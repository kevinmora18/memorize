import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Almacenamiento temporal de salas en memoria (en producción usar Redis)
interface Room {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    id: string;
    name: string;
    level: number;
    isReady: boolean;
  }>;
  mode: string;
  difficulty: string;
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

const rooms = new Map<string, Room>();

// GET /api/rooms - Listar salas disponibles
router.get('/', async (req, res) => {
  try {
    const { mode, status } = req.query;

    let filteredRooms = Array.from(rooms.values());

    // Filtrar por modo
    if (mode) {
      filteredRooms = filteredRooms.filter(room => room.mode === mode);
    }

    // Filtrar por estado
    if (status) {
      filteredRooms = filteredRooms.filter(room => room.status === status);
    }

    // Solo mostrar salas públicas que no estén llenas
    filteredRooms = filteredRooms.filter(
      room => !room.isPrivate && room.currentPlayers < room.maxPlayers && room.status === 'waiting'
    );

    // Ordenar por fecha de creación (más recientes primero)
    filteredRooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(filteredRooms);
  } catch (error) {
    console.error('Error listando salas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/rooms/:roomId - Obtener información de una sala específica
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error obteniendo sala:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/rooms - Crear nueva sala
router.post('/', async (req, res) => {
  try {
    const { name, hostId, hostName, maxPlayers, mode, difficulty, isPrivate, password } = req.body;

    // Validaciones
    if (!name || !hostId || !hostName) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    if (maxPlayers < 2 || maxPlayers > 8) {
      return res.status(400).json({ error: 'Número de jugadores debe estar entre 2 y 8' });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar ID único para la sala
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear sala
    const room: Room = {
      id: roomId,
      name,
      hostId,
      hostName,
      maxPlayers: maxPlayers || 4,
      currentPlayers: 1,
      players: [
        {
          id: hostId,
          name: hostName,
          level: user.level,
          isReady: false,
        },
      ],
      mode: mode || 'classic',
      difficulty: difficulty || 'normal',
      isPrivate: isPrivate || false,
      password: isPrivate ? password : undefined,
      status: 'waiting',
      createdAt: new Date(),
    };

    rooms.set(roomId, room);

    res.json(room);
  } catch (error) {
    console.error('Error creando sala:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/rooms/:roomId/join - Unirse a una sala
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName, password } = req.body;

    // Validaciones
    if (!userId || !userName) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    // Verificar estado de la sala
    if (room.status !== 'waiting') {
      return res.status(400).json({ error: 'La sala ya está en juego' });
    }

    // Verificar capacidad
    if (room.currentPlayers >= room.maxPlayers) {
      return res.status(400).json({ error: 'Sala llena' });
    }

    // Verificar si ya está en la sala
    if (room.players.some(p => p.id === userId)) {
      return res.status(400).json({ error: 'Ya estás en esta sala' });
    }

    // Verificar contraseña si es privada
    if (room.isPrivate && room.password !== password) {
      return res.status(403).json({ error: 'Contraseña incorrecta' });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Agregar jugador a la sala
    room.players.push({
      id: userId,
      name: userName,
      level: user.level,
      isReady: false,
    });
    room.currentPlayers++;

    rooms.set(roomId, room);

    res.json(room);
  } catch (error) {
    console.error('Error uniéndose a sala:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/rooms/:roomId/leave - Salir de una sala
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    // Remover jugador
    room.players = room.players.filter(p => p.id !== userId);
    room.currentPlayers--;

    // Si era el host, asignar nuevo host o eliminar sala
    if (room.hostId === userId) {
      if (room.players.length > 0) {
        room.hostId = room.players[0].id;
        room.hostName = room.players[0].name;
      } else {
        // Eliminar sala si no quedan jugadores
        rooms.delete(roomId);
        return res.json({ message: 'Sala eliminada' });
      }
    }

    rooms.set(roomId, room);

    res.json(room);
  } catch (error) {
    console.error('Error saliendo de sala:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/rooms/:roomId/ready - Marcar jugador como listo
router.put('/:roomId/ready', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, isReady } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    // Actualizar estado del jugador
    const player = room.players.find(p => p.id === userId);
    if (player) {
      player.isReady = isReady;
    }

    rooms.set(roomId, room);

    res.json(room);
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/rooms/:roomId/start - Iniciar partida
router.put('/:roomId/start', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { hostId } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    // Verificar que quien inicia es el host
    if (room.hostId !== hostId) {
      return res.status(403).json({ error: 'Solo el host puede iniciar la partida' });
    }

    // Verificar que hay al menos 2 jugadores
    if (room.currentPlayers < 2) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 jugadores' });
    }

    // Verificar que todos estén listos (excepto el host)
    const allReady = room.players.every(p => p.id === hostId || p.isReady);
    if (!allReady) {
      return res.status(400).json({ error: 'No todos los jugadores están listos' });
    }

    // Cambiar estado de la sala
    room.status = 'playing';
    rooms.set(roomId, room);

    res.json(room);
  } catch (error) {
    console.error('Error iniciando partida:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/rooms/:roomId - Eliminar sala (solo host)
router.delete('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { hostId } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    // Verificar que quien elimina es el host
    if (room.hostId !== hostId) {
      return res.status(403).json({ error: 'Solo el host puede eliminar la sala' });
    }

    rooms.delete(roomId);

    res.json({ message: 'Sala eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando sala:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Función auxiliar para limpiar salas antiguas (ejecutar periódicamente)
export function cleanupOldRooms() {
  const now = new Date();
  const maxAge = 60 * 60 * 1000; // 1 hora

  for (const [roomId, room] of rooms.entries()) {
    const age = now.getTime() - room.createdAt.getTime();
    if (age > maxAge && room.status === 'waiting') {
      rooms.delete(roomId);
      console.log(`Sala ${roomId} eliminada por inactividad`);
    }
  }
}

// Limpiar salas cada 10 minutos
setInterval(cleanupOldRooms, 10 * 60 * 1000);

export { rooms };
export default router;
