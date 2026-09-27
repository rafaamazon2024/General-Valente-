import { CalendarClock, CheckCircle2, Circle } from 'lucide-react';
import { diaDaSemana } from '../config/rotinaSeed';
import { FRENTES_POR_ID } from '../config/frentesSeed';
import { useRotinaConfig } from '../hooks/useRotinaConfig';
import { useRotinaHoje } from '../hooks/useRotinaHoje';

export default function AreaTodayPlan({ areaId, color }: { areaId: string; color: string }) {
  const { blocos } = useRotinaConfig();
  const { feitos, toggleBloco, loading } = useRotinaHoje();
  const hoje = diaDaSemana();
  const itens = blocos
    .filter((bloco) => bloco.dias.includes(hoje) && FRENTES_POR_ID[bloco.frenteId]?.areaId === areaId)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));

  if (!itens.length) return null;
  const concluidos = itens.filter((item) => feitos.includes(item.id)).length;

  return (
    <section className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-4">
        <div className="flex items-center gap-2"><CalendarClock size={17} style={{ color }} /><h3 className="text-xs font-black uppercase tracking-[0.2em]">Agenda de hoje</h3></div>
        <span className="text-xs font-bold text-gray-500">{concluidos}/{itens.length} concluídos</span>
      </div>
      <div className="divide-y divide-black/5">
        {itens.map((item) => {
          const feito = feitos.includes(item.id);
          return (
            <button key={item.id} onClick={() => toggleBloco(item.id)} disabled={loading} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-black/[0.025] disabled:opacity-50">
              <span className="w-24 shrink-0 font-mono text-xs font-bold text-gray-500">{item.inicio}–{item.fim}</span>
              <span className={`flex-1 text-sm font-bold ${feito ? 'text-gray-400 line-through' : 'text-[#14120d]'}`}>{item.titulo}</span>
              {feito ? <CheckCircle2 size={21} style={{ color }} /> : <Circle size={21} className="text-gray-300" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
