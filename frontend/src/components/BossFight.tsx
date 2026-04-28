import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Swords,
  Zap,
  Shield,
  Clock,
  Target,
} from "lucide-react";
import type { Universe } from '../../App';

interface BossFightProps {
  universe: Universe;
  onBossDefeated: () => void;
  onBackToMenu: () => void;
}

const bossConfig = {
  volcania: {
    name: "Ignis el Destructor",
    emoji: "🐉",
    gradient: "from-orange-600 via-red-600 to-amber-600",
    bgGradient: "from-orange-950 via-red-950 to-black",
    glowColor: "#ff4500",
    attacks: ["Llamarada", "Meteorito", "Erupción"],
    symbols: ["🔥", "⚡", "💥", "🌋"],
  },
  frostheim: {
    name: "Glacius el Eterno",
    emoji: "🧊",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    bgGradient: "from-cyan-950 via-blue-950 to-black",
    glowColor: "#00d4ff",
    attacks: ["Ventisca", "Lanza Helada", "Congelación"],
    symbols: ["❄️", "💎", "🌊", "🧊"],
  },
  neural: {
    name: "Synapse la Mente",
    emoji: "🤖",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-950 via-teal-950 to-black",
    glowColor: "#00ff88",
    attacks: ["Pulso Mental", "Sobrecarga", "Hackeo Neural"],
    symbols: ["⚡", "🔌", "💻", "🤖"],
  },
  verdalis: {
    name: "Gaia la Ancestral",
    emoji: "🌳",
    gradient: "from-lime-500 via-green-500 to-emerald-600",
    bgGradient: "from-lime-950 via-green-950 to-black",
    glowColor: "#7fff00",
    attacks: ["Enredadera", "Esporas Tóxicas", "Terremoto"],
    symbols: ["🌿", "🍃", "🌳", "🌺"],
  },
  lunaris: {
    name: "Noctis el Oscuro",
    emoji: "🌑",
    gradient: "from-purple-400 via-violet-500 to-purple-600",
    bgGradient: "from-purple-950 via-violet-950 to-black",
    glowColor: "#b19cd9",
    attacks: ["Eclipse", "Rayo Lunar", "Void"],
    symbols: ["🌙", "⭐", "💫", "🌑"],
  },
};

