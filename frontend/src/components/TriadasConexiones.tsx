import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Zap, Target, Award, Sparkles, HelpCircle, CheckCircle, RefreshCw } from "lucide-react";
import { getEquippedSkinDetails } from "../lib/shopSystem";
import { soundSystem } from "../lib/soundSystem";
import type { Universe } from '../App';

type ModoTriada = 'ecosistema' | 'tecnologia';

interface TriadasConexionesProps {
  universe: Universe;
  modo: ModoTriada;
  onComplete: () => void;
  onBackToMenu: () => void;
  level?: number;
}

interface Card {
  id: number;
  symbol: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
  triadId: number;
  relation: string;
}

interface TriadGroup {
  id: number;
  symbols: [string, string, string];
  labels: [string, string, string];
  relation: string;
}

// Micro-Lore y etiquetas conceptuales 3D para cada símbolo
const TRIADS_BY_MODE: Record<ModoTriada, TriadGroup[]> = {
  ecosistema: [
    { id: 1, symbols: ['🌞', '🌱', '🌳'], labels: ['Sol Radiante', 'Germinación', 'Árbol Maduro'], relation: 'Sol nutre semilla que crece en gran árbol' },
    { id: 2, symbols: ['🐝', '🌸', '🍯'], labels: ['Abeja Obrera', 'Flor Silvestre', 'Miel Dorada'], relation: 'Abeja poliniza flor para crear miel pura' },
    { id: 3, symbols: ['☁️', '💧', '🌊'], labels: ['Nube Pluvial', 'Gota de Lluvia', 'Océano Vivo'], relation: 'Nube condensa lluvia que fluye al océano' },
    { id: 4, symbols: ['🥚', '🐛', '🦋'], labels: ['Huevo Fértil', 'Oruga Activa', 'Mariposa Alada'], relation: 'Metamorfosis: Huevo a oruga y mariposa' },
    { id: 5, symbols: ['🌋', '🪨', '🏔️'], labels: ['Magma Volcánico', 'Roca Basáltica', 'Cordillera'], relation: 'Lava volcánica enfría en roca y forma montañas' },
  ],
  tecnologia: [
    { id: 1, symbols: ['💡', '🔋', '⚡'], labels: ['Idea Creativa', 'Batería Iónica', 'Flujo Eléctrico'], relation: 'Innovación alimenta batería y desata energía' },
    { id: 2, symbols: ['🧠', '💻', '🤖'], labels: ['Red Neuronal', 'Computadora', 'Robot Autónomo'], relation: 'Mente diseña software para androides autónomos' },
    { id: 3, symbols: ['📡', '🛰️', '🌐'], labels: ['Antena Emisora', 'Satélite Orbital', 'Red Global'], relation: 'Antenas envían datos al satélite e internet' },
    { id: 4, symbols: ['🔬', '🧪', '💊'], labels: ['Microscopio', 'Compuesto', 'Medicina'], relation: 'Análisis microscópico formula cura médica' },
    { id: 5, symbols: ['🎮', '📱', '🖥️'], labels: ['Código de Juego', 'Terminal Móvil', 'Estación PC'], relation: 'Desarrollo interactivo cross-platform en PC y móvil' },
  ],
};

const MODE_CONFIG: Record<ModoTriada, { name: string; gradient: string; glowColor: string; emoji: string }> = {
  ecosistema: { name: 'ECOSISTEMA', gradient: 'from-emerald-400 via-teal-400 to-cyan-500', glowColor: '#10b981', emoji: '🌿' },
  tecnologia: { name: 'TECNOLOGÍA', gradient: 'from-cyan-400 via-purple-400 to-pink-500', glowColor: '#00ffff', emoji: '⚡' },
};

