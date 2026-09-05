import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Zap, Trophy, InfinityIcon, RefreshCw } from 'lucide-react';
import { MemoryCard } from './MemoryCard';
import { getEquippedPackCards } from '../lib/shopSystem';
import { soundSystem } from '../lib/soundSystem';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface InfiniteModeProps {
  onBackToLobby: () => void;
}

export function InfiniteMode({ onBackToLobby }: InfiniteModeProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timePerRound, setTimePerRound] = useState(1000);
  const [showPreview, setShowPreview] = useState(true);

  const initializeGame = useCallback(() => {
    const pairCount = Math.min(4 + (level - 1), 8);
    const equipped = getEquippedPackCards();
    const sourceEmojis = equipped && equipped.length >= pairCount ? equipped : ['🌟', '🎮', '🚀', '💎', '🔥', '⚡', '🌈', '🎯', '🎪', '🎨', '🎭', '🎬'];
    const selectedEmojis = sourceEmojis.slice(0, pairCount);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffled = gameEmojis
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: true,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setShowPreview(true);
    soundSystem.playLevelUp();
    
    // Ocultar cartas después de 2.5 segundos
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setShowPreview(false);
    }, 2500);
  }, [level]);

  useEffect(() => {
    initializeGame();
  }, [level, initializeGame]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !showPreview) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), timePerRound);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      if (score > bestScore) {
        setBestScore(score);
      }
    }
  }, [timeLeft, gameOver, showPreview, timePerRound, score, bestScore]);

  const handleCardClick = (index: number) => {
    if (
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      gameOver ||
      showPreview
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
        // Match encontrado
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isMatched = true;
          updatedCards[secondIndex].isMatched = true;
          setCards(updatedCards);
          setFlippedCards([]);

          const newCombo = combo + 1;
          setCombo(newCombo);
          soundSystem.playMatchSound(newCombo);
          
          const points = 10 * newCombo;
          setScore(score + points);
          setTimeLeft(prev => prev + 4);

          // Si completó la ronda
          if (updatedCards.every(card => card.isMatched)) {
            soundSystem.playVictoryFanfare();
            setLevel(prev => prev + 1);
            setTimeLeft(prev => prev + 10);
          }
        }, 400);
      } else {
        // Error
        const newErrors = errors + 1;
        setErrors(newErrors);
        soundSystem.playComboBreak();

        
        const newTimePerRound = Math.max(400, 1000 - (newErrors * 50));
        setTimePerRound(newTimePerRound);
        
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isFlipped = false;
          updatedCards[secondIndex].isFlipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
          setCombo(0);
        }, 800);
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setLevel(1);
    setCombo(0);
    setErrors(0);
    setTimePerRound(1000);
    initializeGame();
  };

  return (
    <div 
      className="min-h-screen text-white p-4 md:p-8 relative overflow-y-auto"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10 max-w-5xl mx-auto">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl backdrop-blur-md border border-gray-700 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <InfinityIcon className="w-7 h-7 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider">
            MODO INFINITO
          </h1>
        </div>

        <div className="w-20" />
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6 max-w-4xl mx-auto relative z-10">
        <motion.div
          className="p-3 bg-slate-900/80 border border-cyan-400/50 rounded-2xl shadow-lg flex flex-col items-center"
          animate={{ scale: timeLeft < 10 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5, repeat: timeLeft < 10 ? Infinity : 0 }}
        >
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Tiempo</span>
          <p className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>{timeLeft}s</p>
        </motion.div>

        <div className="p-3 bg-slate-900/80 border border-purple-400/50 rounded-2xl shadow-lg flex flex-col items-center">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-purple-400" /> Puntos</span>
          <p className="text-2xl font-black text-purple-300">{score}</p>
        </div>

        <div className="p-3 bg-slate-900/80 border border-orange-400/50 rounded-2xl shadow-lg flex flex-col items-center">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-orange-400" /> Racha Combo</span>
          <p className="text-2xl font-black text-orange-300">x{combo}</p>
        </div>

        <div className="p-3 bg-slate-900/80 border border-green-400/50 rounded-2xl shadow-lg flex flex-col items-center">
          <span className="text-xs text-gray-400">Nivel Actual</span>
          <p className="text-2xl font-black text-green-400">Nivel {level}</p>
        </div>

        <div className="p-3 bg-slate-900/80 border border-yellow-400/50 rounded-2xl shadow-lg flex flex-col items-center col-span-2 sm:col-span-1">
          <span className="text-xs text-gray-400">Récord</span>
          <p className="text-2xl font-black text-yellow-300">{bestScore}</p>
        </div>
      </div>

      {/* 3D Holographic Game Board */}
      <div className="max-w-2xl mx-auto mb-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              card={card}
              index={index}
              glowColor="#00ffff"
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-slate-900/95 p-6 sm:p-8 rounded-3xl border border-cyan-400 max-w-md w-full text-center shadow-2xl"
            >
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-2" />
              <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase">
                ¡Tiempo Agotado!
              </h2>
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-purple-950/60 rounded-2xl border border-purple-500/30">
                  <p className="text-xs text-gray-400">Puntuación Final</p>
                  <p className="text-4xl font-black text-purple-300">{score}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <p className="text-gray-400">Nivel</p>
                    <p className="text-lg font-bold text-green-400">{level}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <p className="text-gray-400">Errores</p>
                    <p className="text-lg font-bold text-red-400">{errors}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5">
                    <p className="text-gray-400">Récord</p>
                    <p className="text-lg font-bold text-yellow-400">{bestScore}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black uppercase text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Jugar de Nuevo
                </button>
                <button
                  onClick={onBackToLobby}
                  className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase text-sm rounded-xl transition-all border border-white/10"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
