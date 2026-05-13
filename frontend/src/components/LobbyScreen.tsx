import React, { useState } from 'react';
import {
  Hexagon, Mail, Users, Settings, ChevronRight, Boxes, InfinityIcon,
  Target, Skull, CreditCard, Triangle, Box, Clock, Gamepad2, Zap,
  Sparkles, Shield, Gem, Network, Archive, Settings2
} from 'lucide-react';

export function LobbyScreen({ onStartClassic, onLogout }: { onStartClassic: () => void, onLogout: () => void }) {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="font-rajdhani bg-lobby min-h-screen text-gray-300 flex flex-col overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        
        .font-rajdhani {
          font-family: 'Rajdhani', sans-serif;
        }
        
        .bg-lobby {
          background-image: url('/fonlobby.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .glass-panel {
          background: rgba(10, 15, 30, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .neon-text-cyan {
          color: #00ffff;
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }

        .neon-text-purple {
          color: #b026ff;
          text-shadow: 0 0 5px rgba(176, 38, 255, 0.5);
        }

        .neon-border-cyan {
          border-color: #00ffff;
          box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.2), 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .neon-border-purple {
          border-color: #b026ff;
          box-shadow: inset 0 0 10px rgba(176, 38, 255, 0.2), 0 0 10px rgba(176, 38, 255, 0.2);
        }

        .clip-path-hex {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        .clip-path-button {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        
        .nav-link {
          position: relative;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #b026ff;
          box-shadow: 0 0 5px #b026ff;
        }

        .progress-bar {
          background: linear-gradient(90deg, #b026ff 0%, #00ffff 100%);
        }
      `}</style>

      {/* BEGIN: Top Navigation */}
      <header className="flex justify-between items-center px-8 py-4 z-10 glass-panel border-b-0 sticky top-0">
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-white">M E M O R I Z E</h1>
          <nav className="flex gap-8 text-sm font-semibold tracking-wider uppercase">
            <a className="nav-link active text-white hover:text-white transition-colors cursor-pointer">Lobby</a>
            <a className="nav-link text-gray-400 hover:text-white transition-colors cursor-pointer">Evolución</a>
            <a className="nav-link text-gray-400 hover:text-white transition-colors cursor-pointer">Tienda</a>
            <a className="nav-link text-gray-400 hover:text-white transition-colors cursor-pointer">Ranked</a>
            <a className="nav-link text-gray-400 hover:text-white transition-colors cursor-pointer">Perfil</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1">
              <Hexagon className="w-4 h-4 text-cyan-400" />
              <span className="text-white">12,540</span>
            </div>
            <div className="flex items-center gap-1">
              <Hexagon className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span className="text-white">2,350</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Mail className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <div className="relative">
              <Users className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border border-black"></span>
            </div>
            <Settings className="w-5 h-5 hover:text-white cursor-pointer transition-colors" onClick={() => setShowSettings(true)} />
          </div>
        </div>
      </header>
      {/* END: Top Navigation */}

      {/* BEGIN: Main Content */}
      <main className="flex-grow grid grid-cols-12 gap-6 p-8 relative overflow-hidden">

        {/* BEGIN: Left Panel */}
        <div className="col-span-3 flex flex-col gap-6 z-10">

          {/* User Profile Card */}
          <div className="glass-panel rounded-lg p-5 relative border border-purple-500/30">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-full border-2 neon-border-cyan p-1">
                <img alt="User Avatar" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8M7nQSaF3HtkRN8jafA06uJgrZKNZj4q3CZ-dBiKt4Pmzk7NUjmRvd_eyuvBz5eP1QCfNpQQ_RHP5Q42sVghfZBdMkHT5FIdqV937sW5zf8A3v944vCBuTIdUTehcAQ0FXl5s_ErQoA9mm3VataX_FodvyVHTm0zO4irf1bUPbfNxVfrVOZfS2mHzy3_NCuQoNz9FSHRjjhpMlYFF5MbOGTvQQf-DjzCWtIX9zTGE8FNDdP_GMUns3_m4FB1YmoCMl3Tqo_ywupE" />
                <div className="absolute -bottom-2 -left-2 bg-[#1a1a2e] border border-cyan-500 text-xs px-2 py-0.5 rounded-full clip-path-hex neon-text-cyan font-bold flex items-center justify-center">37</div>
              </div>
              <div className="flex-grow">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">User ID</p>
                <h2 className="text-xl font-bold text-white mb-0.5">NeuroLinker</h2>
                <p className="text-xs text-gray-500 mb-2">ID: MNZ-7845</p>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">8,450 / 15,000</span>
                  <span className="text-cyan-400">XP</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full progress-bar w-[56%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="glass-panel rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 text-purple-400">
              <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Rango Actual</p>
              <h3 className="text-lg font-bold text-white">Neural Adept</h3>
            </div>
          </div>

          {/* Stats Card */}
          <div className="glass-panel rounded-lg p-5 flex-grow">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Estadísticas Neurales</h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 text-cyan-500/50 flex-shrink-0">
                <svg className="w-full h-full opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                </svg>
              </div>
              <div className="flex-grow flex flex-col gap-3 justify-center">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase">Memoria</span>
                  <span className="text-white">92%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden -mt-1"><div className="h-full bg-cyan-400 w-[92%]"></div></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase">Velocidad</span>
                  <span className="text-white">88%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden -mt-1"><div className="h-full bg-cyan-400 w-[88%]"></div></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase">Precisión</span>
                  <span className="text-white">95%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden -mt-1"><div className="h-full bg-cyan-400 w-[95%]"></div></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase">Reflejos</span>
                  <span className="text-white">90%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden -mt-1"><div className="h-full bg-cyan-400 w-[90%]"></div></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase">Sincronización</span>
                  <span className="text-white">83%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden -mt-1"><div className="h-full bg-purple-500 w-[83%]"></div></div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartClassic}
            className="mt-auto relative group overflow-hidden rounded-xl clip-path-button bg-gradient-to-r from-purple-600/80 to-blue-600/80 p-[1px] border border-cyan-400/50 hover:border-cyan-400 transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-[#0a0a1a]/80 backdrop-blur-sm p-6 flex justify-between items-center clip-path-button group-hover:bg-transparent transition-colors">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wider mb-1">INICIAR SECUENCIA</h2>
                <p className="text-sm text-cyan-200/70">Comienza tu evolución</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#0a0a1a] transition-all">
                <ChevronRight />
              </div>
            </div>
          </button>
        </div>
        {/* END: Left Panel */}

        {/* BEGIN: Center Panel (Modes & Character) */}
        <div className="col-span-6 flex flex-col justify-center items-start z-10 relative pl-4">

          {/* Game Modes */}
          <div className="flex flex-col gap-3 w-64 mt-20">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Modo de Juego</h3>

            <div
              onClick={onStartClassic}
              className="glass-panel border-purple-500/50 bg-purple-900/20 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-purple-900/40 transition-colors relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-10 h-10 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <h4 className="text-white font-bold text-sm">CLÁSICO</h4>
                <p className="text-[10px] text-gray-400">Encuentra los pares</p>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400">
                <InfinityIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-gray-300 font-bold text-sm">INFINITO</h4>
                <p className="text-[10px] text-gray-500">Aguanta el tiempo</p>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-gray-300 font-bold text-sm">DESAFÍO</h4>
                <p className="text-[10px] text-gray-500">Misiones especiales</p>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-gray-300 font-bold text-sm">BOSS BATTLE</h4>
                <p className="text-[10px] text-gray-500">Enfrenta a la IA</p>
              </div>
            </div>
          </div>

          {/* Season Pass Card */}
          <div className="absolute right-0 top-1/4 w-56 glass-panel rounded-xl p-5 text-center border-cyan-500/30">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Temporada 1</h4>
            <h3 className="text-sm font-bold text-cyan-400 tracking-wider mb-4">ORIGEN NEURAL</h3>
            <div className="w-20 h-20 mx-auto mb-4 text-cyan-400">
              <svg className="w-full h-full drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path d="M12 2l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" fill="rgba(0,255,255,0.1)"></path>
              </svg>
            </div>
            <p className="text-xs font-bold text-white mb-1">NIVEL 27</p>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>350 / 1,000</span>
              <span>1,000</span>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-cyan-400 w-[35%] rounded-full"></div>
            </div>
            <p className="text-[10px] uppercase text-gray-500 mb-2">Recompensa Nivel 30</p>
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-gray-800/80 border border-gray-700 flex items-center justify-center"><CreditCard className="w-4 h-4 text-blue-400" /></div>
              <div className="w-8 h-8 rounded bg-gray-800/80 border border-gray-700 flex items-center justify-center"><Triangle className="w-4 h-4 text-purple-400" /></div>
              <div className="w-8 h-8 rounded bg-gray-800/80 border border-gray-700 flex items-center justify-center"><Box className="w-4 h-4 text-purple-600" /></div>
            </div>
            <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded text-xs font-bold text-white transition-colors">VER PASE</button>
          </div>
        </div>
        {/* END: Center Panel */}

        {/* BEGIN: Right Panel */}
        <div className="col-span-3 flex flex-col gap-4 z-10">

          {/* Daily Missions */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Misiones Diarias</h3>
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 12:45:30
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-cyan-500/50 flex items-center justify-center text-cyan-400"><Gamepad2 className="w-4 h-4" /></div>
                <div className="flex-grow">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Juega 3 partidas</span>
                    <span className="text-cyan-400">2/3</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 w-[66%]"></div></div>
                  <div className="text-[10px] text-cyan-400/70 text-right mt-0.5">+200 XP</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-purple-500/50 flex items-center justify-center text-purple-400"><Zap className="w-4 h-4" /></div>
                <div className="flex-grow">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Consigue 10 combos</span>
                    <span className="text-cyan-400">2/10</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 w-[20%]"></div></div>
                  <div className="text-[10px] text-cyan-400/70 text-right mt-0.5">+250 XP</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-pink-500/50 flex items-center justify-center text-pink-400"><Sparkles className="w-4 h-4" /></div>
                <div className="flex-grow">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Usa 2 habilidades</span>
                    <span className="text-cyan-400">1/2</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 w-[50%]"></div></div>
                  <div className="text-[10px] text-cyan-400/70 text-right mt-0.5">+150 XP</div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded text-xs font-bold text-white transition-colors">VER TODAS</button>
          </div>

          {/* Friends Online */}
          <div className="glass-panel rounded-xl p-4 flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Amigos en Línea</h3>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative">
                    <img alt="Friend" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDLlSxEVocDdTWst_0OSBmqFoLvlHOoQvdu4kFZ9Oj8H_4qQ6nM3eHE9LcagqLI0Rab3dbeHL7_hQgqlXRyHNCrLZbXupNn_nhuqF5uk1MbTcfyNDLBzAeF_Fgxs438UEEM5kW3SAikY1U4Gti-Ofier5z4hYXPfKuwsKxDjAnBeQFUTqfqHsfDpSvRYN7UTXhs8FVmGYR_az88PTvgAHtYevieCsAbls6Kn8o82DJgOkUi6EUvXQgoRaPc3_pacqAoD8O9Wh3WRI" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Synaptic07</span>
                </div>
                <span className="text-[10px] text-green-400">En partida</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative">
                    <img alt="Friend" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGa1WSSGaJ-wS6Ix0H6PHjvs8pOQWTmXWnfZEVk1UpXrMX7fVCRNXbgvFMvGmWsgPCeh5bl5yDIwIvuMDJ74Sht9LdqivVcIUs1Mt4DhkBWA9tmWMBudNAK3E2mwHWy65ahliiOL6d_ZCtfNTXi24422eTY0_HBgAVoAyAWJo688B5Am2nXZK9R-U_R6o7NjkAL4O2K9Dqffyzjqhb4M0KrM63bAhOBNBBhZSXodER0D5MZSqXVAtf3YHVnehF5dycQ4qauBoMYc8" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">MindCatcher</span>
                </div>
                <span className="text-[10px] text-green-400">En lobby</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative">
                    <img alt="Friend" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFhylNkQZeH_AxZUWCJwmISizFfbPnUxf1pdLHeSTdzkWwtUkCrB-jICQpRAsP2HjT5Xn_GEeyrqLCbDi1-Wrio1lq6eMAl9l0-YxIGz4Vad0MLlhwMF961naomoJ3vUgJVolwJ6Xd_UuYiBSCH0pONSPtXtkS5bYGuFiUaHeSRKwvbDD_qIfa9OhQlE2__krBxHy97qcybLFEq5HgHNDL9vTczkZWNw--RQQ7jkk1zHd_Q7lwKgfAJRUPNATZF_o5MDvutQTUPlw" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">NeuroHunter</span>
                </div>
                <span className="text-[10px] text-green-400">En partida</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative">
                    <img alt="Friend" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoRGK5ZZLcgJITWmwlgnPnOyyTLb2LNVuZtPG_49kHLm8_0zqrOLIUDskn1vVDACQjOnwfQ-WG8vntLOQ9ARbU_U7tSPgI5nRzhrJY2zjl5QR-9c6BRITBl4QMq2dlycOZmZa7uxzyL2YG_kQq_CkUZsaynxb4KiTECc7H5EQeETo61wV-whBGBygMDk-mEhHUUtBeXTM_q31cb5A5jyWbxvUqdSy4mk2E_QaOONGCTZZ6zt0TYLBd4HwuTuSKzq16UWOBzDEgAUM" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-500 rounded-full border border-gray-800"></div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">BrainWave</span>
                </div>
                <span className="text-[10px] text-purple-400">En desafío</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded text-xs font-bold text-gray-300 transition-colors">VER TODOS</button>
          </div>

          {/* Top Neural Rank */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Top Neural Rank</h3>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-bold w-4 text-center">1</span>
                  <span className="text-white">NeuroKing</span>
                </div>
                <span className="text-gray-400">12,540</span>
              </div>
              <div className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-bold w-4 text-center">2</span>
                  <span className="text-gray-300">MemoryGod</span>
                </div>
                <span className="text-gray-400">11,200</span>
              </div>
              <div className="flex justify-between items-center p-1 rounded bg-orange-500/10 border border-orange-500/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-bold w-4 text-center">3</span>
                  <span className="text-orange-200">BrainStorm</span>
                </div>
                <span className="text-orange-400">10,870</span>
              </div>
              <div className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-bold w-4 text-center">4</span>
                  <span className="text-gray-300">Synaptic07</span>
                </div>
                <span className="text-gray-400">9,560</span>
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded text-[10px] font-bold text-gray-300 transition-colors uppercase tracking-wider">Ver Ranking Completo</button>
          </div>
        </div>
        {/* END: Right Panel */}

      </main>
      {/* END: Main Content */}

      {/* BEGIN: Bottom Navigation */}
      <footer className="flex justify-center items-center gap-8 py-6 z-10 relative mt-auto">
        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="w-14 h-14 rounded-lg glass-panel border-purple-500/50 flex items-center justify-center group-hover:bg-purple-900/30 transition-all relative">
            <div className="absolute inset-0 border border-purple-400 rounded-lg scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-purple-300 transition-colors tracking-wider">Arsenal Neural</span>
        </div>

        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="w-14 h-14 rounded-lg glass-panel border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-900/30 transition-all relative">
            <div className="absolute inset-0 border border-cyan-400 rounded-lg scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
            <Gem className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-cyan-300 transition-colors tracking-wider">Habilidades</span>
        </div>

        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="w-14 h-14 rounded-lg glass-panel border-blue-500/50 flex items-center justify-center group-hover:bg-blue-900/30 transition-all relative">
            <div className="absolute inset-0 border border-blue-400 rounded-lg scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>
            <Network className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-blue-300 transition-colors tracking-wider">Árbol Neural</span>
        </div>

        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="w-14 h-14 rounded-lg glass-panel flex items-center justify-center group-hover:bg-white/5 transition-all">
            <Archive className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-gray-300 transition-colors tracking-wider">Archivos</span>
        </div>

        <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setShowSettings(true)}>
          <div className="w-14 h-14 rounded-lg glass-panel flex items-center justify-center group-hover:bg-white/5 transition-all">
            <Settings2 className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-gray-300 transition-colors tracking-wider">Ajustes</span>
        </div>

        {/* Footer Status info */}
        <div className="absolute bottom-4 left-8 text-[10px] text-gray-500 flex gap-4 uppercase font-semibold">
          <span>Región: Automática</span>
          <span>Ping: 24ms</span>
        </div>
      </footer>
      {/* END: Bottom Navigation */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="glass-panel border border-amber-500/40 rounded-xl w-full max-w-md p-6 relative flex flex-col gap-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] bg-[#0a0a10]/95">
            <div className="flex justify-between items-center border-b border-amber-900/50 pb-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 tracking-widest uppercase flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-amber-400" />
                Ajustes Sistema
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-amber-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Audio Settings */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span> Audio
                </h3>
                <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-lg border border-amber-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Volumen General</span>
                    <input type="range" defaultValue={80} className="w-1/2 accent-amber-500 cursor-pointer" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Música de Fondo</span>
                    <input type="range" defaultValue={60} className="w-1/2 accent-yellow-500 cursor-pointer" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Efectos de Sonido</span>
                    <input type="range" defaultValue={90} className="w-1/2 accent-amber-400 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.5)]"></span> Sistema
                </h3>
                <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-lg border border-amber-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Calidad Gráfica</span>
                    <select className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-amber-500 transition-colors">
                      <option>Ultra</option>
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baja</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Idioma</span>
                    <select className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-amber-500 transition-colors">
                      <option>Español</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Account / Session */}
              <div className="pt-2">
                <button 
                  onClick={onLogout}
                  className="w-full py-3 bg-gradient-to-r from-red-900/40 to-red-800/40 hover:from-red-900/60 hover:to-red-800/60 border border-red-500/50 hover:border-red-400 rounded text-sm font-bold text-red-400 hover:text-red-300 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                >
                  Desconectar Enlace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
