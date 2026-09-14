/**
 * PlayerStats Domain Model - Modelo de dominio para Estadísticas de Jugador
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseEntity para compartir identidad y fecha de creación
 * - ENCAPSULACIÓN: Métricas protegidas; las actualizaciones se realizan mediante recordGame con validación
 * - ABSTRACCIÓN: Métodos de alto nivel para win rate, nivel de habilidad y detección de logros
 * - SRP: Se encarga exclusivamente del cálculo y persistencia del rendimiento del jugador
 */

import { BaseEntity } from '../../core/BaseEntity';

export interface IPlayerStats {
  id: string;
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestScore: number;
  totalMatches: number;
  perfectMatches: number;
  maxCombo: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PlayerStats extends BaseEntity<IPlayerStats> implements IPlayerStats {
  readonly userId: string;
  private _gamesPlayed: number;
  private _gamesWon: number;
  private _totalScore: number;
  private _bestScore: number;
  private _totalMatches: number;
  private _perfectMatches: number;
  private _maxCombo: number;

  constructor(data: IPlayerStats) {
    super(data.id, data.createdAt, data.updatedAt);
    this.userId = data.userId;
    this._gamesPlayed = Math.max(0, data.gamesPlayed || 0);
    this._gamesWon = Math.max(0, data.gamesWon || 0);
    this._totalScore = Math.max(0, data.totalScore || 0);
    this._bestScore = Math.max(0, data.bestScore || 0);
    this._totalMatches = Math.max(0, data.totalMatches || 0);
    this._perfectMatches = Math.max(0, data.perfectMatches || 0);
    this._maxCombo = Math.max(0, data.maxCombo || 0);
  }

  get gamesPlayed(): number {
    return this._gamesPlayed;
  }

  get gamesWon(): number {
    return this._gamesWon;
  }

  get totalScore(): number {
    return this._totalScore;
  }

  get bestScore(): number {
    return this._bestScore;
  }

  get totalMatches(): number {
    return this._totalMatches;
  }

  get perfectMatches(): number {
    return this._perfectMatches;
  }

  get maxCombo(): number {
    return this._maxCombo;
  }

  get updatedAt(): Date {
    return this._updatedAt || this.createdAt;
  }

  set updatedAt(date: Date) {
    this._updatedAt = date;
  }

  /**
   * Calcula el porcentaje de victorias
   */
  getWinRate(): number {
    if (this._gamesPlayed === 0) return 0;
    return (this._gamesWon / this._gamesPlayed) * 100;
  }

  /**
   * Calcula el promedio de puntuación
   */
  getAverageScore(): number {
    if (this._gamesPlayed === 0) return 0;
    return this._totalScore / this._gamesPlayed;
  }

  /**
   * Calcula el porcentaje de aciertos perfectos
   */
  getPerfectMatchRate(): number {
    if (this._totalMatches === 0) return 0;
    return (this._perfectMatches / this._totalMatches) * 100;
  }

  /**
   * Registra los resultados de una partida y actualiza métricas de forma encapsulada
   */
  recordGame(score: number, won: boolean, matches: number, perfectMatches: number, combo: number): void {
    this._gamesPlayed++;
    if (won) this._gamesWon++;
    
    this._totalScore += Math.max(0, score);
    if (score > this._bestScore) {
      this._bestScore = score;
    }

    this._totalMatches += Math.max(0, matches);
    this._perfectMatches += Math.max(0, perfectMatches);
    
    if (combo > this._maxCombo) {
      this._maxCombo = combo;
    }

    this.touch();
  }

  getSkillLevel(): 'Novice' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master' {
    const winRate = this.getWinRate();
    const avgScore = this.getAverageScore();

    if (this._gamesPlayed < 10) return 'Novice';
    if (winRate < 40 || avgScore < 500) return 'Intermediate';
    if (winRate < 60 || avgScore < 1000) return 'Advanced';
    if (winRate < 80 || avgScore < 1500) return 'Expert';
    return 'Master';
  }

  checkAchievements(): string[] {
    const achievements: string[] = [];

    if (this._gamesPlayed >= 100) achievements.push('CENTURION');
    if (this._gamesWon >= 50) achievements.push('WINNER_50');
    if (this._bestScore >= 2000) achievements.push('HIGH_SCORER');
    if (this._maxCombo >= 10) achievements.push('COMBO_MASTER');
    if (this.getWinRate() >= 80) achievements.push('CHAMPION');

    return achievements;
  }

  toJSON(): IPlayerStats {
    return {
      id: this.id,
      userId: this.userId,
      gamesPlayed: this._gamesPlayed,
      gamesWon: this._gamesWon,
      totalScore: this._totalScore,
      bestScore: this._bestScore,
      totalMatches: this._totalMatches,
      perfectMatches: this._perfectMatches,
      maxCombo: this._maxCombo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
