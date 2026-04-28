import React, { useState } from 'react';

interface RegisterScreenProps {
  onLoginRedirect?: () => void;
  onRegisterSuccess?: (email: string) => void;
}

export function RegisterScreen({ onLoginRedirect, onRegisterSuccess }: RegisterScreenProps) {
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [heroName, setHeroName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!heroName || !email || !password) {
      setError('Por favor llena todos los campos vitales');
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setStep('code');
    alert(`📧 Secuencia de confirmación enviada a ${email}\n🔐 Código: ${randomCode}\n\n(En producción, esto llegaría a tu enlace neural)`);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code === generatedCode) {
      if (onRegisterSuccess) onRegisterSuccess(email);
    } else {
      setError('Código neural incorrecto. Intenta de nuevo.');
    }
  };

  return (
    <div className="font-['Plus_Jakarta_Sans'] bg-[#0c0e16] min-h-[max(884px,100dvh)] text-[#ededf9] antialiased flex flex-col relative overflow-x-hidden">
      {/* Estilos dinámicos extraídos del head */}
      <style>{`
        .bg-plasma { background: linear-gradient(135deg, #33d8fb 0%, #c180ff 100%); }
        .text-plasma {
          background: linear-gradient(135deg, #33d8fb 0%, #c180ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-card {
          backdrop-filter: blur(40px);
          background: rgba(34, 37, 49, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .star-particle { position: absolute; background: white; border-radius: 50%; pointer-events: none; }
        .neon-glow { box-shadow: 0 0 20px rgba(51, 216, 251, 0.3); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {/* Partículas de fondo & Brillo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-[#33d8fb]/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#c180ff]/5 rounded-full blur-[100px]"></div>

        {/* Estrellas sintéticas */}
        <div className="star-particle opacity-20 w-1 h-1 top-[10%] left-[15%] animate-pulse"></div>
        <div className="star-particle opacity-40 w-[2px] h-[2px] top-[40%] left-[80%]"></div>
        <div className="star-particle opacity-10 w-1 h-1 top-[70%] left-[30%]"></div>
        <div className="star-particle opacity-30 w-[1.5px] h-[1.5px] top-[20%] left-[60%] animate-pulse"></div>
        <div className="star-particle opacity-50 w-1 h-1 top-[85%] left-[75%]"></div>
        <div className="star-particle opacity-20 w-[2px] h-[2px] top-[5%] left-[90%]"></div>
        <div className="star-particle opacity-40 w-[1px] h-[1px] top-[55%] left-[10%]"></div>
      </div>

      {/* Barra de navegación superior */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-cyan-900/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#33d8fb]" translate="no">account_tree</span>
          <div className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#33d8fb] to-[#c180ff] drop-shadow-[0_0_8px_rgba(51,216,251,0.6)]">
            MEMORIZE
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border border-[#33d8fb]/30 overflow-hidden">
          <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo6M9Jaerbh8TmiY6hQED4TVRksFwdlLnEJdjI7tgGzzBhV6WuC6Oy2VwofDMWpavM6l2JsZsJU9NIONHmJdu-_-wB-3GLJ2wGjv656PpX4VACrVHW5p6x5Dqcp_8tBJIOg_wyo60H8gDyCqGMGPY01kctvQTjdEb8yTee2BcoV4TdORQKHyp7CYgpjoJRIw1jpQyB61fUzB-KAAhjrvOQlO-QW52WV8zBE2Nz64ftJrp_y8_3FoyCRrWEszx8jvwc3c3mS7bc3Yw"/>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md relative">
          
          {/* Encabezado */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-black tracking-widest text-plasma drop-shadow-[0_0_15px_rgba(51,216,251,0.4)] mb-2">
                MEMORIZE
            </h1>
            <h2 className="text-xl font-bold tracking-[0.3em] text-[#aaaab6]/80 uppercase">
                EVOLUTIVO
            </h2>
            <p className="text-[#aaaab6]/60 font-medium tracking-wide uppercase text-[0.7rem] mt-4">
                Comienza tu Evolución
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Brillo interior suave */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-[#33d8fb]/5 to-transparent pointer-events-none"></div>
            
            {step === 'form' ? (
              <>
                {/* Formulario de registro */}
                <form className="space-y-6 relative z-10" onSubmit={handleSendCode}>
                  
                  {/* User ID / Hero Name */}
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#33d8fb]/80 ml-1">User ID / Hero Name</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab6]/50 group-focus-within:text-[#33d8fb] transition-colors" translate="no">person_search</span>
                      <input 
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                        className="w-full bg-black/30 border border-[#464751]/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-[#33d8fb]/50 focus:border-[#33d8fb] outline-none transition-all placeholder:text-[#aaaab6]/30" 
                        placeholder="Escribe tu alias..." 
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Neural Link / Email */}
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#33d8fb]/80 ml-1">Neural Link / Email</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab6]/50 group-focus-within:text-[#33d8fb] transition-colors" translate="no">alternate_email</span>
                      <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/30 border border-[#464751]/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-[#33d8fb]/50 focus:border-[#33d8fb] outline-none transition-all placeholder:text-[#aaaab6]/30" 
                        placeholder="vinculo@neural.com" 
                        type="email"
                      />
                    </div>
                  </div>k

                  {/* Neural Key / Password */}
                  <div className="space-y-2">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#33d8fb]/80 ml-1">Neural Key / Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab6]/50 group-focus-within:text-[#33d8fb] transition-colors" translate="no">lock_open</span>
                      <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/30 border border-[#464751]/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-[#33d8fb]/50 focus:border-[#33d8fb] outline-none transition-all placeholder:text-[#aaaab6]/30" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}

                  {/* Botón CTA */}
                  <button className="w-full py-5 rounded-2xl bg-plasma text-white font-extrabold uppercase tracking-[0.2em] text-sm neon-glow active:scale-95 transition-all duration-200 mt-4 shadow-lg shadow-[#33d8fb]/20" type="submit">
                    INICIAR SECUENCIA
                  </button>
                </form>

                {/* Separador */}
                <div className="flex items-center my-8 relative z-10">
                  <div className="flex-grow h-px bg-white/10"></div>
                  <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-[#aaaab6]/40">O vincular con</span>
                  <div className="flex-grow h-px bg-white/10"></div>
                </div>

                {/* Redes Sociales */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdya9BpcYlpfeDC8o13Dmf-wCKyijyGUW3NdypLg-nRECzg3TH1UVMhv80UMMl6f_CQXWwcT7Jv5sPkgVb0IC7-QctOsw46lv3PVJGzCDggIq0pX1pxAZlW-fCPP3XuQ4xGvpbXaqWxVxiSC7BQILXooMkO-p9rPaJXiwafW0IamZwfEv1FfRjjI37iggYUP0JR7dPpS_EASJ5p9BbCwN9HY0kr-j5zxsasePpviF9uIh2__tKOvVK3qVlMVHKUSeLbdzkhZvAVOo"/>
                    <span className="text-[10px] font-bold tracking-widest text-white">GOOGLE</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-white text-xl" translate="no">apple</span>
                    <span className="text-[10px] font-bold tracking-widest text-white">APPLE ID</span>
                  </button>
                </div>

                {/* Enlace al login */}
                <div className="mt-10 text-center relative z-10">
                  <p className="text-[#aaaab6]/70 text-xs">
                    ¿Ya tienes una cuenta? 
                    <button 
                      type="button" 
                      onClick={onLoginRedirect} 
                      className="text-[#33d8fb] font-bold ml-1 hover:text-[#c180ff] transition-colors uppercase tracking-widest text-[11px]"
                    >
                      Inicia Sesión
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Formulario de Validación de Código */}
                <form className="space-y-6 relative z-10" onSubmit={handleVerifyCode}>
                  <div className="text-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-[#c180ff] drop-shadow-[0_0_10px_rgba(193,128,255,0.8)] mb-2" translate="no">verified_user</span>
                    <h3 className="text-lg font-bold tracking-[0.2em] text-[#ededf9] uppercase">Verifica tu origen</h3>
                    <p className="text-[0.65rem] text-[#aaaab6]/70 uppercase tracking-widest mt-2 px-4">
                      Secuencia de confirmación enviada a <br/><span className="text-[#33d8fb]">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#c180ff]/80 ml-1">Decodificador Neural</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab6]/50 group-focus-within:text-[#c180ff] transition-colors" translate="no">dialpad</span>
                      <input 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-black/30 border border-[#464751]/30 rounded-2xl py-4 pl-12 pr-4 text-center text-xl tracking-[0.5em] font-mono text-white focus:ring-2 focus:ring-[#c180ff]/50 focus:border-[#c180ff] outline-none transition-all placeholder:text-[#aaaab6]/30" 
                        placeholder="000000" 
                        type="text"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}

                  {/* Botón CTA Confirmar */}
                  <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#c180ff] to-[#33d8fb] text-white font-extrabold uppercase tracking-[0.2em] text-sm neon-glow active:scale-95 transition-all duration-200 mt-4 shadow-lg shadow-[#c180ff]/20" type="submit">
                    CONFIRMAR VÍNCULO
                  </button>

                  <div className="mt-6 text-center">
                    <button 
                      type="button" 
                      onClick={() => setStep('form')} 
                      className="text-[#aaaab6]/70 hover:text-[#ededf9] transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 mx-auto"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      Regresar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Textura de fondo (estrellas) */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDka1aYM9_D4okRFySQiSRk7GZOtL707YmZ8VFhBItAzCWnhDqnPirCNT7Uz2LVBHg2KRZrkYgkR-uawxuq2oKbBJnqE0DVPYBDqHXp4imLmjRx-SYauLTiJAcjnxlbCmcpiUXugfPxZ_D4UrrAe-6KQWRMwYzHluEvOXSToT1AxAkmfODUDVvAOfQoMjxwCEXb0GUnnc7YuWL00rEbe7JqYorVN6dYlGO7PRMOcmYrNfK3GayOa_ycUQqHQJ5vi2EJFKa6IwMuY50')" }}></div>
    </div>
  );
}
