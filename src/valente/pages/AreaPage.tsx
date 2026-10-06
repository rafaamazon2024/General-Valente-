import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AREA_POR_ID, COR, META_KCAL, situacao, type AreaDef, type AreaId, type MetricaDef,
} from '../areas';
import {
  aderenciaAlimentar, datasDaSemana, diaDe, execucaoDatas, execucaoSemana, kcalDoDia, metaSemanalMissoes,
  minutosFeitosSemana, somaDias, somaMetricaSemana, ultimoPeso, valorMetrica,
} from '../calc';
import { useResumo } from '../useResumo';
import type { Ir } from '../nav';
import { Barra, Botao, Pct, Selo, Titulo, Vazio } from '../ui/kit';
import { MissaoLinhaPublica } from '../ui/widgets';
import { TREINO_SPLIT } from '../../config/treinoSplit';
import { useTreinoHoje } from '../../hooks/useTreinoHoje';
import { useExercicios } from '../../hooks/useExercicios';

type R = ReturnType<typeof useResumo>;

function fmt(n: number, unidade?: string): string {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return unidade ? `${v} ${unidade}` : v;
}

// ---------- Entrada de indicadores ----------

function NumInput({ valor, passo, onCommit }: { valor: number; passo: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(valor || ''));
  useEffect(() => setDraft(valor ? String(valor) : ''), [valor]);
  const aplicar = (v: number) => onCommit(Math.max(0, Math.round(v * 100) / 100));
  return (
    <div className="flex items-center gap-1.5">
      <button aria-label="Diminuir" onClick={() => aplicar(valor - passo)} className="w-8 h-8 border border-line2 rounded-sm flex items-center justify-center cursor-pointer shrink-0"><Minus size={14} /></button>
      <input
        inputMode="decimal"
        value={draft}
        placeholder="0"
        className="num text-center"
        style={{ width: 76 }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { const v = parseFloat(draft.replace(',', '.')); if (!Number.isNaN(v) && v !== valor) aplicar(v); }}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <button aria-label="Aumentar" onClick={() => aplicar(valor + passo)} className="w-8 h-8 border border-line2 rounded-sm flex items-center justify-center cursor-pointer shrink-0"><Plus size={14} /></button>
    </div>
  );
}

