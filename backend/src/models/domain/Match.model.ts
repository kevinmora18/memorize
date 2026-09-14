/**
 * Match Domain Model - Modelo de dominio para Partidas
 *
 * EXPLICACIÓN POO Y SOLID:
 * - HERENCIA: Extiende BaseEntity para compartir atributos de entidad
 * - POLIMORFISMO: Delega el cálculo de XP y Monedas a la estrategia polimórfica del modo (Patrón Strategy)
 * - OCP: Nuevos modos calculan sus recompensas sin modificar esta clase
 * - ENCAPSULACIÓN: Propiedades de la partida protegidas
 */

import { BaseEntity } from '../../core/BaseEntity';
import { GameModeFactory } from '../strategies/GameModeStrategy';

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

export class Match extends BaseEntity<IMatch> implements IMatch {
  readonly userId: string;
  readonly mode: string;
  readonly level: number | null;
  readonly score: number;
  readonly accuracy: number | null;
  readonly combo: number | null;
  readonly timeLeft: number | null;
  readonly won: boolean;

  constructor(data: IMatch) {
    super(data.id, data.createdAt);
    this.userId = data.userId;
    this.mode = data.mode;
    this.level = data.level;
    this.score = data.score;
    this.accuracy = data.accuracy;
    this.combo = data.combo;
    this.timeLeft = data.timeLeft;
    this.won = data.won;
  }

  /**
   * POLIMORFISMO & OCP:
   * Delega el cálculo de XP a la estrategia del modo correspondiente
   */
  calculateXpEarned(): number {
    const strategy = GameModeFactory.getStrategy(this.mode);
    return strategy.calculateXp(this.score, this.won);
  }

  /**
   * POLIMORFISMO & OCP:
   * Delega el cálculo de monedas a la estrategia del modo correspondiente
   */
  calculateCoinsEarned(): number {
    const strategy = GameModeFactory.getStrategy(this.mode);
    return strategy.calculateCoins(this.score, this.won);
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
