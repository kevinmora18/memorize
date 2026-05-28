import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Bot, Trophy, Zap, Brain } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Player {
  id: number;
  name: string;
  isAI: boolean;
  score: number;
  avatar: string;
  color: string;
}

interface AIFriendsGameProps {
  onBackToLobby: () => void;
}

const emojis = ['🌟', '🎮', '🚀', '💎', '🔥', '⚡', '🌈', '🎯'];

export function AIFriendsGame({ onBackToLobby }: AIFriendsGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const [players] = useState<Player[]>([
    { id: 1, name: 'Tú', isAI: false, score: 0, avatar: '👤', color: 'cyan' },
    { id: 2, name: 'NeuroBot Alpha', isAI: true, score: 0, avatar: '🤖', color: 'purple' },
    { id: 3, name: 'SynapticAI', isAI: true, score: 0, avatar: '🧠', color: 'green' },
    { id: 4, name: 'MemoryCore', isAI: true, score: 0, avatar: '⚡', color: 'orange' },
  ]);

  const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (currentPlayerIndex > 0 && !gameOver) {
      // Es turno de la IA
      setIsAIThinking(true);
      setTimeout(() => {
        makeAIMove();
      }, 1500);
    }
  }, [currentPlayerIndex]);

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setPlayerScores([0, 0, 0, 0]);
    setCurrentPlayerIndex(0);
    setGameOver(false);
  };

  const makeAIMove = () => {
    const availableCards = cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !card.isMatched && !card.isFlipped);

    if (availableCards.length < 2) {
      setIsAIThinking(false);
      return;
    }

    // Seleccionar dos cartas aleatorias
    const firstCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    const remainingCards = availableCards.filter(c => c.index !== firstCard.index);
    const secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];

    // Voltear primera carta
    setTimeout(() => {
      handleCardClick(firstCard.index);
    }, 500);

    // Voltear segunda carta
    setTimeout(() => {
      handleCardClick(secondCard.index);
      setIsAIThinking(false);
    }, 1500);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      isAIThinking
    ) {
      return;
    }

    // Sonido al voltear carta
    const flipSound = new Audio('https://actions.google.com/sounds/v1/foley/swoosh.ogg');
    flipSound.volume = 0.3;
    flipSound.play().catch(() => {});

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match encontrado
        // Sonido de match exitoso
        const matchSound = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
        matchSound.volume = 0.5;
        matchSound.play().catch(() => {});
        
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isMatched = true;
          updatedCards[secondIndex].isMatched = true;
          setCards(updatedCards);
          setFlippedCards([]);

          // Incrementar puntuación del jugador actual
          const newScores = [...playerScores];
          newScores[currentPlayerIndex]++;
          setPlayerScores(newScores);

          // Verificar si el juego terminó
          if (updatedCards.every(card => card.isMatched)) {
            setGameOver(true);
          }
        }, 500);
      } else {
        // No hay match, cambiar turno
        // Sonido de error
        const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/slide_whistle_down.ogg');
        errorSound.volume = 0.3;
        errorSound.play().catch(() => {});
        
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isFlipped = false;
          updatedCards[secondIndex].isFlipped = false;
          setCards(updatedCards);
          setFlippedCards([]);

          // Cambiar al siguiente jugador
          setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        }, 1000);
      }
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
      purple: 'border-purple-400 bg-purple-500/20 text-purple-300',
      green: 'border-green-400 bg-green-500/20 text-green-300',
      orange: 'border-orange-400 bg-orange-500/20 text-orange-300',
    };
    return colors[color] || colors.cyan;
  };

  const winner = gameOver
    ? players[playerScores.indexOf(Math.max(...playerScores))]
    : null;

  return (
    <div 
      className="min-h-screen text-white p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050214 0%, #0a0520 40%, #07031a 100%)' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.5), transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.5), transparent)', filter: 'blur(40px)' }} />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1 + Math.random() * 3,
              height: 1 + Math.random() * 3,
              background: ['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)],
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 10,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl backdrop-blur-sm border border-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Lobby</span>
        </button>

        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-cyan-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AMIGOS IA - MODO TURNOS
          </h1>
        </div>

        <div className="w-32"></div>
      </div>

      {/* Players Panel */}
      <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentPlayerIndex === index && !gameOver
                ? `${getColorClass(player.color)} scale-105 shadow-lg`
                : 'border-gray-700 bg-gray-800/30'
            }`}
            animate={
              currentPlayerIndex === index && !gameOver
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{player.avatar}</div>
              <div className="flex-grow">
                <h3 className="font-bold text-sm">{player.name}</h3>
                {player.isAI && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Bot className="w-3 h-3" /> IA
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Puntos:</span>
              <span className="text-2xl font-bold">{playerScores[index]}</span>
            </div>
            {currentPlayerIndex === index && !gameOver && (
              <motion.div
                className="mt-2 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Thinking Indicator */}
      <AnimatePresence>
        {isAIThinking && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center gap-3"
          >
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-semibold">
              {players[currentPlayerIndex].name} está pensando...
            </span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-5 h-5 text-purple-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 relative z-10">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`aspect-square rounded-xl cursor-pointer ${
              card.isMatched
                ? 'bg-green-500/20 border-2 border-green-400'
                : card.isFlipped
                ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400'
                : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
            } flex items-center justify-center text-5xl transition-all`}
            onClick={() => !players[currentPlayerIndex].isAI && handleCardClick(index)}
            whileHover={
              !card.isFlipped && !card.isMatched && !players[currentPlayerIndex].isAI
                ? { scale: 1.05 }
                : {}
            }
            whileTap={
              !card.isFlipped && !card.isMatched && !players[currentPlayerIndex].isAI
                ? { scale: 0.95 }
                : {}
            }
            animate={
              card.isFlipped || card.isMatched
                ? { rotateY: 180 }
                : { rotateY: 0 }
            }
            transition={{ duration: 0.3 }}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </motion.div>
        ))}
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-cyan-400 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-6xl mb-4"
                >
                  <Trophy className="w-20 h-20 mx-auto text-yellow-400" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ¡Juego Terminado!
                </h2>
                <div className="mb-6">
                  <p className="text-xl mb-2">Ganador:</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl">{winner.avatar}</span>
                    <span className="text-2xl font-bold">{winner.name}</span>
                  </div>
                  <p className="text-lg text-cyan-400">
                    Puntuación: {playerScores[players.indexOf(winner)]} pares
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="text-sm text-gray-400 mb-2">Tabla de Posiciones:</h3>
                  {players
                    .map((player, index) => ({ player, score: playerScores[index] }))
                    .sort((a, b) => b.score - a.score)
                    .map((item, position) => (
                      <div
                        key={item.player.id}
                        className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{position + 1}.</span>
                          <span className="text-xl">{item.player.avatar}</span>
                          <span>{item.player.name}</span>
                        </div>
                        <span className="font-bold">{item.score}</span>
                      </div>
                    ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={initializeGame}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl font-bold transition-all"
                  >
                    Jugar de Nuevo
                  </button>
                  <button
                    onClick={onBackToLobby}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
