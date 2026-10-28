import { ArrowUpRight, BookOpen, CalendarRange, Sparkles } from 'lucide-react';
import { useResumo, saudacao } from '../useResumo';
import type { Ir } from '../nav';
import { AREAS } from '../areas';
import CorpoMapa from '../ui/CorpoMapa';
import { Big3Card, MissoesDoDia } from '../ui/widgets';
import { TodayEntries } from './Workspace';

function Inicio({ ir }: { ir: Ir }) {
  const r = useResumo();
  return <div className="gv-page space-y-6">
    <header className="gv-page-header"><div><p className="text-cyan text-sm">Seu desenvolvimento, um dia de cada vez</p><h1>{saudacao(r.agora)}, {r.nome}.</h1><p>Veja o plano, realize a atividade e dê check.</p></div><button className="gv-pill" onClick={() => ir({ t: 'ciclo' })}><CalendarRange size={16} />Semana {r.semana.n} de 12<ArrowUpRight size={14} /></button></header>
    <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.1fr)] items-start">
      <section className="painel-destaque p-5 xl:sticky xl:top-5">
        <p className="text-xs text-cyan tracking-widest uppercase">General Valente</p><h2 className="text-xl font-semibold mt-2">O homem que estou construindo</h2><p className="text-sm text-mute mt-2">Toque em uma área para abrir seu plano, práticas e registros.</p>
        <CorpoMapa pcts={r.pcts} onSelect={id => ir({ t: 'area', id })} className="max-w-[470px] mx-auto mt-7" />
        <p className="text-xs text-mute text-center">Indicadores do mapa: execução da rotina existente na semana.</p>
      </section>
      <div className="space-y-5"><TodayEntries /><Big3Card r={r} />
        <section className="painel p-4"><h2 className="font-medium">Sua rotina existente</h2><p className="text-sm text-mute mt-1 mb-3">Preservada do aplicativo anterior. Revise os horários e objetivos antes de usá-la como seu plano atual.</p><details><summary className="text-cyan cursor-pointer text-sm">Abrir rotina e checks</summary><div className="mt-3"><MissoesDoDia r={r} comFiltros /><button className="gv-link mt-3" onClick={() => ir({ t: 'rotina' })}>Editar agenda semanal →</button></div></details></section>
        <div className="grid sm:grid-cols-2 gap-3"><button className="gv-quick" onClick={() => ir({ t: 'biblioteca' })}><BookOpen size={20} /><span><strong>Diário e arquivos</strong><small>Anote, envie e encontre materiais</small></span><ArrowUpRight size={16} /></button><button className="gv-quick" onClick={() => ir({ t: 'assistente' })}><Sparkles size={20} /><span><strong>Falar com o General</strong><small>Organize o próximo passo</small></span><ArrowUpRight size={16} /></button></div>
      </div>
    </div>
    <section><h2 className="text-lg font-semibold mb-3">Explore suas áreas</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{AREAS.map(a => { const Icon = a.icon; return <button key={a.id} className="gv-area" onClick={() => ir({ t: 'area', id: a.id })}><Icon size={20} className="text-cyan" /><span>{a.nome}</span><ArrowUpRight size={14} className="text-mute" /></button>; })}</div></section>
  </div>;
}
export const InicioDesktop = Inicio;
export const InicioMobile = Inicio;
