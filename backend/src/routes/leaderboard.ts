import { Router } from 'express';
import { Container } from '../Container';

/**
 * Leaderboard Routes - Usando arquitectura POO
 *
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - El controlador maneja HTTP
 * - El servicio maneja la lógica de rankings
 */

const router = Router();
const container = Container.getInstance();
const leaderboardController = container.leaderboardController;

// GET /api/leaderboard - Ranking global
router.get('/', leaderboardController.getGlobalLeaderboard);

// GET /api/leaderboard/weekly - Ranking semanal (debe ir antes de /:mode)
router.get('/weekly', leaderboardController.getWeeklyLeaderboard);

// GET /api/leaderboard/monthly - Ranking mensual
router.get('/monthly', leaderboardController.getMonthlyLeaderboard);

// GET /api/leaderboard/user/:userId - Posición de un usuario
router.get('/user/:userId', leaderboardController.getUserRank);

// GET /api/leaderboard/mode/:mode - Ranking por modo de juego
router.get('/mode/:mode', leaderboardController.getLeaderboardByMode);

export default router;
