import { useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Check, ChevronDown, Clock, Play, Plus, Minus, Pause, ShieldAlert } from 'lucide-react';
import {
  AREAS, AREA_POR_ID, COR, META_KCAL, ROTULO, situacao, type AreaId,
} from '../areas';
import {
  DIAS_SEMANA, aderenciaAlimentar, celulaHeat, datasDaSemana, execucaoSemana, kcalDoDia, parseData,
  type CelulaHeat,
} from '../calc';
import type { Big3Item } from '../store';
import { useResumo, type MissaoComEstado } from '../useResumo';
import type { Ir } from '../nav';
import { useTreinoHoje } from '../../hooks/useTreinoHoje';
import { useExercicios } from '../../hooks/useExercicios';
import { Barra, Botao, Pct, Selo, Titulo, Vazio } from './kit';

type R = ReturnType<typeof useResumo>;

// ---------- Missões do dia ----------

const ESTADO_ROTULO: Record<string, string> = {
  pendente: 'Pendente', iniciada: 'Em andamento', adiada: 'Adiada', feita: 'Concluída',
};
const ESTADO_COR: Record<string, string> = {
  pendente: '#8493a5', iniciada: '#22d3ee', adiada: '#fbbf24', feita: '#34d399',
};

type Filtro = 'todas' | 'pendentes' | 'andamento' | 'concluidas';

