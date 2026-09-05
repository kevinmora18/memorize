// Sistema de tienda y equipamiento profesional AAA

export interface EquippedItems {
  pack: string;
  frame: string;
  skin: string;
  board: string;
}

export interface FrameDetails {
  id: string;
  name: string;
  borderColor: string;
  glowColor: string;
  ringStyle?: string;
  icon?: string;
}

export const ALL_FRAMES: Record<string, FrameDetails> = {
  basic: {
    id: 'basic',
    name: 'Básico',
    borderColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  neon_ring: {
    id: 'neon_ring',
    name: 'Aura Cuántica',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.8)',
    ringStyle: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950',
    icon: '💫',
  },
  phoenix: {
    id: 'phoenix',
    name: 'Fénix Ardiente',
    borderColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.85)',
    ringStyle: 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950',
    icon: '🔥',
  },
  crown_gold: {
    id: 'crown_gold',
    name: 'Corona Real Dorada',
    borderColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.9)',
    ringStyle: 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950',
    icon: '👑',
  },
};

export function getEquippedFrameDetails(): FrameDetails {
  const frameId = getEquippedFrame();
  return ALL_FRAMES[frameId] || ALL_FRAMES.basic;
}

export interface SkinDetails {
  id: string;
  name: string;
  description: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  innerBorder: string;
  gemColors: { top: string; bottom: string };
  sigil: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  foilOverlay: string;
}

// Obtener items equipados
export function getEquippedItems(): EquippedItems {
  return {
    pack: localStorage.getItem('equippedPack') || 'frutas',
    frame: localStorage.getItem('equippedFrame') || 'basic',
    skin: localStorage.getItem('equippedSkin') || 'classic',
    board: localStorage.getItem('equippedBoard') || 'default',
  };
}

export function getEquippedPack(): string {
  return localStorage.getItem('equippedPack') || 'frutas';
}

export function getEquippedFrame(): string {
  return localStorage.getItem('equippedFrame') || 'basic';
}

export function getEquippedSkin(): string {
  return localStorage.getItem('equippedSkin') || 'classic';
}

export function getEquippedBoard(): string {
  return localStorage.getItem('equippedBoard') || 'default';
}

// Obtener cartas del pack equipado para TODOS los modos
export function getEquippedPackCards(): string[] {
  const packId = getEquippedPack();
  
  const PACKS: Record<string, string[]> = {
    frutas: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍'],
    animales: ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐺', '🦄'],
    espacio: ['🪐', '🚀', '🛸', '🌌', '☄️', '🌍', '🌙', '⭐'],
    oceano: ['🐙', '🐬', '🦈', '🐡', '🦑', '🐚', '🦀', '🐠'],
    magico: ['🔮', '🪄', '👑', '💎', '📜', '🧙', '🌟', '💫'],
    dragon: ['🐉', '🐲', '🌋', '⚡', '🗡️', '🛡️', '💥', '🔥'],
    cyber: ['🤖', '💻', '🦾', '🥽', '⚙️', '💾', '🧬', '⚡'],
    celestial: ['☀️', '🌙', '⚡', '🌈', '☁️', '🌟', '🕊️', '✨'],
  };
  
  return PACKS[packId] || PACKS.frutas;
}

