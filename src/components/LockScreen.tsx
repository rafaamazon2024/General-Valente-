import React, { useState } from 'react';
import { Shield, Lock, Unlock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface LockScreenProps {
  onUnlock: () => void;
  userName: string;
}

export default function LockScreen({ onUnlock, userName }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN for the system
    if (pin === '2026') {
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f7f5f0] flex items-center justify-center overflow-hidden">
      <div className="scanline" />

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d97706]/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(217,119,6,0.1)]">
          <Shield size={40} className="text-[#d97706]" />
        </div>

        <h1 className="text-2xl font-mono font-bold text-[#14120d] tracking-tighter uppercase mb-2">
          {userName.toUpperCase().replace(' ', '_')}_OS
        </h1>
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-12">
          SISTEMA_BLOQUEADO
        </p>

        <form onSubmit={handleUnlock} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1">Insira o PIN de Acesso</label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className={`w-full bg-black/5 border ${error ? 'border-red-500/50' : 'border-black/10'} rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] text-[#14120d] focus:outline-none focus:border-[#d97706]/50 transition-all font-mono`}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </div>
            </div>
            {error && (
              <p className="text-[10px] font-mono text-red-600 text-center uppercase tracking-widest animate-pulse">Acesso Negado: PIN Incorreto</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#d97706] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#c2680a] transition-all shadow-[0_0_20px_rgba(217,119,6,0.2)] uppercase tracking-widest text-xs"
          >
            <Unlock size={18} /> Desbloquear Sistema
          </button>
        </form>

        <div className="mt-12 flex items-center gap-4 opacity-40">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-[#d97706]" />
            <span className="text-[8px] font-mono text-[#14120d] uppercase tracking-widest">Encrypted_v2.0</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-500" />
          <span className="text-[8px] font-mono text-[#14120d] uppercase tracking-widest">Core_Active</span>
        </div>

        <p className="mt-8 text-[9px] font-mono text-gray-500 uppercase tracking-widest text-center">
          Dica: O PIN padrão é <span className="text-gray-700">2026</span>
        </p>
      </motion.div>
    </div>
  );
}
