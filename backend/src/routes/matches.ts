import { Router } from 'express';
import { Container } from '../Container';
import { requireAuth, requireOwnership } from '../core/AuthMiddleware';

/**
 * Match Routes - Usando arquitectura POO
 *
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - Protección: solo usuarios autenticados pueden guardar/consultar sus propias partidas
 */

const router = Router();
const container = Container.getInstance();
const matchController = container.matchController;

// POST /api/matches - Guardar resultado de partida (solo el propio usuario)
router.post('/', requireAuth, matchController.saveMatch);

// GET /api/matches/user/:userId - Historial de un usuario (solo el propio usuario)
router.get('/user/:userId', requireAuth, matchController.getUserMatches);

export default router;