/**
 * GameModeStrategy.ts - Implementaciones polimórficas del Patrón Strategy para Modos de Juego
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - POLIMORFISMO: Cada modo de juego concreta las reglas de forma diferente bajo IGameModeStrategy
 * - OCP (Open/Closed Principle): Nuevos modos se añaden creando una nueva clase o registrándola en la factoría, sin modificar GameRoom ni Match
 * - HERENCIA: Clases de estrategia heredan de BaseGameModeStrategy
 * - ENCAPSULACIÓN: Las reglas y fórmulas de puntuación quedan encapsuladas dentro de cada estrategia
 */

import { IGameModeStrategy, IMatchCheckResult } from '../../core/interfaces/IGameModeStrategy';

/**
 * Estrategia base con comportamiento común
 */
export abstract class BaseGameModeStrategy implements IGameModeStrategy {
  abstract readonly modeName: string;
  abstract readonly requiredFlips: number;
  abstract readonly baseExp: number;

  getRequiredFlipsCount(): number {
    return this.requiredFlips;
  }

  checkMatch(flippedCards: any[], flippedIndexes: number[]): IMatchCheckResult {
    if (flippedCards.length !== this.requiredFlips) {
      return { isMatch: false, cardIndexes: flippedIndexes };
    }

    const first = flippedCards[0];
    if (!first) {
      return { isMatch: false, cardIndexes: flippedIndexes };
    }

    let isMatch = false;
    if (first.groupId !== undefined) {
      isMatch = flippedCards.every(c => c && c.groupId === first.groupId);
    } else if (first.symbol !== undefined) {
      isMatch = flippedCards.every(c => c && c.symbol === first.symbol);
    } else {
      isMatch = flippedCards.every(c => c && c.id === first.id);
    }

    return { isMatch, cardIndexes: flippedIndexes };
  }

  calculateXp(score: number, won: boolean): number {
    let xp = this.baseExp;
    if (won) xp *= 1.5;
    if (score > 1000) xp += 50;
    if (score > 2000) xp += 100;
    return Math.floor(xp);
  }

  calculateCoins(score: number, won: boolean): number {
    let coins = Math.floor(score / 10);
    if (won) coins = Math.floor(coins * 1.5);
    return coins;
  }
}

/**
 * Modo Clásico de Parejas (2 cartas)
 */
export class PairsModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'classic';
  readonly requiredFlips = 2;
  readonly baseExp = 50;
}

/**
 * Modo Tríadas (3 cartas para match)
 */
export class TriadsModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'triads';
  readonly requiredFlips = 3;
  readonly baseExp = 75;
}

/**
 * Modo Infinito
 */
export class InfiniteModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'infinite';
  readonly requiredFlips = 2;
  readonly baseExp = 100;
}

/**
 * Modo Desafío / Challenge
 */
export class ChallengeModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'challenge';
  readonly requiredFlips = 2;
  readonly baseExp = 75;
}

/**
 * Modo Jefe / Boss
 */
export class BossModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'boss';
  readonly requiredFlips = 2;
  readonly baseExp = 250;
}

/**
 * Modo Multijugador en Sala
 */
export class MultiplayerModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'multiplayer';
  readonly requiredFlips = 2;
  readonly baseExp = 100;
}

/**
 * Modo Amigos / IA
 */
export class AiFriendsModeStrategy extends BaseGameModeStrategy {
  readonly modeName = 'ai-friends';
  readonly requiredFlips = 2;
  readonly baseExp = 50;
}

/**
 * Factoría de Estrategias de Modos de Juego (Patrón Factory + OCP)
 */
export class GameModeFactory {
  private static strategies: Map<string, IGameModeStrategy> = new Map<string, IGameModeStrategy>([
    ['classic', new PairsModeStrategy()],
    ['pairs', new PairsModeStrategy()],
    ['triads', new TriadsModeStrategy()],
    ['infinite', new InfiniteModeStrategy()],
    ['challenge', new ChallengeModeStrategy()],
    ['boss', new BossModeStrategy()],
    ['multiplayer', new MultiplayerModeStrategy()],
    ['ai-friends', new AiFriendsModeStrategy()],
  ]);

  /**
   * Obtiene la estrategia correspondiente al modo solicitado.
   * Si no existe, aplica el modo clásico como fallback seguro.
   */
  static getStrategy(mode: string): IGameModeStrategy {
    const key = (mode || 'classic').toLowerCase().trim();
    return this.strategies.get(key) || new PairsModeStrategy();
  }

  /**
   * Permite registrar dinámicamente nuevas modalidades sin modificar código existente (OCP)
   */
  static registerStrategy(modeName: string, strategy: IGameModeStrategy): void {
    this.strategies.set(modeName.toLowerCase().trim(), strategy);
  }
}
