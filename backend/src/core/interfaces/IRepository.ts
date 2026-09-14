/**
 * IRepository.ts - Interfaces para acceso a datos
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - ISP (Interface Segregation Principle): Interfaces granulares (Lectura, Escritura, CRUD)
 * - DIP (Dependency Inversion Principle): Los servicios dependen de estas abstracciones, no de Prisma
 * - ABSTRACCIÓN: Define las operaciones de persistencia sin revelar detalles de implementación
 */

import { User } from '../../models/domain/User.model';
import { PlayerStats, IPlayerStats } from '../../models/domain/PlayerStats.model';
import { Match, IMatch } from '../../models/domain/Match.model';

export interface IReadRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
}

export interface IWriteRepository<T, ID = string> {
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface ICrudRepository<T, ID = string>
  extends IReadRepository<T, ID>, IWriteRepository<T, ID> {}

/**
 * Repositorio específico de Usuarios
 */
export interface IUserRepository extends ICrudRepository<User, string> {
  findByEmail(email: string): Promise<User | null>;
  findBannedUsers(): Promise<User[]>;
  updateLastLogin(id: string): Promise<void>;
}

/**
 * Repositorio específico de Estadísticas de Jugador
 */
export interface IPlayerStatsRepository extends ICrudRepository<PlayerStats, string> {
  findByUserId(userId: string): Promise<PlayerStats | null>;
  getTopPlayers(
    criteria: 'bestScore' | 'gamesWon' | 'totalScore',
    limit?: number
  ): Promise<PlayerStats[]>;
  upsert(userId: string, data: Partial<IPlayerStats>): Promise<PlayerStats>;
}

/**
 * Repositorio específico de Partidas
 */
export interface IMatchRepository extends ICrudRepository<Match, string> {
  count(where?: { userId?: string; mode?: string }): Promise<number>;
  getBestScoresByMode(mode: string, limit?: number): Promise<Match[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Match[]>;
}

/**
 * Repositorio específico de Anuncios
 */
export interface IAnnouncementRepository extends ICrudRepository<any, string> {
  toggleActive(id: string, isActive: boolean): Promise<any>;
}

/**
 * Repositorio específico de Promociones
 */
export interface IPromotionRepository extends ICrudRepository<any, string> {}

/**
 * Repositorio específico de Logs Administrativos (Append-only & Query)
 */
export interface IAdminLogRepository {
  createLog(data: {
    adminId: string;
    action: string;
    targetId?: string;
    details?: string;
  }): Promise<any>;
  findAll(options?: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }): Promise<{ logs: any[]; total: number; totalPages: number }>;
}
