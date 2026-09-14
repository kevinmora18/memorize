import { GameRoom, IPlayer, GameStatus } from '../models/domain/GameRoom.model';
import { IRoomManager } from '../core/interfaces/IServices';

/**
 * RoomManager - Gestor de salas (Patrón Singleton)
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - SINGLETON: Garantiza una única instancia compartida del gestor en memoria
 * - ISP: Implementa la interfaz específica IRoomManager
 * - ENCAPSULACIÓN: Oculta la estructura Map interna de salas y expone operaciones seguras
 * - SRP: Exclusivamente responsable del ciclo de vida y búsqueda de salas de juego
 */
export class RoomManager implements IRoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, GameRoom>;

  private constructor() {
    this.rooms = new Map();
    this.startCleanupTask();
  }

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  createRoom(data: {
    name: string;
    code?: string;
    hostId: string;
    hostName: string;
    hostLevel: number;
    maxPlayers: number;
    mode: string;
    cardCount?: number;
    difficulty: string;
    isPrivate: boolean;
    password?: string;
  }): GameRoom {
    const roomId = this.generateRoomId();
    const code = data.code || Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = new GameRoom({
      id: roomId,
      code,
      name: data.name,
      hostId: data.hostId,
      hostName: data.hostName,
      maxPlayers: data.maxPlayers,
      mode: data.mode,
      cardCount: data.cardCount || 12,
      difficulty: data.difficulty,
      isPrivate: data.isPrivate,
      password: data.password,
      createdAt: new Date(),
    });

    room.addPlayer({
      id: data.hostId,
      socketId: '',
      name: data.hostName,
      level: data.hostLevel,
      isReady: false,
      score: 0,
      matches: 0,
      isConnected: true,
    });

    this.rooms.set(roomId, room);
    console.log(`🏠 Sala creada: ${roomId} [Código: ${code}] (${data.name})`);

    return room;
  }

  getRoom(roomIdOrCode: string): GameRoom | undefined {
    if (this.rooms.has(roomIdOrCode)) {
      return this.rooms.get(roomIdOrCode);
    }
    const search = roomIdOrCode.trim().toUpperCase();
    for (const room of this.rooms.values()) {
      if (room.code && room.code.toUpperCase() === search) {
        return room;
      }
      if (room.id.toUpperCase() === search) {
        return room;
      }
    }
    return undefined;
  }

  hasRoom(roomIdOrCode: string): boolean {
    return this.getRoom(roomIdOrCode) !== undefined;
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      console.log(`🗑️  Sala eliminada: ${roomId}`);
    }
    return deleted;
  }

  getAvailableRooms(filters?: {
    mode?: string;
    status?: GameStatus;
  }): GameRoom[] {
    let rooms = Array.from(this.rooms.values());

    rooms = rooms.filter(room => !room.isPrivate);

    if (filters?.mode) {
      rooms = rooms.filter(room => room.mode === filters.mode);
    }

    if (filters?.status) {
      rooms = rooms.filter(room => room.getGameState().status === filters.status);
    } else {
      rooms = rooms.filter(room => room.getGameState().status === GameStatus.WAITING);
    }

    rooms = rooms.filter(room => !room.isFull());
    rooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return rooms;
  }

  joinRoom(roomId: string, playerData: IPlayer, password?: string): GameRoom {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error('Sala no encontrada');
    }

    if (room.isPrivate && !room.validatePassword(password || '')) {
      throw new Error('Contraseña incorrecta');
    }

    room.addPlayer(playerData);
    console.log(`👤 ${playerData.name} se unió a la sala ${roomId}`);

    return room;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.removePlayer(playerId);
    console.log(`👋 Jugador ${playerId} salió de la sala ${roomId}`);

    if (room.isEmpty()) {
      this.deleteRoom(roomId);
    }
  }

  private cleanupOldRooms(): void {
    const now = new Date();
    const maxAge = 60 * 60 * 1000;

    this.rooms.forEach((room, roomId) => {
      const age = now.getTime() - room.createdAt.getTime();
      const status = room.getGameState().status;

      if (age > maxAge && status === GameStatus.WAITING) {
        this.deleteRoom(roomId);
      }

      if (room.isEmpty()) {
        this.deleteRoom(roomId);
      }
    });
  }

  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupOldRooms();
    }, 10 * 60 * 1000);

    console.log('🧹 Tarea de limpieza de salas iniciada');
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): {
    totalRooms: number;
    waitingRooms: number;
    playingRooms: number;
    totalPlayers: number;
  } {
    return {
      totalRooms: this.rooms.size,
      waitingRooms: Array.from(this.rooms.values()).filter(
        r => r.getGameState().status === GameStatus.WAITING
      ).length,
      playingRooms: Array.from(this.rooms.values()).filter(
        r => r.getGameState().status === GameStatus.PLAYING
      ).length,
      totalPlayers: Array.from(this.rooms.values()).reduce(
        (sum, room) => sum + room.getPlayerCount(),
        0
      ),
    };
  }
}
