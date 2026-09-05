import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Users, Play, Copy, Check, Send, MessageCircle, Bot, Sparkles, Swords, Wifi, CheckCircle2, Circle } from 'lucide-react';
import type { Room, Player } from '../App';
import { soundSystem } from '../lib/soundSystem';
import socket from '../lib/socket';
import { generateMultiplayerCards } from '../lib/multiplayerCards';

interface ChatMessage {
  id: string;
  playerId: string;
  playerEmail: string;
  message: string;
  timestamp: number;
}

interface RoomWaitingProps {
  room: Room;
  currentUser: Player;
  onStartGame: (initialCards?: any[]) => void;
  onChangeTeam?: (teamId: number) => void;
  onBackToLobby: () => void;
}

export function RoomWaiting({ room, currentUser, onStartGame, onBackToLobby }: RoomWaitingProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [hasBotOpponent, setHasBotOpponent] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>(room?.players || []);
  const [isReady, setIsReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const localIpUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` : "http://localhost:5173";

  const getDisplayName = (p?: any, fallback = 'Jugador') => {
    if (!p) return fallback;
    if (p.name) return p.name;
    if (p.username) return p.username;
    if (typeof p.email === 'string') {
      return p.email.includes('@') ? p.email.split('@')[0] : p.email;
    }
    return fallback;
  };

  // Sincronización Socket.IO de la Sala
  useEffect(() => {
    if (!room?.id || !currentUser?.id) return;

    // Unirse a la sala vía Socket.IO
    socket.emit('room:join', {
      roomId: room.id,
      userId: currentUser.id,
      userName: currentUser.email || 'Jugador',
      userLevel: currentUser.level || 1,
    });

    const handlePlayerJoined = (payload: any) => {
      if (payload?.players) {
        setRoomPlayers(payload.players.map((p: any) => ({
          id: p.id,
          email: p.name || p.email || 'Jugador',
          level: p.level || 1,
          teamId: p.teamId || 1,
          isReady: p.isReady || false,
          role: 'player',
        })));
        soundSystem.playPowerUp();
      }
    };

    const handlePlayerLeft = (payload: any) => {
      if (payload?.players) {
        setRoomPlayers(payload.players.map((p: any) => ({
          id: p.id,
          email: p.name || p.email || 'Jugador',
          level: p.level || 1,
          teamId: p.teamId || 1,
          isReady: p.isReady || false,
          role: 'player',
        })));
        soundSystem.playBombExplode();
      }
    };

    const handlePlayerReady = (payload: any) => {
      if (payload?.players) {
        setRoomPlayers(payload.players.map((p: any) => ({
          id: p.id,
          email: p.name || p.email || 'Jugador',
          level: p.level || 1,
          teamId: p.teamId || 1,
          isReady: p.isReady || false,
          role: 'player',
        })));
      }
    };

    const handleChatMessage = (payload: any) => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          playerId: payload.userId,
          playerEmail: payload.userName || 'Jugador',
          message: payload.message,
          timestamp: payload.timestamp ? new Date(payload.timestamp).getTime() : Date.now(),
        }
      ]);
    };

    const handleGameStarted = (payload: any) => {
      soundSystem.playLevelUp();
      onStartGame(payload?.cards);
    };

    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('room:player-left', handlePlayerLeft);
    socket.on('room:player-ready', handlePlayerReady);
    socket.on('chat:message', handleChatMessage);
    socket.on('game:started', handleGameStarted);

    return () => {
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('room:player-left', handlePlayerLeft);
      socket.off('room:player-ready', handlePlayerReady);
      socket.off('chat:message', handleChatMessage);
      socket.off('game:started', handleGameStarted);
    };
  }, [room?.id, currentUser?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Jugadores en el Duelo 1 vs 1
  const safePlayers = roomPlayers.length > 0 ? roomPlayers : (room?.players || []);
  const isHost = !room?.creatorId || room.creatorId === currentUser.id || safePlayers[0]?.id === currentUser.id;
  const player1 = safePlayers[0] || currentUser || { id: 'p1', email: 'Jugador 1 👑', level: 1 };
  const player2 = safePlayers[1] || (hasBotOpponent ? { id: 'bot_1', email: 'NeuroBot AI 🤖', level: 5, isReady: true } : null);

  const isPlayer2Ready = player2 ? (Boolean((player2 as any).isReady) || hasBotOpponent || player2.id === currentUser.id && isReady) : false;
  const canStart = Boolean(player2);

  const toggleReady = () => {
    const nextState = !isReady;
    setIsReady(nextState);
    soundSystem.playCardFlip();
    socket.emit('room:ready', {
      roomId: room.id,
      userId: currentUser.id,
      isReady: nextState,
    });
  };

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const text = messageInput.trim();
    
    // Emitir mensaje por socket a toda la sala
    socket.emit('chat:message', {
      roomId: room.id,
      userId: currentUser.id,
      userName: currentUser.email?.split('@')[0] || 'Jugador',
      message: text,
    });

    setMessageInput('');
  };

  const handleStartGameClick = () => {
    if (!canStart) return;
    
    soundSystem.playLevelUp();
    const generatedCards = generateMultiplayerCards(room?.gameMode || 'triads', room?.cardCount || 12);

    // Emitir inicio por Socket.IO
    socket.emit('game:start', {
      roomId: room.id,
      cards: generatedCards,
      mode: room?.gameMode || 'triads',
    });

    onStartGame(generatedCards);
  };

  const modeLabel = room?.gameMode === 'triads' 
    ? '⚡ TRÍADAS DE RELACIÓN (3 CARTAS)' 
    : room?.gameMode === 'connections' 
    ? '🧠 PAREJAS DE RELACIÓN (2 CARTAS)' 
    : '🎮 MODO CLÁSICO (2 CARTAS)';

  return (
    <div 
      className="font-rajdhani min-h-screen text-white p-4 md:p-8 relative overflow-y-auto select-none"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => {
            socket.emit('room:leave', { roomId: room.id, userId: currentUser.id });
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl backdrop-blur-md border border-gray-700 transition font-bold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center justify-center gap-2">
            <Swords className="text-cyan-400 w-6 h-6" /> {room?.name || 'DUELO 1 VS 1'}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded-full text-xs font-black">
              {modeLabel}
            </span>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full text-xs font-black">
              📦 {room?.cardCount || 12} CARTAS
            </span>
          </div>
        </div>

        <div className="w-24 hidden sm:block" />
      </div>

      {/* Room Code & Wi-Fi Link Bar */}
      <div className="relative z-10 max-w-3xl mx-auto mb-8 p-4 bg-slate-900/80 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-left">
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-mono block">CÓDIGO DE SALA:</span>
            <span className="text-2xl font-mono font-black text-cyan-400 tracking-wider">{room?.code || room?.id || 'DUEL01'}</span>
          </div>
          <button
            onClick={copyRoomCode}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/15 cursor-pointer"
            title="Copiar código"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-left text-xs">
            <span className="text-gray-400 block font-mono">Enlace para tu amigo:</span>
            <strong className="text-white font-mono text-[11px] truncate max-w-[200px] block">{localIpUrl}</strong>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(localIpUrl);
              setCopiedWifi(true);
              setTimeout(() => setCopiedWifi(false), 2000);
            }}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-slate-950 font-black text-xs transition cursor-pointer"
          >
            {copiedWifi ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* 1 VS 1 ARENA DISPLAY */}
      <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-8">
        
        {/* Jugador 1 (Host / Creador) */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="md:col-span-2 p-6 bg-gradient-to-b from-cyan-950/80 to-slate-900/90 border-2 border-cyan-400/60 rounded-3xl text-center shadow-[0_0_30px_rgba(0,255,255,0.25)] flex flex-col items-center justify-between min-h-[220px]"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg">
              👑
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-cyan-400 text-slate-950 font-black text-[10px] rounded-full uppercase">
              Host
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-black text-white">{getDisplayName(player1, 'Tú')}</h3>
            <p className="text-xs text-cyan-300 font-mono">Nivel {player1?.level || 1} • {currentUser.id === player1.id ? '(Tú)' : 'Creador'}</p>
          </div>

          <div className="w-full mt-3 pt-2 border-t border-white/10 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LISTO PARA EL DUELO</span>
          </div>
        </motion.div>

        {/* VS CENTER BADGE */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-white flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.5)]">
            <span className="text-xl font-black text-white italic">VS</span>
          </div>
          <span className="text-[11px] font-mono text-gray-400 mt-2 uppercase tracking-widest">1 VS 1</span>
        </div>

        {/* Jugador 2 (Rival o Bot) */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`md:col-span-2 p-6 rounded-3xl text-center flex flex-col items-center justify-between min-h-[220px] transition-all ${
            player2
              ? 'bg-gradient-to-b from-purple-950/80 to-slate-900/90 border-2 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.25)]'
              : 'bg-slate-900/60 border-2 border-dashed border-white/20'
          }`}
        >
          {player2 ? (
            <>
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-lg">
                {hasBotOpponent ? '🤖' : '⚔️'}
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-black text-white">{getDisplayName(player2, 'Rival')}</h3>
                <p className="text-xs text-purple-300 font-mono">Nivel {player2?.level || 1} • {currentUser.id === player2.id ? '(Tú)' : 'Rival'}</p>
              </div>

              <div className="w-full mt-3 pt-2 border-t border-white/10 text-xs font-bold flex items-center justify-center gap-1.5">
                {isPlayer2Ready ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>¡RIVAL LISTO!</span>
                  </span>
                ) : (
                  <span className="text-yellow-400 flex items-center gap-1.5">
                    <Circle className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span>PREPARÁNDOSE...</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-4 space-y-3">
              <Users className="w-10 h-10 text-gray-500 animate-pulse" />
              <p className="text-xs text-gray-400">Esperando que tu amigo ingrese el código...</p>
              <button
                onClick={() => {
                  setHasBotOpponent(true);
                  soundSystem.playLevelUp();
                }}
                className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Jugar contra Bot IA</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* CHAT & ACTION BUTTONS */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-4">
        {/* Mini Chat en Tiempo Real */}
        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <MessageCircle className="w-4 h-4 text-cyan-400" /> CHAT EN VIVO DE SALA
          </div>
          <div className="h-24 overflow-y-auto space-y-1 text-xs pr-2">
            <p className="text-gray-400 italic">🎮 Sala 1 vs 1 lista. ¡Buena suerte a ambos duelistas!</p>
            {chatMessages.map(m => (
              <p key={m.id} className="text-white">
                <strong className={m.playerId === currentUser.id ? "text-cyan-300" : "text-purple-300"}>
                  {m.playerEmail}:
                </strong> {m.message}
              </p>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <input
              type="text"
              placeholder="Escribe un mensaje para tu amigo..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
            <button onClick={handleSendMessage} className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Botón de Listo para el Rival (no host) */}
        {!isHost && player2?.id === currentUser.id && (
          <button
            onClick={toggleReady}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
              isReady 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
            }`}
          >
            {isReady ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            <span>{isReady ? '¡ESTÁS LISTO! (Click para cancelar)' : 'MARCARME COMO LISTO'}</span>
          </button>
        )}

        {/* Start Game Action para el Host */}
        {isHost && (
          <button
            onClick={handleStartGameClick}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition ${
              canStart
                ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:scale-102 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{canStart ? '¡INICIAR DUELO 1 VS 1!' : 'ESPERANDO RIVAL PARA INICIAR...'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

