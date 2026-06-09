import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/users/:userId - Obtener perfil de usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        inventory: true,
        _count: {
          select: { matches: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/users/:userId/stats - Actualizar estadísticas
router.put('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { gamesPlayed, gamesWon, totalScore, bestScore, totalMatches, perfectMatches, maxCombo } = req.body;

    const stats = await prisma.playerStats.upsert({
      where: { userId },
      update: {
        gamesPlayed,
        gamesWon,
        totalScore,
        bestScore,
        totalMatches,
        perfectMatches,
        maxCombo,
      },
      create: {
        userId,
        gamesPlayed: gamesPlayed || 0,
        gamesWon: gamesWon || 0,
        totalScore: totalScore || 0,
        bestScore: bestScore || 0,
        totalMatches: totalMatches || 0,
        perfectMatches: perfectMatches || 0,
        maxCombo: maxCombo || 0,
      },
    });

    res.json(stats);
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/users/:userId/inventory - Obtener inventario
router.get('/:userId/inventory', async (req, res) => {
  try {
    const { userId } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { userId },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventario no encontrado' });
    }

    res.json(inventory);
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/users/:userId/inventory - Actualizar inventario
router.put('/:userId/inventory', async (req, res) => {
  try {
    const { userId } = req.params;
    const { ownedPacks, ownedFrames, ownedSkins, ownedBoards, equippedPack, equippedFrame, equippedSkin, equippedBoard } = req.body;

    const inventory = await prisma.inventory.upsert({
      where: { userId },
      update: {
        ownedPacks,
        ownedFrames,
        ownedSkins,
        ownedBoards,
        equippedPack,
        equippedFrame,
        equippedSkin,
        equippedBoard,
      },
      create: {
        userId,
        ownedPacks: ownedPacks || ['frutas'],
        ownedFrames: ownedFrames || ['basic'],
        ownedSkins: ownedSkins || ['classic'],
        ownedBoards: ownedBoards || ['default'],
        equippedPack: equippedPack || 'frutas',
        equippedFrame: equippedFrame || 'basic',
        equippedSkin: equippedSkin || 'classic',
        equippedBoard: equippedBoard || 'default',
      },
    });

    res.json(inventory);
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/users/:userId/matches - Obtener historial de partidas
router.get('/:userId/matches', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, mode } = req.query;

    const where: any = { userId };
    if (mode) {
      where.mode = mode;
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(matches);
  } catch (error) {
    console.error('Error obteniendo partidas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/users/:userId/xp - Actualizar XP y nivel
router.put('/:userId/xp', async (req, res) => {
  try {
    const { userId } = req.params;
    const { xp, level } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { xp, level },
    });

    res.json(user);
  } catch (error) {
    console.error('Error actualizando XP:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/users/:userId/currency - Actualizar monedas/gemas
router.put('/:userId/currency', async (req, res) => {
  try {
    const { userId } = req.params;
    const { coins, gems } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { coins, gems },
    });

    res.json(user);
  } catch (error) {
    console.error('Error actualizando monedas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
