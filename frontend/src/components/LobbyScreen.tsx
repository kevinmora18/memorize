import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, InfinityIcon, Settings, Target, Skull, Gamepad2, Zap, LogOut, X, TrendingUp, Users, Mail, Trophy, Sparkles, Volume2, VolumeX, Shield, Gift, Flame, Play, BookOpen, Brain, Plus, Search, Copy, Check, Wifi, Globe, ChevronRight, Swords, Sparkle, Layers, User
} from 'lucide-react';

import { loadPlayerStats, getRankByXP, getProgressToNextRank, getNextRank, type PlayerStats, RANKS } from '../lib/playerEvolution';
import { soundSystem } from '../lib/soundSystem';
import { BottomNavigation, type BottomNavTab } from './BottomNavigation';
import { DailyRewardModal } from './DailyRewardModal';
import { isDailyRewardAvailable } from '../lib/dailyRewardsSystem';
import { getEquippedFrameDetails } from '../lib/shopSystem';
import type { Room } from '../App';

interface LobbyScreenProps {
  onStartMode: (mode: string) => void;
  onLogout: () => void;
  userRole?: string;
  userId?: string;
  rooms?: Room[];
  onCreateRoom?: (name?: string) => void;
  onJoinRoom?: (roomIdOrCode: string) => void;
}

