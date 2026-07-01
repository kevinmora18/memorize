import { Router } from 'express';
import { Container } from '../Container';

/**
 * Admin Routes - Usando arquitectura POO
 *
 * EXPLICACIÓN:
 * - Rutas limpias que delegan al controlador
 * - El middleware requireAdmin está en el controlador (inyectable/testeable)
 * - Separación clara entre routing y lógica de negocio
 */

const router = Router();
const container = Container.getInstance();
const adminController = container.adminController;

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

// GET /api/admin/users - Listar usuarios
router.get('/users', adminController.listUsers);

// GET /api/admin/users/:id - Detalle de un usuario
router.get('/users/:id', adminController.getUserDetail);

// PUT /api/admin/users/:id/role - Cambiar rol (requiere admin)
router.put('/users/:id/role', adminController.requireAdmin, adminController.changeUserRole);

// PUT /api/admin/users/:id/currency - Modificar monedas/gemas (requiere admin)
router.put('/users/:id/currency', adminController.requireAdmin, adminController.updateUserCurrency);

// DELETE /api/admin/users/:id - Eliminar usuario (requiere admin)
router.delete('/users/:id', adminController.requireAdmin, adminController.deleteUser);

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

// POST /api/admin/announcements (requiere admin)
router.post('/announcements', adminController.requireAdmin, adminController.createAnnouncement);

// PUT /api/admin/announcements/:id/toggle (requiere admin)
router.put('/announcements/:id/toggle', adminController.requireAdmin, adminController.toggleAnnouncement);

// DELETE /api/admin/announcements/:id (requiere admin)
router.delete('/announcements/:id', adminController.requireAdmin, adminController.deleteAnnouncement);

// ============================================
// PROMOCIONES
// ============================================

// GET /api/admin/promotions
router.get('/promotions', adminController.listPromotions);

// POST /api/admin/promotions (requiere admin)
router.post('/promotions', adminController.requireAdmin, adminController.createPromotion);

// DELETE /api/admin/promotions/:id (requiere admin)
router.delete('/promotions/:id', adminController.requireAdmin, adminController.deletePromotion);

// ============================================
// ACCIONES MASIVAS
// ============================================

// POST /api/admin/give-currency-all (requiere admin)
router.post('/give-currency-all', adminController.requireAdmin, adminController.giveCurrencyToAll);

export default router;