function MetricaLinha({ def, r }: { def: MetricaDef; r: R }) {
  const atual = valorMetrica(r.metricas, r.hoje, def.key);
  const semana = somaMetricaSemana(r.config, r.semana.n, r.metricas, def.key);
  const set = (v: number | boolean) => r.setMetrica(r.hoje, def.key, v);
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="text-[15px]">{def.label}</div>
        {def.tipo !== 'escala' && def.key !== 'peso' && def.key !== 'carga_max' && (
          <div className="rotulo" style={{ fontSize: 10 }}>
            {def.tipo === 'check' ? `${semana} de 7 dias na semana` : `Semana: ${fmt(semana, def.unidade)}`}
          </div>
        )}
        {def.tipo === 'escala' && def.escala && (
          <div className="rotulo" style={{ fontSize: 10 }}>{def.escala[0]} → {def.escala[1]}</div>
        )}
      </div>
      {def.tipo === 'num' && <NumInput valor={atual} passo={def.passo || 1} onCommit={set} />}
      {def.tipo === 'check' && (
        <button
          onClick={() => set(atual ? false : true)}
          className="rotulo px-3 py-2 rounded-sm border cursor-pointer"
          style={{ borderColor: atual ? COR.otimo : 'var(--color-line2)', color: atual ? COR.otimo : undefined, background: atual ? `${COR.otimo}18` : 'transparent' }}
        >{atual ? 'Feito' : 'Marcar'}</button>
      )}
      {def.tipo === 'escala' && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => set(n)}
              className="w-8 h-8 rounded-sm border num cursor-pointer text-sm"
              style={{ borderColor: atual === n ? '#22d3ee' : 'var(--color-line2)', color: atual === n ? '#22d3ee' : undefined, background: atual === n ? '#22d3ee18' : 'transparent' }}
            >{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Blocos específicos ----------

function Livro({ r }: { r: R }) {
  const l = r.config.livro;
  const [titulo, setTitulo] = useState(l?.titulo || '');
  const [total, setTotal] = useState(String(l?.total || ''));
  const [atual, setAtual] = useState(String(l?.atual || ''));
  useEffect(() => { setTitulo(l?.titulo || ''); setTotal(String(l?.total || '')); setAtual(String(l?.atual || '')); }, [l?.titulo, l?.total, l?.atual]);
  const t = Number(total) || 0;
  const a = Number(atual) || 0;
  const p = t > 0 ? Math.min(100, Math.round((a / t) * 100)) : null;
  const salvar = () => r.salvarConfig({ livro: { titulo: titulo.trim(), total: t, atual: a } });
  return (
    <section className="painel p-4">
      <Titulo extra={<Pct v={p} className="text-lg font-semibold" />}>Livro atual</Titulo>
      <div className="space-y-2">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do livro" onBlur={salvar} />
        <div className="grid grid-cols-2 gap-2">
          <label className="rotulo" style={{ fontSize: 10 }}>Página atual<input inputMode="numeric" value={atual} onChange={(e) => setAtual(e.target.value)} onBlur={salvar} /></label>
          <label className="rotulo" style={{ fontSize: 10 }}>Total de páginas<input inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} onBlur={salvar} /></label>
        </div>
        <Barra pct={p} cor="#38bdf8" alt={5} />
      </div>
    </section>
  );
}

function Refeicoes({ r }: { r: R }) {
  const lista = r.metricas[r.hoje]?.refeicoes || [];
  const kcal = kcalDoDia(r.metricas, r.hoje);
  const [nome, setNome] = useState('');
  const [k, setK] = useState('');
  const peso = ultimoPeso(r.metricas);
  const ader = aderenciaAlimentar(r.metricas, datasDaSemana(r.config, r.semana.n), r.hoje);
  const add = () => {
    const kc = parseInt(k, 10);
    if (!nome.trim() || Number.isNaN(kc)) return;
    r.addRefeicao(r.hoje, nome.trim(), kc, lista);
    setNome(''); setK('');
  };
  return (
    <section className="painel p-4">
      <Titulo extra={<span className={`num text-lg font-semibold`} style={{ color: kcal > META_KCAL ? COR.critico : undefined }}>{kcal} / {META_KCAL}</span>}>Refeições de hoje</Titulo>
      <Barra pct={Math.min(100, Math.round((kcal / META_KCAL) * 100))} cor={kcal > META_KCAL ? COR.critico : COR.otimo} alt={6} />
      <div className="mt-3">
        {lista.length === 0 && <Vazio>Nenhuma refeição registrada hoje.</Vazio>}
        {lista.map((x) => (
          <div key={x.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <span className="text-[15px]">{x.nome}</span>
            <span className="flex items-center gap-3">
              <span className="num text-mute">{x.kcal} kcal</span>
              <button aria-label="Remover refeição" onClick={() => r.removeRefeicao(r.hoje, x.id, lista)} className="text-dim hover:text-bad cursor-pointer"><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Refeição" />
        <input value={k} onChange={(e) => setK(e.target.value)} inputMode="numeric" placeholder="kcal" style={{ width: 90 }} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Botao onClick={add} className="shrink-0">Registrar</Botao>
      </div>
      <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div><dt className="rotulo" style={{ fontSize: 10 }}>Último peso</dt><dd className="num">{peso ? `${peso.peso.toFixed(1)} kg` : 'não registrado'}</dd></div>
        <div><dt className="rotulo" style={{ fontSize: 10 }}>Aderência da semana</dt><dd className="num">{ader === null ? 'sem registros' : `${ader}%`}</dd></div>
      </dl>
    </section>
  );
}

function Treino({ r }: { r: R }) {
  const { grupos, log, toggleExercicio } = useTreinoHoje();
  const { exercicios } = useExercicios();
  const doDia = exercicios.filter((e) => grupos.includes(e.grupo_muscular));
  const feitos = log?.exercicios_feitos || [];
  const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hojeIdx = new Date().getDay();
  return (
    <>
      <section className="painel p-4">
        <Titulo extra={<span className="rotulo">{grupos.length ? grupos.join(' + ') : 'Descanso'}</span>}>Treino de hoje</Titulo>
        {doDia.length === 0 ? (
          <Vazio>{grupos.length ? 'Cadastre exercícios deste grupo na Biblioteca.' : 'Hoje é dia de descanso.'}</Vazio>
        ) : (
          doDia.map((e) => {
            const f = feitos.includes(e.id);
            return (
              <button
                key={e.id}
                onClick={() => toggleExercicio(e.id, doDia.map((x) => x.id))}
                className="w-full flex items-center gap-3 py-2.5 border-b border-line last:border-0 text-left cursor-pointer"
              >
                <span className="w-5 h-5 rounded-sm border flex items-center justify-center shrink-0" style={{ borderColor: f ? COR.otimo : 'var(--color-line2)', background: f ? `${COR.otimo}25` : 'transparent' }}>{f ? '✓' : ''}</span>
                <span className={f ? 'text-mute line-through' : ''}>{e.nome}</span>
              </button>
            );
          })
        )}
        {log?.completo && <p className="rotulo mt-2" style={{ color: COR.otimo }}>Treino completo</p>}
      </section>
      <section className="painel p-4">
        <Titulo>Programação da semana</Titulo>
        {[1, 2, 3, 4, 5, 6].map((d) => (
          <div key={d} className="flex justify-between py-2 border-b border-line last:border-0 text-sm">
            <span style={{ color: d === hojeIdx ? '#22d3ee' : undefined }}>{nomesDias[d]}</span>
            <span className="text-mute">{TREINO_SPLIT[d].join(' + ') || 'Descanso'}</span>
          </div>
        ))}
        <p className="text-xs text-dim mt-2">Séries, repetições e carga são registradas nos indicadores ao lado.</p>
      </section>
    </>
  );
}

function CarreiraResumo({ r }: { r: R }) {
  const min = minutosFeitosSemana(r.config, r.semana.n, r.logs, r.hoje, 'carreira');
  const meta = metaSemanalMissoes(r.config, r.semana.n, 'carreira');
  const soma = (k: string) => somaMetricaSemana(r.config, r.semana.n, r.metricas, k);
  const linhas: [string, string][] = [
    ['Horas feitas na semana', `${(min / 60).toFixed(1)} h de ${(meta.minutos / 60).toFixed(0)} h`],
    ['Prospecções', String(soma('prospeccoes'))],
    ['Reuniões', String(soma('reunioes'))],
    ['Propostas', String(soma('propostas'))],
    ['Vendas', String(soma('vendas'))],
    ['Receita', `R$ ${soma('receita').toLocaleString('pt-BR')}`],
  ];
  return (
    <section className="painel p-4">
      <Titulo>Pipeline da semana</Titulo>
      {linhas.map(([l, v]) => (
        <div key={l} className="flex justify-between py-2 border-b border-line last:border-0 text-sm"><span className="text-mute">{l}</span><span className="num">{v}</span></div>
      ))}
    </section>
  );
}

const PRATICAS_CARISMA = [
  { key: 'carisma_presenca', titulo: 'Presença', texto: '5 min: postura relaxada, voz audível e pausas. Grave uma apresentação de 60 segundos.' },
  { key: 'carisma_conversa', titulo: 'Conversa', texto: '10 min: inicie um assunto e desenvolva duas perguntas abertas a partir da resposta.' },
  { key: 'carisma_conexao', titulo: 'Conexão', texto: '10 min: escute sem interromper e retome um detalhe que a pessoa contou.' },
  { key: 'carisma_historia', titulo: 'Humor e histórias', texto: '10 min: conte uma história curta com contexto, acontecimento e desfecho. Use humor sem diminuir alguém.' },
  { key: 'carisma_revisao', titulo: 'Revisão', texto: '5 min: reveja sua gravação e escolha um ajuste para amanhã. Use os exercícios do Assunto Infinito como repertório.' },
] as const;

const MISSOES_CARISMA = [
  'Inicie uma conversa breve com alguém conhecido e faça uma pergunta aberta.',
  'Cumprimente alguém pelo nome e retome um assunto que essa pessoa já contou.',
  'Conte uma história de até 90 segundos e dê espaço para a outra pessoa participar.',
  'Puxe um assunto a partir do ambiente e desenvolva a resposta com curiosidade.',
  'Faça um elogio específico e sincero, sem esperar nada em troca.',
  'Convide alguém conhecido para uma atividade simples, respeitando a resposta.',
  'Converse sem olhar o celular e encerre agradecendo a troca.',
] as const;

function PresencaCarisma({ r }: { r: R }) {
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const semanaDatas = datasDaSemana(r.config, r.semana.n);
  const desafios = [
    ...PRATICAS_CARISMA,
    {
      key: 'carisma_missao_real',
      titulo: 'Missão real do dia',
      texto: MISSOES_CARISMA[new Date(`${r.hoje}T12:00:00`).getDay()],
    },
  ];
  const valores = r.metricas[r.hoje]?.valores || {};
  const xp = Object.entries(r.metricas).reduce((total, [data, dia]) => {
    if (data < r.config.ciclo_inicio || data > r.hoje) return total;
    return total + desafios.reduce((n, d) => n + (dia.valores[d.key] === true ? 10 : 0), 0);
  }, 0);
  const nivel = Math.floor(xp / 200) + 1;
  const nomes = ['Primeiro passo', 'Presença firme', 'Conversa fluida', 'Conexão', 'Carisma em ação'];
  const diasReais = semanaDatas.filter((data) => data <= r.hoje && r.metricas[data]?.valores.carisma_missao_real === true).length;

  const marcar = async (key: string) => {
    setSalvando(key);
    setErro('');
    try {
      await r.setMetrica(r.hoje, key, valores[key] !== true);
    } catch {
      setErro('Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(null);
    }
  };

  return (
    <section className="painel-destaque p-4">
      <Titulo extra={<span className="rotulo" style={{ color: 'var(--color-cyan)' }}>Nível {nivel}</span>}>Presença &amp; Carisma</Titulo>
      <p className="text-[15px] leading-relaxed">Conversar com naturalidade, criar conexão e ser alguém com quem as pessoas gostam de estar.</p>

      <div className="flex items-center justify-between gap-3 mt-4 mb-2 text-sm">
        <span>{nomes[Math.min(nivel - 1, nomes.length - 1)]}</span>
        <span className="num text-cyan">{xp} XP</span>
      </div>
      <Barra pct={(xp % 200) / 2} alt={5} />
      <p className="text-xs text-mute mt-2">10 XP por prática concluída · 200 XP por nível · progresso neste ciclo</p>

      <h3 className="rotulo mt-5 mb-2" style={{ color: 'var(--color-cyan)' }}>Seu treino de 40 minutos</h3>
      <p className="text-xs text-mute mb-2">Estas etapas compõem o bloco de Comunicação da sua rotina.</p>
      <div>
        {desafios.map((d) => {
          const concluido = valores[d.key] === true;
          return (
            <button
              key={d.key}
              type="button"
              disabled={salvando !== null}
              aria-pressed={concluido}
              onClick={() => marcar(d.key)}
              className="w-full flex items-start gap-3 text-left py-3 border-b border-line last:border-0 cursor-pointer disabled:opacity-60"
            >
              <span
                className="w-5 h-5 rounded-sm border flex items-center justify-center shrink-0"
                style={{ borderColor: concluido ? COR.otimo : 'var(--color-line2)', color: COR.otimo, background: concluido ? `${COR.otimo}20` : 'transparent' }}
              >{concluido ? '✓' : ''}</span>
              <span>
                <span className="block text-[15px] font-semibold">{d.titulo}</span>
                <span className="block text-sm text-mute leading-relaxed mt-1">{d.texto}</span>
              </span>
            </button>
          );
        })}
      </div>
      {erro && <p role="alert" className="text-sm text-bad mt-2">{erro}</p>}

      <div className="mt-4 border-t border-line pt-3">
        <h3 className="rotulo" style={{ color: 'var(--color-cyan)' }}>Desafio semanal</h3>
        <p className="text-sm mt-2">Cumprir uma missão real em 5 dias diferentes. Faça sua parte e respeite o espaço da outra pessoa.</p>
        <p className="num mt-2">{diasReais} / 5 dias {diasReais >= 5 ? '· Desafio concluído ✓' : ''}</p>
        <Barra pct={Math.min(100, diasReais * 20)} alt={5} />
      </div>
    </section>
  );
}

// ---------- Evolução da área ----------

function EvolucaoArea({ r, area }: { r: R; area: AreaId }) {
  const dados = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const e = execucaoSemana(r.config, i + 1, r.logs, r.hoje, area);
    return { semana: `S${i + 1}`, pct: e.pct, atual: i + 1 === r.semana.n };
  }), [r, area]);
  return (
    <section className="painel p-4">
      <Titulo>Evolução</Titulo>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ left: -24, right: 4, top: 6 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="semana" tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#8493a5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--color-panel)', border: '1px solid var(--color-line2)', color: 'var(--color-ink)', borderRadius: 4, fontSize: 12 }} cursor={{ fill: '#ffffff08' }} formatter={(v) => [`${v ?? 0}%`, 'Execução']} />
            <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
              {dados.map((d) => <Cell key={d.semana} fill={d.pct === null ? 'var(--color-line)' : d.atual ? '#22d3ee' : COR[situacao(d.pct)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function sequenciaArea(r: R, area: AreaId): number {
  let n = 0;
  let d = r.hoje;
  // hoje ainda aberto não quebra a sequência
  const ex = execucaoDatas([d], r.logs, r.hoje, area);
  if (ex.planejado > 0 && ex.feito === ex.planejado) n++;
  d = somaDias(d, -1);
  while (d >= r.config.ciclo_inicio) {
    const e = execucaoDatas([d], r.logs, r.hoje, area);
    if (e.planejado === 0) { d = somaDias(d, -1); continue; }
    if (e.feito < e.planejado) break;
    n++;
    d = somaDias(d, -1);
  }
  return n;
}

function diagnosticoArea(r: R, def: AreaDef): string[] {
  const e = execucaoSemana(r.config, r.semana.n, r.logs, r.hoje, def.id);
  const ant = r.semana.n > 1 ? execucaoSemana(r.config, r.semana.n - 1, r.logs, r.hoje, def.id) : null;
  const out: string[] = [];
  if (e.pct === null) {
    out.push(`Sem missões vencidas de ${def.nome} nesta semana. Nada a medir ainda.`);
    return out;
  }
  out.push(`${def.nome} está em ${e.pct}% na semana ${r.semana.n}: ${e.feito} de ${e.planejado} missões cumpridas.`);
  if (ant?.pct !== null && ant?.pct !== undefined) {
    const dif = e.pct - ant.pct;
    if (Math.abs(dif) > 3) out.push(dif > 0 ? `Subiu ${dif} pontos sobre a semana passada.` : `Caiu ${Math.abs(dif)} pontos sobre a semana passada.`);
  }
  if (situacao(e.pct) === 'otimo') out.push('Ritmo bom. Mantenha o horário fixo.');
  else {
    const pend = r.missoes.find((m) => m.area === def.id && m.estado !== 'feita');
    out.push(pend ? `Próximo passo: ${pend.titulo}${pend.inicio ? ` às ${pend.inicio}` : ''}.` : 'Sem missão pendente hoje. Reforce amanhã no primeiro horário da área.');
  }
  return out;
}

const POSICAO_BANNER: Record<AreaId, string> = {
  espiritual: 'center 28%', comunicacao: 'center 45%', leitura: 'center 68%', memorizacao: 'center 25%',
  carreira: 'center 62%', mindfulness: 'center 58%', alimentacao: 'center 8%', esporte: 'center 45%',
};

// ---------- Página ----------

export default function AreaPage({ id, ir }: { id: AreaId; ir: Ir }) {
  const r = useResumo();
  const def = AREA_POR_ID[id];
  const Icon = def.icon;
  const pct = r.pcts[id];
  const sit = situacao(pct);
  const meta = metaSemanalMissoes(r.config, r.semana.n, id);
  const feitoMin = minutosFeitosSemana(r.config, r.semana.n, r.logs, r.hoje, id);
  const exec = execucaoSemana(r.config, r.semana.n, r.logs, r.hoje, id);
  const missoes = r.missoes.filter((m) => m.area === id);
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState('');
  const metaCiclo = r.config.metas[id] || def.metaCicloPadrao;
  const sequencia = sequenciaArea(r, id);

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-4">
      <button onClick={() => ir({ t: 'inicio' })} className="rotulo flex items-center gap-1.5 cursor-pointer"><ArrowLeft size={13} />Início</button>

      <section className="painel relative overflow-hidden" style={{ minHeight: 170 }}>
        <img src={`/img/${id}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: POSICAO_BANNER[id] }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 78%, transparent) 42%, transparent 85%)' }} />
        <div className="relative p-4 lg:p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-md border flex items-center justify-center shrink-0" style={{ borderColor: COR[sit], color: COR[sit], background: `${COR[sit]}22` }}><Icon size={24} /></div>
          <div className="flex-1 min-w-0 max-w-[460px]">
            <h1 className="text-2xl font-semibold">{def.nome}</h1>
            <p className="text-ink text-[15px] mt-1 leading-snug opacity-90">{def.identidade}</p>
          </div>
          <div className="text-right shrink-0 rounded-md px-3 py-2" style={{ background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)' }}>
            <Pct v={pct} className="text-3xl font-semibold" />
            <div className="mt-1"><Selo sit={sit} /></div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <div className="space-y-4 min-w-0">
          <section className="painel p-4">
            <Titulo extra={<button className="rotulo cursor-pointer" style={{ color: 'var(--color-cyan)' }} onClick={() => { setRascunho(metaCiclo); setEditando(!editando); }}>{editando ? 'Cancelar' : 'Editar'}</button>}>Meta das 12 semanas</Titulo>
            {editando ? (
              <div className="space-y-2">
                <textarea rows={3} value={rascunho} onChange={(e) => setRascunho(e.target.value)} />
                <Botao variante="primario" onClick={() => { r.salvarConfig({ metas: { [id]: rascunho.trim() } }); setEditando(false); }}>Salvar</Botao>
              </div>
            ) : <p className="text-[15px] leading-relaxed">{metaCiclo}</p>}
          </section>

          <section className="painel p-4">
            <Titulo>Meta semanal</Titulo>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><div className="rotulo" style={{ fontSize: 10 }}>Missões</div><div className="num text-lg">{exec.feito}<span className="text-mute"> / {meta.missoes}</span></div></div>
              <div><div className="rotulo" style={{ fontSize: 10 }}>Tempo</div><div className="num text-lg">{(feitoMin / 60).toFixed(1)}<span className="text-mute"> / {(meta.minutos / 60).toFixed(1)} h</span></div></div>
              <div><div className="rotulo" style={{ fontSize: 10 }}>Sequência</div><div className="num text-lg">{sequencia}<span className="text-mute"> d</span></div></div>
            </div>
            <div className="mt-3"><Barra pct={meta.missoes ? Math.round((exec.feito / meta.missoes) * 100) : null} alt={5} /></div>
          </section>

          <section className="painel p-4">
            <Titulo>Missões do dia</Titulo>
            {missoes.length === 0 ? <Vazio>Sem missão desta área hoje ({diaDe(r.hoje) === 'SU' ? 'domingo' : 'dia livre'}).</Vazio> : missoes.map((m) => <MissaoLinhaPublica key={m.id} m={m} r={r} />)}
          </section>

          {id === 'esporte' && <Treino r={r} />}
        </div>

        <div className="space-y-4 min-w-0">
          {id === 'leitura' && <Livro r={r} />}
          {id === 'alimentacao' && <Refeicoes r={r} />}
          {id === 'carreira' && <CarreiraResumo r={r} />}
          {id === 'comunicacao' && <PresencaCarisma r={r} />}

          <section className="painel p-4">
            <Titulo>Indicadores de hoje</Titulo>
            {def.metricas.map((m) => <MetricaLinha key={m.key} def={m} r={r} />)}
          </section>

          <EvolucaoArea r={r} area={id} />

          <section className="painel-destaque p-4">
            <Titulo>Diagnóstico do General</Titulo>
            <div className="space-y-2 text-[15px] leading-relaxed">{diagnosticoArea(r, def).map((f, i) => <p key={i}>{f}</p>)}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
