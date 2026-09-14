import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { IUserRepository } from '../core/interfaces/IRepository';
import { User, IUser, UserRole } from '../models/domain/User.model';

/**
 * UserRepository - Repositorio para operaciones de usuario en la base de datos
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseRepository<User, string>
 * - POLIMORFISMO: Implementa los métodos abstractos de BaseRepository
 * - LSP: Respeta la sustituibilidad de contratos de BaseRepository
 * - ISP: Implementa la interfaz específica IUserRepository
 * - SRP: Exclusivamente responsable del acceso y persistencia de usuarios
 */
export class UserRepository extends BaseRepository<User, string> implements IUserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'User');
  }

  private toDomain(prismaUser: PrismaUser): User {
    const user = new User({
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      role: prismaUser.role as UserRole,
      level: prismaUser.level,
      xp: prismaUser.xp,
      coins: prismaUser.coins,
      gems: prismaUser.gems,
      isBanned: prismaUser.isBanned,
      bannedUntil: prismaUser.bannedUntil,
      banReason: prismaUser.banReason,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
    user.setPasswordHash(prismaUser.passwordHash);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    this.log(`Buscando usuario por ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.log(`Buscando usuario por email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.toDomain(user) : null;
  }

  async create(data: Partial<User | IUser> & { passwordHash?: string }): Promise<User> {
    this.log(`Creando usuario: ${data.email}`);
    const user = await this.prisma.user.create({
      data: {
        email: data.email!,
        username: data.username || (data.email ? data.email.split('@')[0] : 'user'),
        role: data.role || UserRole.PLAYER,
        level: data.level || 1,
        xp: data.xp || 0,
        coins: data.coins || 500,
        gems: data.gems || 50,
        passwordHash: data.passwordHash ?? null,
      },
    });
    return this.toDomain(user);
  }

  async update(id: string, data: Partial<User | IUser> & { passwordHash?: string }): Promise<User> {
    this.log(`Actualizando usuario: ${id}`);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.xp !== undefined && { xp: data.xp }),
        ...(data.coins !== undefined && { coins: data.coins }),
        ...(data.gems !== undefined && { gems: data.gems }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isBanned !== undefined && { isBanned: data.isBanned }),
        ...(data.bannedUntil !== undefined && { bannedUntil: data.bannedUntil }),
        ...(data.banReason !== undefined && { banReason: data.banReason }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
        updatedAt: new Date(),
      },
    });
    return this.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    this.log(`Eliminando usuario: ${id}`);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    orderBy?: 'createdAt' | 'level' | 'xp';
  }): Promise<User[]> {
    this.log('Listando usuarios');
    const users = await this.prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy ? { [options.orderBy]: 'desc' } : undefined,
    });
    return users.map(user => this.toDomain(user));
  }

  async findBannedUsers(): Promise<User[]> {
    this.log('Buscando usuarios baneados');
    const users = await this.prisma.user.findMany({
      where: { isBanned: true },
    });
    return users.map(user => this.toDomain(user));
  }

  async updateLastLogin(id: string): Promise<void> {
    this.log(`Actualizando última conexión: ${id}`);
    await this.prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}
