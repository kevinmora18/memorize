import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, CheckCircle2, Gift, Zap } from 'lucide-react';
import { getQuests, saveQuests, type Quest } from '../lib/questAndCollectionSystem';

import { soundSystem } from '../lib/soundSystem';

interface QuestsModalProps {
  onClose: () => void;
  onRewardClaimed?: (coins: number, xp: number) => void;
}

export function QuestsModal({ onClose, onRewardClaimed }: QuestsModalProps) {
  const [quests, setQuests] = useState<Quest[]>(getQuests());

  const handleClaim = (questId: string) => {
    soundSystem.playVictoryFanfare();
    const updated = quests.map((q) => {
      if (q.id === questId) {
        if (onRewardClaimed) onRewardClaimed(q.rewardCoins, q.rewardXP);
        return { ...q, isClaimed: true };
      }
      return q;
    });
    setQuests(updated);
    saveQuests(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-wide">MISIONES DIARIAS</h3>
              <p className="text-xs text-gray-400">Completa retos y gana recompensas de experiencia y oro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {quests.map((q) => {
            const isReadyToClaim = q.progress >= q.maxProgress && !q.isClaimed;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all ${
                  q.isClaimed
                    ? 'bg-slate-900/40 border-white/5 opacity-60'
                    : isReadyToClaim
                    ? 'bg-purple-900/40 border-yellow-400/60 shadow-lg shadow-yellow-500/10'
                    : 'bg-slate-900/80 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{q.title}</h4>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-yellow-400 font-bold font-mono">+{q.rewardCoins} 🪙</span>
                    <span className="text-cyan-400 font-bold font-mono">+{q.rewardXP} XP</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mb-3">{q.description}</p>

                <div className="flex items-center gap-3">
                  <div className="flex-grow h-2 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (q.progress / q.maxProgress) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-400 font-bold">
                    {q.progress}/{q.maxProgress}
                  </span>

                  {isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(q.id)}
                      className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition animate-pulse flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" /> RECLAMAR
                    </button>
                  ) : q.isClaimed ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> RECLAMADO
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
