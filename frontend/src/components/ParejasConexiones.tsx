import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Zap, Target, Award, Sparkles, HelpCircle } from "lucide-react";
import { getEquippedSkinDetails } from "../lib/shopSystem";
import { soundSystem } from "../lib/soundSystem";
import type { Universe } from '../App';

type ModoConexion = 'naturaleza' | 'ciencia' | 'humano';

interface ParejasConexionesProps {
  universe: Universe;
  modo: ModoConexion;
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
  pairId: number;
  relation: string;
}

interface PairGroup {
  id: number;
  symbols: [string, string];
  labels: [string, string];
  relation: string;
}

// 🧠 SISTEMA DE PAREJAS POR MODO CON MICRO-LORE
const PAIRS_BY_MODE: Record<ModoConexion, PairGroup[]> = {
  naturaleza: [
    { id: 1, symbols: ['🐝', '🍯'], labels: ['Abeja Obrera', 'Miel Dorada'], relation: 'La abeja elabora miel pura en la colmena' },
    { id: 2, symbols: ['🐟', '🌊'], labels: ['Pez Abisal', 'Océano Profundo'], relation: 'El pez nada en las corrientes oceánicas' },
    { id: 3, symbols: ['🌳', '🍃'], labels: ['Árbol Roble', 'Hojas de Clorofila'], relation: 'El árbol respira a través de sus hojas' },
    { id: 4, symbols: ['☁️', '💧'], labels: ['Nube Condensada', 'Gota de Lluvia'], relation: 'La nube precipita lluvia vital' },
    { id: 5, symbols: ['🌸', '🦋'], labels: ['Flor de Cerezo', 'Mariposa Silvestre'], relation: 'La flor atrae mariposas polinizadoras' },
    { id: 6, symbols: ['🌞', '🌻'], labels: ['Sol Radiante', 'Girasol Dorado'], relation: 'El girasol sigue la luz solar' },
  ],
  ciencia: [
    { id: 1, symbols: ['🤖', '💻'], labels: ['Androide IA', 'Supercomputadora'], relation: 'El robot procesa datos en la computadora' },
    { id: 2, symbols: ['🔬', '🧪'], labels: ['Microscopio', 'Tubo de Ensayo'], relation: 'El microscopio analiza muestras químicas' },
    { id: 3, symbols: ['⚡', '🔋'], labels: ['Voltaje Eléctrico', 'Celda de Batería'], relation: 'La electricidad recarga celdas de energía' },
    { id: 4, symbols: ['🛰️', '📡'], labels: ['Satélite Geo', 'Antena Receptora'], relation: 'El satélite transmite ondas orbitales' },
    { id: 5, symbols: ['🧬', '💉'], labels: ['Cadena de ADN', 'Inyección Génica'], relation: 'La terapia genética corrige el genoma' },
    { id: 6, symbols: ['🔭', '⭐'], labels: ['Telescopio Espacial', 'Estrella Pulsar'], relation: 'El telescopio descubre nuevas estrellas' },
  ],
  humano: [
    { id: 1, symbols: ['👑', '🏰'], labels: ['Corona Monárquica', 'Castillo Real'], relation: 'El rey gobierna su fortaleza histórica' },
    { id: 2, symbols: ['⚔️', '🛡️'], labels: ['Espada Forjada', 'Escudo Templario'], relation: 'Espada y escudo forman la defensa clásica' },
    { id: 3, symbols: ['🍳', '👨‍🍳'], labels: ['Sartén Culinaria', 'Chef Ejecutivo'], relation: 'El chef prepara gastronomía de autor' },
    { id: 4, symbols: ['🎸', '🎵'], labels: ['Guitarra Acústica', 'Nota Musical'], relation: 'Las cuerdas de la guitarra crean armonías' },
    { id: 5, symbols: ['📚', '🎓'], labels: ['Tomo Académico', 'Birrete de Graduado'], relation: 'El estudio continuo lleva a la graduación' },
    { id: 6, symbols: ['🎨', '🖼️'], labels: ['Paleta de Pintor', 'Lienzo en Galería'], relation: 'La pintura al óleo cobra vida en el cuadro' },
  ],
};

