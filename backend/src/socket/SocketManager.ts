import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';

/**
 * SocketManager - Gestor de conexiones Socket.IO con POO
 * 
 * EXPLICACIÓN POO:
 * - ENCAPSULACIÓN: Agrupa toda la lógica de sockets
 * - SRP: Solo maneja eventos de socket
 * - DEPENDENCY INJECTION: Recibe RoomManager como dependencia
 */
export class SocketManager {
  private io: Server;
  private roomManager: RoomManager;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Inicializar todos los handlers de socket
   */
  initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      this.log(`Usuario conectado: ${socket.id}`);

      // Registrar todos los eventos
      this.registerRoomEvents(socket);
      this.registerGameEvents(socket);
      this.registerChatEvents(socket);
      this.registerConnectionEvents(socket);
    });

    this.log('Socket.IO handlers configurados');
  }

  /**
   * Registrar eventos de sala
   */
  private registerRoomEvents(socket: Socket): void {
    // Unirse a una sala
    socket.on('room:join', async ({ roomId, userId, userName, userLevel }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        
        if (!room) {
          socket.emit('room:error', { message: 'Sala no encontrada' });
          return;
        }

        socket.join(roomId);

        // Si el jugador ya existe, actualizar socket
        if (room.hasPlayer(userId)) {
          room.reconnectPlayer(userId, socket.id);
        } else {
          room.addPlayer({
            id: userId,
            socketId: socket.id,
            name: userName,
            level: userLevel,
            isReady: false,
            score: 0,
            matches: 0,
            isConnected: true,
          });
        }

        // Notificar a todos
        this.io.to(roomId).emit('room:player-joined', {
          player: room.getPlayer(userId)?.toJSON(),
          players: room.getPlayers().map(p => p.toJSON()),
        });

        // Enviar estado actual al jugador
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

    // Salir de una sala
    socket.on('room:leave', ({ roomId, userId }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        const player = room.getPlayer(userId);
        room.removePlayer(userId);
        socket.leave(roomId);

        this.io.to(roomId).emit('room:player-left', {
          playerId: userId,
          playerName: player?.name,
          players: room.getPlayers().map(p => p.toJSON()),
        });

        if (room.isEmpty()) {
          this.roomManager.deleteRoom(roomId);
        }

        this.broadcastRoomsUpdate();
        this.log(`${player?.name} salió de la sala ${roomId}`);
      } catch (error: any) {
        this.logError('room:leave', error);
      }
    });

    // Marcar como listo
    socket.on('room:ready', ({ roomId, userId, isReady }) => {
      try {
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

  /**
   * Registrar eventos de juego
   */
  private registerGameEvents(socket: Socket): void {
    // Iniciar partida
    socket.on('game:start', ({ roomId, cards, mode }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        if (mode) {
          room.mode = mode;
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

    // Voltear carta
    socket.on('game:flip-card', ({ roomId, userId, cardIndex }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.flipCard(userId, cardIndex);

        this.io.to(roomId).emit('game:card-flipped', {
          playerId: userId,
          cardIndex,
          flippedCards: room.getGameState().flippedCards,
        });

        // Si se voltearon todas las cartas requeridas (2 para parejas, 3 para tríadas)
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

    // Pasar turno por tiempo
    socket.on('game:pass-turn', ({ roomId, userId }) => {
      try {
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

    // Enviar Emote en vivo
    socket.on('game:emote', ({ roomId, userId, userName, emote }) => {
      try {
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

    // Petición de revancha
    socket.on('game:rematch-request', ({ roomId, userId, userName }) => {
      try {
        this.io.to(roomId).emit('game:rematch-requested', {
          userId,
          userName,
        });
      } catch (error: any) {
        this.logError('game:rematch-request', error);
      }
    });

    // Actualizar puntuación
    socket.on('game:update-score', ({ roomId, userId, score, matches }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        const player = room.getPlayer(userId);
        if (player) {
          player.score = score;
          player.matches = matches;

          this.io.to(roomId).emit('game:score-updated', {
            playerId: userId,
            score,
            matches,
            players: room.getPlayers().map(p => p.toJSON()),
          });
        }
      } catch (error: any) {
        this.logError('game:update-score', error);
      }
    });
  }

  /**
   * Verificar match de cartas
   */
  private checkMatch(roomId: string, userId: string): void {
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) return;

      const { isMatch, cardIndexes } = room.checkMatch();

      if (isMatch) {
        // Match encontrado
        room.registerMatch(userId, cardIndexes);

        this.io.to(roomId).emit('game:match-found', {
          playerId: userId,
          cardIndexes,
          matchedCards: room.getGameState().matchedCards,
          scores: Object.fromEntries(room.getGameState().scores),
          players: room.getPlayers().map(p => p.toJSON()),
        });

        // Verificar si el juego terminó
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
        // No hay match
        this.io.to(roomId).emit('game:no-match', {
          cardIndexes,
        });

        // Cambiar turno
        const nextTurn = room.nextTurn();

        this.io.to(roomId).emit('game:turn-changed', {
          currentTurn: nextTurn,
        });
      }

      // Limpiar cartas volteadas
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

  /**
   * Registrar eventos de chat
   */
  private registerChatEvents(socket: Socket): void {
    socket.on('chat:message', ({ roomId, userId, userName, message }) => {
      try {
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

  /**
   * Registrar eventos de conexión/desconexión
   */
  private registerConnectionEvents(socket: Socket): void {
    // Desconexión
    socket.on('disconnect', () => {
      this.log(`Usuario desconectado: ${socket.id}`);

      // Buscar en qué sala estaba
      // (implementación similar a handlers.ts original)
    });

    // Reconexión
    socket.on('room:reconnect', ({ roomId, userId }) => {
      try {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        room.reconnectPlayer(userId, socket.id);
        socket.join(roomId);

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

  /**
   * Logging
   */
  private log(message: string): void {
    console.log(`[SocketManager] ${message}`);
  }

  private logError(event: string, error: any): void {
    console.error(`[SocketManager] Error en ${event}:`, error.message);
  }
}
