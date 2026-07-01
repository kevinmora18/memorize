import { PrismaClient } from '@prisma/client';
import { BaseService } from '../core/BaseService';
import { UserRepository } from '../repositories/UserRepository';
import { MatchRepository } from '../repositories/MatchRepository';
import { User } from '../models/domain/User.model';

/**
 * AdminService - Servicio para operaciones administrativas
 *
 * EXPLICACIÓN POO:
 * - HERENCIA: Extiende BaseService
 * - SRP: Solo maneja lógica de administración
 * - DEPENDENCY INJECTION: Recibe dependencias en el constructor
 * - ENCAPSULACIÓN: Oculta Prisma para modelos sin repositorio propio (Announcement, Promotion, AdminLog)
 */
export class AdminService extends BaseService {
  private userRepository: UserRepository;
  private matchRepository: MatchRepository;
  private prisma: PrismaClient;

  constructor(
    userRepository: UserRepository,
    matchRepository: MatchRepository,
    prisma: PrismaClient
  ) {
    super('AdminService');
    this.userRepository = userRepository;
    this.matchRepository = matchRepository;
    this.prisma = prisma;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de administración inicializado');
  }

  /**
   * Verifica que el userId dado corresponde a un admin
   */
  async verifyAdmin(adminId: string): Promise<boolean> {
    const user = await this.userRepository.findById(adminId);
    return user ? user.isAdmin() : false;
  }

  // ============================================
  // GESTIÓN DE USUARIOS
  // ============================================

