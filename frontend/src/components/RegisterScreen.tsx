import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, User } from 'lucide-react';
import { apiPost } from '../lib/api';

interface RegisterScreenProps {
  onLoginRedirect?: () => void;
  onRegisterSuccess?: (user: any, token: string) => void;
}

export function RegisterScreen({ onLoginRedirect, onRegisterSuccess }: RegisterScreenProps) {
  const [heroName, setHeroName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!heroName || !email || !password || !confirmPassword) {
      setError('Por favor llena todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<{ user: any; token: string }>('/api/auth/register', {
        email,
        password,
        username: heroName,
      });
      if (onRegisterSuccess) onRegisterSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
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
      
      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
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
          className="absolute w-96 h-96 rounded-full border-2 border-purple-500/20"
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
          className="absolute w-96 h-96 rounded-full border-2 border-cyan-500/20"
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
            <Sparkles className="w-4 h-4 text-purple-400" />
            Crea tu cuenta
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </p>
        </motion.div>

        <motion.div
          key="form"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl text-white font-bold">Crea tu cuenta</h3>
                <p className="text-sm text-purple-300">Completa tus datos</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-purple-300 mb-2 font-semibold">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="Tu alias"
                  className="text-white w-full px-4 py-4 bg-gray-950/50 border-2 border-purple-500/30 rounded-2xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all placeholder:text-gray-500"
                />
              </div>

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

              <div>
                <label className="block text-sm text-purple-300 mb-2 font-semibold">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="text-white w-full px-4 py-4 bg-gray-950/50 border-2 border-purple-500/30 rounded-2xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-purple-300 mb-2 font-semibold">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>

            {onLoginRedirect && (
              <button
                type="button"
                onClick={onLoginRedirect}
                className="w-full mt-6 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest font-semibold"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}