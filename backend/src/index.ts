import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5175;

// Crear instancia de Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ==================== USER ROUTES ====================

// Register or login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        inventory: true,
      },
    });

    if (!user) {
      // Create new user with default stats and inventory
      user = await prisma.user.create({
        data: {
          email,
          username: username || email.split('@')[0],
          stats: {
            create: {},
          },
          inventory: {
            create: {
              ownedPacks: ['frutas'],
              ownedFrames: ['basic'],
              ownedSkins: ['classic'],
              ownedBoards: ['default'],
            },
          },
        },
        include: {
          stats: true,
          inventory: true,
        },
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        inventory: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user stats
app.put('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const statsData = req.body;

    const stats = await prisma.playerStats.upsert({
      where: { userId },
      update: statsData,
      create: {
        userId,
        ...statsData,
      },
    });

    res.json(stats);
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== INVENTORY ROUTES ====================

// Get user inventory
app.get('/api/users/:userId/inventory', async (req, res) => {
  try {
    const { userId } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { userId },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory (buy items, equip items)
app.put('/api/users/:userId/inventory', async (req, res) => {
  try {
    const { userId } = req.params;
    const inventoryData = req.body;

    const inventory = await prisma.inventory.upsert({
      where: { userId },
      update: inventoryData,
      create: {
        userId,
        ...inventoryData,
      },
    });

    res.json(inventory);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MATCH ROUTES ====================

// Save match result
app.post('/api/matches', async (req, res) => {
  try {
    const { userId, mode, level, score, accuracy, combo, timeLeft, won } = req.body;

    if (!userId || !mode || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const match = await prisma.match.create({
      data: {
        userId,
        mode,
        level,
        score,
        accuracy,
        combo,
        timeLeft,
        won,
      },
    });

    // Update user stats
    const stats = await prisma.playerStats.findUnique({
      where: { userId },
    });

    if (stats) {
      await prisma.playerStats.update({
        where: { userId },
        data: {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
          totalScore: stats.totalScore + score,
          bestScore: Math.max(stats.bestScore, score),
          maxCombo: combo ? Math.max(stats.maxCombo, combo) : stats.maxCombo,
        },
      });
    }

    res.json(match);
  } catch (error) {
    console.error('Save match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user match history
app.get('/api/users/:userId/matches', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const matches = await prisma.match.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topPlayers = await prisma.user.findMany({
      include: {
        stats: true,
      },
      orderBy: {
        stats: {
          bestScore: 'desc',
        },
      },
      take: limit,
    });

    res.json(topPlayers);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (Admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        stats: true,
        inventory: true,
        _count: {
          select: { matches: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all matches (Admin only)
app.get('/api/admin/matches', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        user: {
          select: {
            email: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(matches);
  } catch (error) {
    console.error('Get all matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics (Admin only)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalMatches = await prisma.match.count();
    const totalGamesWon = await prisma.match.count({ where: { won: true } });
    
    const avgScore = await prisma.match.aggregate({
      _avg: { score: true }
    });

    const topScores = await prisma.match.findMany({
      orderBy: { score: 'desc' },
      take: 10,
      include: {
        user: {
          select: { email: true, username: true }
        }
      }
    });

    res.json({
      totalUsers,
      totalMatches,
      totalGamesWon,
      avgScore: avgScore._avg.score || 0,
      topScores
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (Admin only)
app.put('/api/admin/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['player', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.json(user);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user coins/gems (Admin only)
app.put('/api/admin/users/:userId/currency', async (req, res) => {
  try {
    const { userId } = req.params;
    const { coins, gems } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        coins: coins !== undefined ? coins : undefined,
        gems: gems !== undefined ? gems : undefined
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BAN SYSTEM ====================

// Ban user (Admin only)
app.post('/api/admin/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration, adminId } = req.body; // duration in hours

    const bannedUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedUntil,
        banReason: reason
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'ban_user',
        targetId: userId,
        details: JSON.stringify({ reason, duration })
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unban user (Admin only)
app.post('/api/admin/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminId } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedUntil: null,
        banReason: null
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'unban_user',
        targetId: userId
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get banned users (Admin only)
app.get('/api/admin/banned-users', async (req, res) => {
  try {
    const bannedUsers = await prisma.user.findMany({
      where: { isBanned: true },
      include: {
        stats: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(bannedUsers);
  } catch (error) {
    console.error('Get banned users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANNOUNCEMENTS ====================

// Get active announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create announcement (Admin only)
app.post('/api/admin/announcements', async (req, res) => {
  try {
    const { title, message, type, expiresAt, adminId } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        type: type || 'info',
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'create_announcement',
        targetId: announcement.id,
        details: JSON.stringify({ title, message })
      }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all announcements (Admin only)
app.get('/api/admin/announcements', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete announcement (Admin only)
app.delete('/api/admin/announcements/:announcementId', async (req, res) => {
  try {
    const { announcementId } = req.params;

    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle announcement active status (Admin only)
app.put('/api/admin/announcements/:announcementId/toggle', async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: { isActive: !announcement.isActive }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROMOTIONS ====================

// Get active promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });

    res.json(promotions);
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create promotion (Admin only)
app.post('/api/admin/promotions', async (req, res) => {
  try {
    const { name, description, type, value, startDate, endDate, adminId } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        type,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'create_promotion',
        targetId: promotion.id,
        details: JSON.stringify({ name, type, value })
      }
    });

    res.json(promotion);
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all promotions (Admin only)
app.get('/api/admin/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(promotions);
  } catch (error) {
    console.error('Get all promotions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete promotion (Admin only)
app.delete('/api/admin/promotions/:promotionId', async (req, res) => {
  try {
    const { promotionId } = req.params;

    await prisma.promotion.delete({
      where: { id: promotionId }
    });

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN LOGS ====================

// Get admin logs (Admin only)
app.get('/api/admin/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await prisma.adminLog.findMany({
      include: {
        admin: {
          select: {
            email: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(logs);
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANALYTICS ====================

// Get analytics data (Admin only)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Users registered per day
    const usersPerDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Matches per day
    const matchesPerDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM matches
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Most popular game modes
    const popularModes = await prisma.match.groupBy({
      by: ['mode'],
      _count: { mode: true },
      orderBy: { _count: { mode: 'desc' } }
    });

    // Active users (played in last 7 days)
    const activeUsers = await prisma.user.count({
      where: {
        matches: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      }
    });

    res.json({
      usersPerDay,
      matchesPerDay,
      popularModes,
      activeUsers
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Give currency to all users (Admin only)
app.post('/api/admin/give-all-currency', async (req, res) => {
  try {
    const { coins, gems, adminId } = req.body;

    const updateData: any = {};
    if (coins !== undefined) updateData.coins = { increment: coins };
    if (gems !== undefined) updateData.gems = { increment: gems };

    await prisma.user.updateMany({
      data: updateData
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'give_currency_all',
        details: JSON.stringify({ coins, gems })
      }
    });

    res.json({ message: 'Currency given to all users successfully' });
  } catch (error) {
    console.error('Give currency to all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban user (Admin only)
app.put('/api/admin/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in days

    const bannedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: true,
        bannedUntil,
        banReason: reason || 'No reason provided'
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unban user (Admin only)
app.put('/api/admin/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: false,
        bannedUntil: null,
        banReason: null
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get banned users (Admin only)
app.get('/api/admin/banned-users', async (req, res) => {
  try {
    const bannedUsers = await prisma.user.findMany({
      where: { isBanned: true },
      include: {
        stats: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(bannedUsers);
  } catch (error) {
    console.error('Get banned users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANNOUNCEMENTS ROUTES ====================

// Get all announcements (Admin only)
app.get('/api/admin/announcements', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active announcements (Public)
app.get('/api/announcements', async (req, res) => {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create announcement (Admin only)
app.post('/api/admin/announcements', async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        type: type || 'info',
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete announcement (Admin only)
app.delete('/api/admin/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle announcement active status (Admin only)
app.put('/api/admin/announcements/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isActive: !announcement.isActive }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROMOTIONS ROUTES ====================

// Get all promotions (Admin only)
app.get('/api/admin/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(promotions);
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active promotions (Public)
app.get('/api/promotions', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    res.json(promotions);
  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create promotion (Admin only)
app.post('/api/admin/promotions', async (req, res) => {
  try {
    const { name, description, type, value, endDate } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        type,
        value: parseFloat(value),
        endDate: new Date(endDate)
      }
    });

    res.json(promotion);
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete promotion (Admin only)
app.delete('/api/admin/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.promotion.delete({
      where: { id }
    });

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Give currency to all users (Admin only)
app.post('/api/admin/give-currency-all', async (req, res) => {
  try {
    const { coins, gems } = req.body;

    const updateData: any = {};
    if (coins !== undefined) updateData.coins = { increment: coins };
    if (gems !== undefined) updateData.gems = { increment: gems };

    await prisma.user.updateMany({
      data: updateData
    });

    res.json({ message: 'Currency given to all users successfully' });
  } catch (error) {
    console.error('Give currency to all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get analytics data (Admin only)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // Users registered per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const usersPerDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Most popular game modes
    const modeStats = await prisma.match.groupBy({
      by: ['mode'],
      _count: { mode: true },
      orderBy: { _count: { mode: 'desc' } }
    });

    // Active users (played in last 7 days)
    const activeUsers = await prisma.match.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      distinct: ['userId']
    });

    res.json({
      usersPerDay,
      modeStats,
      activeUsersCount: activeUsers.length
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Database connected`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
