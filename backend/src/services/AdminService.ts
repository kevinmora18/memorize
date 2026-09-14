import { PrismaClient } from '@prisma/client';
import { BaseService } from '../core/BaseService';
import {
  IUserRepository,
  IMatchRepository,
  IAnnouncementRepository,
  IPromotionRepository,
  IAdminLogRepository,
} from '../core/interfaces/IRepository';
import { IAdminService } from '../core/interfaces/IServices';
import { User, UserRole } from '../models/domain/User.model';

/**
 * AdminService - Servicio para operaciones administrativas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseService
 * - SRP: Delega persistencia de anuncios, promociones y logs a repositorios especializados
 * - DIP (Dependency Inversion Principle): Inyecta interfaces para todas las entidades de persistencia
 * - ISP: Implementa IAdminService
 * - ENCAPSULACIÓN: Todas las modificaciones de estado y registro de auditoría están controladas
 */
export class AdminService extends BaseService implements IAdminService {
  private userRepository: IUserRepository;
  private matchRepository: IMatchRepository;
  private announcementRepository: IAnnouncementRepository;
  private promotionRepository: IPromotionRepository;
  private adminLogRepository: IAdminLogRepository;
  private prisma: PrismaClient;

  constructor(
    userRepository: IUserRepository,
    matchRepository: IMatchRepository,
    announcementRepository: IAnnouncementRepository,
    promotionRepository: IPromotionRepository,
    adminLogRepository: IAdminLogRepository,
    prisma: PrismaClient
  ) {
    super('AdminService');
    this.userRepository = userRepository;
    this.matchRepository = matchRepository;
    this.announcementRepository = announcementRepository;
    this.promotionRepository = promotionRepository;
    this.adminLogRepository = adminLogRepository;
    this.prisma = prisma;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de administración inicializado');
  }

  async verifyAdmin(adminId: string): Promise<boolean> {
    const user = await this.userRepository.findById(adminId);
    return user ? user.isAdmin() : false;
  }

  // ============================================
  // GESTIÓN DE USUARIOS
  // ============================================

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