export function TriadasConexiones({ modo, onComplete, onBackToMenu }: TriadasConexionesProps) {
  const config = MODE_CONFIG[modo];
  const triads = TRIADS_BY_MODE[modo];

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [completedTriads, setCompletedTriads] = useState<number[]>([]);
  const [gamePhase, setGamePhase] = useState<"preview" | "playing" | "victory">("preview");
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [currentHint, setCurrentHint] = useState("");
  const [showConnection, setShowConnection] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ text: string; symbols: string[] }>({ text: '', symbols: [] });
  const [mistakes, setMistakes] = useState(0);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [laserPoints, setLaserPoints] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  // Initialize Game
  useEffect(() => {
    const selectedTriads = triads.slice(0, 4); // 4 tríadas = 12 cartas
    const cardList: Card[] = [];
    
    selectedTriads.forEach((triad) => {
      triad.symbols.forEach((symbol, i) => {
        cardList.push({
          id: cardList.length,
          symbol,
          label: triad.labels[i],
          isFlipped: true,
          isMatched: false,
          triadId: triad.id,
          relation: triad.relation,
        });
      });
    });

    const shuffled = cardList.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    soundSystem.playLevelUp();

    // Vista previa de 3s
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setGamePhase("playing");
    }, 3000);
  }, [modo]);

  // Timer
  useEffect(() => {
    if (gamePhase !== "playing" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  // Recalcular puntos láser entre cartas seleccionadas
  useEffect(() => {
    if (selectedCards.length < 2) {
      setLaserPoints([]);
      return;
    }

    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < selectedCards.length - 1; i++) {
      const idx1 = selectedCards[i];
      const idx2 = selectedCards[i + 1];
      const el1 = cardRefs.current[idx1];
      const el2 = cardRefs.current[idx2];
      if (el1 && el2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        lines.push({
          x1: r1.left + r1.width / 2,
          y1: r1.top + r1.height / 2,
          x2: r2.left + r2.width / 2,
          y2: r2.top + r2.height / 2,
        });
      }
    }
    setLaserPoints(lines);
  }, [selectedCards]);

  const handleCardClick = (index: number) => {
    if (gamePhase !== "playing") return;
    if (selectedCards.includes(index)) return;
    if (selectedCards.length >= 3) return;

    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    // Voltear carta y reproducir nota armónica (Do -> Mi -> Sol)
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    soundSystem.playTriadStep(newSelected.length);

    // Si seleccionó 3 cartas
    if (newSelected.length === 3) {
      const [first, second, third] = newSelected;
      const c1 = cards[first];
      const c2 = cards[second];
      const c3 = cards[third];

      if (c1.triadId === c2.triadId && c2.triadId === c3.triadId) {
        // ✨ ¡TRÍADA CONECTADA EXITOSAMENTE!
        const newCombo = combo + 1;
        setCombo(newCombo);
        setScore(prev => prev + 150 * newCombo);
        soundSystem.playVictoryFanfare();

        setConnectionDetails({
          text: c1.relation,
          symbols: [c1.symbol, c2.symbol, c3.symbol],
        });
        setShowConnection(true);

        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isMatched = true;
            updated[second].isMatched = true;
            updated[third].isMatched = true;
            return updated;
          });
          setSelectedCards([]);
          setShowConnection(false);
          setCompletedTriads(prev => [...prev, c1.triadId]);

          // Comprobar victoria
          const remainingUnmatched = cards.filter((c, i) => i !== first && i !== second && i !== third && !c.isMatched);
          if (remainingUnmatched.length === 0) {
            setTimeout(() => {
              setGamePhase("victory");
              onComplete();
            }, 600);
          }
        }, 1800);
      } else {
        // ❌ Error de relación
        setCombo(0);
        setMistakes(prev => prev + 1);
        soundSystem.playComboBreak();

        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            updated[third].isFlipped = false;
            return updated;
          });
          setSelectedCards([]);
        }, 1100);
      }
    }
  };

  const getHint = () => {
    const remaining = triads.find(t => !completedTriads.includes(t.id));
    if (remaining) {
      setCurrentHint(remaining.relation);
      soundSystem.playLevelUp();
      setTimeout(() => setCurrentHint(""), 4500);
    }
  };

  return (
    <div 
      className="font-rajdhani min-h-screen text-white p-4 md:p-8 relative overflow-y-auto select-none"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />

      {/* ===================== SVG LASER BEAMS OVERLAY ===================== */}
      {laserPoints.length > 0 && (
        <svg className="fixed inset-0 pointer-events-none z-30 w-full h-full">
          <defs>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {laserPoints.map((pt, i) => (
            <g key={i}>
              {/* Outer Beam */}
              <line
                x1={pt.x1}
                y1={pt.y1}
                x2={pt.x2}
                y2={pt.y2}
                stroke={config.glowColor}
                strokeWidth="6"
                strokeOpacity="0.7"
                filter="url(#laser-glow)"
              />
              {/* Core White Laser */}
              <line
                x1={pt.x1}
                y1={pt.y1}
                x2={pt.x2}
                y2={pt.y2}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="6,3"
                className="animate-pulse"
              />
            </g>
          ))}
        </svg>
      )}

      {/* ===================== HEADER ===================== */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto mb-4">
        <button 
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-xl backdrop-blur-md border border-gray-700 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
            {config.emoji} TRÍADAS: {config.name}
          </h2>
          <p className="text-xs text-gray-400 font-medium">Conecta 3 cartas que compartan una relación lógica</p>
        </div>

        <button
          onClick={getHint}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30"
        >
          <HelpCircle className="w-4 h-4" /> Pista
        </button>
      </div>

      {/* ===================== HUD STATS ===================== */}
      <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto mb-6 relative z-10">
        <div className="p-3 bg-slate-900/80 border border-cyan-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tiempo</span>
          <p className="text-2xl font-black text-cyan-300 font-mono">{timeLeft}s</p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-purple-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Puntos</span>
          <p className="text-2xl font-black text-purple-300 font-mono">{score}</p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-amber-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Racha Combo</span>
          <p className="text-2xl font-black text-amber-300 font-mono">x{combo}</p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-red-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Errores</span>
          <p className="text-2xl font-black text-red-400 font-mono">{mistakes}</p>
        </div>
      </div>

      {/* Pista Dinámica */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto mb-4 p-3 bg-purple-950/80 border border-purple-400/50 rounded-2xl text-center shadow-xl backdrop-blur-md relative z-10"
          >
            <span className="text-xs text-purple-200 font-bold">💡 Pista de Tríada: {currentHint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL DE CONEXIÓN TRIÁDICA ===================== */}
      <AnimatePresence>
        {showConnection && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="p-6 md:p-8 bg-slate-950/95 border-2 border-cyan-400 rounded-3xl shadow-[0_0_50px_rgba(0,255,255,0.6)] backdrop-blur-2xl text-center max-w-lg">
              <div className="text-5xl mb-3 flex items-center justify-center gap-3">
                {connectionDetails.symbols.map((sym, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
                    {sym} {i < 2 ? '➔' : ''}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-black uppercase text-cyan-300 mb-1">¡TRÍADA CONECTADA!</h3>
              <p className="text-sm text-gray-200 font-medium">{connectionDetails.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== 3D HOLOGRAPHIC CARD GRID ===================== */}
      <div className="max-w-3xl mx-auto mb-8 relative z-10">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => {
            const skin = getEquippedSkinDetails();
            const isSelected = selectedCards.includes(index);
            const isVisible = card.isFlipped || card.isMatched;

            return (
              <motion.div
                key={card.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className="aspect-square cursor-pointer select-none relative group"
                style={{ perspective: 1200 }}
                onClick={() => handleCardClick(index)}
                whileHover={!card.isMatched ? { scale: 1.06, y: -6 } : {}}
                whileTap={!card.isMatched ? { scale: 0.94 } : {}}
              >
                <motion.div
                  className="relative w-full h-full rounded-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: card.isMatched
                      ? `0 14px 35px -5px ${config.glowColor}88, 0 0 25px ${config.glowColor}66`
                      : isSelected
                      ? '0 0 30px rgba(0,255,255,0.9), 0 0 10px #00ffff'
                      : `0 10px 24px -6px rgba(0,0,0,0.8), 0 0 12px ${skin.glowColor}`,
                  }}
                  animate={{ rotateY: isVisible ? 180 : 0 }}
                  transition={{ duration: 0.55, type: 'spring', stiffness: 220, damping: 18 }}
                >
                  {/* CARD BACK */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      border: `2px solid ${skin.borderColor}`,
                      background: skin.bgGradient,
                      boxShadow: `inset 0 0 18px rgba(0,0,0,0.85)`,
                    }}
                  >
                    <div className="absolute inset-1.5 rounded-xl border border-white/15 pointer-events-none" />
                    <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.gemColors.top, boxShadow: `0 0 6px ${skin.gemColors.top}` }} />
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.gemColors.bottom, boxShadow: `0 0 6px ${skin.gemColors.bottom}` }} />
                    <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.gemColors.bottom, boxShadow: `0 0 6px ${skin.gemColors.bottom}` }} />
                    <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.gemColors.top, boxShadow: `0 0 6px ${skin.gemColors.top}` }} />

                    {/* Foil Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge" style={{ background: skin.foilOverlay }} />

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 border border-white/10 backdrop-blur-sm shadow-md">
                      <span className="text-2xl select-none">{config.emoji}</span>
                    </div>
                  </div>

                  {/* CARD FRONT */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden flex flex-col items-center justify-between p-2"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      border: card.isMatched
                        ? '2.5px solid #10b981'
                        : isSelected
                        ? '2.5px solid #00ffff'
                        : `2px solid ${config.glowColor}`,
                      background: card.isMatched
                        ? 'linear-gradient(145deg, #064e3b 0%, #022c22 100%)'
                        : 'linear-gradient(145deg, #181534 0%, #0a081c 100%)',
                      boxShadow: `inset 0 0 25px rgba(0,0,0,0.7)`,
                    }}
                  >
                    <div className="absolute inset-1.5 rounded-xl border border-white/15 pointer-events-none" />

                    {/* Top Rarity / Role Mini Badge */}
                    <div className="w-full flex justify-between items-center text-[9px] text-gray-400 font-mono z-10 px-1 pt-0.5">
                      <span>TRÍADA</span>
                      <span>#{card.triadId}</span>
                    </div>

                    {/* Símbolo Central con Sombra Volumétrica 3D */}
                    <div className="flex-1 flex items-center justify-center z-10">
                      <span
                        className="text-4xl sm:text-5xl select-none transform-gpu"
                        style={{
                          filter: `drop-shadow(0 12px 16px rgba(0,0,0,0.95)) drop-shadow(0 0 14px ${config.glowColor}88)`,
                        }}
                      >
                        {card.symbol}
                      </span>
                    </div>

                    {/* Subtítulo Conceptual (Micro-Lore) */}
                    <div className="w-full text-center z-10 pb-0.5">
                      <span className="text-[10px] font-bold text-gray-300 block truncate px-1 bg-black/40 rounded-md border border-white/5">
                        {card.label}
                      </span>
                    </div>

                    {/* Selection Badge (#1, #2, #3) */}
                    {isSelected && !card.isMatched && (
                      <motion.div
                        className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-[0_0_12px_#00ffff] z-20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        #{selectedCards.indexOf(index) + 1}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ===================== VICTORY SCREEN ===================== */}
      <AnimatePresence>
        {gamePhase === "victory" && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900/95 p-8 rounded-3xl border-2 border-cyan-400 max-w-md w-full text-center shadow-2xl"
            >
              <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 uppercase">
                ¡SINAPSIS COMPLETA!
              </h3>
              <p className="text-gray-300 text-sm mb-6">Has conectado todas las tríadas conceptuales</p>

              <div className="p-4 bg-purple-950/60 rounded-2xl border border-purple-500/30 mb-6">
                <span className="text-xs text-gray-400 font-bold uppercase">Puntuación Obtenida</span>
                <p className="text-4xl font-black text-purple-300">{score} PTS</p>
              </div>

              <button
                onClick={onBackToMenu}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Volver al Menú
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
