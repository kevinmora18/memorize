import { Router } from 'express';
import { Container } from '../Container';

/**
 * Match Routes - Usando arquitectura POO
 *
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - El controlador maneja HTTP
 * - El servicio maneja lógica de negocio
 * - Los repositorios manejan datos
 */

const router = Router();
const container = Container.getInstance();
const matchController = container.matchController;

// POST /api/matches - Guardar resultado de partida
router.post('/', matchController.saveMatch);

// GET /api/matches/user/:userId - Historial de un usuario
router.get('/user/:userId', matchController.getUserMatches);

export default router;
