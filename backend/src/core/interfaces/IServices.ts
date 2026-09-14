/**
 * IServices.ts - Interfaces para la capa de servicios
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - ISP: Cada servicio tiene un contrato claro y específico
 * - DIP: Los controladores dependen de estas interfaces de servicio, no de las clases concretas
 * - ABSTRACCIÓN: Define las capacidades de cada caso de uso sin acoplar detalles de infraestructura
 */

import { User } from '../../models/domain/User.model';
import { PlayerStats } from '../../models/domain/PlayerStats.model';
import { Match } from '../../models/domain/Match.model';
import { GameRoom, IPlayer, GameStatus } from '../../models/domain/GameRoom.model';

export interface IAuthService {
  initialize(): Promise<void>;
  register(email: string, password: string, username?: string): Promise<User>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  validateAccess(userId: string): Promise<boolean>;
  isAdmin(userId: string): Promise<boolean>;
}

export interface IUserService {
  initialize(): Promise<void>;
  getUserProfile(userId: string): Promise<{ user: User; stats: PlayerStats | null }>;
  addXpToUser(userId: string, xpAmount: number): Promise<{ user: User; levelsGained: number }>;
  updateCurrency(userId: string, coins?: number, gems?: number): Promise<User>;
  rewardCoins(userId: string, amount: number): Promise<User>;
  recordGamePlayed(
    userId: string,
    gameData: {
      score: number;
      won: boolean;
      matches: number;
      perfectMatches: number;
      combo: number;
      xpEarned: number;
      coinsEarned: number;
    }
  ): Promise<{ user: User; stats: PlayerStats; levelsGained: number }>;
  getUserAchievements(userId: string): Promise<string[]>;
  getPlayerRanking(userId: string): Promise<{ rank: number; totalPlayers: number; percentile: number }>;
  banUser(userId: string, reason: string, duration?: number): Promise<User>;
  unbanUser(userId: string): Promise<User>;
  getBannedUsers(): Promise<User[]>;
  getTopPlayers(limit?: number): Promise<Array<{ user: User; stats: PlayerStats }>>;
}

export interface IMatchService {
  initialize(): Promise<void>;
  saveMatch(data: {
    userId: string;
    mode: string;
    level?: number;
    score: number;
    accuracy?: number;
    combo?: number;
    timeLeft?: number;
    won: boolean;
  }): Promise<{ match: Match; xpEarned: number; coinsEarned: number; user: User }>;
  getUserMatches(
    userId: string,
    options?: { page?: number; limit?: number; mode?: string }
  ): Promise<{ matches: Match[]; total: number }>;
  getAllMatches(options?: {
    page?: number;
    limit?: number;
    mode?: string;
    userId?: string;
  }): Promise<{ matches: Match[]; total: number }>;
  getBestScoresByMode(mode: string, limit?: number): Promise<Match[]>;
  getMatchesByDateRange(startDate: Date, endDate: Date): Promise<Match[]>;
}

export interface IAdminService {
  initialize(): Promise<void>;
  verifyAdmin(adminId: string): Promise<boolean>;
  listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    banned?: boolean;
  }): Promise<{ users: any[]; total: number; totalPages: number }>;
  getUserDetail(userId: string): Promise<any>;
  changeUserRole(userId: string, newRole: string, adminId: string): Promise<User>;
  updateUserCurrency(
    userId: string,
    coins: number | undefined,
    gems: number | undefined,
    adminId: string
  ): Promise<User>;
  deleteUser(userId: string, adminId: string): Promise<void>;
  banUser(userId: string, reason: string, durationMinutes: number | undefined, adminId: string): Promise<User>;
  unbanUser(userId: string, adminId: string): Promise<User>;
  getBannedUsers(): Promise<User[]>;
  getAllMatches(options?: { page?: number; limit?: number; mode?: string; userId?: string }): Promise<{ matches: any[]; total: number }>;
  getGeneralStats(): Promise<any>;
  getAnalytics(period: string): Promise<any>;
  listAnnouncements(): Promise<any[]>;
  createAnnouncement(data: {
    title: string;
    message: string;
    type?: string;
    expiresAt?: string;
    adminId: string;
  }): Promise<any>;
  toggleAnnouncement(id: string, isActive: boolean): Promise<any>;
  deleteAnnouncement(id: string): Promise<void>;
  listPromotions(): Promise<any[]>;
  createPromotion(data: {
    name: string;
    description?: string;
    type: string;
    value: number;
    startDate?: string;
    endDate: string;
    adminId: string;
  }): Promise<any>;
  deletePromotion(id: string): Promise<void>;
  giveCurrencyToAll(
    coins: number | undefined,
    gems: number | undefined,
    adminId: string
  ): Promise<{ affectedUsers: number }>;
  getLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    adminId?: string;
  }): Promise<{ logs: any[]; total: number; totalPages: number }>;
}

export interface ILeaderboardService {
  initialize(): Promise<void>;
  getGlobalLeaderboard(
    type?: string,
    limit?: number
  ): Promise<{ leaderboard: any[]; total: number }>;
  getUserRank(
    userId: string,
    type?: string
  ): Promise<{ rank: number; value: number; userId: string; username: string | null }>;
  getLeaderboardByMode(
    mode: string,
    limit?: number
  ): Promise<{ leaderboard: any[]; mode: string }>;
  getWeeklyLeaderboard(limit?: number): Promise<any>;
  getMonthlyLeaderboard(limit?: number): Promise<any>;
}

export interface IRoomManager {
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
  }): GameRoom;
  getRoom(roomIdOrCode: string): GameRoom | undefined;
  hasRoom(roomIdOrCode: string): boolean;
  deleteRoom(roomId: string): boolean;
  getAvailableRooms(filters?: { mode?: string; status?: GameStatus }): GameRoom[];
  joinRoom(roomId: string, playerData: IPlayer, password?: string): GameRoom;
  leaveRoom(roomId: string, playerId: string): void;
  getStats(): {
    totalRooms: number;
    waitingRooms: number;
    playingRooms: number;
    totalPlayers: number;
  };
}