export function LobbyScreen({ onStartMode, onLogout, userRole, userId, rooms = [], onCreateRoom, onJoinRoom }: LobbyScreenProps) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5175';
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showModesModal, setShowModesModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedWifiLink, setCopiedWifiLink] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [coins, setCoins] = useState(1500);
  const [gems, setGems] = useState(80);
  const [isMuted, setIsMuted] = useState(soundSystem.isMuted());

  const equippedFrame = getEquippedFrameDetails();

  const localIpUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` : "http://localhost:5173";

  useEffect(() => {
    const stats = loadPlayerStats();
    setPlayerStats(stats);
    
    if (userId) {
      fetch(`${API_BASE}/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.coins !== undefined) setCoins(data.coins);
          if (data.gems !== undefined) setGems(data.gems);
        })
        .catch(err => console.error('Error loading currency:', err));
    }
  }, [userId]);

  const currentRank = getRankByXP(playerStats.xp);
  const nextRank = getNextRank(currentRank.id);
  const progress = getProgressToNextRank(playerStats.xp);

  const handleModeSelect = (mode: string) => {
    soundSystem.playCardFlip();
    setShowModesModal(false);
    onStartMode(mode);
  };

  const toggleSound = () => {
    const muted = soundSystem.toggleMute();
    setIsMuted(muted);
  };

  const gameModes = [
    {
      mode: 'classic',
      icon: Boxes,
      title: 'MODO CLÁSICO',
      subtitle: '10 Niveles Progresivos',
      desc: 'Supera niveles con dificultad creciente, bombas trampa y efectos de glitch cuántico.',
      color: 'from-purple-600 via-indigo-600 to-blue-700',
      badge: 'POPULAR',
      glow: 'rgba(168, 85, 247, 0.4)',
      accent: '#a855f7',
      category: 'Campaña'
    },
    {
      mode: 'challenge',
      icon: Target,
      title: 'DESAFÍO TÁCTICO',
      subtitle: 'Poderes & Power-Ups',
      desc: 'Pon a prueba tus reflejos con cartas especiales, multiplicadores de combos y bonificaciones.',
      color: 'from-cyan-600 via-teal-600 to-emerald-600',
      badge: 'RETO',
      glow: 'rgba(6, 182, 212, 0.4)',
      accent: '#06b6d4',
      category: 'Desafío'
    },
    {
      mode: 'infinite',
      icon: InfinityIcon,
      title: 'MODO INFINITO',
      subtitle: 'Supervivencia Contrarreloj',
      desc: 'Aguanta el mayor tiempo posible emparejando cartas antes de que el reloj llegue a cero.',
      color: 'from-blue-600 via-indigo-700 to-purple-800',
      badge: 'RÉCORD',
      glow: 'rgba(59, 130, 246, 0.4)',
      accent: '#3b82f6',
      category: 'Supervivencia'
    },
    {
      mode: 'boss',
      icon: Brain,
      title: 'TRÍADAS & RELACIONES',
      subtitle: 'Conexiones Conceptuales',
      desc: 'Empareja conceptos relacionados de 2 cartas o tríadas completas de 3 cartas conectadas.',
      color: 'from-pink-600 via-purple-700 to-indigo-800',
      badge: 'COGNITIVO',
      glow: 'rgba(236, 72, 153, 0.4)',
      accent: '#ec4899',
      category: 'Mental'
    },
    {
      mode: 'ai-friends',
      icon: Swords,
      title: 'MULTIJUGADOR 1 VS 1',
      subtitle: 'Duelo en Vivo (Online / IA)',
      desc: 'Crea o únete a salas en tiempo real para competir contra amigos con código o bots inteligentes.',
      color: 'from-emerald-600 via-teal-600 to-cyan-600',
      badge: 'EN VIVO',
      glow: 'rgba(16, 185, 129, 0.4)',
      accent: '#10b981',
      category: 'Multijugador'
    }
  ];

  const handleBottomNavSelect = (tab: BottomNavTab) => {
    if (tab === 'lobby') {
      setShowModesModal(true);
    } else if (tab === 'tienda') {
      onStartMode('tienda');
    } else if (tab === 'collection') {
      onStartMode('collection');
    } else if (tab === 'ranked') {
      onStartMode('ranked');
    } else if (tab === 'ai-room-lobby') {
      onStartMode('ai-room-lobby');
    }
  };

  return (
    <div 
      className="font-rajdhani min-h-screen w-full max-w-full overflow-x-hidden text-gray-200 flex flex-col relative pb-28 select-none"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;900&display=swap');
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }

        .glass-panel {
          background: rgba(8, 14, 30, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 255, 255, 0.18);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.7);
        }

        .cta-glow-btn {
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #9020f5 100%);
          box-shadow: 0 0 35px rgba(0, 242, 254, 0.45);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-glow-btn:hover {
          box-shadow: 0 0 50px rgba(0, 242, 254, 0.75);
          transform: translateY(-2px) scale(1.02);
        }

        .mode-card-item {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(8, 12, 24, 0.98) 100%);
          backdrop-filter: blur(14px);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          transition: all 0.25s ease-out;
        }

        .mode-card-item:hover {
          border-color: var(--card-accent, #00ffff);
          box-shadow: 0 0 30px -5px var(--card-glow, rgba(0, 255, 255, 0.5));
          transform: translateY(-4px) scale(1.015);
        }
      `}</style>

      {/* ======================= TOP STATUS & PROFILE BAR ======================= */}
      <header className="w-full max-w-full overflow-x-hidden glass-panel border-b border-cyan-500/20 px-2.5 sm:px-6 py-2 sticky top-0 z-40 flex items-center justify-between gap-1.5">
        
        {/* Left: Gamer Profile Avatar & Level Badge */}
        <button
          onClick={() => onStartMode('profile')}
          className="flex items-center gap-2 p-1.5 pr-3 bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 hover:border-cyan-400 rounded-2xl transition-all shadow-[0_0_15px_rgba(0,255,255,0.15)] cursor-pointer group flex-shrink-0"
          title="Toca para ver tu Perfil y Estadísticas"
        >
          <div 
            className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 flex-shrink-0 shadow-md ${equippedFrame?.ringStyle || ''}`}
            style={{
              borderColor: equippedFrame?.borderColor || '#06b6d4',
              borderWidth: '2px',
              borderStyle: 'solid',
              boxShadow: `0 0 12px ${equippedFrame?.glowColor || 'rgba(6, 182, 212, 0.4)'}`
            }}
          >
            <img alt="Avatar del Jugador" className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8M7nQSaF3HtkRN8jafA06uJgrZKNZj4q3CZ-dBiKt4Pmzk7NUjmRvd_eyuvBz5eP1QCfNpQQ_RHP5Q42sVghfZBdMkHT5FIdqV937sW5zf8A3v944vCBuTIdUTehcAQ0FXl5s_ErQoA9mm3VataX_FodvyVHTm0zO4irf1bUPbfNxVfrVOZfS2mHzy3_NCuQoNz9FSHRjjhpMlYFF5MbOGTvQQf-DjzCWtIX9zTGE8FNDdP_GMUns3_m4FB1YmoCMl3Tqo_ywupE" />
            <div 
              className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-950 rounded-full flex items-center justify-center text-[8px] font-black shadow-md"
              style={{
                border: `1px solid ${equippedFrame?.borderColor || '#06b6d4'}`,
                color: equippedFrame?.borderColor || '#06b6d4'
              }}
            >
              LV.{playerStats.level}
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors leading-tight">NeuroLinker</h4>
            <span className="text-[9px] text-cyan-300 font-mono font-bold leading-none">{playerStats.xp} XP</span>
          </div>
        </button>

        {/* Center: Brand Logo (Cerebro Cuántico + MEMORIZE EVOLUTIVO) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/90 border border-cyan-400/60 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-[0.2em] sm:tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 leading-none">
              MEMORIZE
            </h1>
            <span className="text-[8px] sm:text-[10px] font-black tracking-[0.35em] uppercase text-cyan-300 font-mono leading-none mt-0.5">
              EVOLUTIVO
            </span>
          </div>
        </div>

        {/* Right: Currencies, Daily Gift & Tools (100% adaptado a móvil sin desbordes) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Currencies Pills */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold font-mono">
            <div 
              onClick={() => onStartMode('tienda')}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-500/15 hover:bg-yellow-500/25 cursor-pointer rounded-full border border-yellow-500/40 text-yellow-300 shadow-sm transition"
              title="Monedas"
            >
              <span>💰</span>
              <span>{coins >= 1000 ? `${(coins / 1000).toFixed(1)}k` : coins}</span>
            </div>
            <div 
              onClick={() => onStartMode('tienda')}
              className="flex items-center gap-1 px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 cursor-pointer rounded-full border border-cyan-500/40 text-cyan-300 shadow-sm transition"
              title="Gemas"
            >
              <span>💎</span>
              <span>{gems}</span>
            </div>
          </div>

          {/* Daily Gift Button */}
          <button
            onClick={() => setShowDailyRewardModal(true)}
            className="p-1.5 relative bg-yellow-500/20 hover:bg-yellow-500/35 border border-yellow-400/40 rounded-xl text-yellow-300 transition cursor-pointer flex-shrink-0"
            title="Recompensa Diaria"
          >
            <Gift className="w-4 h-4" />
            {isDailyRewardAvailable() && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-ping" />
            )}
          </button>

          {/* Desktop Utilities (Ocultos en móvil pequeño para evitar overflow horizontal) */}
          <div className="hidden md:flex items-center gap-1">
            {userRole === 'admin' && (
              <button 
                className="px-2.5 py-1 bg-red-600/25 text-red-400 border border-red-500/40 rounded-xl text-xs font-black cursor-pointer hover:bg-red-600/40 transition" 
                onClick={() => onStartMode('admin')}
              >
                🛡️
              </button>
            )}
            <button onClick={toggleSound} className="p-1.5 hover:text-cyan-400 transition rounded-lg hover:bg-white/5 cursor-pointer" title="Sonido">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button onClick={() => setShowMessages(true)} className="p-1.5 hover:text-white transition rounded-lg hover:bg-white/5 cursor-pointer" title="Mensajes">
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition text-xs font-bold cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

          {/* Mobile Settings Icon (Abre ajustes del juego) */}
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-1.5 hover:text-white transition rounded-xl bg-white/5 border border-white/10 cursor-pointer flex-shrink-0" 
            title="Ajustes"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </header>

      {/* ======================= MAIN CLEAN LOBBY ======================= */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 z-10 flex-grow">
        
        {/* HERO PROMOTIONAL BANNER */}
        <section className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden border border-cyan-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-pink-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> TEMPORADA 1 NEURAL
                </span>
                <span className="text-xs font-mono text-gray-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  Racha Diaria: 🔥 3 Días
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-wide leading-tight">
                DESAFÍA TU MENTE • <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">EVOLUCIONA</span>
              </h2>
              
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                Entrena tu memoria sináptica, supera retos contrarreloj y compite en duelos 1v1 online en tiempo real contra amigos.
              </p>
            </div>

            {/* MAIN CALL TO ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
              <button
                onClick={() => setShowModesModal(true)}
                className="cta-glow-btn px-8 py-5 text-slate-950 font-black uppercase tracking-widest text-base rounded-2xl flex items-center justify-center gap-3 cursor-pointer"
              >
                <Boxes className="w-6 h-6 text-slate-950" />
                <span>SELECCIONAR MODO DE JUEGO</span>
              </button>

              <button
                onClick={() => handleModeSelect('ai-friends')}
                className="px-6 py-5 bg-slate-900/90 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-sm rounded-2xl border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Swords className="w-5 h-5 text-emerald-400" />
                <span>DUELO 1 VS 1</span>
              </button>
            </div>
          </div>
        </section>

        {/* ======================= PROGRESSION & HUB CARDS ======================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Reward Card */}
          <div
            className="glass-panel rounded-3xl p-5 flex flex-col justify-between border border-yellow-500/30 hover:border-yellow-400/60 transition cursor-pointer group shadow-[0_0_20px_rgba(234,179,8,0.12)]"
            onClick={() => setShowDailyRewardModal(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-yellow-400 flex items-center gap-1.5 font-mono">
                <Gift className="w-4 h-4 text-yellow-400" /> RECOMPENSA DIARIA
              </span>
              {isDailyRewardAvailable() ? (
                <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 rounded-full font-black animate-pulse">
                  ¡HOY! 🎁
                </span>
              ) : (
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                  Completado
                </span>
              )}
            </div>
            <div>
              <h4 className="text-lg font-black text-white group-hover:text-yellow-300 transition-colors">
                CALENDARIO DE 7 DÍAS
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Reclama tus monedas, gemas y XP diarios. Corona de oro el día 7.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-yellow-400 uppercase tracking-wider">
              <span>{isDailyRewardAvailable() ? 'Reclamar Premio' : 'Ver Calendario'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Daily Missions */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" /> MISIONES DIARIAS
              </span>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-bold">
                2 Activas
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-300">🎮 Juega 2 partidas clásicas</span>
                <span className="text-cyan-400 font-bold">1/2</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-300">⚡ Gana en Duelo 1 vs 1</span>
                <span className="text-yellow-400 font-bold">+250 🪙</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Álbum de Reliquias</span>
              <span>12 Coleccionables</span>
            </div>
          </div>

          {/* Quick Multiplayer Card */}
          <div 
            className="glass-panel rounded-3xl p-5 flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer group"
            onClick={() => handleModeSelect('ai-friends')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5 font-mono">
                <Users className="w-4 h-4 text-emerald-400" /> SALA DE DUELO ONLINE
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                En Vivo
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                JUGAR CON UN AMIGO (1 VS 1)
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Genera tu código de sala o únete a la partida de tu rival en tiempo real.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Entrar a la Sala</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </main>

      {/* ======================= MODAL: SELECTOR DE MODOS DE JUEGO ======================= */}
      <AnimatePresence>
        {showModesModal && (
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            onClick={() => setShowModesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel rounded-3xl p-6 md:p-8 max-w-4xl w-full border border-cyan-500/40 shadow-[0_0_60px_rgba(0,255,255,0.25)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 sticky top-0 bg-[#080e1e]/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                      SELECCIONA MODO DE JUEGO
                    </h3>
                    <p className="text-xs text-gray-400">Elige la experiencia en la que deseas entrenar o competir</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowModesModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modes Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameModes.map((item) => (
                  <div
                    key={item.mode}
                    onClick={() => handleModeSelect(item.mode)}
                    style={{ '--card-glow': item.glow, '--card-accent': item.accent } as React.CSSProperties}
                    className="mode-card-item rounded-3xl p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-lg min-h-[190px]"
                  >
                    {/* Badge */}
                    {item.badge && (
                      <span
                        className="absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md text-slate-950"
                        style={{ backgroundColor: item.accent }}
                      >
                        {item.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-gray-400 block">
                            {item.category}
                          </span>
                          <h4 className="text-white font-black text-base uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="w-full pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: item.accent }}>
                      <span>Jugar Modo</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= OTHER MODALS ======================= */}
      {/* Messages Modal */}
      <AnimatePresence>
        {showMessages && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowMessages(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl p-6 max-w-md w-full border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" /> MENSAJES & NOTIFICACIONES
                </h3>
                <button onClick={() => setShowMessages(false)} className="p-1 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-center py-6">
                <p className="text-sm text-gray-300 font-medium">¡Bienvenido a la versión comercial de Memorize!</p>
                <p className="text-xs text-gray-500 mt-1">Reclama tus recompensas diarias en la tienda.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl p-6 max-w-md w-full border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" /> AJUSTES DEL JUEGO
                </h3>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-gray-300">Efectos Web Audio Procedural</span>
                  <button
                    onClick={toggleSound}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-emerald-500 text-slate-950'}`}
                  >
                    {isMuted ? 'Silenciado' : 'Activado'}
                  </button>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-gray-300">Vibración Háptica Táctil</span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">Activo (Móvil)</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ranks Progression Modal */}
      <AnimatePresence>
        {showRanksModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowRanksModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl p-6 max-w-2xl w-full border border-cyan-500/30 max-h-[85vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#080e1e]/95 backdrop-blur-md pb-4 border-b border-white/10 z-10">
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" />
                  CAMINO DE LA EVOLUCIÓN NEURAL
                </h3>
                <button onClick={() => setShowRanksModal(false)} className="hover:text-white p-1 cursor-pointer"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-3">
                {RANKS.map((rank) => {
                  const isCurrentRank = currentRank.id === rank.id;
                  const isPassedRank = playerStats.xp >= rank.minXP;
                  
                  return (
                    <div 
                      key={rank.id} 
                      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                        isCurrentRank 
                          ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_20px_rgba(0,255,255,0.25)] scale-[1.02]' 
                          : isPassedRank
                          ? 'border-purple-500/30 bg-purple-900/10'
                          : 'border-gray-800 bg-gray-900/40 opacity-50 grayscale'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-cyan-500/50 bg-slate-950 flex-shrink-0 shadow-md">
                        {rank.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className={`text-base font-black ${isCurrentRank ? 'text-cyan-400' : 'text-white'}`}>{rank.name}</h4>
                          <span className="text-xs font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded-full">{rank.minXP} XP</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{rank.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoomModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowCreateRoomModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl p-6 md:p-8 max-w-md w-full border border-cyan-500/40 shadow-[0_0_40px_rgba(0,255,255,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
                <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <Globe className="text-cyan-400 w-6 h-6" /> CREAR SALA MULTIJUGADOR
                </h3>
                <button onClick={() => setShowCreateRoomModal(false)} className="hover:text-white p-1 cursor-pointer"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                    Nombre de la Sala (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Duelo Épico / Sala de Amigos"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                  />
                </div>

                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-gray-300">
                  ⚡ Se generará un <strong className="text-cyan-300">código único de 6 dígitos</strong> que podrás compartir con tus amigos para que se unan inmediatamente.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateRoomModal(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (onCreateRoom) {
                        onCreateRoom(newRoomName.trim() || undefined);
                      }
                      setShowCreateRoomModal(false);
                      setNewRoomName('');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition cursor-pointer"
                  >
                    Crear y Entrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= SETTINGS MODAL ======================= */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl p-6 max-w-sm w-full border border-cyan-500/40 shadow-[0_0_40px_rgba(0,255,255,0.3)] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <Settings className="text-cyan-400 w-5 h-5" /> AJUSTES DEL JUEGO
                </h3>
                <button onClick={() => setShowSettings(false)} className="hover:text-white p-1 cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Sound Toggle Option */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Efectos & Sonido</h4>
                    <p className="text-[10px] text-gray-400">{isMuted ? 'Silenciado' : 'Activado'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    isMuted
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  }`}
                >
                  {isMuted ? 'MUTE' : 'ON'}
                </button>
              </div>

              {/* Version info */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                  ✦ MEMORIZE EVOLUTIVO • v2.0 AAA
                </p>
              </div>

              {/* Logout Option */}
              <button
                onClick={() => {
                  setShowSettings(false);
                  onLogout();
                }}
                className="w-full py-3 bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-red-400 hover:text-red-300 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>CERRAR SESIÓN / SALIR</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= DAILY REWARD MODAL ======================= */}
      <DailyRewardModal
        isOpen={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
        onRewardClaimed={(coinsEarned, gemsEarned) => {
          setCoins(prev => prev + coinsEarned);
          setGems(prev => prev + gemsEarned);
        }}
      />

      {/* ======================= MOBILE BOTTOM NAVIGATION BAR ======================= */}
      <BottomNavigation
        activeTab="lobby"
        onSelectTab={handleBottomNavSelect}
      />
    </div>
  );
}
