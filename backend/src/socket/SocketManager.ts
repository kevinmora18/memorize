import { Server, Socket } from 'socket.io';
import { IRoomManager } from '../core/interfaces/IServices';
import { verifyToken, AuthTokenPayload } from '../core/JwtUtil';

/**
 * SocketManager - Gestor de conexiones Socket.IO con POO
 *
 * EXPLICACIÓN POO Y SOLID:
 * - ENCAPSULACIÓN: Agrupa toda la lógica y eventos de sockets en un componente autocontenido
 * - SRP: Exclusivamente responsable de la comunicación bidireccional en tiempo real
 * - DIP (Dependency Inversion Principle): Depende de la interfaz IRoomManager, no de la clase concreta
 * - SEGURIDAD: La identidad del jugador proviene del JWT (handshake), nunca del payload del cliente
 */
export class SocketManager {
  private io: Server;
  private roomManager: IRoomManager;
  private socketRooms: Map<string, { roomId: string; userId: string }>;

  constructor(io: Server, roomManager: IRoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.socketRooms = new Map();
  }

  initialize(): void {
    this.io.use(this.authenticateHandshake.bind(this));

    this.io.on('connection', (socket: Socket) => {
      this.log(`Usuario conectado: ${socket.id} -> ${socket.data.userId}`);

      this.registerRoomEvents(socket);
      this.registerGameEvents(socket);
      this.registerChatEvents(socket);
      this.registerConnectionEvents(socket);
    });

    this.log('Socket.IO handlers configurados');
  }

  /**
   * Middleware de autenticación: verifica el token JWT del handshake
   * y adjunta la identidad autenticada a socket.data
   */
  private authenticateHandshake(socket: Socket, next: (err?: Error) => void): void {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        next(new Error('Autenticación requerida'));
        return;
      }

      const payload: AuthTokenPayload | null = verifyToken(token);
      if (!payload) {
        next(new Error('Token inválido o expirado'));
        return;
      }

