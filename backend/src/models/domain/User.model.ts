/**
 * User Domain Model - Modelo de dominio para Usuario
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseEntity para compartir identidad y control temporal
 * - ENCAPSULACIÓN: Propiedades protegidas con getters y métodos con validación de negocio
 * - ABSTRACCIÓN: Modela las capacidades de un usuario en el sistema (XP, niveles, economía, sanciones)
 * - SRP: Encapsula únicamente el estado y las reglas de negocio inherentes al usuario
 */

import { BaseEntity } from '../../core/BaseEntity';

export interface IUser {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  isBanned: boolean;
  bannedUntil: Date | null;
  banReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  PLAYER = 'player',
  ADMIN = 'admin'
}

/**
 * Clase User con comportamiento encapsulado y herencia de BaseEntity
 */
export class User extends BaseEntity<IUser> implements IUser {
  readonly email: string;
  private _username: string | null;
  private _role: UserRole;
  private _level: number;
  private _xp: number;
  private _coins: number;
  private _gems: number;
  private _isBanned: boolean;
  private _bannedUntil: Date | null;
  private _banReason: string | null;
  private _passwordHash: string | null = null;

  constructor(data: IUser) {
    super(data.id, data.createdAt, data.updatedAt);
    this.email = data.email;
    this._username = data.username;
    this._role = data.role;
    this._level = Math.max(1, data.level || 1);
    this._xp = Math.max(0, data.xp || 0);
    this._coins = Math.max(0, data.coins || 0);
    this._gems = Math.max(0, data.gems || 0);
    this._isBanned = data.isBanned || false;
    this._bannedUntil = data.bannedUntil;
    this._banReason = data.banReason;
  }

  get passwordHash(): string | null {
    return this._passwordHash;
  }

  setPasswordHash(hash: string | null): void {
    this._passwordHash = hash;
    this.touch();
  }

  hasPassword(): boolean {
    return Boolean(this._passwordHash);
  }

  // ============================================
  // GETTERS Y SETTERS ENCAPSULADOS
  // ============================================

  get username(): string | null {
    return this._username;
  }

  set username(value: string | null) {
    this._username = value;
    this.touch();
  }

  get role(): UserRole {
    return this._role;
  }

  set role(newRole: UserRole) {
    this._role = newRole;
    this.touch();
  }

  get level(): number {
    return this._level;
  }

  get xp(): number {
    return this._xp;
  }

  get coins(): number {
    return this._coins;
  }

  get gems(): number {
    return this._gems;
  }

  get isBanned(): boolean {
    return this._isBanned;
  }

  get bannedUntil(): Date | null {
    return this._bannedUntil;
  }

  get banReason(): string | null {
    return this._banReason;
  }

  get updatedAt(): Date {
    return this._updatedAt || this.createdAt;
  }

  set updatedAt(date: Date) {
    this._updatedAt = date;
  }

  // ============================================
  // MÉTODOS DE NEGOCIO
  // ============================================

  /**
   * Verifica si el usuario está actualmente sancionado
   */
  isCurrentlyBanned(): boolean {
    if (!this._isBanned) return false;
    if (!this._bannedUntil) return true; // Baneo permanente
    return new Date() < this._bannedUntil;
  }

  /**
   * Aplica sanción al usuario
   */
  applyBan(reason: string, durationMinutes?: number): void {
    this._isBanned = true;
    this._banReason = reason;
    this._bannedUntil = durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : null;
    this.touch();
  }

  /**
   * Remueve la sanción del usuario
   */
  removeBan(): void {
    this._isBanned = false;
    this._bannedUntil = null;
    this._banReason = null;
    this.touch();
  }

  /**
   * Calcula el XP requerido para el próximo nivel
   */
  getXpForNextLevel(): number {
    return this._level * 100;
  }

  canLevelUp(): boolean {
    return this._xp >= this.getXpForNextLevel();
  }

  levelUp(): void {
    if (!this.canLevelUp()) {
      throw new Error('No hay suficiente XP para subir de nivel');
    }
    this._xp -= this.getXpForNextLevel();
    this._level++;
    this.touch();
  }

  addXp(amount: number): number {
    if (amount <= 0) return 0;
    this._xp += amount;
    let levelsGained = 0;
    while (this.canLevelUp()) {
      this.levelUp();
      levelsGained++;
    }
    this.touch();
    return levelsGained;
  }

  canAfford(coinsRequired: number, gemsRequired: number = 0): boolean {
    return this._coins >= coinsRequired && this._gems >= gemsRequired;
  }

  purchase(coinsRequired: number, gemsRequired: number = 0): void {
    if (!this.canAfford(coinsRequired, gemsRequired)) {
      throw new Error('No tienes suficientes monedas o gemas');
    }
    this._coins -= coinsRequired;
    this._gems -= gemsRequired;
    this.touch();
  }

  addCoins(amount: number): void {
    if (amount < 0) throw new Error('La cantidad de monedas a añadir no puede ser negativa');
    this._coins += amount;
    this.touch();
  }

  addGems(amount: number): void {
    if (amount < 0) throw new Error('La cantidad de gemas a añadir no puede ser negativa');
    this._gems += amount;
    this.touch();
  }

  setCurrency(coins?: number, gems?: number): void {
    if (coins !== undefined) {
      if (coins < 0) throw new Error('Las monedas no pueden ser negativas');
      this._coins = coins;
    }
    if (gems !== undefined) {
      if (gems < 0) throw new Error('Las gemas no pueden ser negativas');
      this._gems = gems;
    }
    this.touch();
  }

  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  toJSON(): IUser {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      level: this.level,
      xp: this.xp,
      coins: this.coins,
      gems: this.gems,
      isBanned: this.isBanned,
      bannedUntil: this.bannedUntil,
      banReason: this.banReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
