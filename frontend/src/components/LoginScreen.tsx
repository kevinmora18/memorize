import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, Check, Shield } from 'lucide-react';
import { apiPost } from '../lib/api';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onRegisterRedirect?: () => void;
}

export function LoginScreen({ onLoginSuccess, onRegisterRedirect }: LoginScreenProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setStep('password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password) {
      setError('Por favor ingresa tu contraseña');
      setLoading(false);
      return;
    }

    try {
      const data = await apiPost<{ user: any; token: string }>('/api/auth/login', {
        email,
        password,
      });
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setError('');
    setLoading(true);

    const guestEmail = `invitado_${Math.floor(Math.random() * 899999 + 100000)}@movil.com`;
    const guestPassword = `g${Date.now().toString(36)}${Math.floor(Math.random() * 100000)}`;

    try {
      // Intentar iniciar sesión (por si la cuenta ya existe), si no, registrarla
      try {
        const data = await apiPost<{ user: any; token: string }>('/api/auth/login', {
          email: guestEmail,
          password: guestPassword,
        });
        onLoginSuccess(data.user, data.token);
        return;
      } catch (loginErr: any) {
        // No existe la cuenta aún -> registrarla
      }

      const data = await apiPost<{ user: any; token: string }>('/api/auth/register', {
        email: guestEmail,
        password: guestPassword,
        username: `Invitado_${Math.floor(Math.random() * 8999 + 1000)}`,
      });
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Error en acceso rápido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/fondosin.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Partículas flotantes optimizadas para móvil y desktop */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}

            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 2, 1],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Círculos de energía */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2 border-cyan-500/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2 border-purple-500/20"
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              textShadow: [
                '0 0 20px rgba(139,92,246,0.6)',
                '0 0 40px rgba(34,211,238,0.6)',
                '0 0 20px rgba(139,92,246,0.6)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-6xl mb-2 font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              MEMORIZE
            </h1>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              EVOLUTIVO
            </h2>
          </motion.div>
          <p className="text-white mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Acceso Neural Seguro
            <Sparkles className="w-4 h-4 text-purple-400" />
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl text-white font-bold">Paso 1 de 2</h3>
                    <p className="text-sm text-purple-300">Ingresa tu email</p>
                  </div>
                </div>

                <form onSubmit={handleNext} className="space-y-5">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2 font-semibold">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="text-white w-full px-4 py-4 bg-gray-950/50 border-2 border-purple-500/30 rounded-2xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all placeholder:text-gray-500"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:via-cyan-500 hover:to-blue-500 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-lg shadow-lg shadow-purple-500/50 disabled:opacity-50"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    disabled={loading}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 border border-cyan-400/40 rounded-2xl text-xs font-black uppercase tracking-wider text-cyan-300 transition disabled:opacity-50"
                  >
                    ⚡ Acceso Rápido como Invitado
                  </button>
                </form>

                {onRegisterRedirect && (
                  <button
                    type="button"
                    onClick={onRegisterRedirect}
                    className="w-full mt-6 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest font-semibold"
                  >
                    ¿No tienes cuenta? Regístrate
                  </button>
                )}
              </div>
            </motion.div>

          ) : (
            <motion.div
              key="password"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl text-white font-bold">Paso 2 de 2</h3>
                    <p className="text-sm text-cyan-300">Ingresa tu contraseña</p>
                  </div>
                </div>

                <div className="mb-5 p-4 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl">
                  <p className="text-sm text-cyan-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Cuenta: <span className="font-mono font-bold">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm text-cyan-300 mb-2 font-semibold">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 bg-gray-950/50 border-2 border-cyan-500/30 rounded-2xl font-mono focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all text-white placeholder:text-gray-600"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-lg shadow-lg shadow-cyan-500/50 text-slate-950 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>{loading ? 'Ingresando...' : 'Iniciar sesión'}</span>
                  </button>


                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    ← Cambiar email
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}