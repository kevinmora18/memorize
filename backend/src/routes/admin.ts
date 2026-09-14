import { Router } from 'express';
import { Container } from '../Container';
import { requireAdmin } from '../core/AuthMiddleware';

/**
 * Admin Routes - Usando arquitectura POO
 *
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - TODO el namespace /api/admin está protegido por requireAdmin (JWT con rol admin)
 * - Separación clara entre routing y lógica de negocio
 */

const router = Router();
const container = Container.getInstance();
const adminController = container.adminController;

// Protección global: todas las rutas bajo /api/admin requieren rol admin
router.use(requireAdmin);

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

// GET /api/admin/users - Listar usuarios
router.get('/users', adminController.listUsers);

// GET /api/admin/users/:id - Detalle de un usuario
router.get('/users/:id', adminController.getUserDetail);

// PUT /api/admin/users/:id/role - Cambiar rol
router.put('/users/:id/role', adminController.changeUserRole);

// PUT /api/admin/users/:id/currency - Modificar monedas/gemas
router.put('/users/:id/currency', adminController.updateUserCurrency);

// POST /api/admin/users/:id/ban - Banear usuario
router.post('/users/:id/ban', adminController.banUser);

// POST /api/admin/users/:id/unban - Desbanear usuario
router.post('/users/:id/unban', adminController.unbanUser);

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete('/users/:id', adminController.deleteUser);

// ============================================
// PARTIDAS
// ============================================

// GET /api/admin/matches - Listar todas las partidas
router.get('/matches', adminController.listMatches);

// GET /api/admin/banned-users - Usuarios baneados
router.get('/banned-users', adminController.getBannedUsers);

// ============================================
// ESTADÍSTICAS Y ANALÍTICAS
// ============================================

// GET /api/admin/stats - Estadísticas generales
router.get('/stats', adminController.getStats);

// GET /api/admin/analytics - Analíticas detalladas
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/logs - Logs administrativos
router.get('/logs', adminController.getLogs);

// ============================================
// ANUNCIOS
// ============================================

// GET /api/admin/announcements
router.get('/announcements', adminController.listAnnouncements);

// POST /api/admin/announcements
router.post('/announcements', adminController.createAnnouncement);

// PUT /api/admin/announcements/:id/toggle
router.put('/announcements/:id/toggle', adminController.toggleAnnouncement);

// DELETE /api/admin/announcements/:id
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// ============================================
// PROMOCIONES
// ============================================

// GET /api/admin/promotions
router.get('/promotions', adminController.listPromotions);

// POST /api/admin/promotions
router.post('/promotions', adminController.createPromotion);

// DELETE /api/admin/promotions/:id
router.delete('/promotions/:id', adminController.deletePromotion);

// ============================================
// ACCIONES MASIVAS
// ============================================

// POST /api/admin/give-currency-all
router.post('/give-currency-all', adminController.giveCurrencyToAll);

export default router;