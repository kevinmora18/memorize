import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Zap, Star, Crown, Bot, Sparkles, Swords, RefreshCw, CheckCircle2, Smile, Flame } from 'lucide-react';
import { soundSystem } from '../lib/soundSystem';
import { loadPlayerStats, addXP, savePlayerStats } from '../lib/playerEvolution';
import { getEquippedSkinDetails, getEquippedFrameDetails } from '../lib/shopSystem';
import socket from '../lib/socket';
import { generateMultiplayerCards, type CardItem } from '../lib/multiplayerCards';
import type { Room, Player } from '../App';

interface MultiplayerGameProps {
  room: Room;
  currentUser: Player;
  initialCards?: CardItem[] | null;
  onGameEnd: () => void;
  onBackToLobby: () => void;
}

interface FloatingScore {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface FloatingEmote {
  id: number;
  userName: string;
  emote: string;
  isMe: boolean;
}

const AVAILABLE_EMOTES = ['😎', '🔥', '🤯', '👏', '👑', '💀'];

export function MultiplayerGame({ room, currentUser, initialCards, onBackToLobby }: MultiplayerGameProps) {
  const equippedSkin = getEquippedSkinDetails();
  const getDisplayName = (p?: any, fallback = 'Jugador') => {
    if (!p) return fallback;
    if (p.name) return p.name;
    if (p.username) return p.username;
    if (typeof p.email === 'string') {
      return p.email.includes('@') ? p.email.split('@')[0] : p.email;
    }
    return fallback;
  };

  const gameMode = room?.gameMode || 'triads';
  const targetCardCount = room?.cardCount || 12;

  const safePlayers = room?.players || [];
  const player1 = safePlayers[0] || currentUser || { id: 'p1', email: 'Jugador 1 👑', level: 1 };
  const player2 = safePlayers[1] || { id: 'bot_1', email: 'NeuroBot AI 🤖', level: 5 };
  const isPlayer2Bot = Boolean(player2?.email?.includes('🤖') || player2?.id?.startsWith('bot'));

  // Turn: ID del jugador activo
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string>(player1.id);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Streak, setP1Streak] = useState(0);
  const [p2Streak, setP2Streak] = useState(0);

  const [timeLeft, setTimeLeft] = useState(30);

