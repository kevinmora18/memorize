import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Crown, Sparkles, Brain, Trophy, Zap, Award, Star } from 'lucide-react';
import { soundSystem } from '../lib/soundSystem';
import type { Universe } from '../App';

interface RewardScreenProps {
  universe: Universe;
  onBackToMenu: () => void;
  onReplay: () => void;
}

export function RewardScreen({ onBackToMenu, onReplay }: RewardScreenProps) {
  useEffect(() => {
    soundSystem.playVictoryFanfare();
  }, []);

  return (
    <div 
      className="font-rajdhani min-h-screen text-white relative overflow-y-auto flex items-center justify-center p-4 md:p-8 select-none"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg pointer-events-none" />

      {/* Floating Ambient Aura */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Main Trophy Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="bg-slate-900/90 border-2 border-cyan-400/60 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,255,255,0.4)] backdrop-blur-2xl"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" /> SINAPSIS NEURAL PERFECTA
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 leading-tight mb-2">
            ¡TRÍADA CONECTADA CON ÉXITO!
          </h2>
          <p className="text-sm md:text-base text-gray-300 mb-6">
            Has demostrado una agilidad conceptual sobrehumana uniendo los nodos lógicos.
          </p>

          {/* Central 3D Energy Core */}
          <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-xl"
              animate={{ scale: [1, 1.25, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative w-32 h-32 rounded-full bg-slate-950/90 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_30px_#00ffff]">
              <Brain className="w-14 h-14 text-cyan-300 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 mt-1">RANGO S+</span>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 bg-slate-950/70 border border-purple-500/40 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Experiencia</span>
              <p className="text-2xl font-black text-purple-300 font-mono">+350 XP</p>
            </div>
            <div className="p-4 bg-slate-950/70 border border-amber-500/40 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Monedas</span>
              <p className="text-2xl font-black text-amber-300 font-mono">+250 🪙</p>
            </div>
            <div className="p-4 bg-slate-950/70 border border-cyan-500/40 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Gemas</span>
              <p className="text-2xl font-black text-cyan-300 font-mono">+15 💎</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left bg-slate-950/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Precisión Mental</span>
                <p className="text-base font-black text-emerald-300">100% Sinapsis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Evaluación</span>
                <p className="text-base font-black text-amber-300">⭐⭐⭐ Maestro</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBackToMenu}
              className="flex-1 py-4 bg-white/10 hover:bg-white/15 rounded-2xl font-black uppercase tracking-wider text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Volver al Menú</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReplay}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black uppercase tracking-wider text-sm rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-5 h-5 fill-slate-950" />
              <span>Jugar Otro Nivel</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