// Diccionario de detalles completos de cada Skin
export const ALL_SKINS: Record<string, SkinDetails> = {
  classic: {
    id: 'classic',
    name: 'Zafiro Arcano',
    description: 'Cartulina holográfica con aleación de zafiro y oricalco místico.',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
    borderColor: 'rgba(168, 85, 247, 0.6)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    innerBorder: 'rgba(0, 255, 255, 0.3)',
    gemColors: { top: '#00ffff', bottom: '#b026ff' },
    sigil: '✦',
    rarity: 'common',
    foilOverlay: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(0,255,255,0.15) 30%, transparent 70%)',
  },
  gold: {
    id: 'gold',
    name: 'Oro 24K Soberano',
    description: 'Lámina de oro macizo grabada a mano con gemas de ámbar y diamantes.',
    bgGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #1c0a00 100%)',
    borderColor: 'rgba(234, 179, 8, 0.9)',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    innerBorder: 'rgba(253, 224, 71, 0.5)',
    gemColors: { top: '#fbbf24', bottom: '#f59e0b' },
    sigil: '👑',
    rarity: 'legendary',
    foilOverlay: 'linear-gradient(45deg, rgba(254,240,138,0.4) 0%, rgba(202,138,4,0.3) 50%, rgba(254,240,138,0.5) 100%)',
  },
  neon: {
    id: 'neon',
    name: 'Matriz Cyberpunk',
    description: 'Circuito superconductor con pulsos de neón cian y magenta cuántico.',
    bgGradient: 'linear-gradient(135deg, #09090b 0%, #030712 50%, #020617 100%)',
    borderColor: 'rgba(6, 182, 212, 0.9)',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    innerBorder: 'rgba(236, 72, 153, 0.6)',
    gemColors: { top: '#00ffff', bottom: '#ec4899' },
    sigil: '⚡',
    rarity: 'epic',
    foilOverlay: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,255,255,0.15) 10px, rgba(236,72,153,0.15) 20px)',
  },
  ice: {
    id: 'ice',
    name: 'Glaciar Eterno',
    description: 'Cristal de hielo ártico puro que congela la luz a su alrededor.',
    bgGradient: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #031e30 100%)',
    borderColor: 'rgba(125, 211, 252, 0.8)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    innerBorder: 'rgba(224, 242, 254, 0.5)',
    gemColors: { top: '#e0f2fe', bottom: '#38bdf8' },
    sigil: '❄️',
    rarity: 'rare',
    foilOverlay: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.6), rgba(56,189,248,0.25) 45%, transparent 70%)',
  },
  shadow: {
    id: 'shadow',
    name: 'Obsidiana Sigilosa',
    description: 'Blindaje de fibra de carbono y piedra volcánica con ranuras carmesí.',
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #000000 100%)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    innerBorder: 'rgba(248, 113, 113, 0.4)',
    gemColors: { top: '#ef4444', bottom: '#991b1b' },
    sigil: '⚔️',
    rarity: 'rare',
    foilOverlay: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, transparent 60%, rgba(0,0,0,0.8) 100%)',
  },
  galaxy: {
    id: 'galaxy',
    name: 'Nebulosa Cósmica',
    description: 'Fragmento del tejido del cosmos con estrellas vivas y polvo estelar.',
    bgGradient: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 40%, #020617 100%)',
    borderColor: 'rgba(192, 132, 252, 0.9)',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    innerBorder: 'rgba(244, 114, 182, 0.5)',
    gemColors: { top: '#c084fc', bottom: '#f472b6' },
    sigil: '🌌',
    rarity: 'mythic',
    foilOverlay: 'radial-gradient(circle at 50% 50%, rgba(244,114,182,0.35) 0%, rgba(192,132,252,0.2) 40%, transparent 75%)',
  },
  dragon: {
    id: 'dragon',
    name: 'Escama de Dragón',
    description: 'Forjada en el corazón de un volcán con escamas de dragón ancestral.',
    bgGradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #1a0202 100%)',
    borderColor: 'rgba(249, 115, 22, 0.9)',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    innerBorder: 'rgba(251, 146, 60, 0.5)',
    gemColors: { top: '#f97316', bottom: '#ef4444' },
    sigil: '🐉',
    rarity: 'epic',
    foilOverlay: 'linear-gradient(60deg, rgba(249,115,22,0.3) 0%, rgba(239,68,68,0.25) 50%, transparent 100%)',
  },
  celestial: {
    id: 'celestial',
    name: 'Luz Celestial',
    description: 'Bendición divina esculpida en mármol sagrado con filigrana dorada.',
    bgGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #082f49 100%)',
    borderColor: 'rgba(250, 204, 21, 0.9)',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    innerBorder: 'rgba(253, 224, 71, 0.5)',
    gemColors: { top: '#fde047', bottom: '#38bdf8' },
    sigil: '🕊️',
    rarity: 'legendary',
    foilOverlay: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(250,204,21,0.25) 45%, transparent 75%)',
  },
};

// Obtener los detalles completos del skin equipado
export function getEquippedSkinDetails(): SkinDetails {
  const skinId = getEquippedSkin();
  return ALL_SKINS[skinId] || ALL_SKINS.classic;
}

// Obtener clase de fondo para retrocompatibilidad
export function getEquippedSkinStyle(): string {
  const skinId = getEquippedSkin();
  const SKIN_STYLES: Record<string, string> = {
    classic: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black',
    gold: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-black',
    neon: 'bg-gradient-to-br from-cyan-950 via-purple-950 to-black',
    ice: 'bg-gradient-to-br from-sky-950 via-blue-950 to-black',
    shadow: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-black',
    galaxy: 'bg-gradient-to-br from-purple-950 via-fuchsia-950 to-black',
    dragon: 'bg-gradient-to-br from-red-950 via-orange-950 to-black',
    celestial: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-black',
  };
  return SKIN_STYLES[skinId] || SKIN_STYLES.classic;
}

// Obtener estilo del tablero equipado
export function getEquippedBoardStyle(): { bgColor: string; gradient: string } {
  const boardId = getEquippedBoard();
  const BOARD_STYLES: Record<string, { bgColor: string; gradient: string }> = {
    default: { bgColor: 'bg-slate-950', gradient: 'from-slate-900 to-slate-950' },
    forest: { bgColor: 'bg-emerald-950', gradient: 'from-green-900 to-emerald-950' },
    ocean: { bgColor: 'bg-cyan-950', gradient: 'from-blue-900 to-cyan-950' },
    volcano: { bgColor: 'bg-red-950', gradient: 'from-orange-900 to-red-950' },
    space: { bgColor: 'bg-neutral-950', gradient: 'from-purple-950 to-black' },
    heaven: { bgColor: 'bg-sky-950', gradient: 'from-amber-900 to-sky-950' },
  };
  return BOARD_STYLES[boardId] || BOARD_STYLES.default;
}

// Obtener estilo del marco equipado
export function getEquippedFrameStyle(): { gradient: string; borderStyle: string } {
  const frameId = getEquippedFrame();
  const FRAME_STYLES: Record<string, { gradient: string; borderStyle: string }> = {
    basic: { gradient: 'from-gray-500 to-gray-600', borderStyle: 'border-4 border-gray-500/50' },
    gold: { gradient: 'from-yellow-400 to-yellow-600', borderStyle: 'border-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
    diamond: { gradient: 'from-cyan-400 to-blue-500', borderStyle: 'border-4 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
    fire: { gradient: 'from-red-500 to-orange-600', borderStyle: 'border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
    cosmic: { gradient: 'from-purple-600 to-pink-600', borderStyle: 'border-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
    rainbow: { gradient: 'from-red-400 via-yellow-400 to-blue-400', borderStyle: 'border-4 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' },
  };
  return FRAME_STYLES[frameId] || FRAME_STYLES.basic;
}
