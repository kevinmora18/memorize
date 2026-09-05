import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getEquippedSkinDetails } from '../lib/shopSystem';
import { soundSystem } from '../lib/soundSystem';

interface CardType {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  isBomb?: boolean;
  isBroken?: boolean;
}

interface MemoryCardProps {
  card: CardType;
  index: number;
  glowColor?: string;
  gradient?: string;
  onClick: () => void;
  comboStreak?: number;
}

export function MemoryCard({ card, index, glowColor = '#00ffff', onClick }: MemoryCardProps) {
  const skin = getEquippedSkinDetails();
  const isExploding = card.isBomb && card.isMatched && !card.isBroken;
  const isVisible = card.isFlipped || card.isMatched;

  // 3D Parallax Tilt state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (card.isMatched || card.isBroken) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -16;
    const rY = ((x - centerX) / centerX) * 16;
    setRotateX(rX);
    setRotateY(rY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.55 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const handleClick = () => {
    if (card.isBroken || card.isFlipped || card.isMatched) return;
    soundSystem.playCardFlip();
    onClick();
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0, rotateY: -180 }}
      animate={
        isExploding
          ? { scale: [1, 1.15, 1], x: [-6, 6, -6, 6, 0] }
          : { scale: 1, rotateY: 0 }
      }
      exit={{ scale: 0, opacity: 0 }}
      transition={
        isExploding
          ? { duration: 0.2, repeat: Infinity }
          : { delay: index * 0.04, type: 'spring', stiffness: 220, damping: 18 }
      }
      whileHover={!card.isMatched && !card.isBroken ? { scale: 1.06, y: -6 } : {}}
      whileTap={!card.isMatched && !card.isBroken ? { scale: 0.94 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="aspect-square cursor-pointer select-none relative group"
      style={{
        perspective: 1200,
        opacity: card.isBroken ? 0.35 : 1,
        filter: card.isBroken ? 'grayscale(100%) blur(1px)' : 'none',
      }}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl"
        animate={{
          rotateY: isVisible ? 180 : 0,
          rotateX: isVisible ? 0 : rotateX,
        }}
        transition={{
          rotateY: { duration: 0.55, type: 'spring', stiffness: 240, damping: 20 },
          rotateX: { duration: 0.12, ease: 'easeOut' },
        }}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: card.isMatched
            ? `0 14px 35px -5px ${glowColor}66, 0 0 25px ${glowColor}44`
            : `0 12px 28px -6px rgba(0, 0, 0, 0.8), 0 0 15px ${skin.glowColor}`,
        }}
      >
        {/* ===================== CARD BACK (DORSO CON SKIN REALISTA EQUIPADO) ===================== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            border: `2px solid ${skin.borderColor}`,
            background: skin.bgGradient,
            boxShadow: `inset 0 0 20px rgba(0,0,0,0.8), 0 0 12px ${skin.glowColor}`,
          }}
        >
          {/* Bevel Frame Layer */}
          <div
            className="absolute inset-1.5 rounded-xl pointer-events-none"
            style={{
              border: `1.5px solid ${skin.innerBorder}`,
              boxShadow: `inset 0 0 14px ${skin.glowColor}`,
            }}
          />
          <div className="absolute inset-3 rounded-lg border border-white/10 pointer-events-none" />

          {/* Corner Decorative Gems */}
          <div
            className="absolute top-2 left-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: skin.gemColors.top, boxShadow: `0 0 8px ${skin.gemColors.top}` }}
          />
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: skin.gemColors.bottom, boxShadow: `0 0 8px ${skin.gemColors.bottom}` }}
          />
          <div
            className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: skin.gemColors.bottom, boxShadow: `0 0 8px ${skin.gemColors.bottom}` }}
          />
          <div
            className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: skin.gemColors.top, boxShadow: `0 0 8px ${skin.gemColors.top}` }}
          />

          {/* Dynamic Foil Sheen Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60 mix-blend-color-dodge"
            style={{ background: skin.foilOverlay }}
          />

          {/* Interactive Mouse Glare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.7) 0%, rgba(0,255,255,0.3) 30%, transparent 70%)`,
            }}
          />

          {/* Center Mythic Sigil of the equipped skin */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-black/40 backdrop-blur-md"
              style={{ border: `1.5px solid ${skin.innerBorder}` }}
            >
              <span className="text-2xl select-none" style={{ filter: `drop-shadow(0 0 8px ${skin.gemColors.top})` }}>
                {skin.sigil}
              </span>
            </motion.div>
          </div>
        </div>

        {/* ===================== CARD FRONT (FRENTE VOLTEADO) ===================== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: card.isBomb
              ? '2.5px solid #ef4444'
              : card.isMatched
              ? `2.5px solid ${glowColor}`
              : '2px solid rgba(255, 255, 255, 0.3)',
            background: card.isBomb
              ? 'linear-gradient(145deg, #2b0808 0%, #150303 100%)'
              : `linear-gradient(145deg, #131b2e 0%, #080d1a 100%)`,
            boxShadow: card.isMatched
              ? `inset 0 0 25px ${glowColor}44, 0 0 20px ${glowColor}66`
              : 'inset 0 0 15px rgba(0,0,0,0.6)',
          }}
        >
          {/* Inner Foil Sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${glowColor}20 0%, transparent 60%, rgba(255,255,255,0.1) 100%)`,
            }}
          />

          {/* Holographic Prismatic Glare */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
            style={{
              background: 'linear-gradient(45deg, transparent 40%, rgba(0,255,255,0.15) 50%, rgba(255,0,128,0.15) 55%, transparent 65%)',
            }}
          />

          {/* Inner Metallic Bevel */}
          <div
            className="absolute inset-1.5 rounded-xl pointer-events-none"
            style={{
              border: `1px solid ${card.isMatched ? glowColor + '77' : 'rgba(255,255,255,0.18)'}`,
              boxShadow: card.isMatched ? `inset 0 0 15px ${glowColor}33` : 'inset 0 1px 2px rgba(255,255,255,0.25)',
            }}
          />

          {/* Active Match Pulsing Aura */}
          {card.isMatched && !card.isBomb && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(circle at center, ${glowColor}55 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Center 3D Symbol with Volumetric Drop Shadow */}
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <motion.span
              className="text-5xl sm:text-6xl select-none"
              style={{
                filter: card.isBomb
                  ? 'drop-shadow(0 8px 16px rgba(239, 68, 68, 0.9))'
                  : `drop-shadow(0 12px 20px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 15px ${glowColor}77)`,
              }}
              animate={card.isMatched && !card.isBomb ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {card.symbol}
            </motion.span>
          </div>

          {/* Floating Sparkle Particles on Match */}
          {card.isMatched && !card.isBomb && (
            [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  backgroundColor: glowColor,
                  boxShadow: `0 0 8px ${glowColor}`,
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 6) * 65,
                  y: Math.sin((i * Math.PI * 2) / 6) * 65,
                  opacity: 0,
                  scale: 0.1,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            ))
          )}

          {/* Fire Particles for Exploding Bomb */}
          {isExploding && (
            [...Array(8)].map((_, i) => (
              <motion.div
                key={i + 'bomb'}
                className="absolute text-xl z-20 pointer-events-none select-none"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 160,
                  y: (Math.random() - 0.5) * 160,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.7, repeat: Infinity, delay: Math.random() * 0.3 }}
              >
                🔥
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
