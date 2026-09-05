import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingBag, Sparkles, Lock, Check, CheckCircle2, Star, Zap, Gift, Flame, Box, Shield, Crown, RefreshCw, X, Coins, Gem
} from 'lucide-react';
import { soundSystem } from '../lib/soundSystem';
import { getEquippedItems, type SkinDetails } from '../lib/shopSystem';

interface TiendaScreenProps {
  onBack: () => void;
  userId?: string;
}

type ShopTab = 'offers' | 'skins' | 'frames' | 'bank';

interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: 'coins' | 'gems';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  gradient: string;
  tag?: string;
  category: 'skin' | 'frame' | 'chest';
}

const CARD_SKINS: ShopItem[] = [
  {
    id: 'cyber',
    name: 'Cyber Neón 2077',
    desc: 'Bordes luminosos cian y núcleo cuántico hiperreactivo.',
    price: 800,
    currency: 'coins',
    icon: '⚡',
    rarity: 'rare',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-800',
    category: 'skin',
  },
  {
    id: 'shadow',
    name: 'Obsidiana Sigilosa',
    desc: 'Fibra de carbono con grabados carmesí de lava negra.',
    price: 1500,
    currency: 'coins',
    icon: '⚔️',
    rarity: 'epic',
    gradient: 'from-zinc-900 via-red-950 to-black',
    category: 'skin',
  },
  {
    id: 'galaxy',
    name: 'Nebulosa Cósmica',
    desc: 'Tejido del universo profundo con polvo estelar brillante.',
    price: 60,
    currency: 'gems',
    icon: '🌌',
    rarity: 'legendary',
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    tag: 'POPULAR ⭐',
    category: 'skin',
  },
  {
    id: 'dragon',
    name: 'Escama de Dragón',
    desc: 'Forjada en el corazón volcánico de un dragón ancestral.',
    price: 2400,
    currency: 'coins',
    icon: '🐉',
    rarity: 'epic',
    gradient: 'from-orange-500 via-red-600 to-amber-700',
    category: 'skin',
  },
  {
    id: 'celestial',
    name: 'Luz Celestial',
    desc: 'Mármol sagrado con filigrana dorada y gemas solares.',
    price: 100,
    currency: 'gems',
    icon: '🕊️',
    rarity: 'legendary',
    gradient: 'from-yellow-300 via-amber-400 to-cyan-400',
    tag: 'MÍTICO 👑',
    category: 'skin',
  },
];

const PROFILE_FRAMES: ShopItem[] = [
  {
    id: 'neon_ring',
    name: 'Aura Cuántica',
    desc: 'Anillo de energía rotatoria para tu avatar.',
    price: 600,
    currency: 'coins',
    icon: '💫',
    rarity: 'rare',
    gradient: 'from-cyan-400 to-blue-500',
    category: 'frame',
  },
  {
    id: 'phoenix',
    name: 'Fénix Ardiente',
    desc: 'Llamas míticas doradas que rodean tu rango.',
    price: 45,
    currency: 'gems',
    icon: '🔥',
    rarity: 'legendary',
    gradient: 'from-orange-500 to-red-600',
    tag: 'ÉPICO',
    category: 'frame',
  },
  {
    id: 'crown_gold',
    name: 'Corona Real Dorada',
    desc: 'Marco imperial con diamantes y laureles.',
    price: 80,
    currency: 'gems',
    icon: '👑',
    rarity: 'legendary',
    gradient: 'from-yellow-400 to-amber-500',
    category: 'frame',
  },
];

