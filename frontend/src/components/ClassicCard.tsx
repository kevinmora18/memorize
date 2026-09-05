import React from 'react';
import { motion } from 'framer-motion';
import { Bomb, Zap } from 'lucide-react';
import { getEquippedSkinStyle } from '../lib/shopSystem';

export interface CardData {
  id: string;
  symbol: string;
  emoji: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
  isGlitch: boolean;
  isBomb: boolean;
  isDark: boolean;
}

interface ClassicCardProps {
  card: CardData;
  index: number;
  onClick: () => void;
  isShaking: boolean;
  isBouncing: boolean;
  isExploding: boolean;
  gamePhase: string;
}

export function ClassicCard({ card, onClick, isShaking, isBouncing, isExploding, gamePhase }: ClassicCardProps) {
  const isVisible = card.isFlipped || card.isMatched;
  const equippedSkinStyle = getEquippedSkinStyle();

  return (
    <motion.div
      className="relative cursor-pointer w-full h-full select-none"
      style={{ perspective: 1000 }}
      animate={
        isShaking
          ? { x: [0, -8, 8, -6, 6, -4, 4, 0], rotate: [0, -3, 3, -2, 2, 0] }
          : isBouncing
          ? { scale: [1, 1.2, 0.9, 1.05, 1], y: [0, -12, 0] }
          : isExploding
          ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
          : { scale: 1, x: 0, rotate: 0, opacity: card.isMatched ? 0.45 : 1 }
      }
      transition={{ duration: isShaking ? 0.5 : isBouncing ? 0.5 : 0.3 }}
      onClick={onClick}
      whileHover={!card.isMatched && gamePhase === 'playing' ? { scale: 1.05, y: -4 } : {}}
      whileTap={!card.isMatched && gamePhase === 'playing' ? { scale: 0.94 } : {}}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: card.isMatched
            ? `0 10px 25px -5px ${card.color}66`
            : '0 10px 20px -5px rgba(0,0,0,0.6)',
        }}
        animate={{ rotateY: isVisible ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* ===================== CARD BACK ===================== */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden border-2 ${equippedSkinStyle} backface-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            borderColor: card.isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.6)',
            background: 'linear-gradient(135deg, #0f172a 0%, #030712 100%)',
          }}
        >
          {/* Inner Bevel Frame */}
          <div className="absolute inset-1.5 rounded-xl border border-cyan-400/25 pointer-events-none shadow-[inset_0_0_10px_rgba(0,255,255,0.1)]" />

          {!card.isDark && (
            <>
              {/* Foil Shimmer */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 65%)',
                }}
              />
              <div className="w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center bg-slate-900/50">
                <span className="text-xl opacity-40 select-none text-purple-300">✦</span>
              </div>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60 shadow-[0_0_4px_#00ffff]" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60 shadow-[0_0_4px_#b026ff]" />
            </>
          )}
          {card.isDark && (
            <div className="w-4 h-4 rounded-full border border-purple-500 opacity-60 animate-pulse" />
          )}
        </div>

        {/* ===================== CARD FRONT ===================== */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center overflow-hidden border-2 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: card.isBomb
              ? 'linear-gradient(145deg, #2b0808 0%, #120303 100%)'
              : card.isGlitch
              ? 'linear-gradient(145deg, #100b33 0%, #06041a 100%)'
              : `linear-gradient(145deg, #131b2e 0%, #080d1a 100%)`,
            borderColor: card.isBomb ? '#ef4444' : card.isGlitch ? '#a855f7' : card.color,
            boxShadow: `0 0 20px ${card.isBomb ? 'rgba(239,68,68,0.5)' : card.isGlitch ? 'rgba(168,85,247,0.5)' : card.color + '44'}, inset 0 0 20px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Inner Foil Sheen */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${card.isBomb ? '#ef4444' : card.color}33, transparent 70%)`,
            }}
          />

          {/* Inner Metallic Frame */}
          <div className="absolute inset-1.5 rounded-xl border border-white/10 pointer-events-none" />

          {card.isBomb ? (
            <div className="flex flex-col items-center gap-1 relative z-10">
              <Bomb size={36} className="text-red-500" style={{ filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.8))' }} />
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">¡BOMBA!</span>
            </div>
          ) : card.isGlitch ? (
            <div className="flex flex-col items-center gap-1 relative z-10">
              <Zap size={36} className="text-purple-400 animate-bounce" style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.8))' }} />
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">GLITCH</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 relative z-10">
              <span
                className="text-4xl sm:text-5xl select-none"
                style={{
                  filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.9)) drop-shadow(0 0 10px ${card.color}66)`,
                }}
              >
                {card.emoji}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider font-mono"
                style={{ color: card.color }}
              >
                {card.symbol}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