const MODE_CONFIG: Record<ModoConexion, { name: string; gradient: string; glowColor: string; emoji: string }> = {
  naturaleza: { name: 'NATURALEZA', gradient: 'from-green-400 via-emerald-500 to-teal-500', glowColor: '#10b981', emoji: '🌿' },
  ciencia: { name: 'CIENCIA', gradient: 'from-blue-400 via-cyan-500 to-sky-500', glowColor: '#3b82f6', emoji: '🔬' },
  humano: { name: 'HUMANO', gradient: 'from-amber-400 via-orange-500 to-yellow-500', glowColor: '#f59e0b', emoji: '👑' },
};

export function ParejasConexiones({ modo, onComplete, onBackToMenu }: ParejasConexionesProps) {
  const config = MODE_CONFIG[modo];
  const pairs = PAIRS_BY_MODE[modo];

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [completedPairs, setCompletedPairs] = useState<number[]>([]);
  const [gamePhase, setGamePhase] = useState<"preview" | "playing" | "victory">("preview");
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [currentHint, setCurrentHint] = useState("");
  const [showConnection, setShowConnection] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ text: string; symbols: string[] }>({ text: '', symbols: [] });
  const [mistakes, setMistakes] = useState(0);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [laserPoints, setLaserPoints] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  useEffect(() => {
    const selectedPairs = pairs.slice(0, 6); // 6 parejas = 12 cartas
    const cardList: Card[] = [];

    selectedPairs.forEach((pair) => {
      pair.symbols.forEach((symbol, i) => {
        cardList.push({
          id: cardList.length,
          symbol,
          label: pair.labels[i],
          isFlipped: true,
          isMatched: false,
          pairId: pair.id,
          relation: pair.relation,
        });
      });
    });

    const shuffled = cardList.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    soundSystem.playLevelUp();

    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setGamePhase("playing");
    }, 3000);
  }, [modo]);

  useEffect(() => {
    if (gamePhase !== "playing" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  // SVG Laser connection between selected pair
  useEffect(() => {
    if (selectedCards.length < 2) {
      setLaserPoints([]);
      return;
    }
    const idx1 = selectedCards[0];
    const idx2 = selectedCards[1];
    const el1 = cardRefs.current[idx1];
    const el2 = cardRefs.current[idx2];
    if (el1 && el2) {
      const r1 = el1.getBoundingClientRect();
      const r2 = el2.getBoundingClientRect();
      setLaserPoints([{
        x1: r1.left + r1.width / 2,
        y1: r1.top + r1.height / 2,
        x2: r2.left + r2.width / 2,
        y2: r2.top + r2.height / 2,
      }]);
    }
  }, [selectedCards]);

  const handleCardClick = (index: number) => {
    if (gamePhase !== "playing") return;
    if (selectedCards.includes(index)) return;
    if (selectedCards.length >= 2) return;

    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    soundSystem.playTriadStep(newSelected.length);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const c1 = cards[first];
      const c2 = cards[second];

      if (c1.pairId === c2.pairId) {
        // ✨ ¡PAREJA CONECTADA!
        const newCombo = combo + 1;
        setCombo(newCombo);
        setScore(prev => prev + 100 * newCombo);
        soundSystem.playVictoryFanfare();

        setConnectionDetails({
          text: c1.relation,
          symbols: [c1.symbol, c2.symbol],
        });
        setShowConnection(true);

        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isMatched = true;
            updated[second].isMatched = true;
            return updated;
          });
          setSelectedCards([]);
          setShowConnection(false);
          setCompletedPairs(prev => [...prev, c1.pairId]);

          const remainingUnmatched = cards.filter((c, i) => i !== first && i !== second && !c.isMatched);
          if (remainingUnmatched.length === 0) {
            setTimeout(() => {
              setGamePhase("victory");
              onComplete();
            }, 600);
          }
        }, 1600);
      } else {
        // ❌ Error
        setCombo(0);
        setMistakes(prev => prev + 1);
        soundSystem.playComboBreak();

        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            return updated;
          });
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const getHint = () => {
    const remaining = pairs.find(p => !completedPairs.includes(p.id));
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

      {/* SVG LASER ARCS */}
      {laserPoints.length > 0 && (
        <svg className="fixed inset-0 pointer-events-none z-30 w-full h-full">
          <defs>
            <filter id="laser-glow-pair" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {laserPoints.map((pt, i) => (
            <g key={i}>
              <line
                x1={pt.x1}
                y1={pt.y1}
                x2={pt.x2}
                y2={pt.y2}
                stroke={config.glowColor}
                strokeWidth="6"
                strokeOpacity="0.7"
                filter="url(#laser-glow-pair)"
              />
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

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto mb-4">
        <button 
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-xl backdrop-blur-md border border-gray-700 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-yellow-400">
            {config.emoji} PAREJAS: {config.name}
          </h2>
          <p className="text-xs text-gray-400 font-medium">Encuentra las 2 cartas con relación conceptual</p>
        </div>

        <button
          onClick={getHint}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30"
        >
          <HelpCircle className="w-4 h-4" /> Pista
        </button>
      </div>

      {/* HUD STATS */}
      <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto mb-6 relative z-10">
        <div className="p-3 bg-slate-900/80 border border-emerald-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tiempo</span>
          <p className="text-2xl font-black text-emerald-300 font-mono">{timeLeft}s</p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-cyan-400/40 rounded-2xl text-center shadow-lg backdrop-blur-md">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Puntos</span>
          <p className="text-2xl font-black text-cyan-300 font-mono">{score}</p>
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
            className="max-w-md mx-auto mb-4 p-3 bg-emerald-950/80 border border-emerald-400/50 rounded-2xl text-center shadow-xl backdrop-blur-md relative z-10"
          >
            <span className="text-xs text-emerald-200 font-bold">💡 Pista de Relación: {currentHint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONEXIÓN */}
      <AnimatePresence>
        {showConnection && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="p-6 md:p-8 bg-slate-950/95 border-2 border-emerald-400 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.6)] backdrop-blur-2xl text-center max-w-lg">
              <div className="text-5xl mb-3 flex items-center justify-center gap-3">
                {connectionDetails.symbols.map((sym, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
                    {sym} {i < 1 ? '🔗' : ''}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-black uppercase text-emerald-300 mb-1">¡CONEXIÓN SINÁPTICA!</h3>
              <p className="text-sm text-gray-200 font-medium">{connectionDetails.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D HOLOGRAPHIC CARD GRID */}
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

                    {/* Top Mini Badge */}
                    <div className="w-full flex justify-between items-center text-[9px] text-gray-400 font-mono z-10 px-1 pt-0.5">
                      <span>PAREJA</span>
                      <span>#{card.pairId}</span>
                    </div>

                    {/* Símbolo 3D */}
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

                    {/* Micro-Lore Label */}
                    <div className="w-full text-center z-10 pb-0.5">
                      <span className="text-[10px] font-bold text-gray-300 block truncate px-1 bg-black/40 rounded-md border border-white/5">
                        {card.label}
                      </span>
                    </div>

                    {/* Selection Indicator (#1, #2) */}
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

      {/* VICTORY */}
      <AnimatePresence>
        {gamePhase === "victory" && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900/95 p-8 rounded-3xl border-2 border-emerald-400 max-w-md w-full text-center shadow-2xl"
            >
              <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 uppercase">
                ¡CONEXIÓN TOTAL!
              </h3>
              <p className="text-gray-300 text-sm mb-6">Has resuelto todas las parejas conceptuales</p>

              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 mb-6">
                <span className="text-xs text-gray-400 font-bold uppercase">Puntuación Obtenida</span>
                <p className="text-4xl font-black text-emerald-300">{score} PTS</p>
              </div>

              <button
                onClick={onBackToMenu}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
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
