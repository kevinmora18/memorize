import { Router } from 'express';
import { Container } from '../Container';
import { requireAuth } from '../core/AuthMiddleware';

/**
 * Auth Routes - Usando arquitectura POO
 * 
 * EXPLICACIÓN:
 * - Las rutas solo definen endpoints y delegan al controlador
 * - El controlador obtiene sus dependencias del Container
 * - Autenticación por email + contraseña con emisión de JWT
 */

const router = Router();
const container = Container.getInstance();
const authController = container.authController;

// POST /api/auth/register - Registro con email y contraseña
router.post('/register', authController.register);

// POST /api/auth/login - Inicio de sesión con email y contraseña
router.post('/login', authController.login);

// GET /api/auth/me - Usuario autenticado a partir del JWT
router.get('/me', requireAuth, authController.me);

// GET /api/auth/validate/:userId - Validar acceso de usuario
router.get('/validate/:userId', authController.validateAccess);

// GET /api/auth/is-admin/:userId - Verificar si es admin
router.get('/is-admin/:userId', authController.checkAdmin);

export default router;