export function TiendaScreen({ onBack, userId }: TiendaScreenProps) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5175';
  const [activeTab, setActiveTab] = useState<ShopTab>('offers');
  
  const [coins, setCoins] = useState(1500);
  const [gems, setGems] = useState(80);

  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ownedSkins');
      return saved ? JSON.parse(saved) : ['classic'];
    } catch { return ['classic']; }
  });

  const [ownedFrames, setOwnedFrames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ownedFrames');
      return saved ? JSON.parse(saved) : ['basic'];
    } catch { return ['basic']; }
  });

  const [equippedSkin, setEquippedSkin] = useState<string>(() => localStorage.getItem('equippedSkin') || 'classic');
  const [equippedFrame, setEquippedFrame] = useState<string>(() => localStorage.getItem('equippedFrame') || 'basic');

  // Modal de Desbloqueo / Compra Exitosa
  const [purchaseModalItem, setPurchaseModalItem] = useState<{ item: ShopItem; action: 'buy' | 'equip' } | null>(null);

  // Modal de Apertura de Cofre
  const [openingChest, setOpeningChest] = useState<{ name: string; type: 'neon' | 'mythic'; cost: number; currency: 'coins' | 'gems' } | null>(null);
  const [chestReward, setChestReward] = useState<{ coins: number; gems: number; skinName?: string } | null>(null);
  const [isChestOpening, setIsChestOpening] = useState(false);

  // Error toast
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE}/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.coins !== undefined) setCoins(data.coins);
          if (data.gems !== undefined) setGems(data.gems);
        })
        .catch(() => {});
    }
  }, [userId]);

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3000);
  };

  const handleBuyOrEquipItem = (item: ShopItem) => {
    const isSkin = item.category === 'skin';
    const isOwned = isSkin ? ownedSkins.includes(item.id) : ownedFrames.includes(item.id);
    const isEquipped = isSkin ? equippedSkin === item.id : equippedFrame === item.id;

    if (isEquipped) return;

    if (isOwned) {
      // Equipar
      if (isSkin) {
        setEquippedSkin(item.id);
        localStorage.setItem('equippedSkin', item.id);
      } else {
        setEquippedFrame(item.id);
        localStorage.setItem('equippedFrame', item.id);
      }
      soundSystem.playLevelUp();
      setPurchaseModalItem({ item, action: 'equip' });
      return;
    }

    // Comprar
    const hasEnough = item.currency === 'coins' ? coins >= item.price : gems >= item.price;
    if (!hasEnough) {
      showToast(`⚠️ No tienes suficientes ${item.currency === 'coins' ? 'Monedas 🪙' : 'Gemas 💎'}`);
      soundSystem.playComboBreak();
      return;
    }

    // Deduct
    if (item.currency === 'coins') setCoins(prev => prev - item.price);
    else setGems(prev => prev - item.price);

    if (isSkin) {
      const newSkins = [...ownedSkins, item.id];
      setOwnedSkins(newSkins);
      setEquippedSkin(item.id);
      localStorage.setItem('ownedSkins', JSON.stringify(newSkins));
      localStorage.setItem('equippedSkin', item.id);
    } else {
      const newFrames = [...ownedFrames, item.id];
      setOwnedFrames(newFrames);
      setEquippedFrame(item.id);
      localStorage.setItem('ownedFrames', JSON.stringify(newFrames));
      localStorage.setItem('equippedFrame', item.id);
    }

    soundSystem.playVictoryFanfare();
    setPurchaseModalItem({ item, action: 'buy' });
  };

  // Abrir Cofre Misterioso
  const handleOpenChest = (type: 'neon' | 'mythic') => {
    const cost = type === 'neon' ? 500 : 70;
    const currency = type === 'neon' ? 'coins' : 'gems';

    const hasEnough = currency === 'coins' ? coins >= cost : gems >= cost;
    if (!hasEnough) {
      showToast(`⚠️ Requiere ${cost} ${currency === 'coins' ? 'Monedas 🪙' : 'Gemas 💎'}`);
      soundSystem.playComboBreak();
      return;
    }

    if (currency === 'coins') setCoins(prev => prev - cost);
    else setGems(prev => prev - cost);

    setOpeningChest({
      name: type === 'neon' ? 'Cofre Neón Cuántico' : 'Cofre Mítico Imperial',
      type,
      cost,
      currency,
    });
    setIsChestOpening(true);
    setChestReward(null);

    soundSystem.playCardFlip();

    // Animación de apertura de cofre
    setTimeout(() => {
      setIsChestOpening(false);
      const earnedCoins = type === 'neon' ? Math.floor(Math.random() * 400 + 200) : Math.floor(Math.random() * 2000 + 1000);
      const earnedGems = type === 'neon' ? Math.floor(Math.random() * 10 + 5) : Math.floor(Math.random() * 35 + 15);
      
      setCoins(prev => prev + earnedCoins);
      setGems(prev => prev + earnedGems);

      setChestReward({
        coins: earnedCoins,
        gems: earnedGems,
        skinName: type === 'mythic' ? 'Nebulosa Cósmica 🌌' : undefined,
      });

      soundSystem.playLevelUp();
    }, 1800);
  };

  // Canje del Banco de Recursos
  const handleBankExchange = (packCoins: number, gemCost: number) => {
    if (gems < gemCost) {
      showToast('⚠️ No tienes suficientes Gemas 💎 para este paquete.');
      soundSystem.playComboBreak();
      return;
    }
    setGems(prev => prev - gemCost);
    setCoins(prev => prev + packCoins);
    soundSystem.playVictoryFanfare();
  };

  return (
    <div 
      className="font-rajdhani min-h-screen text-white p-3 sm:p-6 flex flex-col relative overflow-y-auto select-none pb-28"
      style={{
        backgroundImage: "url('/fonlobby.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl pointer-events-none" />

      {/* ERROR TOAST */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/95 border-2 border-red-500 text-white px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] font-bold text-xs flex items-center gap-2"
          >
            <span>{errorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER COMPACTO CON WALLET */}
      <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-white/15 rounded-2xl transition text-xs font-bold shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400">
          TIENDA NEURAL
        </h1>

        {/* Live Wallet */}
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/15 rounded-full border border-yellow-500/40 text-yellow-300 shadow-sm">
            <span>💰</span>
            <span>{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/15 rounded-full border border-cyan-500/40 text-cyan-300 shadow-sm">
            <span>💎</span>
            <span>{gems.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl w-full mx-auto space-y-4">

        {/* 1. HERO BANNER: OFERTA DESTACADA DEL DÍA */}
        <section className="bg-gradient-to-r from-purple-950/90 via-slate-900/95 to-indigo-950/90 border-2 border-yellow-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-yellow-500/15 via-pink-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-yellow-400 animate-bounce" /> OFERTA DESTACADA • -40%
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded-full">
                  ⏰ Termina en 14h 22m
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                PACK DRAGÓN VOLCÁNICO 🐉
              </h2>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Desbloquea el diseño de cartas con llamas incandescentes y el marco imperial de fuego ancestral.
              </p>
            </div>

            <button
              onClick={() => handleBuyOrEquipItem(CARD_SKINS[3])}
              className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:from-yellow-300 hover:to-amber-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.5)] transition hover:scale-105 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ownedSkins.includes('dragon') ? 'EQUIPAR AHORA' : 'COMPRAR • 2,400 🪙'}</span>
            </button>
          </div>
        </section>

        {/* 2. PESTAÑAS DE CATEGORÍA DE TIENDA */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
          {[
            { id: 'offers', label: '📦 Cofres & Ofertas' },
            { id: 'skins', label: '🎴 Skins de Cartas' },
            { id: 'frames', label: '🖼️ Marcos de Avatar' },
            { id: 'bank', label: '💎 Banco de Recursos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundSystem.playCardFlip();
                setActiveTab(tab.id as ShopTab);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. CONTENIDO DE LA TIENDA SEGÚN PESTAÑA */}
        <AnimatePresence mode="wait">
          
          {/* PESTAÑA 1: COFRES & CAJAS MISTERIOSAS */}
          {activeTab === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Cofre Neón */}
              <div className="bg-slate-900/90 border-2 border-cyan-400/40 rounded-3xl p-5 flex flex-col justify-between shadow-[0_0_25px_rgba(0,255,255,0.15)] relative overflow-hidden group">
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                  POPULAR
                </span>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      📦
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">Cofre Neón Cuántico</h3>
                      <p className="text-xs text-cyan-300 font-mono">Recompensas Rápidas</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Contiene entre <strong className="text-yellow-300">200 y 600 Monedas 🪙</strong>, Gemas 💎 y probabilidad de cartas raras.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenChest('neon')}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition cursor-pointer"
                >
                  Abrir Cofre • 500 🪙
                </button>
              </div>

              {/* Cofre Mítico */}
              <div className="bg-slate-900/90 border-2 border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden group">
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-400 text-slate-950">
                  MÍTICO 👑
                </span>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      👑
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">Cofre Imperial Legendario</h3>
                      <p className="text-xs text-purple-300 font-mono">Garantía Legendaria</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Contiene hasta <strong className="text-yellow-300">3,000 Monedas 🪙</strong>, 35 Gemas 💎 y la skin mítica <strong className="text-pink-400">Nebulosa Cósmica</strong>.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenChest('mythic')}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)] transition cursor-pointer"
                >
                  Abrir Cofre • 70 💎
                </button>
              </div>
            </motion.div>
          )}

          {/* PESTAÑA 2: SKINS DE CARTAS */}
          {activeTab === 'skins' && (
            <motion.div
              key="skins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5"
            >
              {CARD_SKINS.map((skin) => {
                const isOwned = ownedSkins.includes(skin.id);
                const isEquipped = equippedSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`rounded-3xl p-4 flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
                      isEquipped
                        ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.4)] scale-102 ring-2 ring-cyan-300'
                        : isOwned
                        ? 'bg-slate-900/80 border-emerald-500/40'
                        : 'bg-slate-900/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {skin.tag && (
                      <span className="absolute top-2.5 right-2.5 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 shadow-sm">
                        {skin.tag}
                      </span>
                    )}

                    <div>
                      {/* 3D Card Preview Badge */}
                      <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 border border-white/15 mb-3 flex items-center justify-center relative overflow-hidden shadow-inner group">
                        <div className={`w-16 h-22 rounded-xl bg-gradient-to-br ${skin.gradient} border-2 border-white/30 flex items-center justify-center text-3xl shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                          {skin.icon}
                        </div>
                      </div>

                      <h4 className="text-base font-black text-white uppercase">{skin.name}</h4>
                      <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">{skin.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {isEquipped ? (
                        <div className="w-full py-2 bg-cyan-400 text-slate-950 text-center font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipado
                        </div>
                      ) : isOwned ? (
                        <button
                          onClick={() => handleBuyOrEquipItem(skin)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Equipar Dorso
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyOrEquipItem(skin)}
                          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          Comprar • {skin.price} {skin.currency === 'coins' ? '🪙' : '💎'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* PESTAÑA 3: MARCOS DE AVATAR */}
          {activeTab === 'frames' && (
            <motion.div
              key="frames"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {PROFILE_FRAMES.map((frame) => {
                const isOwned = ownedFrames.includes(frame.id);
                const isEquipped = equippedFrame === frame.id;

                return (
                  <div
                    key={frame.id}
                    className={`rounded-3xl p-5 flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
                      isEquipped
                        ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.4)] scale-102 ring-2 ring-cyan-300'
                        : isOwned
                        ? 'bg-slate-900/80 border-emerald-500/40'
                        : 'bg-slate-900/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      {/* Frame Preview */}
                      <div className="w-20 h-20 mx-auto mb-3 rounded-2xl border-4 border-cyan-400 p-1 flex items-center justify-center shadow-lg relative bg-slate-950">
                        <span className="text-3xl">{frame.icon}</span>
                      </div>

                      <h4 className="text-base font-black text-white uppercase text-center">{frame.name}</h4>
                      <p className="text-xs text-gray-300 mt-1 text-center">{frame.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {isEquipped ? (
                        <div className="w-full py-2 bg-cyan-400 text-slate-950 text-center font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipado
                        </div>
                      ) : isOwned ? (
                        <button
                          onClick={() => handleBuyOrEquipItem(frame)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Equipar Marco
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyOrEquipItem(frame)}
                          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Comprar • {frame.price} {frame.currency === 'coins' ? '🪙' : '💎'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* PESTAÑA 4: BANCO DE RECURSOS */}
          {activeTab === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { coins: 1500, gemCost: 20, tag: 'BÁSICO', bonus: '' },
                { coins: 5000, gemCost: 50, tag: 'POPULAR ⭐', bonus: '+20% Extra' },
                { coins: 15000, gemCost: 120, tag: 'MEJOR VALOR 👑', bonus: '+40% Extra' },
              ].map((pack, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border-2 border-yellow-500/40 rounded-3xl p-5 flex flex-col justify-between shadow-[0_0_25px_rgba(234,179,8,0.15)] relative overflow-hidden"
                >
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950">
                    {pack.tag}
                  </span>

                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-4xl mx-auto mb-3 shadow-md">
                      💰
                    </div>

                    <h4 className="text-xl font-black text-yellow-300 text-center font-mono">
                      +{pack.coins.toLocaleString()} Monedas
                    </h4>
                    {pack.bonus && (
                      <p className="text-xs text-emerald-400 font-bold text-center mt-1">{pack.bonus}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleBankExchange(pack.coins, pack.gemCost)}
                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                  >
                    Canjear • {pack.gemCost} 💎
                  </button>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODAL DE COMPRA / EQUIPAMIENTO EXITOSO (REEMPLAZO DE ALERT()) */}
      <AnimatePresence>
        {purchaseModalItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setPurchaseModalItem(null)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-cyan-400 rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,255,255,0.4)] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl mx-auto shadow-md">
                {purchaseModalItem.item.icon}
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase">
                  {purchaseModalItem.action === 'buy' ? '¡COMPRA EXITOSA!' : '¡EQUIPADO CON ÉXITO!'}
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Has configurado <strong className="text-cyan-300">{purchaseModalItem.item.name}</strong> para tus partidas.
                </p>
              </div>

              <button
                onClick={() => setPurchaseModalItem(null)}
                className="w-full py-3 bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
              >
                Aceptar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE ANIMACIÓN DE APERTURA DE COFRE */}
      <AnimatePresence>
        {openingChest && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/95 border-2 border-yellow-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(234,179,8,0.5)] space-y-5"
            >
              {isChestOpening ? (
                <div className="space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: [-5, 5, -5, 5, 0], scale: [1, 1.15, 1.25, 1.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-7xl filter drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
                  >
                    📦
                  </motion.div>
                  <h3 className="text-xl font-black uppercase text-yellow-300 animate-pulse tracking-wider">
                    ¡ABRIENDO COFRE MISTERIOSO...!
                  </h3>
                </div>
              ) : chestReward ? (
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce">
                    🎉
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase text-yellow-300">
                      ¡RECOMPENSAS DESBLOQUEADAS!
                    </h3>
                    <p className="text-xs text-gray-300">Has obtenido botín épico del cofre</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-white/10">
                    <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-center">
                      <span className="text-xs text-yellow-400 font-bold block">MONEDAS</span>
                      <span className="text-xl font-black text-yellow-300 font-mono">+{chestReward.coins} 🪙</span>
                    </div>

                    <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-center">
                      <span className="text-xs text-cyan-400 font-bold block">GEMAS</span>
                      <span className="text-xl font-black text-cyan-300 font-mono">+{chestReward.gems} 💎</span>
                    </div>
                  </div>

                  {chestReward.skinName && (
                    <div className="p-3 bg-purple-950/60 border border-purple-500/50 rounded-2xl text-xs font-bold text-purple-300">
                      ✨ ¡DESBLOQUEASTE LA SKIN MÍTICA: {chestReward.skinName}!
                    </div>
                  )}

                  <button
                    onClick={() => setOpeningChest(null)}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Reclamar y Continuar
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
