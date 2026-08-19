import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarClock, CheckCircle2, Circle, AlertCircle, RotateCw } from 'lucide-react';
import {
  ROTINA,
  CATEGORIA_META,
  DIAS_ORDEM,
  DIA_LABEL,
  blocoAgora,
  blocosDoDia,
  diaDaSemana,
  duracaoMin,
  formatarDuracao,
  minutos,
  type DiaSemana,
} from '../config/rotinaSeed';
import { useRotinaHoje } from '../hooks/useRotinaHoje';

type Aba = 'hoje' | 'semana';

export default function Rotina() {
  const [aba, setAba] = useState<Aba>('hoje');
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(() => diaDaSemana());
  const [agoraMin, setAgoraMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const hoje = diaDaSemana();
  const { feitos, toggleBloco, loading, error, retry } = useRotinaHoje();

  // Atualiza o marcador "agora" a cada minuto.
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setAgoraMin(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const blocos = useMemo(() => blocosDoDia(diaSelecionado), [diaSelecionado]);
  const emAndamento = diaSelecionado === hoje ? blocoAgora(hoje, agoraMin) : null;
  const editavel = diaSelecionado === hoje;

  const totalMin = blocos.reduce((acc, b) => acc + duracaoMin(b), 0);
  const feitosDoDia = blocos.filter((b) => feitos.includes(b.id)).length;
  const pct = blocos.length ? Math.round((feitosDoDia / blocos.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center">
            <CalendarClock size={22} className="text-[#d97706]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#14120d] uppercase">Rotina</h2>
            <p className="text-[13px] font-mono text-gray-500 uppercase tracking-widest mt-1">
              Blocos_Fixos_Do_Dia
            </p>
          </div>
        </div>

        {editavel && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[12px] font-mono text-gray-500 uppercase tracking-widest">Cumpridos_Hoje</p>
              <p className="text-lg font-mono font-bold text-[#14120d]">
                {feitosDoDia}/{blocos.length}
                <span className="text-[#d97706] ml-2">{pct}%</span>
              </p>
            </div>
            <div className="w-16 h-16 relative shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Abas */}
      <div className="inline-flex bg-white/60 border border-black/10 rounded-xl p-1 gap-1">
        {(['hoje', 'semana'] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAba(a);
              if (a === 'hoje') setDiaSelecionado(hoje);
            }}
            className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors ${
              aba === a ? 'bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {a === 'hoje' ? 'Hoje' : 'Semana'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-[13px] font-mono text-red-700 flex-1">Não foi possível carregar o check-in de hoje.</p>
          <button onClick={retry} className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-red-700 hover:text-red-900">
            <RotateCw size={14} /> Tentar de novo
          </button>
        </div>
      )}

      {aba === 'semana' && (
        <div className="flex flex-wrap gap-2">
          {DIAS_ORDEM.map((d) => (
            <button
              key={d}
              onClick={() => setDiaSelecionado(d)}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest border transition-colors ${
                diaSelecionado === d
                  ? 'bg-black/5 text-[#14120d] border-black/10'
                  : 'text-gray-500 border-transparent hover:bg-black/5'
              }`}
            >
              {DIA_LABEL[d]}
              {d === hoje && <span className="ml-2 text-[#d97706]">•</span>}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white/60 border border-black/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            {DIA_LABEL[diaSelecionado]} — {blocos.length} blocos
          </h3>
          <span className="text-[12px] font-mono text-gray-500">{formatarDuracao(totalMin)} mapeadas</span>
        </div>

        <ul className="divide-y divide-black/5">
          {blocos.map((b) => {
            const meta = CATEGORIA_META[b.categoria];
            const feito = feitos.includes(b.id);
            const agora = emAndamento?.id === b.id;
            const passou = editavel && !agora && minutos(b.fim) <= agoraMin && minutos(b.fim) > minutos(b.inicio);

            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${agora ? 'bg-[#d97706]/5' : ''}`}
              >
                <div className="w-20 shrink-0 pt-0.5">
                  <p className="font-mono text-[13px] font-bold text-[#14120d]">{b.inicio}</p>
                  <p className="font-mono text-[11px] text-gray-400">{b.fim}</p>
                </div>

                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: meta.cor }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-[14px] ${feito ? 'text-gray-400 line-through' : 'text-[#14120d]'}`}>
                      {b.titulo}
                    </p>
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      style={{ color: meta.cor, borderColor: `${meta.cor}40`, backgroundColor: `${meta.cor}10` }}
                    >
                      {meta.label}
                    </span>
                    {agora && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#d97706] border border-[#d97706]/30 bg-[#d97706]/10 px-2 py-0.5 rounded-full">
                        Agora
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{b.nota}</p>
                  <p className="font-mono text-[11px] text-gray-400 mt-1.5 uppercase tracking-widest">
                    {formatarDuracao(duracaoMin(b))}
                    {passou && !feito && <span className="text-red-500 ml-2">• não marcado</span>}
                  </p>
                </div>

                <button
                  onClick={() => editavel && toggleBloco(b.id)}
                  disabled={!editavel || loading}
                  title={editavel ? 'Marcar como cumprido' : 'Check-in só no dia de hoje'}
                  className={`shrink-0 mt-0.5 transition-colors ${
                    editavel ? 'hover:text-[#d97706] cursor-pointer' : 'opacity-30 cursor-not-allowed'
                  } ${feito ? 'text-[#0B8043]' : 'text-gray-300'}`}
                >
                  {feito ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORIA_META).map(([id, meta]) => {
          const min = ROTINA.filter((b) => b.categoria === id && b.dias.includes(diaSelecionado)).reduce(
            (acc, b) => acc + duracaoMin(b),
            0
          );
          if (!min) return null;
          return (
            <div key={id} className="flex items-center gap-2 bg-white/60 border border-black/10 rounded-lg px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.cor }} />
              <span className="font-mono text-[11px] uppercase tracking-widest text-gray-600">{meta.label}</span>
              <span className="font-mono text-[11px] font-bold text-[#14120d]">{formatarDuracao(min)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
