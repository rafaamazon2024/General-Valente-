import { ShieldAlert } from 'lucide-react';

interface PunishmentBannerProps {
  active: boolean;
}

export function PunishmentBanner({ active }: PunishmentBannerProps) {
  if (!active) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex items-center gap-4">
      <ShieldAlert className="text-red-500 shrink-0" size={28} />
      <div>
        <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Sistema_Comprometido</p>
        <p className="text-xs text-gray-300 mt-1">
          3 dias seguidos sem cumprir a missão zeraram seu streak e pontuação. Reinicie sua disciplina.
        </p>
      </div>
    </div>
  );
}
