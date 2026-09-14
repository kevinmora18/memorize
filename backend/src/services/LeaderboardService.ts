import { PrismaClient } from '@prisma/client';
import { BaseService } from '../core/BaseService';
import {
  IUserRepository,
  IPlayerStatsRepository,
  IMatchRepository,
} from '../core/interfaces/IRepository';
import { ILeaderboardService } from '../core/interfaces/IServices';

/**
 * LeaderboardService - Servicio para rankings y tablas de clasificación
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseService
 * - DIP (Dependency Inversion Principle): Inyecta interfaces IUserRepository, IPlayerStatsRepository, IMatchRepository
 * - ISP: Implementa la interfaz específica ILeaderboardService
 * - SRP: Exclusivamente enfocado en el cálculo y agregación de clasificaciones
 */
export class LeaderboardService extends BaseService implements ILeaderboardService {
  private userRepository: IUserRepository;
  private statsRepository: IPlayerStatsRepository;
  private matchRepository: IMatchRepository;
  private prisma: PrismaClient;

  constructor(
    userRepository: IUserRepository,
    statsRepository: IPlayerStatsRepository,
    matchRepository: IMatchRepository,
    prisma: PrismaClient
  ) {
    super('LeaderboardService');
    this.userRepository = userRepository;
    this.statsRepository = statsRepository;
    this.matchRepository = matchRepository;
    this.prisma = prisma;
  }

  async initialize(): Promise<void> {
    this.log('Servicio de leaderboard inicializado');
  }

  async getGlobalLeaderboard(
    type: string = 'xp',
    limit: number = 100
  ): Promise<{ leaderboard: any[]; total: number }> {
    try {
      this.log(`Obteniendo ranking global por: ${type}`);

      const directOrderFields: Record<string, any> = {
        xp: { xp: 'desc' },
        level: { level: 'desc' },
        coins: { coins: 'desc' },
      };

      if (directOrderFields[type]) {
        const users = await this.prisma.user.findMany({
          orderBy: directOrderFields[type],
          take: limit,
          include: { stats: true },
        });

        const leaderboard = users.map((user, index) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level,
          xp: user.xp,
          coins: user.coins,
          gems: user.gems,
          gamesPlayed: user.stats?.gamesPlayed ?? 0,
          gamesWon: user.stats?.gamesWon ?? 0,
          bestScore: user.stats?.bestScore ?? 0,
          totalScore: user.stats?.totalScore ?? 0,
          maxCombo: user.stats?.maxCombo ?? 0,
        }));

        return { leaderboard, total: leaderboard.length };
      }

      const sortField = type === 'wins' ? 'gamesWon' : 'bestScore';
      const topStats = await this.statsRepository.getTopPlayers(sortField as any, limit);

      const results = await Promise.all(
        topStats.map(async (stats, index) => {
          const user = await this.userRepository.findById(stats.userId);
          if (!user) return null;
          return {
            rank: index + 1,
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            xp: user.xp,
            coins: user.coins,
            gems: user.gems,
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon,
            bestScore: stats.bestScore,
            totalScore: stats.totalScore,
            maxCombo: stats.maxCombo,
          };
        })
      );

