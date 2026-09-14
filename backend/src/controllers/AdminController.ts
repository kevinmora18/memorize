import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { IAdminService } from '../core/interfaces/IServices';
import { AuthenticatedRequest } from '../core/AuthMiddleware';

/**
 * AdminController - Controlador para rutas de administración
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP (Dependency Inversion Principle): Depende de la interfaz IAdminService
 * - SRP: Encargado únicamente de la capa HTTP de administración
 * - SEGURIDAD: La identidad del admin proviene del JWT (req.user), nunca del body
 */
export class AdminController extends BaseController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    super('AdminController');
    this.adminService = adminService;
  }

  listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, search, role, banned } = req.query;

      const result = await this.adminService.listUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
        role: role as string | undefined,
        banned: banned !== undefined ? banned === 'true' : undefined,
      });

      this.sendSuccess(res, {
        users: result.users,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 50,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      this.handleHttpError(res, error, 'Error listando usuarios');
    }
  };

  getUserDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.adminService.getUserDetail(req.params.id as string);
      this.sendSuccess(res, user);
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error obteniendo detalle de usuario');
    }
  };

  changeUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { role } = req.body;
      const adminId = req.user!.userId;

      if (!role) {
        this.sendError(res, 'Rol requerido', 400);
        return;
      }

      const user = await this.adminService.changeUserRole(req.params.id as string, role, adminId);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error cambiando rol de usuario');
    }
  };

  updateUserCurrency = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { coins, gems } = req.body;
      const adminId = req.user!.userId;
      const user = await this.adminService.updateUserCurrency(req.params.id as string, coins, gems, adminId);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error modificando fondos de usuario');
    }
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      await this.adminService.deleteUser(req.params.id as string, adminId);
      this.sendSuccess(res, { message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error eliminando usuario');
    }
  };

  banUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reason, duration } = req.body;
      const adminId = req.user!.userId;

      if (!reason) {
        this.sendError(res, 'Razón de baneo requerida', 400);
        return;
      }

      const user = await this.adminService.banUser(
        req.params.id as string,
        reason,
        duration ? parseInt(duration) : undefined,
        adminId
      );
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error baneando usuario');
    }
  };

  unbanUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const user = await this.adminService.unbanUser(req.params.id as string, adminId);
      this.sendSuccess(res, user.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error desbaneando usuario');
    }
  };

  getBannedUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.adminService.getBannedUsers();
      this.sendSuccess(res, users.map(u => u.toJSON()));
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error obteniendo usuarios baneados');
    }
  };

  listMatches = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, mode, userId } = req.query;

      const result = await this.adminService.getAllMatches({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        mode: mode as string | undefined,
        userId: userId as string | undefined,
      });

      this.sendSuccess(res, {
        matches: result.matches.map(m => (m as any).toJSON ? (m as any).toJSON() : m),
        total: result.total,
      });
    } catch (error) {
      this.handleHttpError(res, error, 'Error listando partidas');
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.adminService.getGeneralStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo estadísticas generales');
    }
  };

  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '7d' } = req.query;
      const analytics = await this.adminService.getAnalytics(period as string);
      this.sendSuccess(res, analytics);
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo analíticas');
    }
  };

  listAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      const announcements = await this.adminService.listAnnouncements();
      this.sendSuccess(res, announcements);
    } catch (error) {
      this.handleHttpError(res, error, 'Error listando anuncios');
    }
  };

  createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, message, type, expiresAt } = req.body;
      const adminId = req.user!.userId;

      if (!title || !message) {
        this.sendError(res, 'Título y mensaje requeridos', 400);
        return;
      }

      const announcement = await this.adminService.createAnnouncement({
        title, message, type, expiresAt, adminId,
      });
      this.sendSuccess(res, announcement);
    } catch (error) {
      this.handleHttpError(res, error, 'Error creando anuncio');
    }
  };

  toggleAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.body;
      const announcement = await this.adminService.toggleAnnouncement(req.params.id as string, isActive);
      this.sendSuccess(res, announcement);
    } catch (error) {
      this.handleHttpError(res, error, 'Error cambiando estado del anuncio');
    }
  };

  deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminService.deleteAnnouncement(req.params.id as string);
      this.sendSuccess(res, { message: 'Anuncio eliminado correctamente' });
    } catch (error) {
      this.handleHttpError(res, error, 'Error eliminando anuncio');
    }
  };

  listPromotions = async (req: Request, res: Response): Promise<void> => {
    try {
      const promotions = await this.adminService.listPromotions();
      this.sendSuccess(res, promotions);
    } catch (error) {
      this.handleHttpError(res, error, 'Error listando promociones');
    }
  };

  createPromotion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, description, type, value, startDate, endDate } = req.body;
      const adminId = req.user!.userId;

      if (!name || !type || value === undefined || !endDate) {
        this.sendError(res, 'Datos incompletos para crear promoción', 400);
        return;
      }

      const promotion = await this.adminService.createPromotion({
        name, description, type, value, startDate, endDate, adminId,
      });
      this.sendSuccess(res, promotion);
    } catch (error) {
      this.handleHttpError(res, error, 'Error creando promoción');
    }
  };

  deletePromotion = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminService.deletePromotion(req.params.id as string);
      this.sendSuccess(res, { message: 'Promoción eliminada correctamente' });
    } catch (error) {
      this.handleHttpError(res, error, 'Error eliminando promoción');
    }
  };

  giveCurrencyToAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { coins, gems } = req.body;
      const adminId = req.user!.userId;

      if (coins === undefined && gems === undefined) {
        this.sendError(res, 'Debe especificar coins o gems', 400);
        return;
      }

      const result = await this.adminService.giveCurrencyToAll(coins, gems, adminId);
      this.sendSuccess(res, {
        message: `Monedas otorgadas a ${result.affectedUsers} usuarios`,
        affectedUsers: result.affectedUsers,
      });
    } catch (error) {
      this.handleHttpError(res, error, 'Error otorgando monedas masivas');
    }
  };

  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, action } = req.query;

      const result = await this.adminService.getLogs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        action: action as string | undefined,
      });

      this.sendSuccess(res, {
        logs: result.logs,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 50,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo logs de auditoría');
    }
  };
}