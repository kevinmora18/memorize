import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Clock, Flame, Target, Star, Award, Shield } from 'lucide-react';

interface ClassicHUDProps {
  level: number;
  score: number;
  combo: number;
  timer: number;
  maxTime: number;
  energy: number;
  matchedPairs: number;
  totalPairs: number;
  onBack: () => void;
}

export function ClassicHUD({
  level, score, combo, timer, maxTime, energy, matchedPairs, totalPairs, onBack
}: ClassicHUDProps) {
  const timerPct = Math.max(0, Math.min(100, (timer / maxTime) * 100));
  const timerColor = timer < 10 ? '#ef4444' : timer < 20 ? '#f97316' : '#22d3ee';
  const progressPct = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <div 
      className="w-full flex flex-col gap-2 px-3 sm:px-6 pt-2 pb-2.5 z-20 relative border-b border-purple-500/20"
      style={{ background: 'linear-gradient(180deg, rgba(8,6,24,0.98) 0%, rgba(5,2,20,0.92) 100%)' }}
    >
      {/* Top row: back + level info + stats */}
      <div className="flex items-center justify-between gap-2">
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white rounded-xl transition-all text-xs font-bold shadow-sm cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Lobby</span>
        </button>

        {/* Level Indicator */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[9px] sm:text-[10px] text-purple-400 uppercase tracking-widest font-black">CAMPAÑA CLÁSICA</span>
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-sm sm:text-base tracking-wider font-mono">NIVEL {level} / 10</span>
            {level >= 3 && level <= 5 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold">⚡ GLITCH</span>}
            {level >= 6 && level <= 7 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 font-bold">💣 BOMBAS</span>}
            {level >= 8 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 font-bold">👑 TRÍADAS</span>}
          </div>
        </div>

        {/* Total Score */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/30 rounded-xl">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <span className="text-yellow-300 font-black font-mono text-xs sm:text-sm">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Solo Campaign Stats Bar */}
      <div className="grid grid-cols-3 gap-2 items-center pt-1">
        
        {/* Progress: Matched / Total */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            <span>Objetivo</span>
            <span className="text-cyan-300 font-mono">{matchedPairs} / {totalPairs}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Central Timer */}
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            className="text-lg sm:text-2xl font-black font-mono leading-tight"
            style={{ color: timerColor, textShadow: `0 0 15px ${timerColor}88` }}
            animate={timer < 10 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5, repeat: timer < 10 ? Infinity : 0 }}
          >
            ⏱️ {Math.ceil(timer)}s
          </motion.div>
          <span className="text-[8px] sm:text-[9px] text-gray-400 font-mono uppercase tracking-widest">
            {timer < 10 ? '¡TIEMPO CRÍTICO!' : 'TIEMPO RESTANTE'}
          </span>
        </div>

        {/* Combo Multiplier */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center text-center">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            <span>Combo</span>
            <span className="text-orange-400 font-mono font-black flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-400 animate-pulse" /> x{combo}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              animate={{ width: `${Math.min(100, combo * 20)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
