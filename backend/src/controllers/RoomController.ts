import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { IRoomManager } from '../core/interfaces/IServices';
import { IUserRepository } from '../core/interfaces/IRepository';
import { GameStatus } from '../models/domain/GameRoom.model';

/**
 * RoomController - Controlador para rutas de salas
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseController
 * - DIP (Dependency Inversion Principle): Depende de IRoomManager e IUserRepository
 * - SRP: Maneja peticiones HTTP de creación, unión y consulta de salas
 */
export class RoomController extends BaseController {
  private roomManager: IRoomManager;
  private userRepository: IUserRepository;

  constructor(roomManager: IRoomManager, userRepository: IUserRepository) {
    super('RoomController');
    this.roomManager = roomManager;
    this.userRepository = userRepository;
  }

  listRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mode, status } = req.query;

      const rooms = this.roomManager.getAvailableRooms({
        mode: mode as string,
        status: status as GameStatus,
      });

      this.sendSuccess(res, rooms.map(room => room.toJSON()));
    } catch (error) {
      this.handleHttpError(res, error, 'Error listando salas');
    }
  };

  getRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const room = this.roomManager.getRoom(roomId);

      if (!room) {
        this.sendError(res, 'Sala no encontrada', 404);
        return;
      }

      this.sendSuccess(res, room.toJSON());
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo sala');
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, hostId, creator, maxPlayers, mode, difficulty, isPrivate, password } = req.body;
      const actualHostId = hostId || creator?.id || `user_${Date.now()}`;
      const actualName = name || `Sala de ${creator?.email?.split('@')[0] || 'Jugador'}`;

      let user = null;
      try {
        user = await this.userRepository.findById(actualHostId);
      } catch (err) {
        // Fallback si no está en BD
      }

      const hostName = user?.username || user?.email || creator?.email || 'Jugador';
      const hostLevel = user?.level || 1;

      const room = this.roomManager.createRoom({
        name: actualName,
        code: req.body.code,
        hostId: actualHostId,
        hostName,
        hostLevel,
        maxPlayers: maxPlayers && maxPlayers >= 2 && maxPlayers <= 8 ? maxPlayers : 2,
        mode: mode || 'triads',
        cardCount: req.body.cardCount || 12,
        difficulty: difficulty || 'normal',
        isPrivate: isPrivate || false,
        password: isPrivate ? password : undefined,
      });

      this.sendSuccess(res, room.toJSON());
    } catch (error) {
      this.handleHttpError(res, error, 'Error creando sala');
    }
  };

  joinRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const { userId, player, password } = req.body;
      const actualUserId = userId || player?.id || `user_${Date.now()}`;

      let user = null;
      try {
        user = await this.userRepository.findById(actualUserId);
      } catch (err) {
        // Fallback
      }

      const userName = user?.username || user?.email || player?.email || 'Jugador';
      const userLevel = user?.level || 1;

      const room = this.roomManager.joinRoom(
        roomId,
        {
          id: actualUserId,
          socketId: '',
          name: userName,
          level: userLevel,
          isReady: false,
          score: 0,
          matches: 0,
          isConnected: true,
        },
        password
      );

      this.sendSuccess(res, room.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error uniéndose a la sala');
    }
  };

  leaveRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const { userId } = req.body;

      this.roomManager.leaveRoom(roomId, userId);
      const room = this.roomManager.getRoom(roomId);

      if (!room) {
        this.sendSuccess(res, { message: 'Sala eliminada' });
        return;
      }

      this.sendSuccess(res, room.toJSON());
    } catch (error) {
      this.handleHttpError(res, error, 'Error al salir de la sala');
    }
  };

  setReady = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const { userId, isReady } = req.body;

      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        this.sendError(res, 'Sala no encontrada', 404);
        return;
      }

      room.setPlayerReady(userId, isReady);
      this.sendSuccess(res, room.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al actualizar estado de listo');
    }
  };

  startGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const { hostId, cards } = req.body;

      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        this.sendError(res, 'Sala no encontrada', 404);
        return;
      }

      if (room.hostId !== hostId) {
        this.sendError(res, 'Solo el host puede iniciar la partida', 403);
        return;
      }

      room.startGame(cards);
      this.sendSuccess(res, room.toJSON());
    } catch (error: any) {
      this.handleHttpError(res, error, 'Error al iniciar juego en la sala');
    }
  };

  deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId as string;
      const { hostId } = req.body;

      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        this.sendError(res, 'Sala no encontrada', 404);
        return;
      }

      if (room.hostId !== hostId) {
        this.sendError(res, 'Solo el host puede eliminar la sala', 403);
        return;
      }

      this.roomManager.deleteRoom(roomId);
      this.sendSuccess(res, { message: 'Sala eliminada correctamente' });
    } catch (error) {
      this.handleHttpError(res, error, 'Error al eliminar sala');
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.roomManager.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleHttpError(res, error, 'Error obteniendo estadísticas');
    }
  };
}
