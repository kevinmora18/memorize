import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassicCard } from './ClassicCard';
import type { CardData } from './ClassicCard';
import { ClassicHUD } from './ClassicHUD';
import { ClassicResults } from './ClassicResults';
import { ParticleExplosion, ComboPopup, BombAlert, LevelUpBanner } from './ClassicEffects';

// ── Emoji symbol sets ──────────────────────────────────────────────────────────
const SYMBOL_SETS = [
  { emoji: '🍎', color: '#ef4444' },
  { emoji: '🍌', color: '#facc15' },
  { emoji: '🍇', color: '#a855f7' },
  { emoji: '🍉', color: '#f43f5e' },
  { emoji: '🍓', color: '#fb7185' },
  { emoji: '🍒', color: '#e11d48' },
  { emoji: '🍑', color: '#fb923c' },
  { emoji: '🍍', color: '#fcd34d' },
  { emoji: '🥝', color: '#a3e635' },
  { emoji: '🥭', color: '#f59e0b' },
  { emoji: '🥥', color: '#d4d4d8' },
  { emoji: '🍋', color: '#fde047' },
  { emoji: '🍈', color: '#86efac' },
  { emoji: '🍏', color: '#4ade80' },
  { emoji: '🍐', color: '#bef264' },
  { emoji: '🍊', color: '#fdba74' },
  { emoji: '🫐', color: '#60a5fa' },
  { emoji: '🥑', color: '#16a34a' },
];

// ── Level config ──────────────────────────────────────────────────────────────
function getLevelConfig(level: number) {
  const pairs = Math.min(4 + Math.floor((level - 1) * 1.5), 12);
  const time = Math.max(120 - (level - 1) * 6, 30);
  const glitch = level >= 4 && level <= 6;
  const bomb = level >= 5;
  const dark = level >= 11;
  const cols = pairs <= 6 ? 3 : pairs <= 9 ? 4 : 4;
  return { pairs, time, glitch, bomb, dark, cols };
}

// ── Build card deck ───────────────────────────────────────────────────────────
function buildDeck(level: number): CardData[] {
  const cfg = getLevelConfig(level);
  const symbols = [...SYMBOL_SETS].sort(() => Math.random() - 0.5).slice(0, cfg.pairs);

  const cards: CardData[] = [];
  symbols.forEach((sym, i) => {
    for (let side = 0; side < 2; side++) {
      cards.push({
        id: `${i}-${side}-${Date.now()}`,
        symbol: sym.emoji,
        emoji: sym.emoji,
        color: sym.color,
        isFlipped: false,
        isMatched: false,
        isGlitch: false,
        isBomb: false,
        isDark: false,
      });
    }
  });

  // Shuffle
  cards.sort(() => Math.random() - 0.5);

  // Assign glitch / bomb cards
  if (cfg.glitch) {
    const unmatched = cards.filter(c => !c.isBomb);
    const count = Math.max(1, Math.floor(cards.length * 0.15));
    const chosen = unmatched.sort(() => Math.random() - 0.5).slice(0, count);
    chosen.forEach(c => { c.isGlitch = true; });
  }
  if (cfg.bomb) {
    cards.push({
      id: `bomb-1-${Date.now()}`,
      symbol: 'BOMB-1',
      emoji: '💣',
      color: '#ef4444',
      isFlipped: false,
      isMatched: false,
      isGlitch: false,
      isBomb: true,
      isDark: false,
    });
    cards.push({
      id: `bomb-2-${Date.now()}`,
      symbol: 'BOMB-2',
      emoji: '💣',
      color: '#ef4444',
      isFlipped: false,
      isMatched: false,
      isGlitch: false,
      isBomb: true,
      isDark: false,
    });
    cards.sort(() => Math.random() - 0.5);
  }

  return cards;
}

// ── Floating particle background ──────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    color: ['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Scanning phase overlay ────────────────────────────────────────────────────
function ScanningOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-8 flex flex-col items-center justify-center z-30 pointer-events-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-black/80 px-8 py-4 rounded-full backdrop-blur-md flex flex-col items-center border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
        <motion.div
          className="text-xl font-black uppercase tracking-[0.2em] text-center mb-3"
          style={{ color: '#a78bfa', textShadow: '0 0 15px rgba(167,139,250,0.8)' }}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          ¡MEMORIZA LAS CARTAS!
        </motion.div>
        <div className="w-56 h-1.5 bg-gray-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #c084fc)', boxShadow: '0 0 10px rgba(168,85,247,0.8)' }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface GameScreenProps {
  onBackToLobby: () => void;
}

