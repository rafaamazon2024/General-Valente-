import { Check, PlayCircle, Moon, Trophy, AlertTriangle } from 'lucide-react';
import { useExercicios } from '../../hooks/useExercicios';
import { useTreinoHoje } from '../../hooks/useTreinoHoje';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function TreinoHoje() {
  const { exercicios, loading: loadingExercicios, error: errorExercicios, retry: retryExercicios } = useExercicios();
  const { log, loading: loadingLog, error: errorLog, retry: retryLog, grupos, toggleExercicio } = useTreinoHoje();

  const loading = loadingExercicios || loadingLog;
  const error = errorExercicios || errorLog;
  const hoje = new Date();
  const isDescanso = grupos.length === 0;
  const exerciciosDoDia = exercicios.filter(e => grupos.includes(e.grupo_muscular));
  const feitos = log?.exercicios_feitos || [];
  const completo = exerciciosDoDia.length > 0 && exerciciosDoDia.every(e => feitos.includes(e.id));

  if (loading) {
    return <div className="py-12 text-center text-gray-500 font-mono text-[14px] uppercase tracking-widest">Carregando_Treino...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
        <AlertTriangle size={32} className="text-red-500" />
        <p className="text-[14px] font-mono font-bold uppercase tracking-widest text-red-500">Erro ao carregar treino</p>
        <button
          onClick={() => { retryExercicios(); retryLog(); }}
          className="mt-2 px-5 py-2 rounded-xl text-[12px] font-mono font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (isDescanso) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-black/10 rounded-2xl bg-white/50">
        <Moon size={40} className="text-[#10b981] mb-4" />
        <p className="text-[15px] font-bold text-gray-700">{DIAS[hoje.getDay()]} — Dia de Descanso</p>
        <p className="text-[13px] font-mono text-gray-500 mt-2 uppercase tracking-widest">Aproveite pra recuperar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-6">
        <p className="text-[13px] font-mono text-gray-500 uppercase tracking-widest">{DIAS[hoje.getDay()]}</p>
        <h3 className="text-xl font-bold text-gray-700 mt-1">{grupos.join(' + ')}</h3>
        <p className="text-[13px] font-mono text-gray-500 mt-2">
          {feitos.filter(id => exerciciosDoDia.some(e => e.id === id)).length}/{exerciciosDoDia.length} exercícios feitos
        </p>
        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#10b981] transition-all duration-500"
            style={{ width: exerciciosDoDia.length ? `${(feitos.filter(id => exerciciosDoDia.some(e => e.id === id)).length / exerciciosDoDia.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {completo && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10">
          <Trophy size={18} className="text-[#10b981]" />
          <p className="text-[13px] font-mono font-bold uppercase tracking-widest text-[#10b981]">Treino de Hoje Concluído! 🎉</p>
        </div>
      )}

      <div className="space-y-3">
        {exerciciosDoDia.map(ex => {
          const isDone = feitos.includes(ex.id);
          return (
            <div key={ex.id} className="flex items-center gap-4 bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-4">
              <button
                onClick={() => toggleExercicio(ex.id, exerciciosDoDia.map(e => e.id))}
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-[#10b981] text-white' : 'bg-black/5 border border-black/10 text-transparent hover:border-[#10b981]/50'}`}
              >
                <Check size={16} strokeWidth={3} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-bold ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{ex.nome}</p>
                <span className="text-[12px] font-mono text-gray-500 uppercase tracking-widest">{ex.grupo_muscular}</span>
              </div>
              {ex.link_video ? (
                <a href={ex.link_video} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[12px] font-mono font-bold text-[#10b981] uppercase tracking-widest shrink-0 transition-all">
                  <PlayCircle size={14} /> Ver Vídeo
                </a>
              ) : (
                <span className="text-[12px] font-mono text-gray-400 uppercase tracking-widest shrink-0">Vídeo Pendente</span>
              )}
            </div>
          );
        })}
        {exerciciosDoDia.length === 0 && (
          <div className="py-12 text-center text-gray-500 font-mono text-[14px] uppercase tracking-widest border border-dashed border-black/10 rounded-2xl">
            NENHUM_EXERCÍCIO_CADASTRADO_PARA_{grupos.join('_').toUpperCase().replace(/\//g, '_')}
          </div>
        )}
      </div>
    </div>
  );
}