  async banUser(
    userId: string,
    reason: string,
    durationMinutes: number | undefined,
    adminId: string
  ): Promise<User> {
    try {
      this.log(`Baneando usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');

      user.applyBan(reason, durationMinutes);
      const updatedUser = await this.userRepository.update(userId, {
        isBanned: user.isBanned,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
      });

      await this.adminLogRepository.createLog({
        adminId,
        action: 'ban_user',
        targetId: userId,
        details: JSON.stringify({ reason, durationMinutes }),
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'banUser');
    }
  }

  async unbanUser(userId: string, adminId: string): Promise<User> {
    try {
      this.log(`Desbaneando usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');

      user.removeBan();
      const updatedUser = await this.userRepository.update(userId, {
        isBanned: false,
        bannedUntil: null,
        banReason: null,
      });

      await this.adminLogRepository.createLog({
        adminId,
        action: 'unban_user',
        targetId: userId,
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'unbanUser');
    }
  }

  async getBannedUsers(): Promise<User[]> {
    try {
      this.log('Obteniendo usuarios baneados');
      return await this.userRepository.findBannedUsers();
    } catch (error: any) {
      this.handleError(error, 'getBannedUsers');
    }
  }

  async getAllMatches(options?: {
    page?: number;
    limit?: number;
    mode?: string;
    userId?: string;
  }): Promise<{ matches: any[]; total: number }> {
    try {
      this.log('Listando todas las partidas (admin)');

      const page = options?.page ?? 1;
      const limit = options?.limit ?? 20;
      const skip = (page - 1) * limit;

      const [matches, total] = await Promise.all([
        this.matchRepository.findAll({
          userId: options?.userId,
          mode: options?.mode,
          skip,
          take: limit,
        }),
        this.matchRepository.count({
          userId: options?.userId,
          mode: options?.mode,
        }),
      ]);

      return { matches, total };
    } catch (error: any) {
      this.handleError(error, 'getAllMatches');
    }
  }

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

      const updatedUser = await this.userRepository.update(userId, { role: newRole as UserRole });

      // Registro de auditoría desacoplado
      await this.adminLogRepository.createLog({
        adminId,
        action: 'change_role',
        targetId: userId,
        details: JSON.stringify({ oldRole: user.role, newRole }),
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'changeUserRole');
    }
  }

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

      user.setCurrency(coins, gems);

      const updatedUser = await this.userRepository.update(userId, {
        ...(coins !== undefined && { coins }),
        ...(gems !== undefined && { gems }),
      });

      await this.adminLogRepository.createLog({
        adminId,
        action: 'give_currency',
        targetId: userId,
        details: JSON.stringify({ coins, gems }),
      });

      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'updateUserCurrency');
    }
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    try {
      this.log(`Eliminando usuario: ${userId}`);

      await this.userRepository.delete(userId);

      await this.adminLogRepository.createLog({
        adminId,
        action: 'delete_user',
        targetId: userId,
        details: JSON.stringify({ deletedAt: new Date() }),
      });
    } catch (error: any) {
      this.handleError(error, 'deleteUser');
    }
  }

  // ============================================
  // ESTADÍSTICAS GENERALES Y ANALÍTICAS
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

  async getAnalytics(period: string): Promise<any> {
    try {
      this.log(`Obteniendo analíticas para período: ${period}`);

      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case '24h': startDate.setHours(now.getHours() - 24); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        default: startDate.setDate(now.getDate() - 7); break;
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
  // ANUNCIOS (Delegan en AnnouncementRepository)
  // ============================================

  async listAnnouncements(): Promise<any[]> {
    return this.announcementRepository.findAll();
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

      const announcement = await this.announcementRepository.create({
        title: data.title,
        message: data.message,
        type: data.type ?? 'info',
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: true,
      });

      await this.adminLogRepository.createLog({
        adminId: data.adminId,
        action: 'create_announcement',
        targetId: announcement.id,
        details: JSON.stringify({ title: data.title, type: data.type }),
      });

      return announcement;
    } catch (error: any) {
      this.handleError(error, 'createAnnouncement');
    }
  }

  async toggleAnnouncement(id: string, isActive: boolean): Promise<any> {
    return this.announcementRepository.toggleActive(id, isActive);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.announcementRepository.delete(id);
  }

  // ============================================
  // PROMOCIONES (Delegan en PromotionRepository)
  // ============================================

  async listPromotions(): Promise<any[]> {
    return this.promotionRepository.findAll();
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

      const promotion = await this.promotionRepository.create({
        name: data.name,
        description: data.description ?? '',
        type: data.type,
        value: data.value,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: new Date(data.endDate),
        isActive: true,
      });

      await this.adminLogRepository.createLog({
        adminId: data.adminId,
        action: 'create_promotion',
        targetId: promotion.id,
        details: JSON.stringify({ name: data.name, type: data.type, value: data.value }),
      });

      return promotion;
    } catch (error: any) {
      this.handleError(error, 'createPromotion');
    }
  }

  async deletePromotion(id: string): Promise<void> {
    await this.promotionRepository.delete(id);
  }

  // ============================================
  // ACCIONES MASIVAS
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

      await this.adminLogRepository.createLog({
        adminId,
        action: 'give_currency_all',
        details: JSON.stringify({ coins, gems, affectedUsers: result.count }),
      });

      return { affectedUsers: result.count };
    } catch (error: any) {
      this.handleError(error, 'giveCurrencyToAll');
    }
  }

  // ============================================
  // AUDITORÍA (Delega en AdminLogRepository)
  // ============================================

  async getLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }): Promise<{ logs: any[]; total: number; totalPages: number }> {
    try {
      this.log('Obteniendo logs administrativos');
      return await this.adminLogRepository.findAll(options);
    } catch (error: any) {
      this.handleError(error, 'getLogs');
    }
  }
}
