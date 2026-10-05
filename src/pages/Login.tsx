import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Lock, LogIn, Mail, User } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { CapaceteImg } from '../valente/ui/Capacete';
import TemaToggle from '../valente/ui/TemaToggle';

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
      if (mode === 'login') await loginWithEmail(email, password);
      else await registerWithEmail(email, password, name);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setError('E-mail ou senha incorretos.');
      else if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
      else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else setError('Ocorreu um erro. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Campo = ({ label, icon: Icon, ...props }: { label: string; icon: React.ComponentType<{ size?: number; className?: string }> } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className="rotulo">{label}</span>
      <span className="relative block mt-1">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input {...props} style={{ paddingLeft: 38 }} />
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4"><TemaToggle /></div>
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30" style={{ background: 'var(--color-deep)' }} />
      <div className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--color-cyan)' }} />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center text-center mb-8">
          <CapaceteImg altura={120} className="mb-3" />
          <span className="block text-[11px] tracking-[0.4em] text-mute font-mono">GENERAL</span>
          <h1 className="text-3xl font-bold tracking-[0.14em] mt-1">VALENTE</h1>
          <p className="rotulo mt-3">Disciplina constrói liberdade.</p>
        </div>

        <div className="painel p-6">
          {mode === 'initial' ? (
            <div className="space-y-3">
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-cyan font-semibold cursor-pointer hover:brightness-110 transition rotulo"
                style={{ color: 'var(--color-on-accent)' }}
              >
                <LogIn size={16} />Entrar com Google
              </button>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-line" /><span className="rotulo">ou</span><div className="h-px flex-1 bg-line" />
              </div>
              <button onClick={() => setMode('login')} className="w-full py-3 border border-line2 rounded-sm rotulo text-ink hover:border-cyan hover:text-cyan cursor-pointer transition-colors">
                Acessar com e-mail
              </button>
              <button onClick={() => setMode('register')} className="w-full py-2 rotulo hover:text-cyan cursor-pointer transition-colors">
                Não tem conta? Crie agora
              </button>
            </div>
          ) : (
            <div>
              <button onClick={() => { setMode('initial'); setError(null); }} className="flex items-center gap-2 rotulo mb-5 cursor-pointer hover:text-cyan">
                <ArrowLeft size={14} />Voltar
              </button>
              <h2 className="text-xl font-semibold mb-4">{mode === 'login' ? 'Identificação' : 'Criar conta'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <Campo label="Nome" icon={User} type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado?" />
                )}
                <Campo label="E-mail" icon={Mail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                <Campo label="Senha" icon={Lock} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                {error && (
                  <p className="text-sm rounded-sm px-3 py-2 border" style={{ color: 'var(--color-bad)', borderColor: 'color-mix(in srgb, var(--color-bad) 40%, transparent)' }}>{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-sm bg-cyan font-semibold cursor-pointer hover:brightness-110 disabled:opacity-50 transition rotulo mt-2"
                  style={{ color: 'var(--color-on-accent)' }}
                >
                  {isSubmitting ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} className="w-full mt-4 rotulo hover:text-cyan cursor-pointer transition-colors">
                {mode === 'login' ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          )}

          {isMobile && isIframe && mode === 'initial' && (
            <div className="mt-5 p-3 border border-line2 rounded-sm flex gap-3">
              <ExternalLink className="text-warn shrink-0" size={16} />
              <p className="text-xs text-mute leading-relaxed">Se o login Google não abrir, use a opção de e-mail ou abra o app em uma nova aba.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
