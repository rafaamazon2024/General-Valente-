import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, LogIn, Target, ShieldCheck, Zap, ExternalLink, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login, loginWithEmail, registerWithEmail, isMobile } = useAuth();
  const [mode, setMode] = useState<'initial' | 'login' | 'register'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIframe = window.self !== window.top;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Verifique os dados e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d97706]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/60 backdrop-blur-2xl border border-black/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative">

          <AnimatePresence mode="wait">
            {mode === 'initial' ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#d97706] to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#d97706]/20">
                    <Layout size={40} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#14120d] mb-2 tracking-tight">Life Manager</h1>
                  <p className="text-gray-600 text-sm max-w-[280px]">
                    Sua central de produtividade e gestão pessoal com segurança avançada.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-black/5 border border-black/5 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Target size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#14120d] uppercase tracking-widest text-[10px]">Gestão de Metas</h3>
                      <p className="text-xs text-gray-500">Acompanhe seu progresso em tempo real.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-black/5 border border-black/5 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#d97706]/10 flex items-center justify-center shrink-0">
                      <Zap size={20} className="text-[#d97706]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#14120d] uppercase tracking-widest text-[10px]">Habilidades & Hábitos</h3>
                      <p className="text-xs text-gray-500">Construa rotinas sólidas.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={login}
                    className="w-full relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d97706] to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    <div className="relative flex items-center justify-center gap-3 w-full py-4 bg-[#d97706] text-white font-bold rounded-2xl hover:bg-[#c2680a] transition-all">
                      <LogIn size={20} />
                      ENTRAR COM GOOGLE
                    </div>
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px flex-1 bg-black/10" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">OU</span>
                    <div className="h-px flex-1 bg-black/10" />
                  </div>

                  <button
                    onClick={() => setMode('login')}
                    className="w-full py-4 border border-black/10 rounded-2xl text-gray-600 hover:text-[#14120d] hover:bg-black/5 transition-all font-mono text-[10px] uppercase tracking-widest"
                  >
                    ACESSAR COM E-MAIL
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className="w-full py-2 text-gray-500 hover:text-[#d97706] transition-all font-mono text-[9px] uppercase tracking-widest"
                  >
                    NÃO TEM CONTA? CRIE AGORA
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => { setMode('initial'); setError(null); }}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#14120d] transition-all mb-8 group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Voltar</span>
                </button>

                <h2 className="text-2xl font-bold text-[#14120d] mb-2">{mode === 'login' ? 'Identificação' : 'Criar Conta'}</h2>
                <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-mono">
                  {mode === 'login' ? 'SISTEMA_ACESSO_RESTRITO' : 'SISTEMA_REGISTRO_NOVO'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
                          placeholder="Como quer ser chamado?"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest ml-1">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-[#14120d] focus:border-[#d97706] outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-[10px] text-red-600 font-mono uppercase tracking-tight leading-tight">
                        ERRO: {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#d97706] text-white font-bold rounded-2xl hover:bg-[#c2680a] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest text-[11px]"
                  >
                    {isSubmitting ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR_SISTEMA' : 'REGISTRAR_CONTA'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                    className="text-[9px] font-mono text-gray-500 hover:text-[#14120d] uppercase tracking-widest transition-all"
                  >
                    {mode === 'login' ? 'NÃO TEM CONTA? REGISTRE-SE' : 'JÁ TEM CONTA? FAÇA LOGIN'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isMobile && isIframe && mode === 'initial' && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex gap-3">
                <ExternalLink className="text-amber-600 shrink-0" size={16} />
                <p className="text-[10px] text-amber-700 leading-relaxed font-mono uppercase tracking-tight">
                  Se o login Google não abrir, use a opção de <span className="text-amber-700 font-bold">E-mail</span> ou toque em <span className="text-amber-700 font-bold">Abrir em nova aba</span> no topo do AI Studio.
                </p>
              </div>
            </div>
          )}

          <p className="text-center mt-8 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            LIFE_MANAGER_V2.0 // SECURITY_ENABLED
          </p>
        </div>
      </motion.div>
    </div>
  );
}
