import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { IAuthService } from '../core/interfaces/IServices';
import { AuthenticatedRequest } from '../core/AuthMiddleware';
import { signToken } from '../core/JwtUtil';

/**
 * AuthController - Controlador para rutas de autenticación
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP: Depende de la interfaz IAuthService, no de una clase concreta
 * - SRP: Exclusivamente responsable de interpretar solicitudes HTTP y emitir respuestas
 * - THIN CONTROLLER: Toda la lógica de negocio reside en el servicio
 */
export class AuthController extends BaseController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    super('AuthController');
    this.authService = authService;
  }

  /**
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        this.sendError(res, 'Email y contraseña requeridos', 400);
        return;
      }

      const user = await this.authService.register(email, password, username);
      const token = signToken({ userId: user.id, role: user.role, username: user.username });

      this.sendCreated(res, { user: user.toJSON(), token });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al registrar usuario');
    }
  };

  /**
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        this.sendError(res, 'Email y contraseña requeridos', 400);
        return;
      }

      const { user, token } = await this.authService.login(email, password);
      this.sendSuccess(res, { user: user.toJSON(), token });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al iniciar sesión');
    }
  };

  /**
   * GET /api/auth/me - Devuelve el usuario autenticado a partir del token JWT
   */
  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.authService.validateAccess(userId);

      if (!user) {
        this.sendError(res, 'Sesión inválida o usuario suspendido', 401);
        return;
      }

      this.sendSuccess(res, { userId, isValid: true });
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error validando sesión');
    }
  };

  /**
   * GET /api/auth/validate/:userId
   */
  validateAccess = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const hasAccess = await this.authService.validateAccess(userId);
      this.sendSuccess(res, { hasAccess });
    } catch (error) {
      this.handleHttpError(res, error, 'Error validando acceso');
    }
  };

  /**
   * GET /api/auth/is-admin/:userId
   */
  checkAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const isAdmin = await this.authService.isAdmin(userId);
      this.sendSuccess(res, { isAdmin });
    } catch (error) {
      this.handleHttpError(res, error, 'Error verificando rol de administrador');
    }
  };
}