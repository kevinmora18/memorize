/**
 * Match Domain Model - Modelo de dominio para Partidas
 *
 * EXPLICACIÓN POO:
 * - ENCAPSULACIÓN: Agrupa datos y comportamiento de una partida
 * - MÉTODOS DE NEGOCIO: Cálculo de XP y monedas ganadas
 */

export interface IMatch {
  id: string;
  userId: string;
  mode: string;
  level: number | null;
  score: number;
  accuracy: number | null;
  combo: number | null;
  timeLeft: number | null;
  won: boolean;
  createdAt: Date;
}

export class Match implements IMatch {
  readonly id: string;
  readonly userId: string;
  readonly mode: string;
  readonly level: number | null;
  readonly score: number;
  readonly accuracy: number | null;
  readonly combo: number | null;
  readonly timeLeft: number | null;
  readonly won: boolean;
  readonly createdAt: Date;

  constructor(data: IMatch) {
    this.id = data.id;
    this.userId = data.userId;
    this.mode = data.mode;
    this.level = data.level;
    this.score = data.score;
    this.accuracy = data.accuracy;
    this.combo = data.combo;
    this.timeLeft = data.timeLeft;
    this.won = data.won;
    this.createdAt = data.createdAt;
  }

  /**
   * Calcula el XP ganado según el modo, puntuación y resultado
   */
  calculateXpEarned(): number {
    const baseXP: Record<string, number> = {
      classic: 50,
      infinite: 100,
      challenge: 75,
      boss: 250,
      multiplayer: 100,
      'ai-friends': 50,
    };

    let xp = baseXP[this.mode] ?? 50;

    if (this.won) xp *= 1.5;
    if (this.score > 1000) xp += 50;
    if (this.score > 2000) xp += 100;

    return Math.floor(xp);
  }

  /**
   * Calcula las monedas ganadas según puntuación y resultado
   */
  calculateCoinsEarned(): number {
    let coins = Math.floor(this.score / 10);
    if (this.won) coins = Math.floor(coins * 1.5);
    return coins;
  }

  toJSON(): IMatch {
    return {
      id: this.id,
      userId: this.userId,
      mode: this.mode,
      level: this.level,
      score: this.score,
      accuracy: this.accuracy,
      combo: this.combo,
      timeLeft: this.timeLeft,
      won: this.won,
      createdAt: this.createdAt,
    };
  }
}
