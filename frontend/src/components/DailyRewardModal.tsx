import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Check, CheckCircle2, Crown, X, Zap } from 'lucide-react';
import {
  SEVEN_DAYS_REWARDS,
  loadDailyRewardsState,
  isDailyRewardAvailable,
  claimTodayReward,
  type DailyRewardDay
} from '../lib/dailyRewardsSystem';
import { soundSystem } from '../lib/soundSystem';
import { loadPlayerStats, addXP, savePlayerStats } from '../lib/playerEvolution';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coinsAdded: number, gemsAdded: number) => void;
}

export function DailyRewardModal({ isOpen, onClose, onRewardClaimed }: DailyRewardModalProps) {
  const [rewardState, setRewardState] = useState(loadDailyRewardsState());
  const [isClaimable, setIsClaimable] = useState(isDailyRewardAvailable());
  const [claimedReward, setClaimedReward] = useState<DailyRewardDay | null>(null);

  if (!isOpen) return null;

  const currentStreak = rewardState.currentDayStreak;

  const handleClaim = () => {
    if (!isClaimable) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([25, 50, 75]);
      } catch (e) {}
    }

    soundSystem.playLevelUp();
    const { reward, nextState } = claimTodayReward();

    // Actualizar XP en la evolución del jugador
    const stats = loadPlayerStats();
    const updatedStats = addXP(stats, reward.xp);
    savePlayerStats(updatedStats);

    setRewardState(nextState);
    setIsClaimable(false);
    setClaimedReward(reward);
    onRewardClaimed(reward.coins, reward.gems);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-white shadow-[0_0_60px_rgba(0,255,255,0.25)] relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 p-0.5 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                🎁
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  RECOMPENSA DIARIA
                </h3>
                <p className="text-xs text-gray-400">Entra todos los días para desbloquear recompensas legendarias</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
            {SEVEN_DAYS_REWARDS.map((item) => {
              const isToday = item.day === currentStreak && isClaimable;
              const isPast = item.day < currentStreak || (!isClaimable && item.day === currentStreak);
              const isFuture = item.day > currentStreak;

              return (
                <div
                  key={item.day}
                  className={`relative rounded-2xl p-3 flex flex-col justify-between text-center transition-all ${
                    item.isSpecial ? 'col-span-2 sm:col-span-2' : 'col-span-1'
                  } ${
                    isToday
                      ? 'bg-gradient-to-b from-cyan-950/90 to-slate-900 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.4)] scale-102 ring-2 ring-cyan-300'
                      : isPast
                      ? 'bg-slate-900/60 border border-emerald-500/40 opacity-75'
                      : 'bg-slate-900/40 border border-white/10 opacity-50'
                  }`}
                >
                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">
                      Día {item.day}
                    </span>

                    <div className="my-2 flex items-center justify-center">
                      <span className={`text-3xl ${item.isSpecial ? 'text-4xl' : ''}`}>
                        {item.isSpecial ? '👑' : item.gems > 0 ? '💎' : '🪙'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-white font-mono">
                        +{item.coins} 🪙
                      </p>
                      {item.gems > 0 && (
                        <p className="text-[10px] font-bold text-cyan-300 font-mono">
                          +{item.gems} 💎
                        </p>
                      )}
                      <p className="text-[9px] text-purple-300 font-mono">
                        +{item.xp} XP
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center">
                    {isPast ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reclamado
                      </span>
                    ) : isToday ? (
                      <span className="text-[10px] font-black text-cyan-300 animate-pulse">
                        ¡DISPONIBLE HOY!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500">
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="relative z-10">
            {claimedReward ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-2">
                <h4 className="text-lg font-black text-emerald-300 uppercase">
                  ¡RECOMPENSA RECLAMADA CON ÉXITO!
                </h4>
                <p className="text-xs text-gray-300 font-mono">
                  Has obtenido +{claimedReward.coins} Monedas 🪙, +{claimedReward.gems} Gemas 💎 y +{claimedReward.xp} XP 🧠.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Continuar al Juego
                </button>
              </div>
            ) : isClaimable ? (
              <button
                onClick={handleClaim}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:from-yellow-300 hover:to-amber-200 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_35px_rgba(234,179,8,0.5)] transition hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-5 h-5 fill-slate-950" />
                <span>RECLAMAR RECOMPENSA DE HOY</span>
              </button>
            ) : (
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                <span className="text-xs text-gray-400 font-mono">
                  ⏰ Ya has reclamado la recompensa de hoy. Vuelve mañana para continuar tu racha.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