export function BossFight({ universe, onBossDefeated, onBackToMenu }: BossFightProps) {
  const boss = bossConfig[universe];
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [currentAttack, setCurrentAttack] = useState("");
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);

  const [gamePhase, setGamePhase] = useState<"idle" | "watching" | "playing" | "validating">("idle");
  const [bossSequence, setBossSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [sequenceTimer, setSequenceTimer] = useState(10);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [showingSymbolIndex, setShowingSymbolIndex] = useState(-1);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (gamePhase === "playing" && sequenceTimer > 0) {
      const timer = setInterval(() => {
        setSequenceTimer((prev) => {
          if (prev <= 0.1) {
            handleTimeOut();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gamePhase, sequenceTimer]);

  useEffect(() => {
    if (bossHealth <= 70 && bossHealth > 40) setSequenceLength(4);
    else if (bossHealth <= 40) setSequenceLength(5);
  }, [bossHealth]);

  const generateSequence = () => {
    const sequence: string[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomSymbol = boss.symbols[Math.floor(Math.random() * boss.symbols.length)];
      sequence.push(randomSymbol);
    }
    return sequence;
  };

  const handleStartSequence = () => {
    if (gamePhase !== "idle") return;
    const newSequence = generateSequence();
    setBossSequence(newSequence);
    setPlayerSequence([]);
    setGamePhase("watching");
    setShowingSymbolIndex(-1);
    newSequence.forEach((_, index) => setTimeout(() => setShowingSymbolIndex(index), index * 800));
    setTimeout(() => { setShowingSymbolIndex(-1); setGamePhase("playing"); setSequenceTimer(8 - sequenceLength * 0.3); }, newSequence.length * 800 + 500);
  };

  const handleSymbolClick = (symbol: string) => {
    if (gamePhase !== "playing") return;
    const newPlayerSequence = [...playerSequence, symbol];
    setPlayerSequence(newPlayerSequence);
    if (newPlayerSequence.length === bossSequence.length) validateSequence(newPlayerSequence);
  };

  const validateSequence = (playerSeq: string[]) => {
    setGamePhase("validating");
    const isCorrect = playerSeq.every((symbol, index) => symbol === bossSequence[index]);
    if (isCorrect) {
      setFeedback("correct");
      const criticalDamage = 25 + Math.floor(Math.random() * 10) + combo * 5;
      setCombo((prev) => prev + 1);
      setTimeout(() => attackBoss(criticalDamage), 1000);
    } else {
      setFeedback("incorrect");
      const weakDamage = 5 + Math.floor(Math.random() * 5);
      setCombo(0);
      setTimeout(() => attackBoss(weakDamage), 1000);
    }
  };

  const handleTimeOut = () => {
    if (gamePhase !== "playing") return;
    setGamePhase("validating");
    setFeedback("incorrect");
    setCombo(0);
    setTimeout(() => attackBoss(0), 1000);
  };

  const attackBoss = (damage: number) => {
    setIsAttacking(true);
    setFeedback(null);
    setTimeout(() => {
      setBossHealth(Math.max(0, bossHealth - damage));
      setIsAttacking(false);
      if (bossHealth - damage <= 0) { setShowDefeat(true); setTimeout(() => onBossDefeated(), 2000); }
      else setTimeout(() => bossCounterAttack(damage === 0 || damage < 10), 1000);
    }, 800);
  };

  const bossCounterAttack = (isAngry: boolean) => {
    setBossAttacking(true);
    setShakeScreen(true);
    const attack = boss.attacks[Math.floor(Math.random() * boss.attacks.length)];
    setCurrentAttack(attack);
    const baseDamage = 10 + Math.floor(Math.random() * 15);
    const damage = isAngry ? baseDamage * 1.5 : baseDamage;
    setTimeout(() => { setPlayerHealth(Math.max(0, playerHealth - damage)); setBossAttacking(false); setShakeScreen(false); setCurrentAttack(''); setGamePhase('idle'); }, 1500);
  };

  return (
    <motion.div className={`min-h-screen bg-gradient-to-br ${boss.bgGradient} relative overflow-hidden`} animate={shakeScreen ? { x: [-10,10,-10,10,0] } : {}} transition={{ duration: 0.5 }}>
      <div className="absolute inset-0">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${boss.gradient} opacity-20`} animate={{ scale: [1,1.5,1], rotate: [0,180,360] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
        {[...Array(20)].map((_, i) => (<motion.div key={i} className="absolute w-1 h-20" style={{ background: `linear-gradient(to bottom, ${boss.glowColor}, transparent)`, left: `${Math.random()*100}%`, top: -20 }} animate={{ y: [0, window.innerHeight + 20], opacity: [0,1,0] }} transition={{ duration: 1 + Math.random()*2, repeat: Infinity, delay: Math.random()*3 }} />))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBackToMenu} className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl backdrop-blur-sm border border-gray-700 transition-colors"><ArrowLeft className="w-5 h-5" /><span>Menú</span></button>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center"><h2 className="text-3xl text-red-500">¡JEFE FINAL!</h2></motion.div>
          <div className="w-32" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-start">
          <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }} className="text-center mb-6">
            <h3 className="text-2xl mb-2" style={{ textShadow: `0 0 20px ${boss.glowColor}` }}>{boss.name}</h3>
            <div className="w-96 h-8 bg-gray-800 rounded-full border-2 border-gray-700 overflow-hidden mb-4"><motion.div className={`h-full bg-gradient-to-r ${boss.gradient} relative`} initial={{ width: '100%' }} animate={{ width: `${bossHealth}%` }} transition={{ duration: 0.5 }}><motion.div className="absolute inset-0" animate={{ backgroundPosition: ['0% 0%','100% 100%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)', backgroundSize: '200% 200%' }} /></motion.div></div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400"><Heart className="w-4 h-4 text-red-500" /><span>{bossHealth} / 100</span></div>
          </motion.div>

          <motion.div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${boss.gradient} flex items-center justify-center mb-8`} animate={bossAttacking ? { scale: [1,1.2,1] } : isAttacking ? { scale: [1,0.9,1] } : {}} transition={{ boxShadow: { duration: 2, repeat: Infinity }, scale: { duration: 0.5 } }}>
            <motion.span className="text-9xl" animate={showDefeat ? { rotate: 180, scale: 0 } : { rotate: 0 }} transition={{ duration: 1 }}>{boss.emoji}</motion.span>
            <AnimatePresence>{bossAttacking && (<motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} exit={{ opacity: 0 }} className={`absolute inset-0 rounded-full border-4`} style={{ borderColor: boss.glowColor }} />)}</AnimatePresence>
            {showDefeat && (<motion.div initial={{ scale: 0 }} animate={{ scale: 4, opacity: 0 }} className="absolute inset-0">{[...Array(12)].map((_, i) => (<motion.div key={i} className="absolute w-4 h-4 rounded-full" style={{ backgroundColor: boss.glowColor, left: '50%', top: '50%' }} animate={{ x: Math.cos((i * Math.PI * 2) / 12) * 200, y: Math.sin((i * Math.PI * 2) / 12) * 200, opacity: 0 }} transition={{ duration: 1 }} />))}</motion.div>)}
          </motion.div>

          <AnimatePresence>{currentAttack && (<motion.div initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} className="px-6 py-3 bg-red-900/80 rounded-xl border-2 border-red-500 mb-8"><div className="flex items-center gap-2"><Swords className="w-5 h-5" /><span className="text-xl">{currentAttack}!</span></div></motion.div>)}</AnimatePresence>
        </div>

        <div className="flex flex-col items-center pb-8">
          <div className="w-96 h-6 bg-gray-800 rounded-full border-2 border-gray-700 overflow-hidden mb-6"><motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" animate={{ width: `${playerHealth}%` }} transition={{ duration: 0.5 }} /></div>
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400"><Shield className="w-4 h-4 text-green-500" /><span>Tu Salud: {playerHealth} / 100</span></div>

          <div className="flex gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartSequence} disabled={gamePhase !== 'idle' || bossAttacking || showDefeat} className={`px-8 py-4 rounded-xl text-xl flex items-center gap-3 ${gamePhase !== 'idle' || bossAttacking ? 'bg-gray-700 cursor-not-allowed' : `bg-gradient-to-r ${boss.gradient} hover:brightness-110`} disabled:opacity-50 border-2 border-white/20`}><Zap className="w-6 h-6" /><span>{gamePhase !== 'idle' ? 'En proceso...' : '¡Iniciar Ataque!'}</span></motion.button>
            {combo > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 rounded-xl border-2 border-yellow-500"><Target className="w-5 h-5 text-yellow-500" /><span className="text-yellow-500">Combo x{combo}</span></motion.div>)}
          </div>
        </div>
      </div>

      <AnimatePresence>{gamePhase === 'watching' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"><div className="text-center"><motion.h2 className="text-5xl mb-8" style={{ textShadow: `0 0 40px ${boss.glowColor}` }} animate={{ scale: [1,1.05,1] }} transition={{ duration: 1, repeat: Infinity }}>¡Memoriza la Secuencia!</motion.h2><div className="flex gap-4 mb-6 justify-center">{bossSequence.map((symbol, index) => (<motion.div key={index} initial={{ scale: 0, opacity: 0 }} animate={{ scale: showingSymbolIndex === index ? 1.3 : 1, opacity: showingSymbolIndex >= index ? 1 : 0.3 }} className={`w-24 h-24 rounded-xl flex items-center justify-center text-5xl ${showingSymbolIndex === index ? `bg-gradient-to-br ${boss.gradient} shadow-2xl` : 'bg-gray-800'} border-4 ${showingSymbolIndex === index ? 'border-white' : 'border-gray-700'}`} style={{ boxShadow: showingSymbolIndex === index ? `0 0 40px ${boss.glowColor}` : 'none' }}>{symbol}</motion.div>))}</div><p className="text-xl text-gray-400">Observa atentamente...</p></div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{gamePhase === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"><div className="text-center max-w-2xl"><motion.h2 className="text-5xl mb-4" style={{ textShadow: `0 0 40px ${boss.glowColor}` }}>¡Repite la Secuencia!</motion.h2><div className="w-full h-4 bg-gray-800 rounded-full mb-6 overflow-hidden border-2 border-gray-700"><motion.div className={`h-full bg-gradient-to-r ${boss.gradient}`} animate={{ width: `${(sequenceTimer / 8) * 100}%` }} transition={{ duration: 0.1 }} /></div><div className="flex items-center justify-center gap-2 mb-8"><Clock className="w-6 h-6 text-yellow-500" /><span className="text-2xl text-yellow-500">{sequenceTimer.toFixed(1)}s</span></div><div className="flex gap-3 mb-8 justify-center">{bossSequence.map((symbol, index) => (<div key={index} className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl ${playerSequence[index] ? playerSequence[index] === symbol ? 'bg-green-600' : 'bg-red-600' : 'bg-gray-800'} border-4 border-gray-700`}>{playerSequence[index] || '?'}</div>))}</div><div className="grid grid-cols-4 gap-4">{boss.symbols.map((symbol, index) => (<motion.button key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSymbolClick(symbol)} disabled={playerSequence.length >= bossSequence.length} className={`w-24 h-24 rounded-xl text-5xl bg-gradient-to-br ${boss.gradient} hover:brightness-110 disabled:opacity-50 border-4 border-white/20 transition-all`} style={{ boxShadow: `0 0 20px ${boss.glowColor}` }}>{symbol}</motion.button>))}</div></div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{gamePhase === 'validating' && feedback && (<motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"><motion.div animate={{ rotate: feedback === 'correct' ? [0,5,-5,0] : [0,-5,5,0] }} transition={{ duration: 0.5, repeat: 2 }} className="text-center"><motion.div className={`text-9xl mb-6`} animate={{ scale: [1,1.2,1] }} transition={{ duration: 0.5 }}>{feedback === 'correct' ? '✓' : '✗'}</motion.div><h2 className={`text-7xl mb-4 ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`} style={{ textShadow: `0 0 40px ${feedback === 'correct' ? '#00ff00' : '#ff0000'}` }}>{feedback === 'correct' ? '¡PERFECTO!' : '¡FALLASTE!'}</h2><p className="text-2xl text-gray-400">{feedback === 'correct' ? `¡Daño Crítico! ${combo > 1 ? `Combo x${combo}` : ''}` : 'El jefe contraatacará con furia...'}</p></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showDefeat && (<motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"><motion.div animate={{ rotate: [0,5,-5,0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-center"><h2 className="text-7xl mb-4" style={{ textShadow: `0 0 40px ${boss.glowColor}` }}>¡VICTORIA!</h2><p className="text-2xl text-gray-400">Has derrotado a {boss.name}</p></motion.div></motion.div>)}</AnimatePresence>
    </motion.div>
  );
}
