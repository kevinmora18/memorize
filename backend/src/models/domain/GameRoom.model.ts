/**
 * GameRoom Domain Model - Modelo de dominio para Salas de Juego
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: GameRoom extiende BaseEntity
 * - POLIMORFISMO: Reglas de matching y conteo de volteos delegados a IGameModeStrategy polimórfico
 * - OCP: Nuevos modos funcionan en la sala sin modificar su lógica interna
 * - ENCAPSULACIÓN: Propiedades y mapa de jugadores protegidos
 * - SRP: Gestiona exclusivamente el ciclo de vida de la sesión de sala y sus jugadores
 */

import { BaseEntity } from '../../core/BaseEntity';
import { GameModeFactory } from '../strategies/GameModeStrategy';

export interface IPlayer {
  id: string;
  socketId: string;
  name: string;
  level: number;
  isReady: boolean;
  score: number;
  matches: number;
  isConnected: boolean;
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export interface IGameState {
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  cards: any[];
  flippedCards: number[];
  matchedCards: number[];
  currentTurn: string | null;
  scores: Map<string, number>;
}

export interface IGameRoomData {
  id: string;
  code?: string;
  name: string;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  mode: string;
  cardCount?: number;
  difficulty: string;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
}

/**
 * Clase Player - Representa un jugador en la sala con encapsulación
 */
export class Player implements IPlayer {
  readonly id: string;
  private _socketId: string;
  private _name: string;
  private _level: number;
  private _isReady: boolean;
  private _score: number;
  private _matches: number;
  private _isConnected: boolean;

  constructor(data: IPlayer) {
    this.id = data.id;
    this._socketId = data.socketId;
    this._name = data.name;
    this._level = data.level;
    this._isReady = data.isReady || false;
    this._score = data.score || 0;
    this._matches = data.matches || 0;
    this._isConnected = data.isConnected !== undefined ? data.isConnected : true;
  }

  get socketId(): string {
    return this._socketId;
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._level;
  }

  get isReady(): boolean {
    return this._isReady;
  }

  get score(): number {
    return this._score;
  }

  set score(val: number) {
    this._score = Math.max(0, val);
  }

  get matches(): number {
    return this._matches;
  }

  set matches(val: number) {
    this._matches = Math.max(0, val);
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  setReady(ready: boolean): void {
    this._isReady = ready;
  }

  addScore(points: number): void {
    this._score += points;
  }

  addMatch(): void {
    this._matches++;
  }

  resetGameStats(): void {
    this._score = 0;
    this._matches = 0;
    this._isReady = false;
  }

  disconnect(): void {
    this._isConnected = false;
  }

  reconnect(newSocketId: string): void {
    this._socketId = newSocketId;
    this._isConnected = true;
  }

  toJSON(): IPlayer {
    return {
      id: this.id,
      socketId: this._socketId,
      name: this._name,
      level: this._level,
      isReady: this._isReady,
      score: this._score,
      matches: this._matches,
      isConnected: this._isConnected,
    };
  }
}

/**
 * Clase GameRoom con Herencia de BaseEntity y patrón Strategy polimórfico
 */
export class GameRoom extends BaseEntity<any> {
  readonly code: string;
  private _name: string;
  private _hostId: string;
  private _hostName: string;
  private _maxPlayers: number;
  private _mode: string;
  private _cardCount: number;
  private _difficulty: string;
  private _isPrivate: boolean;
  private _password?: string;

  private players: Map<string, Player>;
  private gameState: IGameState;

  constructor(data: IGameRoomData) {
    super(data.id, data.createdAt);
    this.code = data.code || Math.random().toString(36).substring(2, 8).toUpperCase();
    this._name = data.name;
    this._hostId = data.hostId;
    this._hostName = data.hostName;
    this._maxPlayers = data.maxPlayers;
    this._mode = data.mode;
    this._cardCount = data.cardCount || 12;
    this._difficulty = data.difficulty;
    this._isPrivate = data.isPrivate;
    this._password = data.password;

    this.players = new Map();
    this.gameState = {
      status: GameStatus.WAITING,
      currentRound: 0,
      totalRounds: 1,
      cards: [],
      flippedCards: [],
      matchedCards: [],
      currentTurn: null,
      scores: new Map(),
    };
  }

  // Getters y setters controlados
  get name(): string { return this._name; }
  get hostId(): string { return this._hostId; }
  get hostName(): string { return this._hostName; }
  get maxPlayers(): number { return this._maxPlayers; }
  get mode(): string { return this._mode; }
  set mode(newMode: string) { this._mode = newMode; }
  get cardCount(): number { return this._cardCount; }
  get difficulty(): string { return this._difficulty; }
  get isPrivate(): boolean { return this._isPrivate; }
  get password(): string | undefined { return this._password; }

  /**
   * GESTIÓN DE JUGADORES
   */

  addPlayer(playerData: IPlayer): void {
    if (this.isFull()) {
      throw new Error('La sala está llena');
    }

    if (this.hasPlayer(playerData.id)) {
      throw new Error('El jugador ya está en la sala');
    }

    const player = new Player(playerData);
    this.players.set(player.id, player);
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);

