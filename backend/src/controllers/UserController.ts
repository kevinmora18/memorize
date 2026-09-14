import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { IUserService } from '../core/interfaces/IServices';

/**
 * UserController - Controlador para rutas de usuarios
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP (Dependency Inversion Principle): Depende de la abstracción IUserService
 * - SRP: Interpreta peticiones HTTP y delega la ejecución al servicio
 * - THIN CONTROLLERS: No almacena estado ni contiene lógica de negocio
 */
export class UserController extends BaseController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    super('UserController');
    this.userService = userService;
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const profile = await this.userService.getUserProfile(userId);
      this.sendSuccess(res, profile);
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error obteniendo perfil');
    }
  };

  addXp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { xpAmount } = req.body;

      if (!xpAmount || xpAmount <= 0) {
        this.sendError(res, 'XP amount debe ser positivo', 400);
        return;
      }

      const result = await this.userService.addXpToUser(userId, xpAmount);
      this.sendSuccess(res, result);
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error añadiendo XP');
    }
  };

  updateCurrency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { coins, gems } = req.body;

      const user = await this.userService.updateCurrency(userId, coins, gems);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error actualizando moneda');
    }
  };

  rewardCoins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        this.sendError(res, 'Amount debe ser positivo', 400);
        return;
      }

      const user = await this.userService.rewardCoins(userId, amount);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error otorgando recompensa');
    }
  };

  recordGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { score, won, matches, perfectMatches, combo, xpEarned, coinsEarned } = req.body;

      if (score === undefined || won === undefined) {
        this.sendError(res, 'Datos incompletos', 400);
        return;
      }

      const result = await this.userService.recordGamePlayed(userId, {
        score,
        won,
        matches: matches || 0,
        perfectMatches: perfectMatches || 0,
        combo: combo || 0,
        xpEarned: xpEarned || 0,
        coinsEarned: coinsEarned || 0,
      });

      this.sendSuccess(res, result);
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error registrando partida');
    }
  };

  getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const achievements = await this.userService.getUserAchievements(userId);
      this.sendSuccess(res, { achievements });
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo logros');
    }
  };

  getRanking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const ranking = await this.userService.getPlayerRanking(userId);
      this.sendSuccess(res, ranking);
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error obteniendo ranking');
    }
  };

  getTopPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const topPlayers = await this.userService.getTopPlayers(parseInt(limit as string));

      this.sendSuccess(
        res,
        topPlayers.map(p => ({
          user: p.user.toJSON(),
          stats: p.stats.toJSON(),
        }))
      );
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo top jugadores');
    }
  };

  banUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { reason, duration } = req.body;

      if (!reason) {
        this.sendError(res, 'Razón de baneo requerida', 400);
        return;
      }

      const user = await this.userService.banUser(userId, reason, duration);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al banear usuario');
    }
  };

  unbanUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const user = await this.userService.unbanUser(userId);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al desbanear usuario');
    }
  };

  getBannedUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bannedUsers = await this.userService.getBannedUsers();
      this.sendSuccess(res, bannedUsers.map(u => u.toJSON()));
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo usuarios baneados');
    }
  };
}
