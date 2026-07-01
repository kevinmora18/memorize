import { BaseService } from '../core/BaseService';
import { MatchRepository } from '../repositories/MatchRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PlayerStatsRepository } from '../repositories/PlayerStatsRepository';
import { Match, IMatch } from '../models/domain/Match.model';
import { User } from '../models/domain/User.model';
import { PlayerStats } from '../models/domain/PlayerStats.model';

/**
 * MatchService - Servicio para gestión de partidas
 *
 * EXPLICACIÓN POO:
 * - HERENCIA: Extiende BaseService
 * - SRP: Solo maneja lógica de partidas
 * - DEPENDENCY INJECTION: Recibe repositorios como dependencias
 * - COMPOSICIÓN: Coordina múltiples repositorios y modelos de dominio
 */
export class MatchService extends BaseService {
  private matchRepository: MatchRepository;
  private userRepository: UserRepository;
  private statsRepository: PlayerStatsRepository;

  constructor(
    matchRepository: MatchRepository,
    userRepository: UserRepository,
    statsRepository: PlayerStatsRepository
  ) {
    super('MatchService');
    this.matchRepository = matchRepository;
    this.userRepository = userRepository;
    this.statsRepository = statsRepository;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de partidas inicializado');
  }

  /**
   * Guardar resultado de una partida y actualizar usuario + estadísticas
   * Usa los métodos de los modelos de dominio para los cálculos
   */
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

      // Verificar que el usuario existe
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Crear la partida en BD
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

      // Usar métodos del modelo de dominio para calcular recompensas
      const xpEarned = match.calculateXpEarned();
      const coinsEarned = match.calculateCoinsEarned();

      // Actualizar estadísticas usando el modelo de dominio
      let stats = await this.statsRepository.findByUserId(data.userId);
      if (!stats) {
        stats = await this.statsRepository.create({ userId: data.userId });
      }

      stats.recordGame(
        data.score,
        data.won,
        1, // matches jugados
        0, // perfectMatches (no disponible en este endpoint básico)
        data.combo ?? 0
      );

      // Actualizar XP y monedas usando el modelo User
      user.addXp(xpEarned);
      user.addCoins(coinsEarned);

      // Persistir cambios en paralelo
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

  /**
   * Obtener historial de partidas de un usuario
   */
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

  /**
   * Obtener todas las partidas (para admin)
   */
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

  /**
   * Obtener mejores puntuaciones por modo (para leaderboard)
   */
  async getBestScoresByMode(mode: string, limit: number = 100): Promise<Match[]> {
    try {
      return await this.matchRepository.getBestScoresByMode(mode, limit);
    } catch (error: any) {
      this.handleError(error, 'getBestScoresByMode');
    }
  }

  /**
   * Obtener partidas en un rango de fechas (para analíticas)
   */
  async getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    try {
      return await this.matchRepository.findByDateRange(startDate, endDate);
    } catch (error: any) {
      this.handleError(error, 'getMatchesByDateRange');
    }
  }
}
