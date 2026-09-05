import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Lock, Sparkles, X } from 'lucide-react';
import { getCollection, type CollectionItem } from '../lib/questAndCollectionSystem';

import { soundSystem } from '../lib/soundSystem';

interface CollectionScreenProps {
  onBack: () => void;
}

export function CollectionScreen({ onBack }: CollectionScreenProps) {
  const [items] = useState<CollectionItem[]>(getCollection());
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  const handleSelectItem = (item: CollectionItem) => {
    soundSystem.playCardFlip();
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-4 md:p-8 flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-semibold transition"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>

        <div className="flex items-center gap-3 bg-indigo-900/40 border border-indigo-500/30 px-6 py-2 rounded-2xl backdrop-blur-md">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span className="text-xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
            ÁLBUM DE ARTEFACTOS Y LORE
          </span>
        </div>

        <div className="text-sm font-mono text-cyan-300 font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          {items.filter((i) => i.isUnlocked).length} / {items.length} DESBLOQUEADOS
        </div>
      </div>

      {/* Grid of Collectibles */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 z-10 my-auto">
        {items.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => handleSelectItem(item)}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-[3/4] rounded-2xl border-2 p-4 flex flex-col items-center justify-between cursor-pointer relative overflow-hidden backdrop-blur-md transition-all ${
              item.isUnlocked
                ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900/90 border-amber-400/50 shadow-xl shadow-amber-500/10'
                : 'bg-slate-900/40 border-white/10 opacity-50 grayscale'
            }`}
          >
            <div className="w-full flex justify-between items-center text-xs">
              <span className={`font-black uppercase tracking-wider ${item.category === 'mítico' ? 'text-amber-400' : 'text-purple-400'}`}>
                {item.category}
              </span>
              {item.isUnlocked ? <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> : <Lock className="w-4 h-4 text-gray-500" />}
            </div>

            <div className="text-6xl my-auto select-none">{item.isUnlocked ? item.symbol : '❓'}</div>

            <div className="w-full text-center">
              <h4 className="font-bold text-xs text-white truncate">{item.isUnlocked ? item.title : '???'}</h4>
              <p className="text-[10px] text-gray-400">{item.isUnlocked ? 'Toca para leer Lore' : 'Bloqueado'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Item Detail Lore Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-center relative shadow-2xl overflow-hidden"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>

              <div className="text-8xl mb-4 select-none animate-bounce">{selectedItem.isUnlocked ? selectedItem.symbol : '🔒'}</div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full bg-amber-400/10 inline-block mb-3">
                {selectedItem.category}
              </span>

              <h3 className="text-2xl font-black text-white mb-3">{selectedItem.isUnlocked ? selectedItem.title : 'Artefacto Misterioso'}</h3>

              <p className="text-sm text-gray-300 leading-relaxed italic bg-white/5 border border-white/10 p-4 rounded-2xl mb-4">
                "{selectedItem.isUnlocked ? selectedItem.lore : 'Gana partidas en Modo Boss o Desafío para revelar el lore histórico de esta reliquia.'}"
              </p>

              {selectedItem.isUnlocked && selectedItem.unlockedAt && (
                <div className="text-xs text-gray-400 font-mono">Desbloqueado el: {selectedItem.unlockedAt}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
