import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarClock, CheckCircle2, Circle, AlertCircle, RotateCw, Pencil, Plus, ExternalLink, X, Trash2 } from 'lucide-react';
import {
  CATEGORIA_META,
  DIAS_ORDEM,
  DIA_LABEL,
  diaDaSemana,
  duracaoMin,
  formatarDuracao,
  minutos,
  type BlocoRotina,
  type CategoriaRotina,
  type DiaSemana,
} from '../config/rotinaSeed';
import { FRENTES, FRENTES_POR_ID } from '../config/frentesSeed';
import { useRotinaHoje } from '../hooks/useRotinaHoje';
import { useRotinaConfig } from '../hooks/useRotinaConfig';

type Aba = 'hoje' | 'semana';

export default function Rotina({ onNavigate }: { onNavigate: (area: string) => void }) {
  const [aba, setAba] = useState<Aba>('hoje');
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(() => diaDaSemana());
  const [agoraMin, setAgoraMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const hoje = diaDaSemana();
  const { feitos, toggleBloco, loading, error, retry } = useRotinaHoje();
  const { blocos: rotina, upsertBloco, removeBloco } = useRotinaConfig();
  const [editing, setEditing] = useState<BlocoRotina | null>(null);

  // Atualiza o marcador "agora" a cada minuto.
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setAgoraMin(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const blocos = useMemo(() => rotina.filter((b) => b.dias.includes(diaSelecionado)).sort((a, b) => a.inicio.localeCompare(b.inicio)), [rotina, diaSelecionado]);
  const alocacao = useMemo(() => blocos.reduce<Record<string, number>>((acc, b) => ({ ...acc, [b.frenteId]: (acc[b.frenteId] || 0) + duracaoMin(b) }), {}), [blocos]);

  const emAndamento = diaSelecionado === hoje ? blocos.find((b) => {
    const ini = minutos(b.inicio); const fim = minutos(b.fim);
    return fim > ini ? agoraMin >= ini && agoraMin < fim : agoraMin >= ini || agoraMin < fim;
  }) || null : null;
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
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing({ id: `bloco_${Date.now()}`, titulo: '', inicio: '08:00', fim: '09:00', dias: [diaSelecionado], categoria: 'estudo', frenteId: 'carreira', nota: '' })} className="flex items-center gap-2 rounded-xl bg-[#d97706] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm"><Plus size={16} /> Novo bloco</button>
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
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-black/10"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                />
              </svg>
            </div>
          </div>
        )}</div>
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
              aba === a
                ? 'bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {a === 'hoje' ? 'Hoje' : 'Semana'}
          </button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-[13px] font-mono text-red-700 flex-1">
            Não foi possível carregar o check-in de hoje.
          </p>
          <button
            onClick={retry}
            className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-red-700 hover:text-red-900"
          >
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
            const passou =
              editavel &&
              !error &&
              !loading &&
              !agora &&
              minutos(b.fim) <= agoraMin &&
              minutos(b.fim) > minutos(b.inicio);
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
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: meta.cor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`font-bold text-[14px] ${feito ? 'text-gray-400 line-through' : 'text-[#14120d]'}`}
                    >
                      {b.titulo}
                    </p>
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      style={{
                        color: meta.cor,
                        borderColor: `${meta.cor}40`,
                        backgroundColor: `${meta.cor}10`,
                      }}
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
                  {FRENTES_POR_ID[b.frenteId] && (
                    <p
                      className="font-mono text-[11px] mt-1.5 uppercase tracking-widest"
                      style={{ color: FRENTES_POR_ID[b.frenteId].cor }}
                    >
                      Alimenta {FRENTES_POR_ID[b.frenteId].nome}
                    </p>
                  )}
                  <p className="font-mono text-[11px] text-gray-400 mt-1.5 uppercase tracking-widest">
                    {formatarDuracao(duracaoMin(b))}
                    {passou && !feito && <span className="text-red-500 ml-2">• não marcado</span>}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(FRENTES_POR_ID[b.frenteId]?.areaId || 'dashboard')}
                  title="Abrir área"
                  className="shrink-0 mt-0.5 text-gray-300 hover:text-[#0e7490]"
                >
                  <ExternalLink size={20} />
                </button>
                <button onClick={() => setEditing({ ...b, dias: [...b.dias] })} title="Editar bloco" className="shrink-0 mt-0.5 text-gray-300 hover:text-[#d97706]"><Pencil size={20} /></button>
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
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={async (event) => { event.preventDefault(); await upsertBloco(editing); setEditing(null); }} className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#d97706]">Agenda recorrente</p><h3 className="mt-1 text-2xl font-black">Editar bloco</h3></div><button type="button" onClick={() => setEditing(null)} className="rounded-xl p-2 hover:bg-black/5"><X /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-xs font-bold text-gray-600">Atividade<input required value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#d97706]" /></label>
              <label className="text-xs font-bold text-gray-600">Início<input type="time" required value={editing.inicio} onChange={(e) => setEditing({ ...editing, inicio: e.target.value })} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm" /></label>
              <label className="text-xs font-bold text-gray-600">Fim<input type="time" required value={editing.fim} onChange={(e) => setEditing({ ...editing, fim: e.target.value })} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm" /></label>
              <label className="text-xs font-bold text-gray-600">Área<select value={editing.frenteId} onChange={(e) => setEditing({ ...editing, frenteId: e.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm">{FRENTES.filter(f => f.tipo === 'entrada').map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></label>
              <label className="text-xs font-bold text-gray-600">Categoria<select value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value as CategoriaRotina })} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm">{Object.entries(CATEGORIA_META).map(([id, meta]) => <option key={id} value={id}>{meta.label}</option>)}</select></label>
              <fieldset className="sm:col-span-2"><legend className="mb-2 text-xs font-bold text-gray-600">Repete nos dias</legend><div className="flex flex-wrap gap-2">{DIAS_ORDEM.map((dia) => <button type="button" key={dia} onClick={() => setEditing({ ...editing, dias: editing.dias.includes(dia) ? editing.dias.filter(d => d !== dia) : [...editing.dias, dia] })} className={`rounded-xl border px-3 py-2 text-xs font-black ${editing.dias.includes(dia) ? 'border-[#d97706] bg-[#d97706]/10 text-[#d97706]' : 'border-black/10 text-gray-400'}`}>{DIA_LABEL[dia]}</button>)}</div></fieldset>
              <label className="sm:col-span-2 text-xs font-bold text-gray-600">O que farei neste horário<textarea rows={3} value={editing.nota} onChange={(e) => setEditing({ ...editing, nota: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-black/10 p-3 text-sm" /></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={async () => { if (confirm('Remover este bloco recorrente da agenda?')) { await removeBloco(editing.id); setEditing(null); } }} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50"><Trash2 size={16} /> Remover</button>
              <button type="submit" disabled={!editing.dias.length} className="rounded-xl bg-[#14120d] px-6 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-30">Salvar na agenda</button>
            </div>
          </form>
        </div>
      )}
      {/* Frentes alimentadas neste dia */}
      <div className="bg-white/60 border border-black/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="text-[12px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            Frentes_Alimentadas — {DIA_LABEL[diaSelecionado]}
          </h3>
        </div>
        <ul className="divide-y divide-black/5">
          {FRENTES.map((f) => {
            const min = alocacao[f.id] || 0;
            const semTempo = min === 0 && f.tipo === 'entrada';
            return (
              <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.cor }} />
                <span
                  className={`font-mono text-[12px] uppercase tracking-widest flex-1 min-w-0 truncate ${semTempo ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  {f.nome}
                </span>
                <span className="font-mono text-[11px] text-gray-400 shrink-0">
                  partida {f.notaPartida}/10
                </span>
                {semTempo ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                    Sem tempo
                  </span>
                ) : min === 0 ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 border border-black/10 px-2 py-0.5 rounded-full shrink-0">
                    Conquista
                  </span>
                ) : (
                  <span className="font-mono text-[12px] font-bold text-[#14120d] shrink-0 w-16 text-right">
                    {formatarDuracao(min)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
