import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';

/**
 * AdminController - Controlador para rutas de administración
 *
 * EXPLICACIÓN POO:
 * - SRP: Solo maneja peticiones HTTP de administración
 * - DEPENDENCY INJECTION: Recibe el servicio como dependencia
 * - THIN CONTROLLER: Delega toda la lógica al servicio
 */
export class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  // ────────────────────────────────────────────
  // MIDDLEWARE de verificación de admin
  // ────────────────────────────────────────────

  /**
   * Middleware: verifica que adminId en el body/query sea un admin válido
   */
  requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.body.adminId ?? req.query.adminId as string;

      if (!adminId) {
        res.status(401).json({ error: 'ID de administrador requerido' });
        return;
      }

      const isAdmin = await this.adminService.verifyAdmin(adminId);

      if (!isAdmin) {
        res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────
  // USUARIOS
  // ────────────────────────────────────────────

  /**
   * GET /api/admin/users
   */
  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, role, banned } = req.query;

      const result = await this.adminService.listUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
        role: role as string | undefined,
        banned: banned !== undefined ? banned === 'true' : undefined,
      });

      res.json({
        users: result.users,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 50,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/users/:id
   */
  getUserDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminService.getUserDetail(req.params.id as string);
      res.json(user);
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  /**
   * PUT /api/admin/users/:id/role
   */
  changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, adminId } = req.body;

      if (!role) {
        res.status(400).json({ error: 'Rol requerido' });
        return;
      }

      const user = await this.adminService.changeUserRole(req.params.id as string, role, adminId);
      res.json(user.toJSON());
    } catch (error: any) {
      if (error.message.includes('inválido')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  /**
   * PUT /api/admin/users/:id/currency
   */
  updateUserCurrency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { coins, gems, adminId } = req.body;

      const user = await this.adminService.updateUserCurrency(req.params.id as string, coins, gems, adminId);
      res.json(user.toJSON());
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  /**
   * DELETE /api/admin/users/:id
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminId } = req.body;
      await this.adminService.deleteUser(req.params.id as string, adminId);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  };

  // ────────────────────────────────────────────
  // ESTADÍSTICAS Y ANALÍTICAS
  // ────────────────────────────────────────────

  /**
   * GET /api/admin/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getGeneralStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period = '7d' } = req.query;
      const analytics = await this.adminService.getAnalytics(period as string);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────
  // ANUNCIOS
  // ────────────────────────────────────────────

  /**
   * GET /api/admin/announcements
   */
  listAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcements = await this.adminService.listAnnouncements();
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/announcements
   */
  createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, message, type, expiresAt, adminId } = req.body;

      if (!title || !message) {
        res.status(400).json({ error: 'Título y mensaje requeridos' });
        return;
      }

      const announcement = await this.adminService.createAnnouncement({
        title, message, type, expiresAt, adminId,
      });
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/announcements/:id/toggle
   */
  toggleAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = req.body;
      const announcement = await this.adminService.toggleAnnouncement(req.params.id as string, isActive);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/announcements/:id
   */
  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deleteAnnouncement(req.params.id as string);
      res.json({ message: 'Anuncio eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────
  // PROMOCIONES
  // ────────────────────────────────────────────

  /**
   * GET /api/admin/promotions
   */
  listPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const promotions = await this.adminService.listPromotions();
      res.json(promotions);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/promotions
   */
  createPromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, type, value, startDate, endDate, adminId } = req.body;

      if (!name || !type || value === undefined || !endDate) {
        res.status(400).json({ error: 'Datos incompletos' });
        return;
      }

      const promotion = await this.adminService.createPromotion({
        name, description, type, value, startDate, endDate, adminId,
      });
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/promotions/:id
   */
  deletePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.adminService.deletePromotion(req.params.id as string);
      res.json({ message: 'Promoción eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────
  // ACCIONES MASIVAS
  // ────────────────────────────────────────────

  /**
   * POST /api/admin/give-currency-all
   */
  giveCurrencyToAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { coins, gems, adminId } = req.body;

      if (!coins && !gems) {
        res.status(400).json({ error: 'Debe especificar coins o gems' });
        return;
      }

      const result = await this.adminService.giveCurrencyToAll(coins, gems, adminId);
      res.json({
        message: `Monedas otorgadas a ${result.affectedUsers} usuarios`,
        affectedUsers: result.affectedUsers,
      });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────
  // PARTIDAS (admin view usa MatchService)
  // ────────────────────────────────────────────

  /**
   * GET /api/admin/logs
   */
  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, action, adminId } = req.query;

      const result = await this.adminService.getLogs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        action: action as string | undefined,
        adminId: adminId as string | undefined,
      });

      res.json({
        logs: result.logs,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 50,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
