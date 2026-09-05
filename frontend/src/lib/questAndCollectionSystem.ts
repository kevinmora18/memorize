/**
 * MEMORIZE AAA - QUESTS, PASS & COLLECTION SYSTEM
 * Gestor de gamificación de misiones, pase de temporada y álbum coleccionable con lore.
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardXP: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface CollectionItem {
  id: string;
  title: string;
  category: 'mítico' | 'épico' | 'legendario';
  symbol: string;
  lore: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface PassLevel {
  level: number;
  requiredXP: number;
  freeReward: string;
  premiumReward: string;
  isUnlocked: boolean;
  isClaimed: boolean;
}

const QUESTS_STORAGE_KEY = 'memorize_daily_quests_v1';
const COLLECTION_STORAGE_KEY = 'memorize_collection_v1';
const PASS_STORAGE_KEY = 'memorize_season_pass_v1';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Entrenamiento Inicial',
    description: 'Completa 2 partidas en Modo Clásico',
    progress: 1,
    maxProgress: 2,
    rewardCoins: 150,
    rewardXP: 100,
    isCompleted: false,
    isClaimed: false
  },
  {
    id: 'q2',
    title: 'Memoria Relámpago',
    description: 'Gana 1 partida en Modo Flash Memory',
    progress: 0,
    maxProgress: 1,
    rewardCoins: 250,
    rewardXP: 200,
    isCompleted: false,
    isClaimed: false
  },
  {
    id: 'q3',
    title: 'Cazador de Jefes',
    description: 'Inflige 200 DMG al Boss en Modo Raid 2vs1',
    progress: 120,
    maxProgress: 200,
    rewardCoins: 400,
    rewardXP: 350,
    isCompleted: false,
    isClaimed: false
  },
  {
    id: 'q4',
    title: 'Cadena Ininterrumpida',
    description: 'Consigue una racha de 5 aciertos seguidos',
    progress: 3,
    maxProgress: 5,
    rewardCoins: 300,
    rewardXP: 250,
    isCompleted: false,
    isClaimed: false
  }
];

export const INITIAL_COLLECTION: CollectionItem[] = [
  {
    id: 'c1',
    title: 'El Bastión Neura',
    category: 'legendario',
    symbol: '🏛️',
    lore: 'Antigua fortaleza de los Maestros de la Memoria. Sus pilares resuenan con la energía de miles de sinapsis conectadas en perfecta armonía.',
    isUnlocked: true
  },
  {
    id: 'c2',
    title: 'Orbe de Helios',
    category: 'épico',
    symbol: '🔮',
    lore: 'Un orbe misterioso capaz de revelar los secretos ocultos tras los tableros del universo Volcania.',
    isUnlocked: true
  },
  {
    id: 'c3',
    title: 'Dragón de Escarcha',
    category: 'mítico',
    symbol: '🐉',
    lore: 'Guardia del reino Frostheim. Congela el tiempo y las cartas de quienes intentan desafiar el saber ancestral.',
    isUnlocked: false
  },
  {
    id: 'c4',
    title: 'Gema del Vacío Estelar',
    category: 'mítico',
    symbol: '🌌',
    lore: 'Forjada en el núcleo de una estrella extinta. Concede visión profética a quien logre dominar las parejas cósmicas.',
    isUnlocked: false
  },
  {
    id: 'c5',
    title: 'Corona del Rey Neura',
    category: 'legendario',
    symbol: '👑',
    lore: 'Otorgada únicamente a los jugadores que alcanzan el Rango de Leyenda Eterna.',
    isUnlocked: false
  }
];

export function getQuests(): Quest[] {
  const saved = localStorage.getItem(QUESTS_STORAGE_KEY);
  if (!saved) return INITIAL_QUESTS;
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_QUESTS;
  }
}

export function saveQuests(quests: Quest[]) {
  localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(quests));
}

export function getCollection(): CollectionItem[] {
  const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!saved) return INITIAL_COLLECTION;
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_COLLECTION;
  }
}

export function unlockCollectionItem(id: string) {
  const current = getCollection();
  const updated = current.map((item) =>
    item.id === id ? { ...item, isUnlocked: true, unlockedAt: new Date().toLocaleDateString() } : item
  );
  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(updated));
}
