import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Lock, Star, Shield, Zap } from 'lucide-react';

interface ClassicLevelSelectProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
  unlockedLevels?: number;
}

export function ClassicLevelSelect({ onSelectLevel, onBack, unlockedLevels = 10 }: ClassicLevelSelectProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalLevels = 10;

  const nextLevel = () => {
    setCurrentIndex((prev) => (prev + 1) % totalLevels);
  };

  const prevLevel = () => {
    setCurrentIndex((prev) => (prev - 1 + totalLevels) % totalLevels);
  };

  const currentLevelNumber = currentIndex + 1;
  const isUnlocked = currentLevelNumber <= unlockedLevels;

  return (
    <div className="min-h-screen bg-[#050214] font-rajdhani text-gray-300 flex flex-col items-center justify-center relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        .glass-panel {
          background: rgba(10, 15, 30, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .neon-text-purple {
          color: #b026ff;
          text-shadow: 0 0 10px rgba(176, 38, 255, 0.6);
        }
        .neon-text-cyan {
          color: #00ffff;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/fonlobby.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
      </div>

      {/* Header */}
      <div className="w-full p-4 md:p-6 flex justify-between items-center z-20 max-w-5xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-bold tracking-widest uppercase text-xs md:text-sm hidden sm:inline">Volver</span>
        </button>
        <div className="glass-panel px-4 md:px-6 py-1.5 md:py-2 rounded-full border-cyan-500/30">
          <h1 className="text-sm md:text-xl font-bold tracking-[0.2em] uppercase neon-text-cyan">SELECCIÓN DE NIVEL</h1>
        </div>
        <div className="w-9 sm:w-24" /> {/* Spacer */}
      </div>

      {/* Level Carousel */}
      <div className="relative w-full max-w-4xl h-[460px] md:h-[500px] flex items-center justify-center z-10 perspective-1000 my-auto">
        
        <button 
          onClick={prevLevel}
          className="absolute left-2 sm:left-6 md:left-10 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full glass-panel flex items-center justify-center text-purple-400 hover:text-white hover:border-purple-400 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div className="relative w-[280px] sm:w-[340px] h-[420px] sm:h-[460px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, x: -50, scale: 0.9, rotateY: -15 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="absolute w-full h-full"
            >
              <div className={`w-full h-full rounded-2xl glass-panel relative overflow-hidden flex flex-col ${isUnlocked ? 'border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'border-gray-800/50 opacity-80'}`}>
                
                {/* Number Watermark */}
                <div className="absolute -top-10 -right-10 text-[180px] sm:text-[200px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                  {currentLevelNumber}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex flex-col h-full relative z-10 justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-purple-900/40 border border-purple-500/30 px-3 py-1 rounded text-xs font-bold tracking-widest text-purple-300">
                        CLÁSICO
                      </div>
                      {!isUnlocked && <Lock className="w-6 h-6 text-red-400" />}
                    </div>

                    <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-1">
                      NIVEL {currentLevelNumber}
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm mb-4">
                      {currentLevelNumber <= 4 ? 'Entrenamiento Básico' : 
                       currentLevelNumber <= 8 ? 'Desafío Intermedio' : 
                       currentLevelNumber <= 12 ? 'Simulación Avanzada' : 'Pesadilla Neural'}
                    </p>

                    <div className="space-y-2.5 sm:space-y-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400"/> Pares</span>
                        <span className="text-white font-bold">{Math.min(4 + currentLevelNumber, 14)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Tiempo Límite</span>
                        <span className="text-white font-bold">{Math.max(120 - (currentLevelNumber - 1) * 8, 40)}s</span>
                      </div>
                      {currentLevelNumber >= 3 && currentLevelNumber <= 5 && (
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-400 flex items-center gap-2"><Star className="w-4 h-4 text-purple-400"/> Efecto</span>
                          <span className="text-purple-400 font-bold">Glitch</span>
                        </div>
                      )}
                      {currentLevelNumber >= 4 && (
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-400 flex items-center gap-2"><Star className="w-4 h-4 text-red-400"/> Peligro</span>
                          <span className="text-red-400 font-bold">Bombas</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => isUnlocked && onSelectLevel(currentLevelNumber)}
                    disabled={!isUnlocked}
                    className={`w-full py-3.5 sm:py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 mt-4 ${
                      isUnlocked 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>INICIAR <Play className="w-5 h-5 fill-current" /></>
                    ) : (
                      <>BLOQUEADO</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button 
          onClick={nextLevel}
          className="absolute right-2 sm:right-6 md:right-10 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full glass-panel flex items-center justify-center text-purple-400 hover:text-white hover:border-purple-400 transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>

      </div>


      {/* Level Indicators */}
      <div className="absolute bottom-10 flex gap-2 z-20 max-w-2xl flex-wrap justify-center px-4">
        {Array.from({ length: totalLevels }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentIndex 
                ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)] scale-125' 
                : i < unlockedLevels 
                  ? 'bg-purple-900/50 hover:bg-purple-500/50' 
                  : 'bg-gray-800/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
