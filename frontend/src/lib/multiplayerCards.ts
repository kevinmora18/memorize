import { getEquippedPackCards } from './shopSystem';

export interface CardItem {
  id: number;
  groupId: number;
  symbol: string;
  name: string;
  lore: string;
  isFlipped: boolean;
  isMatched: boolean;
  orderInTriad?: number;
}

export const TRIADS_DATA = [
  {
    groupId: 1,
    items: [
      { symbol: '🌞', name: 'Sol Radiante', lore: 'Emite energía fotónica' },
      { symbol: '🌱', name: 'Germinación', lore: 'Absorbe fotosíntesis' },
      { symbol: '🌳', name: 'Árbol Maduro', lore: 'Produce oxígeno vital' }
    ]
  },
  {
    groupId: 2,
    items: [
      { symbol: '💡', name: 'Idea / Chispa', lore: 'Concepto inicial' },
      { symbol: '🔋', name: 'Batería Iónica', lore: 'Almacena energía' },
      { symbol: '⚡', name: 'Red Eléctrica', lore: 'Distribuye poder' }
    ]
  },
  {
    groupId: 3,
    items: [
      { symbol: '💧', name: 'Gota de Lluvia', lore: 'Condensación de vapor' },
      { symbol: '🌊', name: 'Río Torrencial', lore: 'Flujo hídrico natural' },
      { symbol: '❄️', name: 'Glaciar Eterno', lore: 'Reserva congelada' }
    ]
  },
  {
    groupId: 4,
    items: [
      { symbol: '🚀', name: 'Cohete Espacial', lore: 'Despegue atmosférico' },
      { symbol: '🛰️', name: 'Satélite Orbital', lore: 'Transmisión cuántica' },
      { symbol: '🌌', name: 'Espacio Profundo', lore: 'Frontera estelar' }
    ]
  },
  {
    groupId: 5,
    items: [
      { symbol: '🔥', name: 'Llama Viva', lore: 'Combustión térmica' },
      { symbol: '💨', name: 'Corriente de Aire', lore: 'Alimenta el oxígeno' },
      { symbol: '🌋', name: 'Volcán Activo', lore: 'Poder magmático' }
    ]
  },
  {
    groupId: 6,
    items: [
      { symbol: '🧬', name: 'Código Genético', lore: 'Estructura molecular' },
      { symbol: '🔬', name: 'Microscopio', lore: 'Análisis biológico' },
      { symbol: '🧪', name: 'Cura Sintética', lore: 'Medicina avanzada' }
    ]
  },
  {
    groupId: 7,
    items: [
      { symbol: '🧠', name: 'Neurona Viva', lore: 'Impulso sináptico' },
      { symbol: '💾', name: 'Chip Neural', lore: 'Memoria cibernética' },
      { symbol: '🤖', name: 'Androide IA', lore: 'Conciencia artificial' }
    ]
  },
  {
    groupId: 8,
    items: [
      { symbol: '🎨', name: 'Paleta Creativa', lore: 'Mezcla de pigmentos' },
      { symbol: '🖌️', name: 'Pincel de Seda', lore: 'Trazo de precisión' },
      { symbol: '🖼️', name: 'Obra Maestra', lore: 'Arte inmortal' }
    ]
  }
];

