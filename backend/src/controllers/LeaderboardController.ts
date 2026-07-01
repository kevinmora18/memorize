import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';

/**
 * LeaderboardController - Controlador para rutas de rankings
 *
 * EXPLICACIÓN POO:
 * - SRP: Solo maneja peticiones HTTP de leaderboard
 * - DEPENDENCY INJECTION: Recibe el servicio como dependencia
 * - THIN CONTROLLER: Delega toda la lógica al servicio
 */
export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor(leaderboardService: LeaderboardService) {
    this.leaderboardService = leaderboardService;
  }

  /**
   * GET /api/leaderboard
   * Ranking global por criterio
   */
  getGlobalLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type = 'xp', limit = '100' } = req.query;

      const result = await this.leaderboardService.getGlobalLeaderboard(
        type as string,
        parseInt(limit as string)
      );

      res.json({ type, period: 'all', ...result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/leaderboard/user/:userId
   * Posición de un usuario específico
   */
  getUserRank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { type = 'xp' } = req.query;

      const rank = await this.leaderboardService.getUserRank(userId as string, type as string);
      res.json({ ...rank, type });
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  /**
   * GET /api/leaderboard/mode/:mode
   * Mejores puntuaciones por modo
   */
  getLeaderboardByMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mode } = req.params;
      const { limit = '100' } = req.query;

      const result = await this.leaderboardService.getLeaderboardByMode(
        mode as string,
        parseInt(limit as string)
      );

      res.json({ ...result, total: result.leaderboard.length });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/leaderboard/weekly
   * Ranking semanal
   */
  getWeeklyLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '100' } = req.query;
      const result = await this.leaderboardService.getWeeklyLeaderboard(parseInt(limit as string));
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/leaderboard/monthly
   * Ranking mensual
   */
  getMonthlyLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '100' } = req.query;
      const result = await this.leaderboardService.getMonthlyLeaderboard(parseInt(limit as string));
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
