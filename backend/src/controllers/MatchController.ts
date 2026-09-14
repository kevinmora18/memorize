import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { IMatchService } from '../core/interfaces/IServices';

/**
 * MatchController - Controlador para rutas de partidas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP (Dependency Inversion Principle): Depende de la interfaz IMatchService
 * - SRP: Gestiona exclusivamente el transporte HTTP de resultados e historial de partidas
 */
export class MatchController extends BaseController {
  private matchService: IMatchService;

  constructor(matchService: IMatchService) {
    super('MatchController');
    this.matchService = matchService;
  }

  saveMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, mode, level, score, accuracy, combo, timeLeft, won } = req.body;

      if (!userId || !mode || score === undefined || won === undefined) {
        this.sendError(res, 'Datos incompletos: userId, mode, score y won son requeridos', 400);
        return;
      }

      const result = await this.matchService.saveMatch({
        userId,
        mode,
        level,
        score,
        accuracy,
        combo,
        timeLeft,
        won,
      });

      this.sendSuccess(res, {
        match: result.match.toJSON(),
        xpGained: result.xpEarned,
        coinsGained: result.coinsEarned,
      });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error guardando partida');
    }
  };

  getUserMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { page, limit, mode } = req.query;

      const result = await this.matchService.getUserMatches(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        mode: mode as string | undefined,
      });

      this.sendSuccess(res, {
        matches: result.matches.map(m => m.toJSON()),
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo historial de partidas');
    }
  };
}
