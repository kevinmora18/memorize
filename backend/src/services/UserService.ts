import { BaseService } from '../core/BaseService';
import { IUserRepository, IPlayerStatsRepository } from '../core/interfaces/IRepository';
import { IUserService } from '../core/interfaces/IServices';
import { User } from '../models/domain/User.model';
import { PlayerStats } from '../models/domain/PlayerStats.model';

/**
 * UserService - Servicio para gestión de usuarios
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseService
 * - DIP (Dependency Inversion Principle): Inyecta interfaces IUserRepository e IPlayerStatsRepository
 * - ISP: Implementa la interfaz específica IUserService
 * - SRP: Se encarga de la lógica de negocio de usuarios, progresión y sanciones
 * - ENCAPSULACIÓN: Interactúa con los modelos mediante sus métodos de dominio protegidos
 */
export class UserService extends BaseService implements IUserService {
  private userRepository: IUserRepository;
  private statsRepository: IPlayerStatsRepository;

  constructor(
    userRepository: IUserRepository,
    statsRepository: IPlayerStatsRepository
  ) {
    super('UserService');
    this.userRepository = userRepository;
    this.statsRepository = statsRepository;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de usuarios inicializado');
  }

  async getUserProfile(userId: string): Promise<{
    user: User;
    stats: PlayerStats | null;
  }> {
    try {
      this.log(`Obteniendo perfil completo de usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const stats = await this.statsRepository.findByUserId(userId);
      return { user, stats };
    } catch (error: any) {
      this.handleError(error, 'getUserProfile');
    }
  }

  async addXpToUser(userId: string, xpAmount: number): Promise<{
    user: User;
    levelsGained: number;
  }> {
    try {
      this.log(`Añadiendo ${xpAmount} XP al usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const levelsGained = user.addXp(xpAmount);

      const updatedUser = await this.userRepository.update(userId, {
        xp: user.xp,
        level: user.level,
      });

      this.log(`Usuario ${userId} subió ${levelsGained} niveles`);
      return { user: updatedUser, levelsGained };
    } catch (error: any) {
      this.handleError(error, 'addXpToUser');
    }
  }

  async updateCurrency(
    userId: string,
    coins?: number,
    gems?: number
  ): Promise<User> {
    try {
      this.log(`Actualizando monedas del usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // ENCAPSULACIÓN: Se utiliza el método de negocio del modelo
      user.setCurrency(coins, gems);

      return await this.userRepository.update(userId, {
        coins: user.coins,
        gems: user.gems,
      });
    } catch (error: any) {
      this.handleError(error, 'updateCurrency');
    }
  }

  async rewardCoins(userId: string, amount: number): Promise<User> {
    try {
      this.log(`Recompensando ${amount} monedas al usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.addCoins(amount);

      return await this.userRepository.update(userId, {
        coins: user.coins,
      });
    } catch (error: any) {
      this.handleError(error, 'rewardCoins');
    }
  }

  async recordGamePlayed(
    userId: string,
    gameData: {
      score: number;
      won: boolean;
      matches: number;
      perfectMatches: number;
      combo: number;
      xpEarned: number;
      coinsEarned: number;
    }
  ): Promise<{
    user: User;
    stats: PlayerStats;
    levelsGained: number;
  }> {
    try {
      this.log(`Registrando partida para usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      let stats = await this.statsRepository.findByUserId(userId);
      if (!stats) {
        stats = await this.statsRepository.create({ userId });
      }

      stats.recordGame(
        gameData.score,
        gameData.won,
        gameData.matches,
        gameData.perfectMatches,
        gameData.combo
      );

      const levelsGained = user.addXp(gameData.xpEarned);
      user.addCoins(gameData.coinsEarned);

      const [updatedUser, updatedStats] = await Promise.all([
        this.userRepository.update(userId, {
          xp: user.xp,
          level: user.level,
          coins: user.coins,
        }),
        this.statsRepository.update(stats.id, stats.toJSON()),
      ]);

      this.log(`Partida registrada. Niveles ganados: ${levelsGained}`);

      return {
        user: updatedUser,
        stats: updatedStats,
        levelsGained,
      };
    } catch (error: any) {
      this.handleError(error, 'recordGamePlayed');
    }
  }

  async getUserAchievements(userId: string): Promise<string[]> {
    try {
      const stats = await this.statsRepository.findByUserId(userId);
      if (!stats) return [];
      return stats.checkAchievements();
    } catch (error: any) {
      this.log(`Error obteniendo logros: ${error.message}`, 'error');
      return [];
    }
  }

  async getPlayerRanking(userId: string): Promise<{
    rank: number;
    totalPlayers: number;
    percentile: number;
  }> {
    try {
      const stats = await this.statsRepository.findByUserId(userId);
      if (!stats) {
        throw new Error('Estadísticas no encontradas');
      }

      const allStats = await this.statsRepository.findAll({
        orderBy: 'bestScore',
      });

      const rank = allStats.findIndex(s => s.userId === userId) + 1;
      const totalPlayers = allStats.length;
      const percentile = totalPlayers > 0 ? ((totalPlayers - rank) / totalPlayers) * 100 : 0;

      return { rank, totalPlayers, percentile };
    } catch (error: any) {
      this.handleError(error, 'getPlayerRanking');
    }
  }

  async banUser(
    userId: string,
    reason: string,
    duration?: number
  ): Promise<User> {
    try {
      this.log(`Baneando usuario: ${userId}. Razón: ${reason}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // ENCAPSULACIÓN: Métodos del modelo de dominio
      user.applyBan(reason, duration);

      return await this.userRepository.update(userId, {
        isBanned: user.isBanned,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
      });
    } catch (error: any) {
      this.handleError(error, 'banUser');
    }
  }

  async unbanUser(userId: string): Promise<User> {
    try {
      this.log(`Desbaneando usuario: ${userId}`);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // ENCAPSULACIÓN: Métodos del modelo de dominio
      user.removeBan();

      return await this.userRepository.update(userId, {
        isBanned: user.isBanned,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
      });
    } catch (error: any) {
      this.handleError(error, 'unbanUser');
    }
  }

  async getBannedUsers(): Promise<User[]> {
    try {
      return await this.userRepository.findBannedUsers();
    } catch (error: any) {
      this.handleError(error, 'getBannedUsers');
    }
  }

  async getTopPlayers(limit: number = 10): Promise<Array<{
    user: User;
    stats: PlayerStats;
  }>> {
    try {
      const topStats = await this.statsRepository.getTopPlayers('bestScore', limit);

      const results = await Promise.all(
        topStats.map(async (stats) => {
          const user = await this.userRepository.findById(stats.userId);
          return user ? { user, stats } : null;
        })
      );

      return results.filter((r): r is { user: User; stats: PlayerStats } => r !== null);
    } catch (error: any) {
      this.handleError(error, 'getTopPlayers');
    }
  }
}
