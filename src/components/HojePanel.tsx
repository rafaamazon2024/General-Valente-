import React from 'react';
import { CheckSquare, Square, Moon, Dumbbell, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { CONFIG_AREAS } from '../config/areas';
import { GenericRecord } from '../types';
import { useHabitosHoje } from '../hooks/useHabitosHoje';
import { useExercicios } from '../hooks/useExercicios';
import { useTreinoHoje } from '../hooks/useTreinoHoje';
import { todayStr } from '../utils/date';

const DONE_STATUSES = ['Lido', 'Concluído', 'Finalizado', 'Realizado', 'Pago', 'Feito', 'Mestre'];
const DATE_FIELDS = ['prazo', 'deadline', 'data'];

interface HojePanelProps {
  allRecords: GenericRecord[];
  updateRecord: (id: string, record: Partial<GenericRecord>) => Promise<void>;
  onNavigate?: (areaId: string) => void;
}

export default function HojePanel({ allRecords, updateRecord, onNavigate }: HojePanelProps) {
  const { habitosAtivos, feitosHoje, toggleHabito, loading: loadingHabitos, error: errorHabitos, retry: retryHabitos } = useHabitosHoje();
  const { exercicios } = useExercicios();
  const { log: treinoLog, grupos: gruposHoje } = useTreinoHoje();
  const hoje = todayStr();

  const tarefasHoje = allRecords.filter(r => {
    if (DONE_STATUSES.includes(r.data?.status)) return false;
    return DATE_FIELDS.some(field => r.data?.[field] === hoje);
  });

  const desafiosAtivos = allRecords
    .filter(r => r.type === 'desafio')
    .map(r => {
      const { dataInicio, duracao, checkedDays = [] } = r.data || {};
      const dias = Number(duracao) || 30;
      const checked: number[] = Array.isArray(checkedDays) ? checkedDays : [];
      const startDate = dataInicio ? parseISO(dataInicio) : null;
      const todayIndex = startDate ? differenceInCalendarDays(new Date(), startDate) : -1;
      return { record: r, todayIndex, dias, checked, area: CONFIG_AREAS.find(a => a.id === r.area_id) };
    })
    .filter(d => d.todayIndex >= 0 && d.todayIndex < d.dias && !d.checked.includes(d.todayIndex));

  const toggleDesafioHoje = async (item: (typeof desafiosAtivos)[number]) => {
    const novos = [...item.checked, item.todayIndex].sort((a, b) => a - b);
    await updateRecord(String(item.record.id), { data: { ...item.record.data, checkedDays: novos } });
  };

  const isDescanso = gruposHoje.length === 0;
  const exerciciosDoDia = exercicios.filter(e => gruposHoje.includes(e.grupo_muscular));
  const feitosTreino = treinoLog?.exercicios_feitos || [];
  const feitosTreinoHoje = feitosTreino.filter(id => exerciciosDoDia.some(e => e.id === id)).length;
  const treinoCompleto = exerciciosDoDia.length > 0 && feitosTreinoHoje === exerciciosDoDia.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-[#d97706] rounded-full" />
        <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-[#14120d] uppercase">Hoje</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hábitos de hoje */}
        <div className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">Hábitos_De_Hoje</h4>
            <span className="text-[12px] font-mono text-gray-500">{feitosHoje.length}/{habitosAtivos.length}</span>
          </div>

          {loadingHabitos ? (
            <p className="text-[13px] font-mono text-gray-500 uppercase tracking-widest py-4">Carregando...</p>
          ) : errorHabitos ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={16} />
              <p className="text-[13px] font-mono">Erro ao carregar</p>
              <button onClick={retryHabitos} className="text-[13px] font-mono underline">tentar de novo</button>
            </div>
          ) : habitosAtivos.length === 0 ? (
            <p className="text-[13px] font-mono text-gray-500 uppercase tracking-widest py-4">Nenhum hábito ativo cadastrado</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {habitosAtivos.map(h => {
                const feito = feitosHoje.includes(String(h.id));
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabito(String(h.id))}
                    className="w-full flex items-center gap-3 p-3 bg-black/5 rounded-xl border border-black/5 hover:border-black/10 transition-all text-left"
                  >
                    {feito ? <CheckSquare size={18} className="text-[#10b981] shrink-0" /> : <Square size={18} className="text-gray-400 shrink-0" />}
                    <span className={`text-[14px] flex-1 min-w-0 truncate ${feito ? 'text-gray-400 line-through' : 'text-gray-700 font-bold'}`}>{h.data.nome}</span>
                    <span className="text-[12px] font-mono text-gray-500 shrink-0">{h.data.streakAtual || 0}d</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Treino + Desafios */}
        <div className="space-y-4">
          <button
            onClick={() => onNavigate?.('saude')}
            className="w-full text-left bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-5 flex items-center gap-4 hover:border-[#10b981]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
              {isDescanso ? <Moon size={18} className="text-[#10b981]" /> : <Dumbbell size={18} className="text-[#10b981]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">Treino_De_Hoje</p>
              <p className="font-bold text-gray-700 truncate">
                {isDescanso ? 'Dia de Descanso' : `${gruposHoje.join(' + ')} — ${feitosTreinoHoje}/${exerciciosDoDia.length} feitos`}
              </p>
            </div>
            {treinoCompleto && <span className="text-[12px] font-mono font-bold text-[#10b981] uppercase tracking-widest shrink-0">Concluído 🎉</span>}
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>

          {desafiosAtivos.length > 0 && (
            <div className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">Desafios_Ativos</h4>
              {desafiosAtivos.map(item => (
                <div key={String(item.record.id)} className="flex items-center gap-3 p-3 bg-black/5 rounded-xl border border-black/5">
                  <span className="text-lg shrink-0">{item.area?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-700 truncate">{item.record.data.nome}</p>
                    <p className="text-[12px] font-mono text-gray-500 uppercase">Dia {item.todayIndex + 1} de {item.dias}</p>
                  </div>
                  <button
                    onClick={() => toggleDesafioHoje(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#d97706]/10 text-[#d97706] text-[12px] font-mono font-bold uppercase tracking-widest hover:bg-[#d97706]/20 transition-all shrink-0"
                  >
                    Marcar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metas/tarefas com prazo hoje */}
      {tarefasHoje.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flag size={16} className="text-[#0e7490]" />
            <h4 className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">Vence_Hoje</h4>
          </div>
          <div className="space-y-2">
            {tarefasHoje.map((t, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate?.(t.area_id)}
                className="w-full flex items-center gap-3 p-3 bg-black/5 rounded-xl border border-black/5 hover:border-black/10 transition-all text-left"
              >
                <span className="text-lg shrink-0">{CONFIG_AREAS.find(a => a.id === t.area_id)?.icon}</span>
                <span className="text-[14px] font-bold text-gray-700 flex-1 min-w-0 truncate">
                  {t.data.titulo || t.data.nome || t.data.projeto || t.data.item || 'Item'}
                </span>
                <span className="text-[12px] font-mono text-gray-500 uppercase shrink-0">{t.data.status || 'Pendente'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
