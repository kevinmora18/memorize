import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { ILeaderboardService } from '../core/interfaces/IServices';

/**
 * LeaderboardController - Controlador para rutas de rankings
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP (Dependency Inversion Principle): Depende de ILeaderboardService
 * - SRP: Encargado exclusivamente del transporte HTTP para consultas de rankings
 */
export class LeaderboardController extends BaseController {
  private leaderboardService: ILeaderboardService;

  constructor(leaderboardService: ILeaderboardService) {
    super('LeaderboardController');
    this.leaderboardService = leaderboardService;
  }

  getGlobalLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type = 'xp', limit = '100' } = req.query;

      const result = await this.leaderboardService.getGlobalLeaderboard(
        type as string,
        parseInt(limit as string)
      );

      this.sendSuccess(res, { type, period: 'all', ...result });
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo ranking global');
    }
  };

  getUserRank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { type = 'xp' } = req.query;

      const rank = await this.leaderboardService.getUserRank(userId as string, type as string);
      this.sendSuccess(res, { ...rank, type });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error obteniendo rango del usuario');
    }
  };

  getLeaderboardByMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mode } = req.params;
      const { limit = '100' } = req.query;

      const result = await this.leaderboardService.getLeaderboardByMode(
        mode as string,
        parseInt(limit as string)
      );

      this.sendSuccess(res, { ...result, total: result.leaderboard.length });
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo ranking por modo');
    }
  };

  getWeeklyLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '100' } = req.query;
      const result = await this.leaderboardService.getWeeklyLeaderboard(parseInt(limit as string));
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo ranking semanal');
    }
  };

  getMonthlyLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '100' } = req.query;
      const result = await this.leaderboardService.getMonthlyLeaderboard(parseInt(limit as string));
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo ranking mensual');
    }
  };
}
