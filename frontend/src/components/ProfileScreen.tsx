import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, Zap, Award, Target, Brain, Clock, Activity, Sparkles, CheckCircle2, Flame, Shield, Star
} from 'lucide-react';
import { getCognitiveStats } from '../lib/cognitiveAnalytics';
import { loadPlayerStats, getRankByXP, getProgressToNextRank, getNextRank } from '../lib/playerEvolution';
import { soundSystem } from '../lib/soundSystem';
import { getEquippedFrameDetails } from '../lib/shopSystem';

interface ProfileScreenProps {
  onBack: () => void;
}

type ProfileTab = 'attributes' | 'achievements' | 'history';

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('attributes');
  const playerStats = loadPlayerStats();
  const cogStats = getCognitiveStats();
  const equippedFrame = getEquippedFrameDetails();

  const currentRank = getRankByXP(playerStats.xp);
  const nextRank = getNextRank(currentRank.id);
  const progress = getProgressToNextRank(playerStats.xp);

  const handleTabChange = (tab: ProfileTab) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) {}
    }
    soundSystem.playCardFlip();
    setActiveTab(tab);
  };

  const cognitiveAttributes = [
    { name: 'Memoria Sináptica', value: 94, icon: Brain, color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400' },
    { name: 'Velocidad de Reacción', value: 88, icon: Zap, color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-400' },
    { name: 'Precisión Visual', value: 96, icon: Target, color: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-400' },
    { name: 'Enfoque & Concentración', value: 91, icon: Sparkles, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' },
    { name: 'Sincronización Neural', value: 85, icon: Activity, color: 'from-pink-500 to-rose-600', textColor: 'text-pink-400' },
  ];

  const achievements = [
    { id: '1', title: 'Primera Sinapsis', desc: 'Completa tu primera partida con éxito', icon: '⚡', unlocked: true },
    { id: '2', title: 'Duelo Maestro', desc: 'Gana 5 duelos multijugador 1v1', icon: '⚔️', unlocked: true },
    { id: '3', title: 'Racha Imparable', desc: 'Consigue una racha de 10 aciertos sin fallos', icon: '🔥', unlocked: true },
    { id: '4', title: 'Mente Cuántica', desc: 'Alcanza el rango de Élite Neural', icon: '👑', unlocked: playerStats.level >= 10 },
    { id: '5', title: 'Coleccionista Mítico', desc: 'Desbloquea 6 reliquias en el álbum', icon: '🎴', unlocked: false },
    { id: '6', title: 'Velocidad de la Luz', desc: 'Resuelve un tablero en menos de 20 segundos', icon: '⏱️', unlocked: true },
  ];

  return (
    <div 
      className="font-rajdhani min-h-screen text-white p-3 sm:p-6 flex flex-col relative overflow-y-auto select-none pb-12"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-none" />

      {/* HEADER COMPACTO */}
      <header className="relative z-10 max-w-2xl w-full mx-auto flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-white/15 rounded-2xl transition text-xs font-bold shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
          PERFIL DE JUGADOR
        </h1>

        <div className="w-16" />
      </header>

      <main className="relative z-10 max-w-2xl w-full mx-auto space-y-4">
        
        {/* 1. TARJETA DE IDENTIDAD DE JUGADOR (ID CARD ULTRA COMPACTA) */}
        <section className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)] relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            {/* Avatar Mini con Marco Equipado */}
            <div 
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 flex-shrink-0 shadow-sm ${equippedFrame?.ringStyle || ''}`}
              style={{
                borderColor: equippedFrame?.borderColor || '#06b6d4',
                borderWidth: '2px',
                borderStyle: 'solid',
                boxShadow: `0 0 12px ${equippedFrame?.glowColor || 'rgba(6, 182, 212, 0.4)'}`
              }}
            >
              <img 
                alt="Avatar" 
                className="w-full h-full rounded-lg object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8M7nQSaF3HtkRN8jafA06uJgrZKNZj4q3CZ-dBiKt4Pmzk7NUjmRvd_eyuvBz5eP1QCfNpQQ_RHP5Q42sVghfZBdMkHT5FIdqV937sW5zf8A3v944vCBuTIdUTehcAQ0FXl5s_ErQoA9mm3VataX_FodvyVHTm0zO4irf1bUPbfNxVfrVOZfS2mHzy3_NCuQoNz9FSHRjjhpMlYFF5MbOGTvQQf-DjzCWtIX9zTGE8FNDdP_GMUns3_m4FB1YmoCMl3Tqo_ywupE"
              />
              <div 
                className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-slate-950 rounded-full flex items-center justify-center text-[7px] font-black shadow-md"
                style={{
                  border: `1px solid ${equippedFrame?.borderColor || '#06b6d4'}`,
                  color: equippedFrame?.borderColor || '#06b6d4'
                }}
              >
                LV.{playerStats.level}
              </div>
            </div>

            {/* Info y Rango */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-white truncate leading-tight">NeuroLinker</h2>
                <span 
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 flex-shrink-0"
                  style={{
                    backgroundColor: currentRank.color + '25',
                    color: currentRank.color,
                    border: `1px solid ${currentRank.color}60`
                  }}
                >
                  <span>{currentRank.icon}</span>
                  <span className="truncate">{currentRank.name}</span>
                </span>
              </div>
              
              <p className="text-[10px] text-gray-400 font-mono">ID: #MNZ-7845 • Adepto Sináptico</p>

              {/* Barra de Progreso XP */}
              <div className="mt-1.5">
                <div className="flex justify-between text-[9px] font-mono mb-0.5">
                  <span className="text-gray-400">Progreso Nivel {playerStats.level + 1}</span>
                  <span className="text-cyan-300 font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MÉTRICAS CLAVE EN UNA FILA COMPACTA */}
        <section className="grid grid-cols-4 gap-2">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2 sm:p-2.5 text-center">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Partidas</span>
            <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">342</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-2 sm:p-2.5 text-center">
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Victorias</span>
            <span className="text-base sm:text-lg font-black text-emerald-300 font-mono leading-tight">245</span>
          </div>

          <div className="bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-2 sm:p-2.5 text-center">
            <span className="text-[9px] sm:text-[10px] text-yellow-400 font-bold block uppercase tracking-wider">Racha Top</span>
            <span className="text-base sm:text-lg font-black text-yellow-300 font-mono leading-tight">🔥 x14</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-2 sm:p-2.5 text-center">
            <span className="text-[9px] sm:text-[10px] text-purple-400 font-bold block uppercase tracking-wider">Precisión</span>
            <span className="text-base sm:text-lg font-black text-purple-300 font-mono leading-tight">71.6%</span>
          </div>
        </section>

        {/* 3. PESTAÑAS INTERACTIVAS (SEGMENTED CONTROL) */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => handleTabChange('attributes')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'attributes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🧠 Atributos
          </button>

          <button
            onClick={() => handleTabChange('achievements')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏅 Logros (5/6)
          </button>

          <button
            onClick={() => handleTabChange('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Analítica
          </button>
        </div>

        {/* 4. CONTENIDO DINÁMICO POR PESTAÑA */}
        <AnimatePresence mode="wait">
          {activeTab === 'attributes' && (
            <motion.div
              key="attributes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3.5 backdrop-blur-xl"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-cyan-400" /> Rendimiento Cognitivo en Tiempo Real
              </h3>

              <div className="space-y-3">
                {cognitiveAttributes.map((attr) => (
                  <div key={attr.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-200 font-bold flex items-center gap-1.5">
                        <attr.icon className={`w-3.5 h-3.5 ${attr.textColor}`} />
                        {attr.name}
                      </span>
                      <span className={`font-mono font-black ${attr.textColor}`}>{attr.value}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attr.value}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${attr.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-slate-900/80 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-white/10 opacity-50 grayscale'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {ach.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white truncate">{ach.title}</h4>
                      {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1" />}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight truncate">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 space-y-3 backdrop-blur-xl"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" /> Métricas de Velocidad y Eficiencia
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Tiempo de Reacción</span>
                  <span className="text-lg font-black text-cyan-300 font-mono">0.62s</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Memoria a Corto Plazo</span>
                  <span className="text-lg font-black text-purple-300 font-mono">Alta (Tier S)</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Duelos Ganados</span>
                  <span className="text-lg font-black text-emerald-300 font-mono">38 Partidas</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Puntos Totales</span>
                  <span className="text-lg font-black text-yellow-300 font-mono">{playerStats.xp * 12}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