    if (this._hostId === playerId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0];
      this._hostId = newHost.id;
      this._hostName = newHost.name;
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  isFull(): boolean {
    return this.players.size >= this._maxPlayers;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  /**
   * GESTIÓN DE ESTADO DE LISTO
   */

  setPlayerReady(playerId: string, ready: boolean): void {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error('Jugador no encontrado');
    }
    player.setReady(ready);
  }

  areAllPlayersReady(): boolean {
    if (this.players.size < 2) return false;

    return Array.from(this.players.values())
      .filter(p => p.id !== this._hostId)
      .every(p => p.isReady);
  }

  /**
   * GESTIÓN DEL JUEGO (POLIMORFISMO & OCP)
   */

  getRequiredFlipsCount(): number {
    const strategy = GameModeFactory.getStrategy(this._mode);
    return strategy.getRequiredFlipsCount();
  }

  startGame(cards: any[], bypassReadyCheck = false): void {
    if (!bypassReadyCheck && !this.areAllPlayersReady() && this.players.size > 1) {
      throw new Error('No todos los jugadores están listos');
    }

    if (this.players.size < 1) {
      throw new Error('Se necesita al menos 1 jugador');
    }

    this.gameState = {
      status: GameStatus.PLAYING,
      currentRound: 1,
      totalRounds: 1,
      cards: cards || [],
      flippedCards: [],
      matchedCards: [],
      currentTurn: Array.from(this.players.keys())[0],
      scores: new Map(Array.from(this.players.keys()).map(id => [id, 0])),
    };

    this.players.forEach(player => {
      player.resetGameStats();
    });
  }

  getGameState(): IGameState {
    return { ...this.gameState };
  }

  flipCard(playerId: string, cardIndex: number): void {
    if (this.gameState.currentTurn && this.gameState.currentTurn !== playerId) {
      throw new Error('No es tu turno');
    }

    const required = this.getRequiredFlipsCount();
    if (this.gameState.flippedCards.length >= required) {
      throw new Error(`Ya hay ${required} cartas volteadas`);
    }

    if (this.gameState.flippedCards.includes(cardIndex) ||
        this.gameState.matchedCards.includes(cardIndex)) {
      throw new Error('Carta no disponible');
    }

    this.gameState.flippedCards.push(cardIndex);
  }

  /**
   * POLIMORFISMO & OCP:
   * Evalúa la coincidencia según la estrategia de modo de juego activa
   */
  checkMatch(): { isMatch: boolean; cardIndexes: number[] } {
    const required = this.getRequiredFlipsCount();
    if (this.gameState.flippedCards.length !== required) {
      throw new Error(`No hay ${required} cartas volteadas`);
    }

    const flippedIndexes = [...this.gameState.flippedCards];
    const flippedCardObjects = flippedIndexes.map(idx => this.gameState.cards[idx]).filter(Boolean);

    const strategy = GameModeFactory.getStrategy(this._mode);
    return strategy.checkMatch(flippedCardObjects, flippedIndexes);
  }

  registerMatch(playerId: string, cardIndexes: number[]): void {
    cardIndexes.forEach(idx => {
      if (!this.gameState.matchedCards.includes(idx)) {
        this.gameState.matchedCards.push(idx);
      }
    });
    
    const currentScore = this.gameState.scores.get(playerId) || 0;
    this.gameState.scores.set(playerId, currentScore + 150);

    const player = this.players.get(playerId);
    if (player) {
      player.addMatch();
      player.addScore(150);
    }
  }

  clearFlippedCards(): void {
    this.gameState.flippedCards = [];
  }

  nextTurn(): string {
    const playerIds = Array.from(this.players.keys());
    if (playerIds.length === 0) return '';
    const currentIndex = this.gameState.currentTurn ? playerIds.indexOf(this.gameState.currentTurn) : -1;
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playerIds.length;
    this.gameState.currentTurn = playerIds[nextIndex];
    return this.gameState.currentTurn;
  }

  isGameFinished(): boolean {
    return this.gameState.cards.length > 0 && this.gameState.matchedCards.length >= this.gameState.cards.length;
  }

  finishGame(): string | null {
    this.gameState.status = GameStatus.FINISHED;

    let winnerId: string | null = null;
    let maxScore = -1;

    this.gameState.scores.forEach((score, playerId) => {
      if (score > maxScore) {
        maxScore = score;
        winnerId = playerId;
      }
    });

    return winnerId;
  }

  disconnectPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.disconnect();
    }
  }

  reconnectPlayer(playerId: string, newSocketId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.reconnect(newSocketId);
    }
  }

  validatePassword(password: string): boolean {
    if (!this._isPrivate) return true;
    return this._password === password;
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this._name,
      hostId: this._hostId,
      hostName: this._hostName,
      maxPlayers: this._maxPlayers,
      currentPlayers: this.players.size,
      mode: this._mode,
      gameMode: this._mode,
      cardCount: this._cardCount,
      difficulty: this._difficulty,
      isPrivate: this._isPrivate,
      status: this.gameState.status,
      isStarted: this.gameState.status === GameStatus.PLAYING,
      createdAt: this.createdAt,
      players: Array.from(this.players.values()).map(p => p.toJSON()),
      gameState: this.gameState,
    };
  }
}
