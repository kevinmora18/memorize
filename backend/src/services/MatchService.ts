import { BaseService } from '../core/BaseService';
import { IMatchRepository, IUserRepository, IPlayerStatsRepository } from '../core/interfaces/IRepository';
import { IMatchService } from '../core/interfaces/IServices';
import { Match } from '../models/domain/Match.model';
import { User } from '../models/domain/User.model';

/**
 * MatchService - Servicio para gestión de partidas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseService
 * - DIP (Dependency Inversion Principle): Recibe interfaces abstractas en el constructor
 * - ISP: Implementa la interfaz específica IMatchService
 * - SRP: Exclusivamente enfocado en el ciclo y registro de partidas jugadas
 * - POLIMORFISMO: Delega el cálculo de recompensas en los métodos del modelo Match (que usan Strategy)
 */
export class MatchService extends BaseService implements IMatchService {
  private matchRepository: IMatchRepository;
  private userRepository: IUserRepository;
  private statsRepository: IPlayerStatsRepository;

  constructor(
    matchRepository: IMatchRepository,
    userRepository: IUserRepository,
    statsRepository: IPlayerStatsRepository
  ) {
    super('MatchService');
    this.matchRepository = matchRepository;
    this.userRepository = userRepository;
    this.statsRepository = statsRepository;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de partidas inicializado');
  }

  async saveMatch(data: {
    userId: string;
    mode: string;
    level?: number;
    score: number;
    accuracy?: number;
    combo?: number;
    timeLeft?: number;
    won: boolean;
  }): Promise<{ match: Match; xpEarned: number; coinsEarned: number; user: User }> {
    try {
      this.log(`Guardando partida para usuario: ${data.userId}`);

      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const match = await this.matchRepository.create({
        userId: data.userId,
        mode: data.mode,
        level: data.level ?? null,
        score: data.score,
        accuracy: data.accuracy ?? null,
        combo: data.combo ?? null,
        timeLeft: data.timeLeft ?? null,
        won: data.won,
      });

      // POLIMORFISMO: Cálculo delegado en la estrategia del modo
      const xpEarned = match.calculateXpEarned();
      const coinsEarned = match.calculateCoinsEarned();

      let stats = await this.statsRepository.findByUserId(data.userId);
      if (!stats) {
        stats = await this.statsRepository.create({ userId: data.userId });
      }

      stats.recordGame(
        data.score,
        data.won,
        1,
        0,
        data.combo ?? 0
      );

      user.addXp(xpEarned);
      user.addCoins(coinsEarned);

      const [updatedUser] = await Promise.all([
        this.userRepository.update(data.userId, {
          xp: user.xp,
          level: user.level,
          coins: user.coins,
        }),
        this.statsRepository.update(stats.id, stats.toJSON()),
      ]);

      this.log(`Partida guardada. XP: +${xpEarned}, Monedas: +${coinsEarned}`);
      return { match, xpEarned, coinsEarned, user: updatedUser };
    } catch (error: any) {
      this.handleError(error, 'saveMatch');
    }
  }

  async getUserMatches(
    userId: string,
    options?: { page?: number; limit?: number; mode?: string }
  ): Promise<{ matches: Match[]; total: number }> {
    try {
      this.log(`Obteniendo partidas del usuario: ${userId}`);

      const page = options?.page ?? 1;
      const limit = options?.limit ?? 20;
      const skip = (page - 1) * limit;

      const [matches, total] = await Promise.all([
        this.matchRepository.findAll({ userId, mode: options?.mode, skip, take: limit }),
        this.matchRepository.count({ userId, mode: options?.mode }),
      ]);

      return { matches, total };
    } catch (error: any) {
      this.handleError(error, 'getUserMatches');
    }
  }

  async getAllMatches(options?: {
    page?: number;
    limit?: number;
    mode?: string;
    userId?: string;
  }): Promise<{ matches: Match[]; total: number }> {
    try {
      this.log('Listando todas las partidas');

      const page = options?.page ?? 1;
      const limit = options?.limit ?? 50;
      const skip = (page - 1) * limit;

      const [matches, total] = await Promise.all([
        this.matchRepository.findAll({ userId: options?.userId, mode: options?.mode, skip, take: limit }),
        this.matchRepository.count({ userId: options?.userId, mode: options?.mode }),
      ]);

      return { matches, total };
    } catch (error: any) {
      this.handleError(error, 'getAllMatches');
    }
  }

  async getBestScoresByMode(mode: string, limit: number = 100): Promise<Match[]> {
    try {
      return await this.matchRepository.getBestScoresByMode(mode, limit);
    } catch (error: any) {
      this.handleError(error, 'getBestScoresByMode');
    }
  }

  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    try {
      return await this.matchRepository.findByDateRange(startDate, endDate);
    } catch (error: any) {
      this.handleError(error, 'getMatchesByDateRange');
    }
  }
}