export function GameScreen({ onBackToLobby }: GameScreenProps) {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timer, setTimer] = useState(120);
  const [maxTime, setMaxTime] = useState(120);
  const [energy, setEnergy] = useState(60);
  const [attempts, setAttempts] = useState(0);

  type Phase = 'scanning' | 'playing' | 'levelUp' | 'results';
  const [phase, setPhase] = useState<Phase>('scanning');
  const [resultWon, setResultWon] = useState(false);

  const [shakingIdx, setShakingIdx] = useState<number[]>([]);
  const [bouncingIdx, setBouncingIdx] = useState<number[]>([]);
  const [explodingIdx] = useState<number[]>([]);
  const [explosion, setExplosion] = useState<{ x: number; y: number; color: string; id: number } | null>(null);
  const [comboActive, setComboActive] = useState(false);
  const [bombAlert, setBombAlert] = useState(false);
  const [levelUpActive, setLevelUpActive] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [darkVeil, setDarkVeil] = useState(0);

  const lockRef = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Init / reinit ────────────────────────────────────────────────────────────
  const initLevel = useCallback((lvl: number) => {
    const cfg = getLevelConfig(lvl);
    const deck = buildDeck(lvl);
    // Show cards face-up initially
    const visible = deck.map(c => ({ ...c, isFlipped: true }));
    setCards(visible);
    setSelected([]);
    setTimer(cfg.time);
    setMaxTime(cfg.time);
    setPhase('scanning');
    setDarkVeil(0);
    lockRef.current = false;
  }, []);

  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // After scanning, flip all cards back
  const handleScanDone = useCallback(() => {
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
    setPhase('playing');
  }, []);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const tick = setInterval(() => {
      setTimer(t => {
        if (t <= 0) {
          clearInterval(tick);
          setResultWon(false);
          setPhase('results');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase]);

  // ── Darkness veil (levels 11-15) ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const cfg = getLevelConfig(level);
    if (!cfg.dark) return;
    const darkTick = setInterval(() => {
      setDarkVeil(v => Math.min(v + 2, 70));
    }, 2000);
    return () => clearInterval(darkTick);
  }, [phase, level]);

  // ── AI score drift ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const aiTick = setInterval(() => {
      setAiScore(s => s + Math.floor(Math.random() * 80 + 20));
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(aiTick);
  }, [phase]);

  // ── Card click ────────────────────────────────────────────────────────────
  const handleCardClick = useCallback((idx: number) => {
    if (phase !== 'playing') return;
    if (lockRef.current) return;
    const card = cards[idx];
    if (card.isFlipped || card.isMatched) return;
    if (selected.includes(idx)) return;

    // Immediate bomb check
    if (card.isBomb) {
      lockRef.current = true;
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, isFlipped: true } : c));
      
      setBombAlert(true);
      setTimeout(() => setBombAlert(false), 700);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
      setScore(s => Math.max(0, s - 200));
      setTimer(t => Math.max(0, t - 8));
      setCombo(0);
      setEnergy(e => Math.max(0, e - 15));

      const el = cardRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        setExplosion({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color: card.color, id: Date.now() });
      }

      setTimeout(() => {
        setCards(prev => {
          let updated = prev.map((c, i) => {
             if (i === idx) return { ...c, isMatched: true };
             if (selected.includes(i)) return { ...c, isFlipped: false };
             return c;
          });
          
          const unmatched = updated.filter(c => !c.isMatched);
          unmatched.sort(() => Math.random() - 0.5);
          let unmatchedIndex = 0;
          return updated.map(c => c.isMatched ? c : unmatched[unmatchedIndex++]);
        });
        setSelected([]);
        lockRef.current = false;
      }, 1000);
      return;
    }

    // Flip
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, isFlipped: true } : c));
    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length < 2) return;

    // Two cards selected — evaluate
    lockRef.current = true;
    setAttempts(a => a + 1);
    const [i1, i2] = newSelected;
    const c1 = cards[i1];
    const c2 = cards[i2];

    if (c1.symbol === c2.symbol) {
      // Match!
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      const gained = 100 + newCombo * 50;
      setScore(s => s + gained);
      setEnergy(e => Math.min(100, e + 8));

      if (newCombo >= 2) {
        setComboActive(true);
        setTimeout(() => setComboActive(false), 1500);
      }

      // Bounce
      setBouncingIdx([i1, i2]);
      setTimeout(() => setBouncingIdx([]), 600);

      // Particle explosion at card position
      const el = cardRefs.current[i1];
      if (el) {
        const rect = el.getBoundingClientRect();
        setExplosion({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color: c1.color, id: Date.now() });
      }

      setTimeout(() => {
        setCards(prev => {
          const updated = prev.map((c, i) => i === i1 || i === i2 ? { ...c, isMatched: true } : c);
          const remaining = updated.filter(c => !c.isMatched && !c.isBomb).length;
          if (remaining === 0) {
            setTimeout(() => {
              if (level < 15) {
                setLevelUpActive(true);
                setTimeout(() => {
                  setLevelUpActive(false);
                  setLevel(l => l + 1);
                  setScore(s => s + Math.ceil(timer) * 10);
                }, 2200);
              } else {
                setResultWon(true);
                setPhase('results');
              }
            }, 400);
          }
          return updated;
        });
        setSelected([]);
        lockRef.current = false;
      }, 700);
    } else {
      // Mismatch
      setCombo(0);
      setEnergy(e => Math.max(0, e - 5));
      setShakingIdx([i1, i2]);
      setTimeout(() => setShakingIdx([]), 600);
      setTimeout(() => {
        setCards(prev => prev.map((c, i) => i === i1 || i === i2 ? { ...c, isFlipped: false } : c));
        setSelected([]);
        lockRef.current = false;
      }, 1000);
    }
  }, [phase, cards, selected, combo, timer, level]);

  const cfg = getLevelConfig(level);
  const totalPairs = cfg.pairs;
  const matchedPairs = cards.filter(c => c.isMatched && !c.isBomb).length / 2;
  const accuracy = attempts > 0 ? Math.round((matchedPairs / attempts) * 100) : 100;

  // Apply dark veil to unmatched, unflipped cards
  const displayCards = cards.map(c => ({
    ...c,
    isDark: cfg.dark && !c.isFlipped && !c.isMatched && darkVeil > 0,
  }));

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050214 0%, #0a0520 40%, #07031a 100%)' }}
    >
      {/* Animated bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.5), transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.5), transparent)', filter: 'blur(40px)' }} />
      </div>
      <FloatingParticles />

      {/* Screen shake */}
      <motion.div
        className="flex flex-col flex-1 relative z-10"
        animate={screenShake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* HUD */}
        <ClassicHUD
          level={level}
          score={score}
          aiScore={aiScore}
          combo={combo}
          timer={timer}
          maxTime={maxTime}
          energy={energy}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          onBack={onBackToLobby}
        />

        {/* Board */}
        <div className="flex-1 flex items-center justify-center p-4 relative">

          {/* Darkness veil for levels 11-15 */}
          {cfg.dark && darkVeil > 0 && (
            <div
              className="absolute inset-0 z-20 pointer-events-none rounded-2xl transition-all duration-1000"
              style={{ background: `rgba(2,0,10,${darkVeil / 100})` }}
            />
          )}

          <div
            className="grid gap-3 w-full max-w-xs"
            style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}
          >
            {displayCards.map((card, idx) => (
              <div
                key={card.id}
                ref={el => { cardRefs.current[idx] = el; }}
                style={{ aspectRatio: '3/4' }}
              >
                <ClassicCard
                  card={card}
                  index={idx}
                  onClick={() => handleCardClick(idx)}
                  isShaking={shakingIdx.includes(idx)}
                  isBouncing={bouncingIdx.includes(idx)}
                  isExploding={explodingIdx.includes(idx)}
                  gamePhase={phase}
                />
              </div>
            ))}
          </div>

          {/* Scanning overlay */}
          <AnimatePresence>
            {phase === 'scanning' && <ScanningOverlay onDone={handleScanDone} />}
          </AnimatePresence>
        </div>

        {/* Bottom dark gradient */}
        <div className="h-6 w-full"
          style={{ background: 'linear-gradient(0deg, rgba(5,2,20,0.8), transparent)' }} />
      </motion.div>

      {/* Effects */}
      <BombAlert active={bombAlert} />
      <ComboPopup combo={combo} active={comboActive} />
      <LevelUpBanner level={level} active={levelUpActive} />
      {explosion && (
        <ParticleExplosion
          key={explosion.id}
          x={explosion.x}
          y={explosion.y}
          color={explosion.color}
          active={true}
          onDone={() => setExplosion(null)}
        />
      )}

      {/* Results */}
      {phase === 'results' && (
        <ClassicResults
          level={level}
          score={score}
          aiScore={aiScore}
          accuracy={accuracy}
          maxCombo={maxCombo}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          timeLeft={timer}
          won={resultWon}
          onNextLevel={() => { setLevel(l => l + 1); setAttempts(0); }}
          onRetry={() => { setScore(0); setAiScore(0); setCombo(0); setMaxCombo(0); setAttempts(0); setEnergy(60); initLevel(level); }}
          onBackToLobby={onBackToLobby}
        />
      )}
    </div>
  );
}
