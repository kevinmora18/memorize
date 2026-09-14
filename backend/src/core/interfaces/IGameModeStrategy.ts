/**
 * IGameModeStrategy.ts - Contrato de Estrategia para Modos de Juego
 * 
 * EXPLICACIÓN POO Y SOLID:
 * - OCP (Open/Closed Principle): Nuevos modos de juego extienden el sistema sin modificar clases existentes
 * - POLIMORFISMO: Cada modo implementa sus propias reglas de match, conteo de volteos y cálculo de recompensas
 * - ABSTRACCIÓN: Modela las reglas esenciales de cualquier modalidad de juego de cartas
 */

export interface IMatchCheckResult {
  isMatch: boolean;
  cardIndexes: number[];
}

export interface IGameModeStrategy {
  readonly modeName: string;
  
  /**
   * Cantidad de cartas a voltear en cada turno (ej: 2 en parejas, 3 en tríadas)
   */
  getRequiredFlipsCount(): number;

  /**
   * Evalúa si las cartas seleccionadas constituyen un match válido
   */
  checkMatch(flippedCards: any[], flippedIndexes: number[]): IMatchCheckResult;

  /**
   * Calcula el XP obtenido polimórficamente según el modo, puntuación y resultado
   */
  calculateXp(score: number, won: boolean): number;

  /**
   * Calcula las monedas obtenidas según el resultado de la partida
   */
  calculateCoins(score: number, won: boolean): number;
}