  const [cards, setCards] = useState<CardItem[]>(() => {
    if (initialCards && initialCards.length > 0) return initialCards;
    return generateMultiplayerCards(gameMode, targetCardCount);
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [laserLines, setLaserLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{ winnerId: string | null; winnerName: string; isMe: boolean } | null>(null);

  // Game Juice & Emotes
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchStatusMessage, setRematchStatusMessage] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const isMyTurn = currentTurnPlayerId === currentUser.id;
  const activePlayerTurn: 1 | 2 = currentTurnPlayerId === player1.id ? 1 : 2;

  // Generar confeti al ganar
  const triggerConfetti = () => {
    const colors = ['#00ffff', '#ec4899', '#eab308', '#10b981', '#a855f7', '#3b82f6'];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 0.8,
    }));
    setConfettiPieces(pieces);
  };

  // Spawn de Floating Score Text
  const spawnFloatingScore = (cardIndex: number, text: string, color = '#00ffff') => {
    if (!gridRef.current) return;
    const cardEl = cardElementsRef.current[cardIndex];
    if (!cardEl) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    const x = cardRect.left + cardRect.width / 2 - gridRect.left;
    const y = cardRect.top + cardRect.height / 2 - gridRect.top;

    const newScore: FloatingScore = {
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
    };

    setFloatingScores(prev => [...prev, newScore]);

    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== newScore.id));
    }, 1200);
  };

  // Enviar Emote en Vivo
  const handleSendEmote = (emote: string) => {
    setShowEmotePicker(false);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) {}
    }

    const payload = {
      roomId: room.id,
      userId: currentUser.id,
      userName: getDisplayName(currentUser),
      emote,
    };

    socket.emit('game:emote', payload);

    // Render local inmediato
    const newEmote: FloatingEmote = {
      id: Date.now() + Math.random(),
      userName: 'Tú',
      emote,
      isMe: true,
    };
    setFloatingEmotes(prev => [...prev, newEmote]);

    setTimeout(() => {
      setFloatingEmotes(prev => prev.filter(e => e.id !== newEmote.id));
    }, 2500);
  };

  // Sincronización Socket.IO de la Partida
  useEffect(() => {
    if (!room?.id) return;

    const handleCardFlipped = (payload: { playerId: string; cardIndex: number; flippedCards: number[] }) => {
      const { cardIndex, flippedCards } = payload;
      setCards(prev => prev.map((c, idx) => idx === cardIndex ? { ...c, isFlipped: true } : c));
      setSelectedIds(flippedCards || [cardIndex]);
      soundSystem.playTriadStep((flippedCards?.length || 1));
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(12); } catch (e) {}
      }
    };

    const handleMatchFound = (payload: {
      playerId: string;
      cardIndexes: number[];
      matchedCards: number[];
      scores: Record<string, number>;
      players?: any[];
    }) => {
      const { playerId, cardIndexes, scores } = payload;
      setIsEvaluating(true);

      const isMe = playerId === currentUser.id;

      // Spawn floating score numbers
      if (cardIndexes.length > 0) {
        const firstIdx = cardIndexes[0];
        spawnFloatingScore(firstIdx, '+150 PTS ⚡', isMe ? '#00ffff' : '#c084fc');
      }

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([25, 45]); } catch (e) {}
      }

      setTimeout(() => {
        setCards(prev => prev.map((c, idx) => cardIndexes.includes(idx) ? { ...c, isMatched: true } : c));
        setSelectedIds([]);
        setLaserLines([]);
        setIsEvaluating(false);

        if (scores) {
          if (scores[player1.id] !== undefined) setP1Score(scores[player1.id]);
          if (scores[player2.id] !== undefined) setP2Score(scores[player2.id]);
        } else {
          if (playerId === player1.id) setP1Score(prev => prev + 150);
          else setP2Score(prev => prev + 150);
        }

        if (playerId === player1.id) {
          setP1Streak(prev => {
            soundSystem.playMatchSound(prev + 1);
            return prev + 1;
          });
        } else {
          setP2Streak(prev => {
            soundSystem.playMatchSound(prev + 1);
            return prev + 1;
          });
        }
      }, 600);
    };

    const handleNoMatch = (payload: { cardIndexes: number[] }) => {
      const { cardIndexes } = payload;
      setIsEvaluating(true);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(35); } catch (e) {}
      }

      setTimeout(() => {
        soundSystem.playComboBreak();
        setCards(prev => prev.map((c, idx) => cardIndexes.includes(idx) ? { ...c, isFlipped: false } : c));
        setSelectedIds([]);
        setLaserLines([]);
        setIsEvaluating(false);

        if (currentTurnPlayerId === player1.id) setP1Streak(0);
        else setP2Streak(0);
      }, 900);
    };

    const handleTurnChanged = (payload: { currentTurn: string; passedBy?: string }) => {
      setCurrentTurnPlayerId(payload.currentTurn);
      setTimeLeft(30);
      setSelectedIds([]);
      setLaserLines([]);
    };

    const handleGameFinished = (payload: { winnerId: string | null; scores?: Record<string, number> }) => {
      const winnerId = payload.winnerId;
      const isMe = winnerId === currentUser.id;
      const winnerName = winnerId === player1.id ? getDisplayName(player1) : getDisplayName(player2);

      setWinnerInfo({ winnerId, winnerName, isMe });

      const stats = loadPlayerStats();
      const earnedXP = isMe ? 350 : 100;
      const newStats = addXP(stats, earnedXP);
      savePlayerStats(newStats);

      soundSystem.playLevelUp();
      triggerConfetti();

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 80, 120]); } catch (e) {}
      }

      setShowVictoryModal(true);
    };

    const handleEmoteReceived = (payload: { userId: string; userName: string; emote: string }) => {
      if (payload.userId === currentUser.id) return;

      const newEmote: FloatingEmote = {
        id: Date.now() + Math.random(),
        userName: payload.userName,
        emote: payload.emote,
        isMe: false,
      };
      setFloatingEmotes(prev => [...prev, newEmote]);

      setTimeout(() => {
        setFloatingEmotes(prev => prev.filter(e => e.id !== newEmote.id));
      }, 2500);
    };

    const handleRematchRequested = (payload: { userId: string; userName: string }) => {
      if (payload.userId !== currentUser.id) {
        setRematchStatusMessage(`⚡ ¡${payload.userName} te pide la REVANCHA!`);
      }
    };

    const handlePlayerLeft = (payload: any) => {
      if (payload.playerId !== currentUser.id) {
        setWinnerInfo({
          winnerId: currentUser.id,
          winnerName: `${getDisplayName(currentUser)} (Victoria por Abandono)`,
          isMe: true,
        });
        const stats = loadPlayerStats();
        const newStats = addXP(stats, 300);
        savePlayerStats(newStats);
        triggerConfetti();
        setShowVictoryModal(true);
      }
    };

    socket.on('game:card-flipped', handleCardFlipped);
    socket.on('game:match-found', handleMatchFound);
    socket.on('game:no-match', handleNoMatch);
    socket.on('game:turn-changed', handleTurnChanged);
    socket.on('game:finished', handleGameFinished);
    socket.on('game:emote-received', handleEmoteReceived);
    socket.on('game:rematch-requested', handleRematchRequested);
    socket.on('room:player-left', handlePlayerLeft);

    return () => {
      socket.off('game:card-flipped', handleCardFlipped);
      socket.off('game:match-found', handleMatchFound);
      socket.off('game:no-match', handleNoMatch);
      socket.off('game:turn-changed', handleTurnChanged);
      socket.off('game:finished', handleGameFinished);
      socket.off('game:emote-received', handleEmoteReceived);
      socket.off('game:rematch-requested', handleRematchRequested);
      socket.off('room:player-left', handlePlayerLeft);
    };
  }, [room?.id, currentUser?.id, currentTurnPlayerId, player1.id, player2.id]);

  // Actualizar Rayos Láser SVG
  useEffect(() => {
    if (!gridRef.current || selectedIds.length < 2) {
      setLaserLines([]);
      return;
    }
    const gridRect = gridRef.current.getBoundingClientRect();
    const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let i = 0; i < selectedIds.length - 1; i++) {
      const idx1 = selectedIds[i];
      const idx2 = selectedIds[i + 1];
      const el1 = cardElementsRef.current[idx1];
      const el2 = cardElementsRef.current[idx2];
      if (el1 && el2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        newLines.push({
          x1: r1.left + r1.width / 2 - gridRect.left,
          y1: r1.top + r1.height / 2 - gridRect.top,
          x2: r2.left + r2.width / 2 - gridRect.left,
          y2: r2.top + r2.height / 2 - gridRect.top,
        });
      }
    }
    setLaserLines(newLines);
  }, [selectedIds]);

  // Temporizador de Turno
  useEffect(() => {
    if (showVictoryModal || isEvaluating) return;
    if (timeLeft <= 0) {
      if (isMyTurn) {
        socket.emit('game:pass-turn', { roomId: room.id, userId: currentUser.id });
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isMyTurn, showVictoryModal, isEvaluating, room?.id, currentUser?.id]);

  // Bot IA Simulado
  useEffect(() => {
    if (isPlayer2Bot && currentTurnPlayerId === player2.id && !isEvaluating && !showVictoryModal) {
      const timer = setTimeout(() => {
        const availableIndexes = cards
          .map((c, idx) => (!c.isMatched && !selectedIds.includes(idx) ? idx : -1))
          .filter(idx => idx !== -1);

        if (availableIndexes.length > 0) {
          const randomPickIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
          handleSelectCard(randomPickIndex, true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurnPlayerId, isPlayer2Bot, selectedIds, isEvaluating, showVictoryModal, cards]);

  // Función para voltear carta
  const handleSelectCard = (cardIndex: number, isBotAction = false) => {
    if (isEvaluating || showVictoryModal) return;
    if (!isMyTurn && !isBotAction) return;

    const card = cards[cardIndex];
    if (!card || card.isMatched || selectedIds.includes(cardIndex)) return;

    const activeUserId = isBotAction ? player2.id : currentUser.id;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) {}
    }

    socket.emit('game:flip-card', {
      roomId: room.id,
      userId: activeUserId,
      cardIndex,
    });

    setCards(prev => prev.map((c, idx) => idx === cardIndex ? { ...c, isFlipped: true } : c));
    const newSelected = [...selectedIds, cardIndex];
    setSelectedIds(newSelected);
    soundSystem.playTriadStep(newSelected.length);
  };

  // Solicitar Revancha Instantánea
  const handleRequestRematch = () => {
    setRematchRequested(true);
    socket.emit('game:rematch-request', {
      roomId: room.id,
      userId: currentUser.id,
      userName: getDisplayName(currentUser),
    });

    // Reiniciar tablero local
    const freshCards = generateMultiplayerCards(gameMode, targetCardCount);
    setCards(freshCards);
    setSelectedIds([]);
    setP1Score(0);
    setP2Score(0);
    setP1Streak(0);
    setP2Streak(0);
    setTimeLeft(30);
    setShowVictoryModal(false);
    setConfettiPieces([]);
    setRematchRequested(false);
    setRematchStatusMessage(null);
  };

  // Determinar columnas dinámicas para asegurar zero-scroll en móvil
  const getGridColsClass = () => {
    const total = cards.length;
    if (total <= 6) return 'grid-cols-3 sm:grid-cols-3 md:grid-cols-6';
    if (total <= 12) return 'grid-cols-4 sm:grid-cols-4 md:grid-cols-6';
    return 'grid-cols-4 sm:grid-cols-4 md:grid-cols-8';
  };

  return (
    <div 
      className="font-rajdhani h-[100dvh] max-h-[100dvh] text-white p-2 sm:p-4 relative flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-none" />

      {/* CONFETTI CELEBRATION OVERLAY */}
      {confettiPieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', opacity: [1, 1, 0], rotate: 360 * 3 }}
          transition={{ duration: 3.5, ease: 'easeOut', delay: p.delay }}
          className="absolute z-50 pointer-events-none rounded-sm"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* FLOATING EMOTES OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingEmotes.map((fe) => (
          <motion.div
            key={fe.id}
            initial={{ opacity: 0, y: 150, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -200, scale: [0.5, 1.4, 1.2, 0.8] }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className={`absolute bottom-20 ${fe.isMe ? 'right-6' : 'left-6'} flex flex-col items-center`}
          >
            <div className="text-5xl md:text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-bounce">
              {fe.emote}
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-cyan-300 font-mono shadow-md mt-1">
              {fe.userName}
            </span>
          </motion.div>
        ))}
      </div>

      {/* COMPACT TOP BAR */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between gap-2 py-1 px-1 flex-shrink-0">
        <button
          onClick={() => {
            socket.emit('room:leave', { roomId: room.id, userId: currentUser.id });
            onBackToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/90 hover:bg-gray-700/90 rounded-xl border border-gray-700 transition font-bold text-xs cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Salir</span>
        </button>

        {/* Modo & Reloj */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            {gameMode === 'triads' ? '⚡ TRÍADAS' : gameMode === 'connections' ? '🧠 CONEXIONES' : '🎮 CLÁSICO'}
          </span>
          <div className="flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/40 px-2.5 py-0.5 rounded-full">
            <Timer className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-mono font-black text-yellow-300">{timeLeft}s</span>
          </div>
        </div>

        {/* Emote Button & Progreso */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmotePicker(prev => !prev)}
            className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl text-cyan-300 transition cursor-pointer shadow-sm"
            title="Enviar Reacción"
          >
            <Smile className="w-4 h-4" />
          </button>

          <div className="px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] sm:text-xs font-mono font-bold border border-white/10">
            {cards.filter(c => c.isMatched).length} / {cards.length}
          </div>
        </div>
      </header>

      {/* FLOATING EMOTE PICKER POPUP */}
      <AnimatePresence>
        {showEmotePicker && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            className="absolute top-12 right-4 z-50 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl p-2 shadow-[0_0_30px_rgba(0,255,255,0.4)] backdrop-blur-xl flex gap-2"
          >
            {AVAILABLE_EMOTES.map((em) => (
              <button
                key={em}
                onClick={() => handleSendEmote(em)}
                className="text-2xl p-1.5 hover:scale-125 transition-transform hover:bg-white/10 rounded-xl cursor-pointer"
              >
                {em}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPACT INTEGRATED SCOREBOARD */}
      <section className="relative z-10 max-w-5xl w-full mx-auto my-1 flex-shrink-0">
        <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-center">
          
          {/* Jugador 1 (Izquierda) */}
          <div className={`col-span-5 p-2 rounded-2xl border transition-all flex items-center justify-between ${
            activePlayerTurn === 1
              ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
              : 'bg-slate-900/60 border-white/10 opacity-70'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                👑
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                  {getDisplayName(player1, 'P1')} {player1.id === currentUser.id ? '(Tú)' : ''}
                </h4>
                <p className="text-[9px] sm:text-xs text-cyan-300 font-mono">x{p1Streak}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 pl-1">
              <span className="text-sm sm:text-xl font-black text-cyan-400 font-mono leading-none block">{p1Score}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">PTS</span>
            </div>
          </div>

          {/* Turn Banner Central Mini */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider font-mono shadow-sm truncate max-w-full ${
              isMyTurn 
                ? 'bg-cyan-400 text-slate-950 animate-pulse'
                : 'bg-purple-600/80 text-white'
            }`}>
              {isMyTurn ? '👉 TU TURNO' : '⏳ RIVAL'}
            </span>
          </div>

          {/* Jugador 2 (Derecha) */}
          <div className={`col-span-5 p-2 rounded-2xl border transition-all flex items-center justify-between ${
            activePlayerTurn === 2
              ? 'bg-purple-950/90 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'bg-slate-900/60 border-white/10 opacity-70'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-purple-500/20 border border-purple-400 flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                {isPlayer2Bot ? '🤖' : '⚔️'}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                  {getDisplayName(player2, 'Rival')} {player2.id === currentUser.id ? '(Tú)' : ''}
                </h4>
                <p className="text-[9px] sm:text-xs text-purple-300 font-mono">x{p2Streak}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 pl-1">
              <span className="text-sm sm:text-xl font-black text-purple-400 font-mono leading-none block">{p2Score}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">PTS</span>
            </div>
          </div>

        </div>
      </section>

      {/* ZERO-SCROLL CARDS ARENA WITH FLOATING SCORES & LASERS */}
      <main className="relative z-10 max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center min-h-0 my-auto">
        <div ref={gridRef} className="relative w-full">
          {/* SVG Lasers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {laserLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#ec4899"
                  strokeWidth="6"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#00ffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </g>
            ))}
          </svg>

          {/* FLOATING COMBAT SCORES */}
          {floatingScores.map((fs) => (
            <motion.div
              key={fs.id}
              initial={{ opacity: 1, y: 0, scale: 0.7 }}
              animate={{ opacity: 0, y: -65, scale: 1.35 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute z-30 pointer-events-none font-black text-lg md:text-2xl font-mono tracking-wider"
              style={{
                left: `${fs.x}px`,
                top: `${fs.y}px`,
                transform: 'translate(-50%, -50%)',
                color: fs.color,
                textShadow: `0 0 15px ${fs.color}`,
              }}
            >
              {fs.text}
            </motion.div>
          ))}

          {/* Cards Grid Responsive Zero-Scroll */}
          <div className={`grid ${getGridColsClass()} gap-1.5 sm:gap-3 w-full items-center justify-center`}>
            {cards.map((card, idx) => {
              const isSelected = selectedIds.includes(idx);
              const selectionIndex = selectedIds.indexOf(idx) + 1;

              return (
                <div
                  key={`${card.id}_${idx}`}
                  ref={(el) => { cardElementsRef.current[idx] = el; }}
                  onClick={() => {
                    if (isMyTurn && !card.isMatched && !isSelected) {
                      handleSelectCard(idx);
                    }
                  }}
                  className={`relative aspect-[3/3.8] max-h-[22vh] sm:max-h-[26vh] rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 transform ${
                    card.isMatched
                      ? 'opacity-35 grayscale cursor-default scale-95'
                      : isSelected
                      ? 'scale-105 ring-2 sm:ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.6)] z-10'
                      : isMyTurn
                      ? 'hover:scale-102 hover:shadow-[0_0_12px_rgba(0,255,255,0.3)]'
                      : 'cursor-not-allowed opacity-90'
                  }`}
                >
                  <div 
                    className={`w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-between p-1.5 sm:p-2.5 border transition-all relative overflow-hidden`}
                    style={{
                      background: card.isFlipped || card.isMatched
                        ? 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 50%, rgba(15,23,42,0.95) 100%)'
                        : equippedSkin.bgGradient,
                      borderColor: card.isFlipped || card.isMatched ? '#22d3ee' : equippedSkin.borderColor,
                      boxShadow: card.isFlipped || card.isMatched 
                        ? '0 0 15px rgba(6,182,212,0.3)' 
                        : `0 0 12px ${equippedSkin.glowColor}`,
                    }}
                  >
                    {/* Holographic foil overlay on card back */}
                    {!card.isFlipped && !card.isMatched && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                        style={{ background: equippedSkin.foilOverlay }}
                      />
                    )}

                    {card.isFlipped || card.isMatched ? (
                      <>
                        <div className="w-full flex justify-between items-center text-[8px] sm:text-[10px] font-mono text-cyan-300 leading-none">
                          <span>#{card.groupId}</span>
                          {card.orderInTriad && <span className="text-pink-400 font-black">P{card.orderInTriad}</span>}
                        </div>

                        <div className="text-2xl sm:text-4xl md:text-5xl filter drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] my-auto transform transition-transform">
                          {card.symbol}
                        </div>

                        <div className="w-full text-center leading-tight">
                          <p className="text-[10px] sm:text-xs font-black text-white truncate">{card.name}</p>
                          <p className="text-[8px] sm:text-[9px] text-gray-400 truncate hidden xs:block">{card.lore}</p>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] sm:text-xs flex items-center justify-center shadow-lg animate-bounce">
                            #{selectionIndex}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-1 relative z-10">
                        <div 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-2xl shadow-md border border-white/20"
                          style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                        >
                          {equippedSkin.sigil}
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-mono text-white/90 uppercase tracking-widest font-black">
                          {equippedSkin.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* VICTORY / RESULTS MODAL WITH INSTANT REMATCH */}
      <AnimatePresence>
        {showVictoryModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 sm:p-8 bg-slate-900/95 border-2 border-cyan-400 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(0,255,255,0.5)] space-y-5"
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-300 border-2 border-white flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_30px_rgba(234,179,8,0.6)]">
                  🏆
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wider">
                  {p1Score > p2Score 
                    ? (currentUser.id === player1.id ? '¡VICTORIA ÉPICA!' : '¡DERROTA EN DUELO!')
                    : p1Score < p2Score
                    ? (currentUser.id === player2.id ? '¡VICTORIA ÉPICA!' : '¡DERROTA EN DUELO!')
                    : '¡EMPATE TÉCNICO!'}
                </h2>
                <p className="text-xs text-gray-300 mt-1">
                  {winnerInfo?.winnerName ? `Ganador del Duelo: ${winnerInfo.winnerName}` : 'Gran partida disputada.'}
                </p>
              </div>

              {rematchStatusMessage && (
                <div className="p-2.5 bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-xs font-bold text-yellow-300 animate-pulse">
                  {rematchStatusMessage}
                </div>
              )}

              {/* Comparativa de Puntos */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[11px] text-cyan-300 block font-bold truncate">{getDisplayName(player1)}</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">{p1Score} PTS</span>
                </div>
                <div>
                  <span className="text-[11px] text-purple-300 block font-bold truncate">{getDisplayName(player2)}</span>
                  <span className="text-xl font-black text-purple-400 font-mono">{p2Score} PTS</span>
                </div>
              </div>

              {/* Recompensas */}
              <div className="flex justify-around items-center p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold">
                <span className="text-cyan-300">+350 XP 🧠</span>
                <span className="text-yellow-400">+250 MONEDAS 🪙</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleRequestRematch}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>JUGAR REVANCHA INMEDIATA</span>
                </button>

                <button
                  onClick={() => {
                    socket.emit('room:leave', { roomId: room.id, userId: currentUser.id });
                    onBackToLobby();
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
                >
                  Volver al Lobby
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