      socket.data.userId = payload.userId;
      socket.data.userName = payload.username || payload.userId;
      next();
    } catch (error: any) {
      this.logError('authenticateHandshake', error);
      next(new Error('Error de autenticación'));
    }
  }

  private registerRoomEvents(socket: Socket): void {
    socket.on('room:join', async ({ roomId, userLevel, password }) => {
      try {
        const userId = socket.data.userId as string;
        const userName = socket.data.userName as string;

        const room = this.roomManager.getRoom(roomId);

        if (!room) {
          socket.emit('room:error', { message: 'Sala no encontrada' });
          return;
        }

        if (room.isPrivate && !room.validatePassword(password || '')) {
          socket.emit('room:error', { message: 'Contraseña incorrecta' });
          return;
        }

        socket.join(roomId);

        if (room.hasPlayer(userId)) {
          room.reconnectPlayer(userId, socket.id);
        } else {
          this.roomManager.joinRoom(roomId, {
            id: userId,
            socketId: socket.id,
            name: userName,
            level: userLevel || 1,
            isReady: false,
            score: 0,
            matches: 0,
            isConnected: true,
          });
        }

        this.socketRooms.set(socket.id, { roomId, userId });

        this.io.to(roomId).emit('room:player-joined', {
          player: room.getPlayer(userId)?.toJSON(),
          players: room.getPlayers().map(p => p.toJSON()),
        });

        socket.emit('room:joined', {
          roomId,
          players: room.getPlayers().map(p => p.toJSON()),
          gameState: room.getGameState(),
        });

        this.broadcastRoomsUpdate();
        this.log(`${userName} se unió a la sala ${roomId}`);
      } catch (error: any) {
        this.logError('room:join', error);
        socket.emit('room:error', { message: error.message });
      }
    });

    socket.on('room:leave', ({ roomId }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        const player = room.getPlayer(userId);
        this.roomManager.leaveRoom(roomId, userId);
        socket.leave(roomId);
        this.socketRooms.delete(socket.id);

        this.io.to(roomId).emit('room:player-left', {
          playerId: userId,
          playerName: player?.name,
          players: room.getPlayers().map(p => p.toJSON()),
        });

        this.broadcastRoomsUpdate();
        this.log(`${player?.name} salió de la sala ${roomId}`);
      } catch (error: any) {
        this.logError('room:leave', error);
      }
    });

    socket.on('room:ready', ({ roomId, isReady }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.setPlayerReady(userId, isReady);

        this.io.to(roomId).emit('room:player-ready', {
          playerId: userId,
          isReady,
          players: room.getPlayers().map(p => p.toJSON()),
        });

        this.broadcastRoomsUpdate();
        this.log(`Jugador ${userId} está ${isReady ? 'listo' : 'no listo'}`);
      } catch (error: any) {
        this.logError('room:ready', error);
      }
    });
  }

  private registerGameEvents(socket: Socket): void {
    socket.on('game:start', ({ roomId, cards, mode }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        if (mode) {
          room.mode = mode;
        }

        if (room.hostId !== userId) {
          socket.emit('game:error', { message: 'Solo el host puede iniciar la partida' });
          return;
        }

        room.startGame(cards, true);

        this.io.to(roomId).emit('game:started', {
          gameState: room.getGameState(),
          cards,
          firstTurn: room.getGameState().currentTurn,
          mode: room.mode,
        });

        this.broadcastRoomsUpdate();
        this.log(`Partida iniciada en sala ${roomId} (Modo: ${room.mode})`);
      } catch (error: any) {
        this.logError('game:start', error);
        socket.emit('game:error', { message: error.message });
      }
    });

    socket.on('game:flip-card', ({ roomId, cardIndex }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.flipCard(userId, cardIndex);

        this.io.to(roomId).emit('game:card-flipped', {
          playerId: userId,
          cardIndex,
          flippedCards: room.getGameState().flippedCards,
        });

        const required = room.getRequiredFlipsCount();
        if (room.getGameState().flippedCards.length === required) {
          setTimeout(() => {
            this.checkMatch(roomId, userId);
          }, 1000);
        }
      } catch (error: any) {
        this.logError('game:flip-card', error);
        socket.emit('game:error', { message: error.message });
      }
    });

    socket.on('game:pass-turn', ({ roomId }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.clearFlippedCards();
        const nextTurn = room.nextTurn();

        this.io.to(roomId).emit('game:turn-changed', {
          currentTurn: nextTurn,
          passedBy: userId,
        });
      } catch (error: any) {
        this.logError('game:pass-turn', error);
      }
    });

    socket.on('game:emote', ({ roomId, emote }) => {
      try {
        const userId = socket.data.userId as string;
        const userName = socket.data.userName as string;
        this.io.to(roomId).emit('game:emote-received', {
          userId,
          userName,
          emote,
          timestamp: Date.now(),
        });
      } catch (error: any) {
        this.logError('game:emote', error);
      }
    });

    socket.on('game:rematch-request', ({ roomId }) => {
      try {
        const userId = socket.data.userId as string;
        const userName = socket.data.userName as string;
        this.io.to(roomId).emit('game:rematch-requested', {
          userId,
          userName,
        });
      } catch (error: any) {
        this.logError('game:rematch-request', error);
      }
    });

    socket.on('game:update-score', ({ roomId, score, matches }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        const player = room.getPlayer(userId);
        if (player) {
          player.score = Math.min(score || 0, 999999);
          player.matches = Math.min(matches || 0, 999);

          this.io.to(roomId).emit('game:score-updated', {
            playerId: userId,
            score: player.score,
            matches: player.matches,
            players: room.getPlayers().map(p => p.toJSON()),
          });
        }
      } catch (error: any) {
        this.logError('game:update-score', error);
      }
    });
  }

  private checkMatch(roomId: string, userId: string): void {
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) return;

      const { isMatch, cardIndexes } = room.checkMatch();

      if (isMatch) {
        room.registerMatch(userId, cardIndexes);

        this.io.to(roomId).emit('game:match-found', {
          playerId: userId,
          cardIndexes,
          matchedCards: room.getGameState().matchedCards,
          scores: Object.fromEntries(room.getGameState().scores),
          players: room.getPlayers().map(p => p.toJSON()),
        });

        if (room.isGameFinished()) {
          const winnerId = room.finishGame();

          this.io.to(roomId).emit('game:finished', {
            winnerId,
            scores: Object.fromEntries(room.getGameState().scores),
            players: room.getPlayers().map(p => p.toJSON()),
          });

          this.broadcastRoomsUpdate();
          this.log(`Partida terminada en sala ${roomId}. Ganador: ${winnerId}`);
        }
      } else {
        this.io.to(roomId).emit('game:no-match', {
          cardIndexes,
        });

        const nextTurn = room.nextTurn();
        this.io.to(roomId).emit('game:turn-changed', {
          currentTurn: nextTurn,
        });
      }

      room.clearFlippedCards();
    } catch (error: any) {
      this.logError('checkMatch', error);
    }
  }

  private broadcastRoomsUpdate(): void {
    try {
      const rooms = this.roomManager.getAvailableRooms().map(r => r.toJSON());
      this.io.emit('rooms:update', rooms);
    } catch (error: any) {
      this.logError('broadcastRoomsUpdate', error);
    }
  }

  private registerChatEvents(socket: Socket): void {
    socket.on('chat:message', ({ roomId, message }) => {
      try {
        const userId = socket.data.userId as string;
        const userName = socket.data.userName as string;

        this.io.to(roomId).emit('chat:message', {
          userId,
          userName,
          message,
          timestamp: new Date(),
        });
      } catch (error: any) {
        this.logError('chat:message', error);
      }
    });
  }

  private registerConnectionEvents(socket: Socket): void {
    socket.on('disconnect', () => {
      this.log(`Usuario desconectado: ${socket.id}`);

      const membership = this.socketRooms.get(socket.id);
      if (membership) {
        const { roomId, userId } = membership;
        const room = this.roomManager.getRoom(roomId);

        if (room) {
          room.disconnectPlayer(userId);
          this.io.to(roomId).emit('room:player-disconnected', {
            playerId: userId,
            players: room.getPlayers().map(p => p.toJSON()),
          });

          // Si todos los demás jugadores no están conectados y hay un solo jugador restante, limpiar
          const connectedPlayers = room.getPlayers().filter(p => p.isConnected);
          if (connectedPlayers.length === 0) {
            this.roomManager.leaveRoom(roomId, userId);
            room.getPlayers().forEach(p => this.roomManager.leaveRoom(roomId, p.id));
          }

          // Reasignar host si el host se desconectó
          if (room.hostId === userId && room.getPlayerCount() > 0) {
            const newHost = room.getPlayers().find(p => p.isConnected) || room.getPlayers()[0];
            this.io.to(roomId).emit('room:host-changed', { newHostId: newHost.id });
          }
        }

        this.socketRooms.delete(socket.id);
      }

      this.broadcastRoomsUpdate();
    });

    socket.on('room:reconnect', ({ roomId }) => {
      try {
        const userId = socket.data.userId as string;
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.reconnectPlayer(userId, socket.id);
        socket.join(roomId);
        this.socketRooms.set(socket.id, { roomId, userId });

        this.io.to(roomId).emit('room:player-reconnected', {
          playerId: userId,
        });

        socket.emit('room:state', {
          roomId,
          players: room.getPlayers().map(p => p.toJSON()),
          gameState: room.getGameState(),
        });

        this.log(`Jugador ${userId} reconectado a sala ${roomId}`);
      } catch (error: any) {
        this.logError('room:reconnect', error);
      }
    });
  }

  private log(message: string): void {
    console.log(`[SocketManager] ${message}`);
  }

  private logError(event: string, error: any): void {
    console.error(`[SocketManager] Error en ${event}:`, error.message);
  }
}