      const leaderboard = results.filter((r): r is NonNullable<typeof r> => r !== null);
      return { leaderboard, total: leaderboard.length };
    } catch (error: any) {
      this.handleError(error, 'getGlobalLeaderboard');
    }
  }

  async getUserRank(
    userId: string,
    type: string = 'xp'
  ): Promise<{ rank: number; value: number; userId: string; username: string | null }> {
    try {
      this.log(`Obteniendo posición del usuario ${userId} en ranking ${type}`);

      const user = await this.userRepository.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');

      let rank = 0;
      let value = 0;

      switch (type) {
        case 'xp':
          value = user.xp;
          rank = (await this.prisma.user.count({ where: { xp: { gt: user.xp } } })) + 1;
          break;
        case 'level':
          value = user.level;
          rank = (await this.prisma.user.count({ where: { level: { gt: user.level } } })) + 1;
          break;
        case 'coins':
          value = user.coins;
          rank = (await this.prisma.user.count({ where: { coins: { gt: user.coins } } })) + 1;
          break;
        case 'wins': {
          const stats = await this.statsRepository.findByUserId(userId);
          value = stats?.gamesWon ?? 0;
          rank = (await this.prisma.playerStats.count({ where: { gamesWon: { gt: value } } })) + 1;
          break;
        }
        case 'score': {
          const stats = await this.statsRepository.findByUserId(userId);
          value = stats?.bestScore ?? 0;
          rank = (await this.prisma.playerStats.count({ where: { bestScore: { gt: value } } })) + 1;
          break;
        }
        default:
          value = user.xp;
          rank = (await this.prisma.user.count({ where: { xp: { gt: user.xp } } })) + 1;
      }

      return { rank, value, userId: user.id, username: user.username };
    } catch (error: any) {
      this.handleError(error, 'getUserRank');
    }
  }

  async getLeaderboardByMode(
    mode: string,
    limit: number = 100
  ): Promise<{ leaderboard: any[]; mode: string }> {
    try {
      this.log(`Obteniendo ranking para modo: ${mode}`);

      const matches = await this.matchRepository.getBestScoresByMode(mode, limit * 3);

      const userBest = new Map<string, any>();
      for (const match of matches) {
        const existing = userBest.get(match.userId);
        if (!existing || match.score > existing.score) {
          const user = await this.userRepository.findById(match.userId);
          if (user) {
            userBest.set(match.userId, {
              userId: match.userId,
              username: user.username,
              email: user.email,
              level: user.level,
              score: match.score,
              accuracy: match.accuracy,
              combo: match.combo,
              timeLeft: match.timeLeft,
              createdAt: match.createdAt,
            });
          }
        }
      }

      const leaderboard = Array.from(userBest.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({ rank: index + 1, ...entry }));

      return { leaderboard, mode };
    } catch (error: any) {
      this.handleError(error, 'getLeaderboardByMode');
    }
  }

  async getWeeklyLeaderboard(limit: number = 100): Promise<any> {
    try {
      this.log('Obteniendo ranking semanal');

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return await this.buildPeriodLeaderboard(startOfWeek, now, 'weekly', limit);
    } catch (error: any) {
      this.handleError(error, 'getWeeklyLeaderboard');
    }
  }

  async getMonthlyLeaderboard(limit: number = 100): Promise<any> {
    try {
      this.log('Obteniendo ranking mensual');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return await this.buildPeriodLeaderboard(startOfMonth, now, 'monthly', limit);
    } catch (error: any) {
      this.handleError(error, 'getMonthlyLeaderboard');
    }
  }

  private async buildPeriodLeaderboard(
    startDate: Date,
    endDate: Date,
    period: string,
    limit: number
  ): Promise<any> {
    const matches = await this.matchRepository.findByDateRange(startDate, endDate);

    const userScores = new Map<string, { totalScore: number; gamesPlayed: number; gamesWon: number }>();
    for (const match of matches) {
      const existing = userScores.get(match.userId) ?? { totalScore: 0, gamesPlayed: 0, gamesWon: 0 };
      existing.totalScore += match.score;
      existing.gamesPlayed++;
      if (match.won) existing.gamesWon++;
      userScores.set(match.userId, existing);
    }

    const leaderboard = (
      await Promise.all(
        Array.from(userScores.entries()).map(async ([userId, data]) => {
          const user = await this.userRepository.findById(userId);
          if (!user) return null;
          return {
            userId,
            username: user.username,
            email: user.email,
            level: user.level,
            ...data,
          };
        })
      )
    )
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    return { period, startDate, endDate, leaderboard, total: leaderboard.length };
  }
}
