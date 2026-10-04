import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AREAS, AREA_POR_ID, COR, MISSOES, situacao } from '../areas';
import {
  DIAS_SEMANA, datasDaSemana, execucaoDatas, execucaoSemana, porArea, somaDias,
} from '../calc';
import { useResumo } from '../useResumo';
import type { Ir } from '../nav';
import type { Revisao } from '../store';
import { Barra, Botao, Pct, Selo, Titulo, Vazio } from '../ui/kit';
import {
  AlertaCard, Big3Card, DiagnosticoCard, EvolucaoAreas, EvolucaoSemanal, MissaoLinhaPublica, dataCurta,
} from '../ui/widgets';
import Settings from '../../components/Settings';
import { useAuth } from '../../components/AuthContext';
import TemaToggle from '../ui/TemaToggle';

// ---------- Áreas da vida (lista) ----------

export function AreasPagina({ ir }: { ir: Ir }) {
  const r = useResumo();
  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Áreas da vida</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AREAS.map((a) => {
          const p = r.pcts[a.id];
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => ir({ t: 'area', id: a.id })} className="painel p-4 text-left cursor-pointer hover:border-line2">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} style={{ color: COR[situacao(p)] }} />
                <Pct v={p} className="text-xl font-semibold" />
              </div>
              <div className="font-medium mb-1">{a.nome}</div>
              <div className="text-xs text-mute mb-3 leading-snug">{a.corpo} · {a.identidade.split('.')[0]}.</div>
              <Barra pct={p} />
              <div className="mt-2"><Selo sit={situacao(p)} /></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Ciclo de 12 semanas ----------

export function CicloPagina({ ir }: { ir: Ir }) {
  const r = useResumo();
  const [sel, setSel] = useState(r.semana.n);
  const datas = datasDaSemana(r.config, sel);
  const execSel = execucaoSemana(r.config, sel, r.logs, r.hoje);
  const areasSel = porArea(r.config, sel, r.logs, r.hoje);
  const big3Sel = r.config.big3[String(sel)] || [];

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="rotulo" style={{ color: 'var(--color-cyan)' }}>Ciclo de 12 semanas</div>
          <h1 className="text-2xl font-semibold">Semana {r.semana.n} de 12</h1>
          {r.semana.concluido && <p className="text-sm text-warn mt-1">Ciclo concluído. Defina um novo início em Perfil.</p>}
        </div>
        <Botao variante="primario" onClick={() => ir({ t: 'revisao' })}>Revisão semanal</Botao>
      </div>

      <section className="painel p-4">
        <Titulo>Semanas</Titulo>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const n = i + 1;
            const e = execucaoSemana(r.config, n, r.logs, r.hoje);
            const futura = e.pct === null;
            const atual = n === r.semana.n;
            return (
              <button
                key={n}
                onClick={() => setSel(n)}
                className="rounded-sm border p-2 text-center cursor-pointer"
                style={{
                  borderColor: sel === n ? '#22d3ee' : atual ? '#2563eb' : 'var(--color-line2)',
                  background: futura ? 'transparent' : `${COR[situacao(e.pct)]}18`,
                }}
              >
                <div className="rotulo" style={{ fontSize: 10 }}>S{n}</div>
                <div className="num text-sm mt-1" style={{ color: futura ? undefined : COR[situacao(e.pct)] }}>{e.pct === null ? '—' : `${e.pct}%`}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <section className="painel p-4">
          <Titulo extra={<Pct v={execSel.pct} className="text-xl font-semibold" />}>Execução da semana {sel}</Titulo>
          <p className="text-xs text-mute mb-3">{dataCurta(datas[0])} a {dataCurta(datas[6])} · {execSel.feito} de {execSel.planejado} missões</p>
          <Barra pct={execSel.pct} alt={6} />
          <div className="mt-4 space-y-3">
            {areasSel.map(({ area, exec }) => (
              <div key={area}>
                <div className="flex justify-between text-sm mb-1"><span>{AREA_POR_ID[area].nome}</span><Pct v={exec.pct} /></div>
                <Barra pct={exec.pct} />
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          {sel === r.semana.n ? <Big3Card r={r} /> : (
            <section className="painel p-4">
              <Titulo>Big 3 da semana {sel}</Titulo>
              {big3Sel.length === 0 ? <Vazio>Sem Big 3 registrado nesta semana.</Vazio> : big3Sel.map((b) => (
                <div key={b.id} className="py-2"><div className="text-[15px]">{b.titulo}</div><Barra pct={b.progresso} cor="#22d3ee" /></div>
              ))}
            </section>
          )}
          <section className="painel p-4">
            <Titulo>Objetivos do ciclo</Titulo>
            {AREAS.map((a) => (
              <button key={a.id} onClick={() => ir({ t: 'area', id: a.id })} className="w-full text-left py-2 border-b border-line last:border-0 cursor-pointer">
                <div className="text-sm font-medium">{a.nome}</div>
                <div className="text-xs text-mute leading-snug">{r.config.metas[a.id] || a.metaCicloPadrao}</div>
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------- Revisão semanal ----------

const VAZIA: Revisao = { destaques: '', deuCerto: '', deuErrado: '', licoes: '', big3Proxima: ['', '', ''], criadaEm: '' };

export function RevisaoPagina({ ir }: { ir: Ir }) {
  const r = useResumo();
  const n = r.semana.n;
  const existente = r.config.revisoes[String(n)];
  const [f, setF] = useState<Revisao>(existente || VAZIA);
  const [salvo, setSalvo] = useState(false);
  const campo = (k: 'destaques' | 'deuCerto' | 'deuErrado' | 'licoes', label: string) => (
    <label className="block">
      <span className="rotulo">{label}</span>
      <textarea rows={3} className="mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </label>
  );

  const salvar = async () => {
    const rev: Revisao = { ...f, criadaEm: new Date().toISOString() };
    const extra: Record<string, unknown> = { revisoes: { [String(n)]: rev } };
    const proxima = f.big3Proxima.map((t) => t.trim()).filter(Boolean);
    if (n < 12 && proxima.length && !(r.config.big3[String(n + 1)] || []).length) {
      extra.big3 = { [String(n + 1)]: proxima.map((t, i) => ({ id: `${Date.now()}${i}`, titulo: t, progresso: 0 })) };
    }
    await r.salvarConfig(extra);
    setSalvo(true);
  };

  const areas = porArea(r.config, n, r.logs, r.hoje).filter((a) => a.exec.pct !== null).sort((a, b) => (a.exec.pct as number) - (b.exec.pct as number));
  const pior = areas[0];
  const melhor = areas[areas.length - 1];
  const rev = r.config.revisoes[String(n)];
  const historico = Object.entries(r.config.revisoes).filter(([k]) => Number(k) !== n).sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto space-y-4">
      <button onClick={() => ir({ t: 'ciclo' })} className="rotulo cursor-pointer">← Ciclo</button>
      <h1 className="text-2xl font-semibold">Revisão da semana {n}</h1>

      <section className="painel p-4 space-y-4">
        {campo('destaques', 'Destaques da semana')}
        {campo('deuCerto', 'O que deu certo')}
        {campo('deuErrado', 'O que deu errado')}
        {campo('licoes', 'Lições aprendidas')}
        <div>
          <span className="rotulo">Big 3 da próxima semana</span>
          <div className="space-y-2 mt-1">
            {f.big3Proxima.map((t, i) => (
              <input key={i} value={t} placeholder={`Resultado crítico ${i + 1}`} onChange={(e) => setF({ ...f, big3Proxima: f.big3Proxima.map((x, j) => (j === i ? e.target.value : x)) })} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Botao variante="primario" onClick={salvar}>Salvar revisão</Botao>
          {salvo && <span className="rotulo" style={{ color: COR.otimo }}>Salva</span>}
        </div>
      </section>

      {(rev || salvo) && (
        <section className="painel-destaque p-4">
          <Titulo extra={<span className="rotulo" style={{ fontSize: 10 }}>Análise automática</span>}>Diagnóstico final</Titulo>
          <div className="space-y-2 text-[15px] leading-relaxed">
            <p>Execução da semana {n}: {r.execSemana.pct === null ? 'sem dados' : `${r.execSemana.pct}% (${r.execSemana.feito} de ${r.execSemana.planejado} missões)`}.</p>
            {melhor && <p>Ponto mais forte: {AREA_POR_ID[melhor.area].nome} ({melhor.exec.pct}%).</p>}
            {pior && <p>Ponto mais fraco: {AREA_POR_ID[pior.area].nome} ({pior.exec.pct}%). Garanta a primeira missão dessa área logo no início da próxima semana.</p>}
            {f.licoes.trim() && <p>Lição que você registrou: “{f.licoes.trim()}”. Transforme em uma regra para a próxima semana.</p>}
            {f.big3Proxima.some((t) => t.trim()) && <p>Único movimento para segunda-feira: começar pelo primeiro item do Big 3 — “{f.big3Proxima.find((t) => t.trim())}”.</p>}
          </div>
        </section>
      )}

      {historico.length > 0 && (
        <section className="painel p-4">
          <Titulo>Revisões anteriores</Titulo>
          {historico.map(([k, v]) => (
            <div key={k} className="py-2 border-b border-line last:border-0 text-sm">
              <div className="rotulo">Semana {k}</div>
              <p className="text-mute mt-1">{v.licoes || v.destaques || 'Sem texto.'}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ---------- Hábitos ----------

export function HabitosPagina() {
  const r = useResumo();
  const inicio = r.config.ciclo_inicio;
  return (
    <div className="p-4 lg:p-6 max-w-[1000px] mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Hábitos</h1>
      <p className="text-sm text-mute">Aderência desde o início do ciclo ({dataCurta(inicio)}). Cada hábito é uma missão recorrente da rotina.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {AREAS.map((a) => {
          const lista = MISSOES.filter((m) => m.area === a.id);
          return (
            <section key={a.id} className="painel p-4">
              <Titulo>{a.nome}</Titulo>
              {lista.map((m) => {
                const datas: string[] = [];
                for (let d = inicio; d <= r.hoje; d = somaDias(d, 1)) datas.push(d);
                let plan = 0, feit = 0;
                for (const d of datas) {
                  const dia = DIAS_SEMANA[(new Date(d + 'T00:00:00').getDay() + 6) % 7].dia;
                  if (!m.dias.includes(dia)) continue;
                  if (d === r.hoje && r.estadoMissao(m.id, d) !== 'feita') continue;
                  plan++;
                  if (r.estadoMissao(m.id, d) === 'feita') feit++;
                }
                const p = plan ? Math.round((feit / plan) * 100) : null;
                return (
                  <div key={m.id} className="py-2.5 border-b border-line last:border-0">
                    <div className="flex justify-between gap-3 text-[15px]"><span className="truncate">{m.titulo}</span><Pct v={p} /></div>
                    <div className="flex gap-1 mt-1.5 mb-1.5">
                      {DIAS_SEMANA.map((d) => (
                        <span key={d.dia} className="rotulo px-1.5 py-0.5 rounded-sm" style={{ fontSize: 9, background: m.dias.includes(d.dia) ? 'var(--color-panel2)' : 'transparent', color: m.dias.includes(d.dia) ? 'var(--color-ink)' : 'var(--color-dim)', border: '1px solid var(--color-line)' }}>{d.label}</span>
                      ))}
                      {m.inicio && <span className="rotulo ml-auto num" style={{ fontSize: 10 }}>{m.inicio}</span>}
                    </div>
                    <Barra pct={p} />
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Big 3 (histórico) ----------

export function Big3Pagina() {
  const r = useResumo();
  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Big 3</h1>
      <Big3Card r={r} />
      <section className="painel p-4">
        <Titulo>Histórico do ciclo</Titulo>
        {Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n !== r.semana.n && (r.config.big3[String(n)] || []).length).map((n) => (
          <div key={n} className="py-3 border-b border-line last:border-0">
            <div className="rotulo mb-1">Semana {n}</div>
            {r.config.big3[String(n)].map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-1"><span className="flex-1 text-[15px] truncate">{b.titulo}</span><Pct v={b.progresso} className="text-sm" /></div>
            ))}
          </div>
        ))}
        {Object.keys(r.config.big3).filter((k) => Number(k) !== r.semana.n).length === 0 && <Vazio>O histórico aparece aqui quando houver outras semanas com Big 3.</Vazio>}
      </section>
    </div>
  );
}

// ---------- Relatórios ----------

export function RelatoriosPagina({ ir }: { ir: Ir }) {
  const r = useResumo();
  return (
    <div className="p-4 lg:p-6 max-w-[1300px] mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Relatórios</h1>
      <DiagnosticoCard r={r} ir={ir} largo />
      <div className="grid gap-4 xl:grid-cols-2">
        <EvolucaoSemanal r={r} />
        <EvolucaoAreas r={r} />
      </div>
      <section className="painel p-4 overflow-x-auto">
        <Titulo>Quadro por área</Titulo>
        <table className="w-full text-sm">
          <thead><tr className="rotulo text-left"><th className="py-2 font-normal">Área</th><th className="font-normal">Semana atual</th><th className="font-normal">Semana anterior</th><th className="font-normal">Ciclo</th></tr></thead>
          <tbody>
            {AREAS.map((a) => {
              const atual = execucaoSemana(r.config, r.semana.n, r.logs, r.hoje, a.id).pct;
              const ant = r.semana.n > 1 ? execucaoSemana(r.config, r.semana.n - 1, r.logs, r.hoje, a.id).pct : null;
              const todas: string[] = [];
              for (let d = r.config.ciclo_inicio; d <= r.hoje; d = somaDias(d, 1)) todas.push(d);
              const ciclo = execucaoDatas(todas, r.logs, r.hoje, a.id).pct;
              return (
                <tr key={a.id} className="border-t border-line">
                  <td className="py-2.5"><button className="cursor-pointer hover:text-cyan" onClick={() => ir({ t: 'area', id: a.id })}>{a.nome}</button></td>
                  <td className="num" style={{ color: COR[situacao(atual)] }}>{atual === null ? '—' : `${atual}%`}</td>
                  <td className="num text-mute">{ant === null ? '—' : `${ant}%`}</td>
                  <td className="num">{ciclo === null ? '—' : `${ciclo}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ---------- General (aba mobile) ----------

export function GeneralPagina({ ir }: { ir: Ir }) {
  const r = useResumo();
  const [plano, setPlano] = useState(false);
  const abertas = r.missoes.filter((m) => m.estado !== 'feita');
  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="rotulo" style={{ color: 'var(--color-cyan)' }}>Quartel general</div>
        <h1 className="text-2xl font-semibold">General</h1>
      </div>
      <AlertaCard r={r} ir={ir} />
      <DiagnosticoCard r={r} ir={ir} />
      <section className="painel p-4">
        <Titulo extra={<Botao onClick={() => setPlano(!plano)}>{plano ? 'Ocultar' : 'Gerar plano do dia'}</Botao>}>Plano do dia</Titulo>
        {plano && (abertas.length === 0 ? <Vazio>Nada pendente. O dia está fechado.</Vazio> : abertas.map((m) => <MissaoLinhaPublica key={m.id} m={m} r={r} />))}
        {!plano && <p className="text-sm text-mute">Lista as missões que faltam hoje, em ordem de horário.</p>}
      </section>
    </div>
  );
}

// ---------- Perfil ----------

export function PerfilPagina() {
  const r = useResumo();
  const { user, logout } = useAuth();
  const [data, setData] = useState(r.config.ciclo_inicio);
  return (
    <div className="p-4 lg:p-6 max-w-[800px] mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <section className="painel p-4 flex items-center gap-4">
        {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full" /> : <div className="w-14 h-14 rounded-full bg-panel2 border border-line2" />}
        <div className="min-w-0">
          <div className="text-lg font-medium truncate">{user?.displayName || r.nome}</div>
          <div className="text-sm text-mute truncate">{user?.email}</div>
        </div>
      </section>

      <section className="painel p-4">
        <Titulo>Início do ciclo de 12 semanas</Titulo>
        <div className="flex gap-2 items-center">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <Botao variante="primario" onClick={() => r.salvarConfig({ ciclo_inicio: data })} className="shrink-0">Salvar</Botao>
        </div>
        <p className="text-xs text-mute mt-2">Use uma segunda-feira. Muda a contagem de semanas; nada do histórico é apagado.</p>
      </section>

      <section className="painel p-4">
        <Titulo>Aparência</Titulo>
        <TemaToggle rotulo />
      </section>

      <section className="painel p-4">
        <Titulo>Notificações e configurações</Titulo>
        <div className="legado-claro"><Settings /></div>
      </section>

      <Botao onClick={() => logout()} className="flex items-center gap-2"><LogOut size={14} />Sair</Botao>
    </div>
  );
}