export const CONNECTIONS_DATA = [
  { groupId: 1, items: [{ symbol: '🐝', name: 'Abeja Reina', lore: 'Polinización' }, { symbol: '🍯', name: 'Miel Pura', lore: 'Dulce néctar' }] },
  { groupId: 2, items: [{ symbol: '🏹', name: 'Arco Tensado', lore: 'Fuerza elástica' }, { symbol: '🎯', name: 'Diana Central', lore: 'Precisión total' }] },
  { groupId: 3, items: [{ symbol: '🗝️', name: 'Llave Dorada', lore: 'Acceso seguro' }, { symbol: '🔒', name: 'Cofre Antiguo', lore: 'Secreto sellado' }] },
  { groupId: 4, items: [{ symbol: '⚡', name: 'Rayo Eléctrico', lore: 'Descarga voltaica' }, { symbol: '🌩️', name: 'Tormenta', lore: 'Tempestad activa' }] },
  { groupId: 5, items: [{ symbol: '⛵', name: 'Barco Velero', lore: 'Navegación' }, { symbol: '⚓', name: 'Ancla Marina', lore: 'Firmeza en puerto' }] },
  { groupId: 6, items: [{ symbol: '🌙', name: 'Luna Creciente', lore: 'Luz nocturna' }, { symbol: '⭐', name: 'Estrella Fugaz', lore: 'Brillo cósmico' }] },
  { groupId: 7, items: [{ symbol: '🕷️', name: 'Araña Tejedora', lore: 'Arquitectura' }, { symbol: '🕸️', name: 'Telaraña', lore: 'Trampa de seda' }] },
  { groupId: 8, items: [{ symbol: '☕', name: 'Café Caliente', lore: 'Vapor aromático' }, { symbol: '🥐', name: 'Croissant', lore: 'Desayuno fresco' }] },
  { groupId: 9, items: [{ symbol: '📚', name: 'Libro Antiguo', lore: 'Sabiduría' }, { symbol: '👓', name: 'Gafas de Lectura', lore: 'Visión nítida' }] },
  { groupId: 10, items: [{ symbol: '👑', name: 'Corona Real', lore: 'Mando absoluto' }, { symbol: '🏰', name: 'Castillo Feudal', lore: 'Fortaleza' }] },
  { groupId: 11, items: [{ symbol: '🚗', name: 'Auto Deportivo', lore: 'Velocidad' }, { symbol: '🏁', name: 'Bandera a Cuadros', lore: 'Meta final' }] },
  { groupId: 12, items: [{ symbol: '🎸', name: 'Guitarra', lore: 'Acordes sonoros' }, { symbol: '🎶', name: 'Partitura Musical', lore: 'Melodía viva' }] }
];

export function generateMultiplayerCards(
  gameMode: 'classic' | 'connections' | 'triads' = 'triads',
  targetCardCount: number = 12
): CardItem[] {
  let generatedCards: CardItem[] = [];

  if (gameMode === 'triads') {
    const triadCount = Math.max(2, Math.min(TRIADS_DATA.length, Math.floor(targetCardCount / 3)));
    const chosenTriads = TRIADS_DATA.slice(0, triadCount);
    let idCounter = 0;
    chosenTriads.forEach(t => {
      t.items.forEach((item, idx) => {
        generatedCards.push({
          id: idCounter++,
          groupId: t.groupId,
          symbol: item.symbol,
          name: item.name,
          lore: item.lore,
          isFlipped: false,
          isMatched: false,
          orderInTriad: idx + 1,
        });
      });
    });
  } else if (gameMode === 'connections') {
    const pairCount = Math.max(2, Math.min(CONNECTIONS_DATA.length, Math.floor(targetCardCount / 2)));
    const chosenPairs = CONNECTIONS_DATA.slice(0, pairCount);
    let idCounter = 0;
    chosenPairs.forEach(p => {
      p.items.forEach(item => {
        generatedCards.push({
          id: idCounter++,
          groupId: p.groupId,
          symbol: item.symbol,
          name: item.name,
          lore: item.lore,
          isFlipped: false,
          isMatched: false,
        });
      });
    });
  } else {
    // Clásico
    const pairCount = Math.max(2, Math.floor(targetCardCount / 2));
    const equipped = getEquippedPackCards();
    const pool = (equipped && equipped.length >= pairCount)
      ? equipped.slice(0, pairCount)
      : ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🥝', '🥭', '🥥', '🍋'].slice(0, pairCount);
    
    let idCounter = 0;
    pool.forEach((sym, gIdx) => {
      for (let i = 0; i < 2; i++) {
        generatedCards.push({
          id: idCounter++,
          groupId: gIdx + 1,
          symbol: sym,
          name: `Pareja ${sym}`,
          lore: 'Símbolo idéntico',
          isFlipped: false,
          isMatched: false,
        });
      }
    });
  }

  // Barajar
  return [...generatedCards].sort(() => Math.random() - 0.5);
}
