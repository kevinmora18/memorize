import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// POST /api/auth/login - Login o registro automático
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email válido requerido' });
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        inventory: true,
      },
    });

    if (!user) {
      // Crear nuevo usuario
      user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0],
          level: 1,
          xp: 0,
          coins: 500,
          gems: 50,
          stats: {
            create: {
              gamesPlayed: 0,
              gamesWon: 0,
              totalScore: 0,
              bestScore: 0,
              totalMatches: 0,
              perfectMatches: 0,
              maxCombo: 0,
            },
          },
          inventory: {
            create: {
              ownedPacks: ['frutas'],
              ownedFrames: ['basic'],
              ownedSkins: ['classic'],
              ownedBoards: ['default'],
              equippedPack: 'frutas',
              equippedFrame: 'basic',
              equippedSkin: 'classic',
              equippedBoard: 'default',
            },
          },
        },
        include: {
          stats: true,
          inventory: true,
        },
      });
    }

    // Verificar si está baneado
    if (user.isBanned) {
      if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        return res.status(403).json({
          error: 'Usuario baneado',
          bannedUntil: user.bannedUntil,
          reason: user.banReason,
        });
      } else if (user.bannedUntil) {
        // Desbanear automáticamente si el tiempo expiró
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isBanned: false,
            bannedUntil: null,
            banReason: null,
          },
          include: {
            stats: true,
            inventory: true,
          },
        });
      } else {
        // Baneo permanente
        return res.status(403).json({
          error: 'Usuario baneado permanentemente',
          reason: user.banReason,
        });
      }
    }

    // Actualizar última fecha de login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    res.json(user);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
