import { Request, Response, NextFunction } from 'express';
import { MatchService } from '../services/MatchService';

/**
 * MatchController - Controlador para rutas de partidas
 *
 * EXPLICACIÓN POO:
 * - SRP: Solo maneja peticiones HTTP de partidas
 * - DEPENDENCY INJECTION: Recibe el servicio como dependencia
 * - THIN CONTROLLER: Delega toda la lógica al servicio
 */
export class MatchController {
  private matchService: MatchService;

  constructor(matchService: MatchService) {
    this.matchService = matchService;
  }

  /**
   * POST /api/matches
   * Guardar resultado de una partida
   */
  saveMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, mode, level, score, accuracy, combo, timeLeft, won } = req.body;

      if (!userId || !mode || score === undefined || won === undefined) {
        res.status(400).json({ error: 'Datos incompletos: userId, mode, score y won son requeridos' });
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

      res.json({
        match: result.match.toJSON(),
        xpGained: result.xpEarned,
        coinsGained: result.coinsEarned,
      });
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  /**
   * GET /api/matches/user/:userId
   * Obtener historial de partidas de un usuario
   */
  getUserMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { page, limit, mode } = req.query;

      const result = await this.matchService.getUserMatches(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        mode: mode as string | undefined,
      });

      res.json({
        matches: result.matches.map(m => m.toJSON()),
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
    } catch (error) {
      next(error);
    }
  };
}