function MissaoLinha({ m, r }: { m: MissaoComEstado; r: R }) {
  const [aberta, setAberta] = useState(false);
  const feita = m.estado === 'feita';
  const area = AREA_POR_ID[m.area];
  return (
    <div className="border-b border-line last:border-0">
      <div className="flex items-center gap-3 py-3">
        <button
          aria-label={feita ? 'Reabrir missão' : 'Concluir missão'}
          onClick={() => r.mudarMissao(m.id, feita ? 'reabrir' : 'concluir')}
          className="w-6 h-6 shrink-0 rounded-sm border flex items-center justify-center cursor-pointer transition-colors"
          style={{ borderColor: feita ? COR.otimo : 'var(--color-line2)', background: feita ? `${COR.otimo}25` : 'transparent' }}
        >
          {feita && <Check size={15} color={COR.otimo} />}
        </button>
        <button className="flex-1 min-w-0 text-left cursor-pointer" onClick={() => setAberta(!aberta)}>
          <div className={`text-[15px] leading-tight truncate ${feita ? 'text-mute line-through' : 'text-ink'}`}>{m.titulo}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="rotulo" style={{ fontSize: 10 }}>{area.curto}</span>
            {m.inicio && <span className="rotulo num" style={{ fontSize: 10 }}>{m.inicio}</span>}
            {m.duracao ? <span className="rotulo num" style={{ fontSize: 10 }}>{m.duracao} min</span> : null}
            <span className="rotulo" style={{ fontSize: 10, color: ESTADO_COR[m.estado] }}>{ESTADO_ROTULO[m.estado]}</span>
          </div>
        </button>
        <button aria-label="Detalhes" onClick={() => setAberta(!aberta)} className="p-1 text-mute cursor-pointer">
          <ChevronDown size={18} className={`transition-transform ${aberta ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {aberta && (
        <div className="pb-3 pl-9 space-y-3">
          {m.nota && <p className="text-sm text-mute leading-relaxed">{m.nota}</p>}
          <div className="flex gap-2 flex-wrap">
            {!feita && m.estado !== 'iniciada' && (
              <Botao onClick={() => r.mudarMissao(m.id, 'iniciar')}><Play size={12} className="inline mr-1" />Iniciar</Botao>
            )}
            {!feita && m.estado !== 'adiada' && (
              <Botao onClick={() => r.mudarMissao(m.id, 'adiar')}><Pause size={12} className="inline mr-1" />Adiar</Botao>
            )}
            {m.estado !== 'pendente' && !feita && <Botao onClick={() => r.mudarMissao(m.id, 'reabrir')}>Voltar a pendente</Botao>}
          </div>
        </div>
      )}
    </div>
  );
}

export { MissaoLinha as MissaoLinhaPublica };

export function MissoesDoDia({ r, comFiltros = false }: { r: R; comFiltros?: boolean }) {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const feitas = r.missoes.filter((m) => m.estado === 'feita').length;
  const total = r.missoes.length;
  const lista = r.missoes.filter((m) => {
    if (filtro === 'pendentes') return m.estado === 'pendente' || m.estado === 'adiada';
    if (filtro === 'andamento') return m.estado === 'iniciada';
    if (filtro === 'concluidas') return m.estado === 'feita';
    return true;
  });
  const filtros: [Filtro, string][] = [['todas', 'Todas'], ['pendentes', 'Pendentes'], ['andamento', 'Em andamento'], ['concluidas', 'Concluídas']];

  return (
    <section className="painel p-4">
      <Titulo extra={<Pct v={r.execHoje.pct} className="text-2xl font-semibold" />}>Missões do dia</Titulo>
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-sm text-ink num">{feitas} de {total} concluídas</span>
        <span className="text-sm text-mute num">{total - feitas} pendentes</span>
      </div>
      <Barra pct={r.execHoje.pct} alt={5} />
      {comFiltros && (
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {filtros.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFiltro(k)}
              className="rotulo px-2.5 py-1.5 rounded-sm border cursor-pointer"
              style={{ borderColor: filtro === k ? COR.sem : 'var(--color-line2)', background: filtro === k ? 'var(--color-panel2)' : 'transparent', color: filtro === k ? 'var(--color-cyan)' : undefined }}
            >{l}</button>
          ))}
        </div>
      )}
      <div className="mt-2">
        {lista.length === 0 ? <Vazio>Nenhuma missão neste filtro.</Vazio> : lista.map((m) => <MissaoLinha key={m.id} m={m} r={r} />)}
      </div>
    </section>
  );
}

// ---------- Próxima ação ----------

const MOTIVO: Record<string, string> = {
  'em-andamento': 'Em andamento',
  agora: 'Agora',
  proxima: 'A seguir',
  'sem-horario': 'Sem horário fixo',
  adiada: 'Retomar',
};

export function ProximaAcaoCard({ r }: { r: R }) {
  const p = r.proxima;
  return (
    <section className="painel-destaque p-4">
      <Titulo>Próxima ação</Titulo>
      {!p ? (
        <Vazio>Todas as missões de hoje estão fechadas.</Vazio>
      ) : (
        <>
          <div className="rotulo mb-1" style={{ color: 'var(--color-cyan)' }}>{MOTIVO[p.motivo]}{p.missao.inicio ? ` · ${p.missao.inicio}` : ''}</div>
          <div className="text-xl font-semibold leading-tight">{p.missao.titulo}</div>
          <div className="text-mute text-sm mt-1">{AREA_POR_ID[p.missao.area].nome}{p.missao.duracao ? ` · ${p.missao.duracao} minutos` : ''}</div>
          <Botao
            variante="primario"
            className="w-full mt-4 py-3"
            onClick={() => r.mudarMissao(p.missao.id, p.motivo === 'em-andamento' ? 'concluir' : 'iniciar')}
          >
            {p.motivo === 'em-andamento' ? 'Concluir' : 'Iniciar'}
          </Botao>
        </>
      )}
    </section>
  );
}

// ---------- Alerta ----------

export function AlertaCard({ r, ir }: { r: R; ir?: Ir }) {
  const a = r.alerta;
  const cor = a ? COR.critico : COR.otimo;
  return (
    <section className="painel p-4" style={{ borderColor: `${cor}55` }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: cor }}>
        <ShieldAlert size={16} />
        <span className="rotulo" style={{ color: cor }}>Alerta do General</span>
      </div>
      <p className="text-[15px] leading-snug">{a ? a.texto : 'Nenhuma área abaixo da meta semanal. Mantenha o ritmo.'}</p>
      {a?.area && ir && (
        <button className="rotulo mt-3 cursor-pointer" style={{ color: 'var(--color-cyan)' }} onClick={() => ir({ t: 'area', id: a.area as AreaId })}>
          Abrir {AREA_POR_ID[a.area].nome} →
        </button>
      )}
    </section>
  );
}

// ---------- Diagnóstico ----------

export function DiagnosticoCard({ r, ir, largo = false }: { r: R; ir: Ir; largo?: boolean }) {
  return (
    <section className="painel-destaque p-4">
      <Titulo extra={<span className="rotulo" style={{ fontSize: 10 }}>Análise automática</span>}>Diagnóstico do General</Titulo>
      <div className={`space-y-2 text-[15px] leading-relaxed ${largo ? 'max-w-3xl' : ''}`}>
        {r.diag.frases.map((f, i) => <p key={i}>{f}</p>)}
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Botao onClick={() => ir({ t: 'relatorios' })}>Ver análise completa</Botao>
        <Botao onClick={() => ir({ t: 'general' })}>Gerar plano do dia</Botao>
        <Botao onClick={() => ir({ t: 'revisao' })}>Revisar semana</Botao>
      </div>
    </section>
  );
}

// ---------- Big 3 ----------

export function Big3Card({ r, editavel = true }: { r: R; editavel?: boolean }) {
  const n = String(r.semana.n);
  const [novo, setNovo] = useState('');
  const salvar = (lista: Big3Item[]) => r.salvarConfig({ big3: { [n]: lista } });

  const ajustar = (id: string, d: number) =>
    salvar(r.big3.map((b) => (b.id === id ? { ...b, progresso: Math.max(0, Math.min(100, b.progresso + d)) } : b)));
  const adicionar = () => {
    const t = novo.trim();
    if (!t || r.big3.length >= 3) return;
    salvar([...r.big3, { id: String(Date.now()), titulo: t, progresso: 0 }]);
    setNovo('');
  };

  return (
    <section className="painel p-4">
      <Titulo extra={<span className="rotulo num">Semana {r.semana.n}</span>}>Big 3 da semana</Titulo>
      {r.big3.length === 0 && <Vazio>Defina os três resultados críticos desta semana.</Vazio>}
      <div className="space-y-4">
        {r.big3.map((b, i) => (
          <div key={b.id}>
            <div className="flex items-start gap-3">
              <span className="rotulo num mt-0.5" style={{ color: 'var(--color-cyan)' }}>0{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] leading-tight">{b.titulo}</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1"><Barra pct={b.progresso} cor={b.progresso >= 100 ? COR.otimo : '#22d3ee'} alt={5} /></div>
                  <Pct v={b.progresso} className="text-sm w-10 text-right" />
                  {editavel && (
                    <div className="flex gap-1">
                      <button aria-label="Menos 10%" onClick={() => ajustar(b.id, -10)} className="w-7 h-7 border border-line2 rounded-sm flex items-center justify-center cursor-pointer"><Minus size={13} /></button>
                      <button aria-label="Mais 10%" onClick={() => ajustar(b.id, 10)} className="w-7 h-7 border border-line2 rounded-sm flex items-center justify-center cursor-pointer"><Plus size={13} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editavel && r.big3.length < 3 && (
        <div className="flex gap-2 mt-4">
          <input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Resultado crítico da semana" onKeyDown={(e) => e.key === 'Enter' && adicionar()} />
          <Botao onClick={adicionar} className="shrink-0">Adicionar</Botao>
        </div>
      )}
    </section>
  );
}

// ---------- Resumo das áreas (cards compactos) ----------

export function ResumoAreas({ r, ir, grade = false }: { r: R; ir: Ir; grade?: boolean }) {
  return (
    <div className={grade ? 'grid grid-cols-4 xl:grid-cols-8 gap-2' : 'flex gap-2 overflow-x-auto pb-1'}>
      {AREAS.map((a) => {
        const p = r.pcts[a.id];
        const sit = situacao(p);
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            onClick={() => ir({ t: 'area', id: a.id })}
            className="painel p-3 text-left cursor-pointer hover:border-line2 transition-colors min-w-[132px] flex-1"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: `${COR[sit]}1f`, border: `1px solid ${COR[sit]}66`, color: COR[sit] }}><Icon size={17} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-mute leading-tight truncate">{a.nome}</div>
                <Pct v={p} className="text-lg font-semibold leading-tight" />
              </div>
            </div>
            <Barra pct={p} />
            <div className="mt-2"><Selo sit={sit} /></div>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Heatmap ----------

const COR_HEAT: Record<CelulaHeat, string> = {
  feito: '#34d399', parcial: '#fbbf24', falha: '#f87171', futuro: 'var(--color-line2)', vazio: 'transparent',
};

export function MapaExecucao({ r }: { r: R }) {
  const datas = datasDaSemana(r.config, r.semana.n);
  return (
    <section className="painel p-4">
      <Titulo extra={
        <div className="hidden sm:flex gap-3 rotulo" style={{ fontSize: 10 }}>
          {([['feito', 'Realizado'], ['parcial', 'Parcial'], ['falha', 'Falha'], ['futuro', 'Futuro']] as [CelulaHeat, string][]).map(([k, l]) => (
            <span key={k} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COR_HEAT[k] }} />{l}</span>
          ))}
        </div>
      }>Mapa de execução</Titulo>
      <div className="flex gap-4 items-stretch">
      <div className="overflow-x-auto flex-1 min-w-0">
        <table className="w-full border-separate" style={{ borderSpacing: 4 }}>
          <thead>
            <tr>
              <th />
              {DIAS_SEMANA.map((d, i) => (
                <th key={d.dia} className="rotulo font-normal pb-1" style={{ fontSize: 10, color: datas[i] === r.hoje ? 'var(--color-cyan)' : undefined }}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AREAS.map((a) => (
              <tr key={a.id}>
                <td className="text-[13px] pr-2 whitespace-nowrap text-mute">{a.curto}</td>
                {datas.map((d) => {
                  const c = celulaHeat(a.id, d, r.logs, r.hoje);
                  return (
                    <td key={d}>
                      <div
                        title={`${a.nome} · ${d}`}
                        className="h-[18px] w-[18px] rounded-full mx-auto"
                        style={{ background: COR_HEAT[c], opacity: c === 'futuro' ? 0.5 : 1, border: c === 'vazio' ? '1px dashed var(--color-line2)' : 'none' }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="hidden md:flex flex-col justify-between painel p-3 w-[130px] shrink-0">
        <div className="rotulo" style={{ fontSize: 10 }}>Taxa da semana</div>
        <div className="text-3xl font-semibold num">{r.execSemana.pct === null ? '—' : `${r.execSemana.pct}%`}</div>
        <div className="flex items-end gap-1 h-12">
          {[0, 1, 2, 3, 4].map((i) => {
            const n = r.semana.n - 4 + i;
            const p = n >= 1 ? execucaoSemana(r.config, n, r.logs, r.hoje).pct : null;
            return <span key={i} className="flex-1 rounded-[1px]" style={{ height: `${Math.max(6, p ?? 6)}%`, background: p === null ? 'var(--color-line)' : i === 4 ? '#22d3ee' : '#2563eb' }} />;
          })}
        </div>
      </div>
      </div>
      <p className="text-xs text-dim mt-2">Círculo vazado: área sem missão prevista no dia.</p>
    </section>
  );
}

// ---------- Painéis operacionais ----------

export function AlimentacaoHoje({ r, ir }: { r: R; ir: Ir }) {
  const kcal = kcalDoDia(r.metricas, r.hoje);
  const m = r.metricas[r.hoje];
  const agua = typeof m?.valores?.agua_ml === 'number' ? (m.valores.agua_ml as number) : 0;
  const ader = aderenciaAlimentar(r.metricas, datasDaSemana(r.config, r.semana.n), r.hoje);
  const pct = Math.min(100, Math.round((kcal / META_KCAL) * 100));
  const cor = kcal > META_KCAL ? COR.critico : COR.otimo;
  return (
    <section className="painel p-4">
      <Titulo extra={<button className="rotulo cursor-pointer" style={{ color: 'var(--color-cyan)' }} onClick={() => ir({ t: 'area', id: 'alimentacao' })}>Abrir →</button>}>Alimentação hoje</Titulo>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold num" style={{ color: kcal > 0 ? cor : undefined }}>{kcal}</span>
        <span className="text-mute text-sm">de {META_KCAL.toLocaleString('pt-BR')} kcal</span>
      </div>
      <div className="my-3"><Barra pct={pct} cor={cor} alt={5} /></div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div><dt className="rotulo" style={{ fontSize: 10 }}>Água</dt><dd className="num">{agua ? `${(agua / 1000).toFixed(1)} L` : '—'}</dd></div>
        <div><dt className="rotulo" style={{ fontSize: 10 }}>Refeições</dt><dd className="num">{m?.refeicoes?.length || 0}</dd></div>
        <div><dt className="rotulo" style={{ fontSize: 10 }}>Aderência</dt><dd className="num">{ader === null ? '—' : `${ader}%`}</dd></div>
      </dl>
    </section>
  );
}

export function TreinoHoje({ r, ir }: { r: R; ir: Ir }) {
  const { grupos } = useTreinoHoje();
  const { exercicios } = useExercicios();
  const principais = exercicios.filter((e) => grupos.includes(e.grupo_muscular)).slice(0, 3);
  const missaoTreino = r.missoes.find((m) => m.area === 'esporte');
  const nome = grupos.length ? grupos.join(' + ') : 'Descanso';
  return (
    <section className="painel p-4">
      <Titulo extra={<button className="rotulo cursor-pointer" style={{ color: 'var(--color-cyan)' }} onClick={() => ir({ t: 'area', id: 'esporte' })}>Abrir →</button>}>Treino hoje</Titulo>
      <div className="text-lg font-semibold">{nome}</div>
      <div className="text-sm text-mute mb-2">
        {missaoTreino ? `${missaoTreino.titulo}${missaoTreino.duracao ? ` · ${missaoTreino.duracao} min` : ''}` : 'Sem treino previsto hoje'}
      </div>
      {principais.length > 0 && (
        <ul className="text-sm space-y-1 mb-2">
          {principais.map((e) => <li key={e.id} className="text-ink truncate">· {e.nome}</li>)}
        </ul>
      )}
      {missaoTreino && (
        <span className="rotulo" style={{ color: ESTADO_COR[missaoTreino.estado] }}>{ESTADO_ROTULO[missaoTreino.estado]}</span>
      )}
    </section>
  );
}

export function Consistencia({ r }: { r: R }) {
  const s = r.seq;
  return (
    <section className="painel p-4">
      <Titulo>Consistência</Titulo>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold num">{s.dias}</span>
        <span className="text-mute text-sm">{s.dias === 1 ? 'dia seguindo o plano' : 'dias seguidos no plano'}</span>
      </div>
      <p className="text-xs text-mute mt-2 leading-relaxed">
        {s.cheios} cheio{s.cheios === 1 ? '' : 's'} e {s.minimos} mínimo{s.minimos === 1 ? '' : 's'}. Dia mínimo (40% das missões) mantém a sequência.
        {s.emRecuperacao ? ' Sequência em recuperação: mantenha o ritmo.' : ''}
      </p>
    </section>
  );
}

// ---------- Gráficos ----------

const TT = { background: 'var(--color-panel)', border: '1px solid var(--color-line2)', color: 'var(--color-ink)', borderRadius: 4, fontSize: 12 };

export function EvolucaoSemanal({ r }: { r: R }) {
  const dados = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const e = execucaoSemana(r.config, i + 1, r.logs, r.hoje);
    return { semana: `S${i + 1}`, pct: e.pct, atual: i + 1 === r.semana.n };
  }), [r]);
  return (
    <section className="painel p-4">
      <Titulo>Evolução da execução semanal</Titulo>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ left: -20, right: 4, top: 8 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="semana" tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} cursor={{ fill: '#ffffff08' }} formatter={(v) => [`${v ?? 0}%`, 'Execução']} />
            <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
              {dados.map((d) => <Cell key={d.semana} fill={d.pct === null ? 'var(--color-line)' : d.atual ? '#22d3ee' : COR[situacao(d.pct)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export const COR_LINHA: Record<AreaId, string> = {
  espiritual: '#a78bfa', comunicacao: '#f472b6', leitura: '#38bdf8', memorizacao: '#22d3ee',
  carreira: '#fbbf24', mindfulness: '#34d399', alimentacao: '#fb923c', esporte: '#f87171',
};

export function EvolucaoAreas({ r }: { r: R }) {
  const [sel, setSel] = useState<AreaId[]>(['leitura', 'memorizacao', 'esporte']);
  const dados = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const linha: Record<string, number | string | null> = { semana: `S${i + 1}` };
    for (const a of AREAS) linha[a.id] = execucaoSemana(r.config, i + 1, r.logs, r.hoje, a.id).pct;
    return linha;
  }), [r]);
  const alternar = (id: AreaId) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <section className="painel p-4">
      <Titulo>Evolução por área da vida</Titulo>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {AREAS.map((a) => (
          <button
            key={a.id}
            onClick={() => alternar(a.id)}
            className="rotulo px-2 py-1 rounded-sm border cursor-pointer"
            style={{ fontSize: 10, borderColor: sel.includes(a.id) ? COR_LINHA[a.id] : 'var(--color-line2)', color: sel.includes(a.id) ? COR_LINHA[a.id] : undefined }}
          >{a.curto}</button>
        ))}
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="semana" tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} formatter={(v, n) => [`${v}%`, AREA_POR_ID[n as AreaId]?.nome || n]} />
            {sel.map((id) => (
              <Line key={id} type="monotone" dataKey={id} stroke={COR_LINHA[id]} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function dataCurta(s: string): string {
  return parseData(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export { Clock };
