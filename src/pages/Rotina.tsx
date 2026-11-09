import { useEffect, useMemo, useState, type CSSProperties } from 'react';
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
    <div className="routine space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center">
            <CalendarClock size={22} className="text-[var(--routine-accent)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink uppercase">Rotina</h2>
            <p className="text-sm text-mute mt-1">
              Sua agenda, um bloco de cada vez
            </p>
          </div>
        </div>
        <div className="routine-header-actions flex flex-wrap items-center gap-3">
          <button onClick={() => setEditing({ id: `bloco_${Date.now()}`, titulo: '', inicio: '08:00', fim: '09:00', dias: [diaSelecionado], categoria: 'estudo', frenteId: 'carreira', nota: '' })} className="flex items-center gap-2 rounded-xl routine-primary flex-shrink-0 bg-[#f59e0b] px-4 py-3 text-sm font-bold text-[#14120d]"><Plus size={16} /> Novo bloco</button>
        {editavel && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[12px] font-mono text-mute uppercase tracking-widest">Cumpridos hoje</p>
              <p className="text-lg font-mono font-bold text-ink">
                {feitosDoDia}/{blocos.length}
                <span className="text-[var(--routine-accent)] ml-2">{pct}%</span>
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
                  className="text-line2"
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
      <div className="inline-flex bg-panel border border-line rounded-xl p-1 gap-1" aria-label="Visualização da rotina">
        {(['hoje', 'semana'] as Aba[]).map((a) => (
          <button
            key={a}
            aria-pressed={aba === a}
            onClick={() => {
              setAba(a);
              if (a === 'hoje') setDiaSelecionado(hoje);
            }}
            className={`min-h-11 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              aba === a
                ? 'bg-[#d97706]/15 text-[var(--routine-accent)] border border-[#d97706]/60'
                : 'text-mute hover:text-ink'
            }`}
          >
            {a === 'hoje' ? 'Hoje' : 'Semana'}
          </button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-bad shrink-0" />
          <p className="text-[13px] font-mono text-bad flex-1">
            Não foi possível carregar o check-in de hoje.
          </p>
          <button
            onClick={retry}
            className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-bad hover:text-bad"
          >
            <RotateCw size={14} /> Tentar de novo
          </button>
        </div>
      )}
      {aba === 'semana' && (
        <div className="routine-days" aria-label="Dia da semana">
          {DIAS_ORDEM.map((d) => (
            <button
              key={d}
              aria-pressed={diaSelecionado === d}
              onClick={() => setDiaSelecionado(d)}
              className={`min-h-11 px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                diaSelecionado === d
                  ? 'bg-[#d97706]/15 text-[var(--routine-accent)] border-[#d97706]/60'
                  : 'text-mute border-transparent hover:bg-panel2'
              }`}
            >
              {DIA_LABEL[d]}
              {d === hoje && <span className="ml-2 text-[var(--routine-accent)]">•</span>}
            </button>
          ))}
        </div>
      )}
      {/* Timeline */}
      <div className="bg-panel border border-line rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-line flex flex-wrap gap-2 items-center justify-between">
          <h3 className="text-[12px] font-mono font-bold text-mute uppercase tracking-widest">
            {DIA_LABEL[diaSelecionado]} — {blocos.length} blocos
          </h3>
          <span className="text-[12px] font-mono text-mute">{formatarDuracao(totalMin)} mapeadas</span>
        </div>
        <ul className="divide-y divide-line" aria-label="Blocos da rotina">
          {blocos.map((b) => {
            const meta = CATEGORIA_META[b.categoria];
            const feito = editavel && feitos.includes(b.id);
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
                className={`routine-block transition-colors ${agora ? 'bg-[#d97706]/5' : ''}`}
              >
                <div className="routine-time">
                  <p className="font-mono text-sm font-bold text-ink">{b.inicio}</p>
                  <p className="font-mono text-xs text-mute mt-1">{b.fim}</p>
                </div>
                <div
                  className="routine-marker"
                  style={{ backgroundColor: meta.cor }}
                />
                <div className="routine-content">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`font-semibold text-[15px] leading-6 ${feito ? 'text-mute line-through' : 'text-ink'}`}
                    >
                      {b.titulo}
                    </p>
                    <span
                      className="routine-category text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        '--routine-category': meta.cor,
                      } as CSSProperties}
                    >
                      {meta.label}
                    </span>
                    {agora && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--routine-accent)] border border-[#d97706]/30 bg-[#d97706]/10 px-2 py-0.5 rounded-full">
                        Agora
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-mute mt-1 leading-relaxed routine-note">{b.nota}</p>
                  <div className="routine-meta">
                  {FRENTES_POR_ID[b.frenteId] && (
                    <p
                      className="text-xs text-mute"
                    >
                      Alimenta {FRENTES_POR_ID[b.frenteId].nome}
                    </p>
                  )}
                  <p className="font-mono text-xs text-mute">
                    {formatarDuracao(duracaoMin(b))}
                    {passou && !feito && <span className="text-bad ml-2">• não marcado</span>}
                  </p>
                  </div>
                </div>
                <div className="routine-actions">
                <button
                  onClick={() => onNavigate(FRENTES_POR_ID[b.frenteId]?.areaId || 'dashboard')}
                  title="Abrir área"
                  aria-label={`Abrir área de ${b.titulo}`}
                  className="routine-action"
                >
                  <ExternalLink size={20} />
                </button>
                <button onClick={() => setEditing({ ...b, dias: [...b.dias] })} title="Editar bloco" aria-label={`Editar ${b.titulo}`} className="routine-action"><Pencil size={20} /></button>
                <button
                  onClick={() => editavel && toggleBloco(b.id)}
                  disabled={!editavel || loading}
                  title={editavel ? (feito ? 'Desmarcar cumprimento' : 'Marcar como cumprido') : 'Check-in só no dia de hoje'}
                  aria-label={`${feito ? 'Desmarcar' : 'Concluir'} ${b.titulo}`}
                  aria-pressed={feito}
                  className={`routine-action ${feito ? 'routine-action-done' : ''}`}
                >
                  {feito ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form role="dialog" aria-modal="true" aria-label="Editar bloco" onSubmit={async (event) => { event.preventDefault(); await upsertBloco(editing); setEditing(null); }} className="routine-dialog w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-panel border border-line p-5 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--routine-accent)]">Agenda recorrente</p><h3 className="mt-1 text-2xl font-black">Editar bloco</h3></div><button type="button" onClick={() => setEditing(null)} aria-label="Fechar editor" className="rounded-xl p-2 hover:bg-panel2"><X /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-xs font-bold text-ink">Atividade<input required value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} className="mt-2 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-[#d97706]" /></label>
              <label className="text-xs font-bold text-ink">Início<input type="time" required value={editing.inicio} onChange={(e) => setEditing({ ...editing, inicio: e.target.value })} className="mt-2 w-full rounded-xl border border-line p-3 text-sm" /></label>
              <label className="text-xs font-bold text-ink">Fim<input type="time" required value={editing.fim} onChange={(e) => setEditing({ ...editing, fim: e.target.value })} className="mt-2 w-full rounded-xl border border-line p-3 text-sm" /></label>
              <label className="text-xs font-bold text-ink">Área<select value={editing.frenteId} onChange={(e) => setEditing({ ...editing, frenteId: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-panel2 p-3 text-sm">{FRENTES.filter(f => f.tipo === 'entrada').map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></label>
              <label className="text-xs font-bold text-ink">Categoria<select value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value as CategoriaRotina })} className="mt-2 w-full rounded-xl border border-line bg-panel2 p-3 text-sm">{Object.entries(CATEGORIA_META).map(([id, meta]) => <option key={id} value={id}>{meta.label}</option>)}</select></label>
              <fieldset className="sm:col-span-2"><legend className="mb-2 text-xs font-bold text-ink">Repete nos dias</legend><div className="flex flex-wrap gap-2">{DIAS_ORDEM.map((dia) => <button type="button" key={dia} onClick={() => setEditing({ ...editing, dias: editing.dias.includes(dia) ? editing.dias.filter(d => d !== dia) : [...editing.dias, dia] })} className={`rounded-xl border px-3 py-2 text-xs font-black ${editing.dias.includes(dia) ? 'border-[#d97706] bg-[#d97706]/10 text-[var(--routine-accent)]' : 'border-line text-mute'}`}>{DIA_LABEL[dia]}</button>)}</div></fieldset>
              <label className="sm:col-span-2 text-xs font-bold text-ink">O que farei neste horário<textarea rows={3} value={editing.nota} onChange={(e) => setEditing({ ...editing, nota: e.target.value })} className="mt-2 w-full resize-none rounded-xl border border-line p-3 text-sm" /></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={async () => { if (confirm('Remover este bloco recorrente da agenda?')) { await removeBloco(editing.id); setEditing(null); } }} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-bad hover:bg-red-500/10"><Trash2 size={16} /> Remover</button>
              <button type="submit" disabled={!editing.dias.length} className="rounded-xl bg-[#b45309] px-6 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-30">Salvar na agenda</button>
            </div>
          </form>
        </div>
      )}
      {/* Frentes alimentadas neste dia */}
      <div className="bg-panel border border-line rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h3 className="text-[12px] font-mono font-bold text-mute uppercase tracking-widest">
            Frentes alimentadas — {DIA_LABEL[diaSelecionado]}
          </h3>
        </div>
        <ul className="divide-y divide-line">
          {FRENTES.map((f) => {
            const min = alocacao[f.id] || 0;
            const semTempo = min === 0 && f.tipo === 'entrada';
            return (
              <li key={f.id} className="routine-front flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.cor }} />
                <span
                  className="text-sm flex-1 min-w-[120px] text-ink"
                >
                  {f.nome}
                </span>
                <span className="routine-baseline font-mono text-xs text-mute shrink-0">
                  partida {f.notaPartida}/10
                </span>
                {semTempo ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-bad border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                    Sem tempo
                  </span>
                ) : min === 0 ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mute border border-line px-2 py-0.5 rounded-full shrink-0">
                    Conquista
                  </span>
                ) : (
                  <span className="font-mono text-[12px] font-bold text-ink shrink-0 w-16 text-right">
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
