import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, BookOpen, Swords, Trophy, Users } from 'lucide-react';
import { soundSystem } from '../lib/soundSystem';

export type BottomNavTab = 'tienda' | 'collection' | 'lobby' | 'ranked' | 'ai-room-lobby';

interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  badges?: {
    tienda?: boolean | string;
    ranked?: boolean | string;
    collection?: boolean | string;
    'ai-room-lobby'?: boolean | string;
  };
}

export function BottomNavigation({ activeTab, onSelectTab, badges = {} }: BottomNavigationProps) {
  const tabs: { id: BottomNavTab; label: string; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }[] = [
    { id: 'tienda', label: 'Tienda', icon: ShoppingBag },
    { id: 'collection', label: 'Álbum', icon: BookOpen },
    { id: 'lobby', label: 'Jugar', icon: Swords, highlight: true },
    { id: 'ranked', label: 'Ranked', icon: Trophy },
    { id: 'ai-room-lobby', label: 'Duelos 1v1', icon: Users },
  ];

  const handleTabClick = (tabId: BottomNavTab) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (err) {}
    }
    soundSystem.playCardFlip();
    onSelectTab(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2.5 pt-1 px-3 sm:px-6 pointer-events-none">
      <nav className="pointer-events-auto max-w-lg w-full bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-1.5 shadow-[0_-10px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(0,255,255,0.15)] flex items-center justify-between relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const hasBadge = badges[tab.id as keyof typeof badges];

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="relative flex flex-col items-center justify-center -top-3.5 cursor-pointer group flex-1"
                aria-label={tab.label}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 text-slate-950 shadow-[0_0_30px_rgba(0,255,255,0.7)] ring-2 ring-cyan-300'
                      : 'bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-[0_0_18px_rgba(0,255,255,0.4)]'
                  }`}
                >
                  <Icon className="w-7 h-7 fill-current" />
                </motion.div>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-1 transition-colors ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {tab.label}
                </span>
                {hasBadge && (
                  <span className="absolute top-0 right-2 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex-1 py-1.5 flex flex-col items-center justify-center cursor-pointer transition-all group"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 bg-cyan-500/15 border border-cyan-400/40 rounded-2xl shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? 'text-cyan-400 scale-110'
                    : 'text-gray-400 group-hover:text-gray-200 group-hover:scale-105'
                }`} />

                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors ${
                  isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'
                }`}>
                  {tab.label}
                </span>
              </div>

              {hasBadge && (
                <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
