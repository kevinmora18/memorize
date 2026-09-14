import { Router } from 'express';
import { Container } from '../Container';
import { requireAuth, requireAdmin, requireOwnership } from '../core/AuthMiddleware';

/**
 * User Routes - Usando arquitectura POO
 * 
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - Protección: perfil/economía requieren autenticación + propiedad; ban/unban/admin solo admin
 * - El controlador maneja HTTP
 * - El servicio maneja lógica de negocio
 * - Los repositorios manejan datos
 */

const router = Router();
const container = Container.getInstance();
const userController = container.userController;

// GET /api/users/top - Top jugadores (público)
router.get('/top', userController.getTopPlayers);

// GET /api/users/banned - Usuarios baneados (solo admin)
router.get('/banned', requireAdmin, userController.getBannedUsers);

// GET /api/users/:userId - Obtener perfil (requiere ser el propio usuario)
router.get('/:userId', requireAuth, requireOwnership, userController.getProfile);

// POST /api/users/:userId/xp - Añadir XP (solo propio usuario)
router.post('/:userId/xp', requireAuth, requireOwnership, userController.addXp);

// PUT /api/users/:userId/currency - Actualizar monedas/gemas (solo propio usuario)
router.put('/:userId/currency', requireAuth, requireOwnership, userController.updateCurrency);

// POST /api/users/:userId/reward - Dar recompensa (solo propio usuario)
router.post('/:userId/reward', requireAuth, requireOwnership, userController.rewardCoins);

// POST /api/users/:userId/game-result - Registrar resultado de partida (solo propio usuario)
router.post('/:userId/game-result', requireAuth, requireOwnership, userController.recordGame);

// GET /api/users/:userId/achievements - Obtener logros (propio usuario)
router.get('/:userId/achievements', requireAuth, requireOwnership, userController.getAchievements);

// GET /api/users/:userId/ranking - Obtener ranking (propio usuario)
router.get('/:userId/ranking', requireAuth, requireOwnership, userController.getRanking);

// POST /api/users/:userId/ban - Banear usuario (solo admin)
router.post('/:userId/ban', requireAdmin, userController.banUser);

// POST /api/users/:userId/unban - Desbanear usuario (solo admin)
router.post('/:userId/unban', requireAdmin, userController.unbanUser);

export default router;