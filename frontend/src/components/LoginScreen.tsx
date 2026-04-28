import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
  onRegisterRedirect?: () => void;
}

export function LoginScreen({ onLoginSuccess, onRegisterRedirect }: LoginScreenProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setStep('code');

    console.log('📧 Código enviado a:', email);
    console.log('🔐 Tu código es:', randomCode);
    alert(`📧 Código enviado a ${email}\n🔐 Código: ${randomCode}\n\n(En producción, esto llegaría a tu email)`);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code === generatedCode) {
      onLoginSuccess(email);
    } else {
      setError('Código incorrecto. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
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
                '0 0 20px rgba(0,255,255,0.5)',
                '0 0 40px rgba(255,0,255,0.5)',
                '0 0 20px rgba(0,255,255,0.5)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-6xl mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MEMORIZE
            </h1>
            <h2 className="text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              EVOLUTIVO
            </h2>
          </motion.div>
          <p className="text-white mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Modo Multijugador
            <Sparkles className="w-4 h-4" />
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
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl text-white">Paso 1 de 2</h3>
                    <p className="text-sm text-white">Ingresa tu email</p>
                  </div>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="text-white w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Enviar código</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Te enviaremos un código de 6 dígitos a tu email
                </p>

                {onRegisterRedirect && (
                  <button
                    type="button"
                    onClick={onRegisterRedirect}
                    className="w-full mt-6 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                  >
                    ¿No tienes cuenta? Regístrate
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl">Paso 2 de 2</h3>
                    <p className="text-sm text-white">Verifica tu código</p>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-400">
                    📧 Código enviado a <span className="font-mono">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Check className="w-5 h-5" />
                    <span>Verificar e iniciar sesión</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-full py-2 text-sm text-gray-300 hover:text-white transition-colors"
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
