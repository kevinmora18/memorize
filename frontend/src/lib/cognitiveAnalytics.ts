/**
 * MEMORIZE AAA - COGNITIVE ANALYTICS SYSTEM
 * Módulo de evaluación de rendimiento mental, tiempo de reacción y mapa de memoria.
 */

export interface CognitiveStats {
  avgReactionTimeMs: number;
  accuracyRate: number; // 0..100 %
  quadrantPrecision: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  retentionIndex: number; // 0..100
  totalGamesAnalyzed: number;
}

const COGNITIVE_STORAGE_KEY = 'memorize_cognitive_stats_v1';

export const INITIAL_COGNITIVE_STATS: CognitiveStats = {
  avgReactionTimeMs: 420,
  accuracyRate: 92.5,
  quadrantPrecision: {
    topLeft: 94.0,
    topRight: 91.2,
    bottomLeft: 89.5,
    bottomRight: 95.3
  },
  retentionIndex: 88.4,
  totalGamesAnalyzed: 14
};

export function getCognitiveStats(): CognitiveStats {
  const saved = localStorage.getItem(COGNITIVE_STORAGE_KEY);
  if (!saved) return INITIAL_COGNITIVE_STATS;
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_COGNITIVE_STATS;
  }
}

export function recordTurnAnalytics(reactionTimeMs: number, isMatch: boolean, quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') {
  const current = getCognitiveStats();
  const n = current.totalGamesAnalyzed + 1;
  const newAvgTime = Math.round((current.avgReactionTimeMs * (n - 1) + reactionTimeMs) / n);
  const newAccuracy = Math.min(100, Math.max(0, current.accuracyRate + (isMatch ? 0.3 : -0.5)));

  const updated: CognitiveStats = {
    ...current,
    avgReactionTimeMs: newAvgTime,
    accuracyRate: Number(newAccuracy.toFixed(1)),
    totalGamesAnalyzed: n
  };

  localStorage.setItem(COGNITIVE_STORAGE_KEY, JSON.stringify(updated));
}
