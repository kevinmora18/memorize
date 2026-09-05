import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Plus, Play, Crown, Bot, Copy, Check, Send, MessageCircle, Wifi, Globe, Sparkles, X, Shield
} from 'lucide-react';
import { soundSystem } from '../lib/soundSystem';
import type { Room as BackendRoom } from '../App';

interface SimulatedRoom {
  id: string;
  name: string;
  code: string;
  host: string;
  players: string[];
  maxPlayers: number;
  gameMode: 'classic' | 'connections' | 'triads';
  cardCount: number;
}

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface AIRoomLobbyProps {
  onBackToLobby: () => void;
  onStartGame: () => void;
  onCreateRealRoom?: (name?: string, gameMode?: 'classic' | 'connections' | 'triads', cardCount?: number) => void;
  onJoinRealRoom?: (roomIdOrCode: string) => void;
  realRooms?: BackendRoom[];
}

export function AIRoomLobby({
  onBackToLobby,
  onStartGame,
  onCreateRealRoom,
  onJoinRealRoom,
  realRooms = [],
}: AIRoomLobbyProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'ai'>('friends');
  const [view, setView] = useState<'list' | 'create' | 'room'>('list');
  const [simulatedRooms, setSimulatedRooms] = useState<SimulatedRoom[]>([]);
  const [currentSimRoom, setCurrentSimRoom] = useState<SimulatedRoom | null>(null);
  const [roomName, setRoomName] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState<'classic' | 'connections' | 'triads'>('triads');
  const [selectedCardCount, setSelectedCardCount] = useState(6);
  const [selectedRealMode, setSelectedRealMode] = useState<'classic' | 'connections' | 'triads'>('triads');
  const [selectedRealCardCount, setSelectedRealCardCount] = useState(12);
  const [playerName, setPlayerName] = useState('Jugador');
  const [copiedCode, setCopiedCode] = useState(false);

  const [copiedWifiLink, setCopiedWifiLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateRealModal, setShowCreateRealModal] = useState(false);
  const [newRealRoomName, setNewRealRoomName] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const localIpUrl = "http://192.168.1.151:5173";

  const gameModes = [
    { id: 'classic' as const, name: 'Clásico', desc: 'Encuentra pares iguales', icon: '🎮', color: 'from-purple-500 to-pink-500' },
    { id: 'connections' as const, name: 'Conexiones', desc: 'Parejas relacionadas', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
    { id: 'triads' as const, name: 'Tríadas', desc: 'Tríos conectados', icon: '⚡', color: 'from-orange-500 to-red-500' },
  ];

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateSimulatedRoom = () => {
    if (!roomName.trim()) return;

    const botNames = ['NeuroBot Alpha', 'SynapticAI', 'MemoryCore'];
    const newRoom: SimulatedRoom = {
      id: Date.now().toString(),
      name: roomName,
      code: generateRoomCode(),
      host: playerName,
      players: [playerName, ...botNames],
      maxPlayers: 4,
      gameMode: selectedGameMode,
      cardCount: selectedCardCount,
    };

    setSimulatedRooms([...simulatedRooms, newRoom]);
    setCurrentSimRoom(newRoom);
    setView('room');
    
    localStorage.setItem('aiFriendsMode', selectedGameMode);
    localStorage.setItem('aiFriendsRoomName', roomName);
    localStorage.setItem('aiFriendsCardCount', selectedCardCount.toString());
    setRoomName('');
    soundSystem.playLevelUp();
  };

  const handleJoinSimulatedRoom = (room: SimulatedRoom) => {
    if (room.players.length >= room.maxPlayers) return;
    const updatedRoom = {
      ...room,
      players: [...room.players, playerName],
    };
    setSimulatedRooms(simulatedRooms.map(r => r.id === room.id ? updatedRoom : r));
    setCurrentSimRoom(updatedRoom);
    setView('room');
    soundSystem.playCardFlip();
  };

  const handleLeaveSimRoom = () => {
    if (!currentSimRoom) return;
    const updatedRoom = {
      ...currentSimRoom,
      players: currentSimRoom.players.filter(p => p !== playerName),
    };
    if (updatedRoom.players.length === 0) {
      setSimulatedRooms(simulatedRooms.filter(r => r.id !== currentSimRoom.id));
    } else {
      setSimulatedRooms(simulatedRooms.map(r => r.id === currentSimRoom.id ? updatedRoom : r));
    }
    setCurrentSimRoom(null);
    setView('list');
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentSimRoom) return;
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      playerName,
      message: messageInput.trim(),
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  };

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

      {/* ===================== HEADER ===================== */}
      <div className="relative z-10 flex items-center justify-between max-w-6xl mx-auto mb-6">
        <button
          onClick={view === 'room' ? handleLeaveSimRoom : onBackToLobby}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-xl backdrop-blur-md border border-gray-700 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{view === 'room' ? 'Salir de la Sala' : 'Volver al Lobby'}</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400">
            SALA MULTIJUGADOR
          </h1>
          <p className="text-xs text-gray-300">Elige jugar en vivo con amigos reales o practica con bots IA</p>
        </div>

        <div className="w-28 hidden sm:block" />
      </div>

      {/* ===================== TABS SELECTOR ===================== */}
      {view !== 'room' && (
        <div className="max-w-md mx-auto mb-8 bg-slate-900/80 p-1.5 rounded-2xl border border-white/15 flex gap-2 relative z-10">
          <button
            onClick={() => {
              setActiveTab('friends');
              setView('list');
              soundSystem.playCardFlip();
            }}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>AMIGOS REALES (ONLINE)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai');
              setView('list');
              soundSystem.playCardFlip();
            }}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>BOTS IA (SIMULADO)</span>
          </button>
        </div>
      )}

      {/* ===================== CONTENIDO SEGÚN TAB ===================== */}
      <div className="max-w-5xl mx-auto relative z-10">

        {/* ---------------- PESTAÑA 1: AMIGOS REALES ---------------- */}
        {activeTab === 'friends' && view === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Action Bar: Create + Join */}
            <div className="p-6 bg-slate-900/80 border border-cyan-500/30 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="text-cyan-400 w-6 h-6" /> CREAR O UNIRSE A UNA SALA EN VIVO
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Juega en tiempo real con amigos en tu misma red Wi-Fi o mediante código único de 6 dígitos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowCreateRealModal(true)}
                  className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center justify-center gap-2 transition hover:scale-105"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>CREAR SALA</span>
                </button>

                <div className="flex items-center gap-2 flex-1 md:flex-initial bg-slate-950 border border-white/20 p-1 rounded-xl">
                  <input
                    type="text"
                    placeholder="CÓDIGO (EJ: 8X2A)"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && joinCodeInput.trim() && onJoinRealRoom) {
                        onJoinRealRoom(joinCodeInput.trim());
                      }
                    }}
                    className="bg-transparent px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-white placeholder-gray-500 outline-none w-36"
                    maxLength={6}
                  />
                  <button
                    onClick={() => {
                      if (joinCodeInput.trim() && onJoinRealRoom) {
                        onJoinRealRoom(joinCodeInput.trim());
                      }
                    }}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-lg transition"
                  >
                    UNIRSE
                  </button>
                </div>
              </div>
            </div>

            {/* Wi-Fi Invitation Banner */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-cyan-300 block">Jugar desde celulares u otros PCs en tu Wi-Fi:</span>
                  <span className="text-[11px] font-mono text-gray-300">
                    Abre en el navegador del teléfono: <strong className="text-cyan-400 font-black">{localIpUrl}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(localIpUrl);
                  setCopiedWifiLink(true);
                  setTimeout(() => setCopiedWifiLink(false), 2500);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/15 whitespace-nowrap"
              >
                {copiedWifiLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
                <span>{copiedWifiLink ? '¡Link Copiado!' : 'Copiar Link Wi-Fi'}</span>
              </button>
            </div>

            {/* Live Real Rooms Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Salas Activas en Vivo ({realRooms.length})</span>
                <span className="text-cyan-400 font-mono">Actualización en tiempo real</span>
              </div>

              {realRooms.length === 0 ? (
                <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center justify-center gap-3">
                  <Users className="w-12 h-12 text-gray-500 animate-pulse" />
                  <p className="text-base font-bold text-gray-200">No hay salas abiertas en este momento.</p>
                  <p className="text-xs text-gray-400 max-w-sm">
                    ¡Crea una sala y comparte el código de 6 dígitos con tus amigos para jugar inmediatamente!
                  </p>
                  <button
                    onClick={() => setShowCreateRealModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg mt-2 hover:scale-105 transition"
                  >
                    + CREAR MI SALA AHORA
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realRooms.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-white/15 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-4 shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-black text-white truncate max-w-[170px]">{r.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-purple-500/20 text-purple-300 border border-purple-400/40">
                            {r.code}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {r.players?.length || 0} Jugador(es) • {r.isStarted ? '🎮 En Juego' : '🟢 En Espera'}
                        </p>
                      </div>

                      <button
                        onClick={() => onJoinRealRoom && onJoinRealRoom(r.id)}
                        disabled={r.isStarted}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                          r.isStarted
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md hover:scale-102'
                        }`}
                      >
                        {r.isStarted ? 'SALA EN PARTIDA' : 'UNIRSE A LA SALA'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------------- PESTAÑA 2: BOTS IA ---------------- */}
        {activeTab === 'ai' && view === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-slate-900/80 border border-emerald-500/30 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Bot className="text-emerald-400 w-6 h-6" /> SALAS SIMULADAS CON BOTS INTELIGENTES
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Juega partidas por turnos contra AlexBot, LunaIA y Cipher en cualquier modo.
                </p>
              </div>

              <button
                onClick={() => setView('create')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition hover:scale-105"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>NUEVA SALA CON BOTS</span>
              </button>
            </div>

            {/* Simulated Rooms List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Salas con IA Disponibles ({simulatedRooms.length})</span>
              </div>

              {simulatedRooms.length === 0 ? (
                <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center justify-center gap-3">
                  <Bot className="w-12 h-12 text-emerald-400/60 animate-bounce" />
                  <p className="text-base font-bold text-gray-200">No hay salas simuladas creadas.</p>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Crea una sala personalizada y compite contra 3 inteligencias artificiales con diferentes niveles de memoria.
                  </p>
                  <button
                    onClick={() => setView('create')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg mt-2 hover:scale-105 transition"
                  >
                    + CREAR SALA CON BOTS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulatedRooms.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between gap-4 shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-black text-white">{r.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            {r.gameMode.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {r.players.length} Jugadores (Tú + Bots)
                        </p>
                      </div>

                      <button
                        onClick={() => handleJoinSimulatedRoom(r)}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition"
                      >
                        ENTRAR A LA SALA
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------------- CREAR SALA SIMULADA (VIEW === 'CREATE') ---------------- */}
        {view === 'create' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto p-6 md:p-8 bg-slate-900/90 border border-emerald-500/40 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="text-emerald-400 w-6 h-6" /> CREAR SALA CON AMIGOS IA
              </h3>
              <button onClick={() => setView('list')} className="p-1 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Nombre de la Sala:</label>
                <input
                  type="text"
                  placeholder="Ej: Desafío Neural con Bots"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Modo de Juego:</label>
                <div className="grid grid-cols-3 gap-3">
                  {gameModes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedGameMode(m.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        selectedGameMode === m.id
                          ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <span className="text-xl block mb-1">{m.icon}</span>
                      <span className="text-xs font-bold block text-white">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Cantidad de Cartas:</label>
                <div className="flex gap-3">
                  {[4, 6, 8].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedCardCount(cnt)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase transition ${
                        selectedCardCount === cnt
                          ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      {cnt * 2} Cartas ({cnt} pares)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setView('list')}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSimulatedRoom}
                  disabled={!roomName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
                >
                  Crear Sala y Jugar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------- SALA DE ESPERA SIMULADA (VIEW === 'ROOM') ---------------- */}
        {view === 'room' && currentSimRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto p-6 md:p-8 bg-slate-900/90 border border-emerald-500/40 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">{currentSimRoom.name}</h2>
                <span className="text-xs text-gray-400">Modo: {currentSimRoom.gameMode.toUpperCase()} • {currentSimRoom.cardCount * 2} Cartas</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                <span className="text-xs font-mono font-black text-emerald-400">CÓDIGO: {currentSimRoom.code}</span>
              </div>
            </div>

            {/* Lista de Jugadores (Tú + Bots) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentSimRoom.players.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl mb-2">
                    {idx === 0 ? '👑' : '🤖'}
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-full">{p}</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5">{idx === 0 ? 'Host (Tú)' : 'Bot IA'}</span>
                </div>
              ))}
            </div>

            {/* Chat Simulado */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" /> CHAT DE SALA
              </div>
              <div className="h-28 overflow-y-auto space-y-2 text-xs pr-2">
                <p className="text-gray-400 italic">🤖 NeuroBot Alpha: ¡Listo para la partida neural!</p>
                <p className="text-gray-400 italic">🤖 SynapticAI: Calibrando matriz de memoria...</p>
                {chatMessages.map(msg => (
                  <p key={msg.id} className="text-white"><strong className="text-cyan-300">{msg.playerName}:</strong> {msg.message}</p>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Escribe un mensaje en la sala..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-slate-950"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Iniciar Partida */}
            <button
              onClick={onStartGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 hover:scale-102 transition"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>INICIAR PARTIDA MULTIJUGADOR</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* ===================== MODAL CREAR SALA REAL ===================== */}
      <AnimatePresence>
        {showCreateRealModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowCreateRealModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 md:p-8 bg-slate-900/95 border border-cyan-500/40 rounded-3xl max-w-md w-full shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
                <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <Globe className="text-cyan-400 w-6 h-6" /> CREAR SALA EN VIVO
                </h3>
                <button onClick={() => setShowCreateRealModal(false)} className="hover:text-white p-1"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Nombre del Duelo:</label>
                  <input
                    type="text"
                    placeholder="Ej: Duelo 1 vs 1 Épico"
                    value={newRealRoomName}
                    onChange={(e) => setNewRealRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  />
                </div>

                {/* Selector de Modo */}
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Tipo de Relación / Modo:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedRealMode('triads')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        selectedRealMode === 'triads'
                          ? 'border-pink-400 bg-pink-950/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <span className="text-lg block">⚡</span>
                      <span className="text-[11px] font-black block text-white">Tríadas (3)</span>
                    </button>

                    <button
                      onClick={() => setSelectedRealMode('connections')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        selectedRealMode === 'connections'
                          ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <span className="text-lg block">🧠</span>
                      <span className="text-[11px] font-black block text-white">Parejas Rel. (2)</span>
                    </button>

                    <button
                      onClick={() => setSelectedRealMode('classic')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        selectedRealMode === 'classic'
                          ? 'border-purple-400 bg-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <span className="text-lg block">🎮</span>
                      <span className="text-[11px] font-black block text-white">Clásico (2)</span>
                    </button>
                  </div>
                </div>

                {/* Selector de Cantidad de Cartas */}
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Cantidad de Cartas:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[8, 12, 16, 24].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setSelectedRealCardCount(cnt)}
                        className={`py-2 rounded-xl border text-xs font-black transition ${
                          selectedRealCardCount === cnt
                            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-sm'
                            : 'border-white/10 bg-white/5 text-gray-400'
                        }`}
                      >
                        {cnt} Cartas
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-gray-300">
                  ⚡ Se generará un <strong className="text-cyan-300">código único de 6 dígitos</strong> para que tu rival se una al duelo 1 vs 1.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateRealModal(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (onCreateRealRoom) {
                        onCreateRealRoom(newRealRoomName.trim() || undefined, selectedRealMode, selectedRealCardCount);
                      }
                      setShowCreateRealModal(false);
                      setNewRealRoomName('');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
                  >
                    Crear Duelo 1 vs 1
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