  /**
   * Listar usuarios con paginación y filtros
   */
  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    banned?: boolean;
  }): Promise<{ users: any[]; total: number; totalPages: number }> {
    try {
      this.log('Listando usuarios');

      const page = options.page ?? 1;
      const limit = options.limit ?? 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (options.search) {
        where.OR = [
          { email: { contains: options.search, mode: 'insensitive' } },
          { username: { contains: options.search, mode: 'insensitive' } },
        ];
      }
      if (options.role) where.role = options.role;
      if (options.banned !== undefined) where.isBanned = options.banned;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            stats: true,
            _count: { select: { matches: true } },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return { users, total, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      this.handleError(error, 'listUsers');
    }
  }

  /**
   * Obtener detalle de un usuario (con inventario, partidas recientes)
   */
  async getUserDetail(userId: string): Promise<any> {
    try {
      this.log(`Obteniendo detalle del usuario: ${userId}`);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          stats: true,
          inventory: true,
          matches: { orderBy: { createdAt: 'desc' }, take: 10 },
          _count: { select: { matches: true } },
        },
      });

      if (!user) throw new Error('Usuario no encontrado');

      return user;
    } catch (error: any) {
      this.handleError(error, 'getUserDetail');
    }
  }

  /**
   * Cambiar el rol de un usuario y registrar en logs
   */
  async changeUserRole(
    userId: string,
    newRole: string,
    adminId: string
  ): Promise<User> {
    try {
      this.log(`Cambiando rol del usuario ${userId} a ${newRole}`);

      if (!['player', 'admin'].includes(newRole)) {
        throw new Error('Rol inválido');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');

      const updatedUser = await this.userRepository.update(userId, { role: newRole as any });

      await this.prisma.adminLog.create({
        data: {
          adminId,
          action: 'change_role',
          targetId: userId,
          details: JSON.stringify({ oldRole: user.role, newRole }),
        },
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'changeUserRole');
    }
  }

  /**
   * Modificar monedas/gemas de un usuario y registrar en logs
   */
  async updateUserCurrency(
    userId: string,
    coins: number | undefined,
    gems: number | undefined,
    adminId: string
  ): Promise<User> {
    try {
      this.log(`Actualizando monedas del usuario ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');

      const updatedUser = await this.userRepository.update(userId, {
        ...(coins !== undefined && { coins }),
        ...(gems !== undefined && { gems }),
      });

      await this.prisma.adminLog.create({
        data: {
          adminId,
          action: 'give_currency',
          targetId: userId,
          details: JSON.stringify({ coins, gems }),
        },
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'updateUserCurrency');
    }
  }

  /**
   * Eliminar un usuario y registrar en logs
   */
  async deleteUser(userId: string, adminId: string): Promise<void> {
    try {
      this.log(`Eliminando usuario: ${userId}`);

      await this.userRepository.delete(userId);

      await this.prisma.adminLog.create({
        data: {
          adminId,
          action: 'delete_user',
          targetId: userId,
          details: JSON.stringify({ deletedAt: new Date() }),
        },
      });
    } catch (error: any) {
      this.handleError(error, 'deleteUser');
    }
  }

  // ============================================
  // ESTADÍSTICAS GENERALES
  // ============================================

  async getGeneralStats(): Promise<any> {
    try {
      this.log('Obteniendo estadísticas generales');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        totalMatches,
        activeUsers,
        bannedUsers,
        coinsAgg,
        gemsAgg,
        matchesByMode,
        topPlayers,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.match.count(),
        this.prisma.user.count({ where: { updatedAt: { gte: sevenDaysAgo } } }),
        this.prisma.user.count({ where: { isBanned: true } }),
        this.prisma.user.aggregate({ _sum: { coins: true } }),
        this.prisma.user.aggregate({ _sum: { gems: true } }),
        this.prisma.match.groupBy({ by: ['mode'], _count: { mode: true } }),
        this.prisma.user.findMany({
          orderBy: { xp: 'desc' },
          take: 10,
          include: { stats: true },
        }),
      ]);

      return {
        overview: {
          totalUsers,
          totalMatches,
          activeUsers,
          bannedUsers,
          totalCoins: coinsAgg._sum.coins ?? 0,
          totalGems: gemsAgg._sum.gems ?? 0,
        },
        matchesByMode,
        topPlayers,
      };
    } catch (error: any) {
      this.handleError(error, 'getGeneralStats');
    }
  }

  // ============================================
  // ANALÍTICAS
  // ============================================

  async getAnalytics(period: string): Promise<any> {
    try {
      this.log(`Obteniendo analíticas para período: ${period}`);

      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case '24h': startDate.setHours(now.getHours() - 24); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        default: startDate.setDate(now.getDate() - 7); break; // 7d
      }

      const [newUsers, matchesPlayed, activeUsers, modeDistribution, usersWithMatches] =
        await Promise.all([
          this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
          this.prisma.match.count({ where: { createdAt: { gte: startDate } } }),
          this.prisma.user.count({ where: { updatedAt: { gte: startDate } } }),
          this.prisma.match.groupBy({
            by: ['mode'],
            where: { createdAt: { gte: startDate } },
            _count: { mode: true },
          }),
          this.prisma.user.findMany({
            where: { matches: { some: { createdAt: { gte: startDate } } } },
            include: { _count: { select: { matches: true } } },
          }),
        ]);

      const retentionRate =
        (usersWithMatches.filter(u => u._count.matches > 1).length /
          (usersWithMatches.length || 1)) *
        100;

      return {
        period,
        startDate,
        endDate: now,
        metrics: {
          newUsers,
          matchesPlayed,
          activeUsers,
          retentionRate: Math.round(retentionRate * 100) / 100,
          avgMatchesPerUser: Math.round((matchesPlayed / (activeUsers || 1)) * 100) / 100,
        },
        modeDistribution,
      };
    } catch (error: any) {
      this.handleError(error, 'getAnalytics');
    }
  }

  // ============================================
  // ANUNCIOS
  // ============================================

  async listAnnouncements(): Promise<any[]> {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createAnnouncement(data: {
    title: string;
    message: string;
    type?: string;
    expiresAt?: string;
    adminId: string;
  }): Promise<any> {
    try {
      this.log(`Creando anuncio: ${data.title}`);

      const announcement = await this.prisma.announcement.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type ?? 'info',
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          isActive: true,
        },
      });

      await this.prisma.adminLog.create({
        data: {
          adminId: data.adminId,
          action: 'create_announcement',
          targetId: announcement.id,
          details: JSON.stringify({ title: data.title, type: data.type }),
        },
      });

      return announcement;
    } catch (error: any) {
      this.handleError(error, 'createAnnouncement');
    }
  }

  async toggleAnnouncement(id: string, isActive: boolean): Promise<any> {
    return this.prisma.announcement.update({ where: { id }, data: { isActive } });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.prisma.announcement.delete({ where: { id } });
  }

  // ============================================
  // PROMOCIONES
  // ============================================

  async listPromotions(): Promise<any[]> {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPromotion(data: {
    name: string;
    description?: string;
    type: string;
    value: number;
    startDate?: string;
    endDate: string;
    adminId: string;
  }): Promise<any> {
    try {
      this.log(`Creando promoción: ${data.name}`);

      const promotion = await this.prisma.promotion.create({
        data: {
          name: data.name,
          description: data.description ?? '',
          type: data.type,
          value: data.value,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: new Date(data.endDate),
          isActive: true,
        },
      });

      await this.prisma.adminLog.create({
        data: {
          adminId: data.adminId,
          action: 'create_promotion',
          targetId: promotion.id,
          details: JSON.stringify({ name: data.name, type: data.type, value: data.value }),
        },
      });

      return promotion;
    } catch (error: any) {
      this.handleError(error, 'createPromotion');
    }
  }

  async deletePromotion(id: string): Promise<void> {
    await this.prisma.promotion.delete({ where: { id } });
  }

  // ============================================
  // ACCIÓN MASIVA: dar monedas a todos
  // ============================================

  async giveCurrencyToAll(
    coins: number | undefined,
    gems: number | undefined,
    adminId: string
  ): Promise<{ affectedUsers: number }> {
    try {
      this.log('Dando monedas/gemas a todos los usuarios');

      const updateData: any = {};
      if (coins) updateData.coins = { increment: coins };
      if (gems) updateData.gems = { increment: gems };

      const result = await this.prisma.user.updateMany({ data: updateData });

      await this.prisma.adminLog.create({
        data: {
          adminId,
          action: 'give_currency_all',
          details: JSON.stringify({ coins, gems, affectedUsers: result.count }),
        },
      });

      return { affectedUsers: result.count };
    } catch (error: any) {
      this.handleError(error, 'giveCurrencyToAll');
    }
  }

  // ============================================
  // LOGS
  // ============================================

  async getLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }): Promise<{ logs: any[]; total: number; totalPages: number }> {
    try {
      this.log('Obteniendo logs administrativos');

      const page = options.page ?? 1;
      const limit = options.limit ?? 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (options.action) where.action = options.action;
      if (options.adminId) where.adminId = options.adminId;

      const [logs, total] = await Promise.all([
        this.prisma.adminLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: { select: { id: true, username: true, email: true } },
          },
        }),
        this.prisma.adminLog.count({ where }),
      ]);

      return { logs, total, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      this.handleError(error, 'getLogs');
    }
  }
}
