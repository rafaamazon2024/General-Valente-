import React from 'react';
import { Bell, Search, Target, BarChart3, Play, ShieldAlert, ChevronRight } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { useResumo, saudacao } from '../useResumo';
import type { Ir } from '../nav';
import Capacete, { Logo } from '../ui/Capacete';
import CorpoMapa from '../ui/CorpoMapa';
import { Barra, Pct, Titulo } from '../ui/kit';
import {
  AlertaCard, AlimentacaoHoje, Big3Card, Consistencia, DiagnosticoCard, EvolucaoAreas, EvolucaoSemanal,
  MapaExecucao, MissoesDoDia, ProximaAcaoCard, ResumoAreas, TreinoHoje,
} from '../ui/widgets';

function SegmentosSemana({ n }: { n: number }) {
  return (
    <div className="flex gap-[3px] mt-1.5 justify-end">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="h-[5px] w-[11px] rounded-[1px]" style={{ background: i < n ? '#2563eb' : 'var(--color-line)' }} />
      ))}
    </div>
  );
}

function Delta({ v }: { v: number | null }) {
  if (v === null) return null;
  return <span className="text-xs num" style={{ color: v >= 0 ? '#34d399' : '#fbbf24' }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)}%</span>;
}

function CabecalhoMobile({ r }: { r: ReturnType<typeof useResumo> }) {
  return (
    <header className="px-4 pt-4 pb-3">
      <div className="flex items-center justify-center relative mb-4">
        <Logo size={28} />
        <Bell size={18} className="absolute right-0 text-mute" />
      </div>
      <div className="flex items-end justify-between">
        <h1 className="text-[22px] font-semibold whitespace-nowrap">{saudacao(r.agora)}, {r.nome}</h1>
        <div className="text-right shrink-0">
          <div className="text-[12px] text-ink num">Semana {r.semana.n} de 12</div>
          <SegmentosSemana n={r.semana.n} />
        </div>
      </div>
      <div className="painel-destaque px-4 py-3 mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px]">Execução da semana: <Pct v={r.execSemana.pct} className="text-xl font-semibold" /></span>
          <Delta v={r.delta} />
        </div>
        <div className="mt-2"><Barra pct={r.execSemana.pct} cor="#3b82f6" alt={6} /></div>
      </div>
      <p className="mt-3 text-[15px] text-mute italic leading-snug border border-line rounded-md px-4 py-3">
        “{r.frase}” <span className="rotulo not-italic ml-1" style={{ fontSize: 9 }}>General Valente</span>
      </p>
    </header>
  );
}

function Atalho({ icon, titulo, sub, cor, onClick, destaque }: {
  icon: React.ReactNode; titulo: string; sub: string; cor: string; onClick: () => void; destaque?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="painel p-3 text-left flex items-center gap-3 cursor-pointer min-w-0"
      style={destaque ? { borderColor: `${cor}66`, background: `${cor}10` } : undefined}
    >
      <span className="shrink-0" style={{ color: cor }}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-tight" style={destaque ? { color: cor } : undefined}>{titulo}</span>
        <span className="block text-[12px] text-mute leading-tight mt-0.5 truncate">{sub}</span>
      </span>
      <ChevronRight size={16} className="text-dim shrink-0" />
    </button>
  );
}

const rolar = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function InicioMobile({ ir }: { ir: Ir }) {
  const r = useResumo();
  return (
    <div className="pb-6">
      <CabecalhoMobile r={r} />
      <div className="px-2">
        <CorpoMapa pcts={r.pcts} onSelect={(id) => ir({ t: 'area', id })} className="max-w-[460px] mx-auto" />
      </div>
      <div className="px-4 space-y-3 mt-2">
        <div className="grid grid-cols-2 gap-2">
          <Atalho icon={<Target size={22} />} titulo="Missão do dia" sub={`${r.execHoje.feito} de ${r.execHoje.planejado} concluídas`} cor="#fbbf24" onClick={() => rolar('missoes')} />
          <Atalho icon={<BarChart3 size={22} />} titulo="Big 3 da semana" sub={r.big3.length ? `${r.big3.length} em andamento` : 'Defina os 3'} cor="#3b82f6" onClick={() => rolar('big3')} />
          <Atalho
            icon={<Play size={22} />} titulo="Próxima ação" cor="#22d3ee" onClick={() => rolar('proxima')}
            sub={r.proxima ? `${r.proxima.missao.titulo}${r.proxima.missao.duracao ? ` · ${r.proxima.missao.duracao} min` : ''}` : 'Tudo fechado'}
          />
          <Atalho
            icon={<ShieldAlert size={22} />} titulo="Alerta do General" cor="#f87171" destaque={!!r.alerta}
            sub={r.alerta ? r.alerta.texto.split(':')[0] : 'Sem alertas'}
            onClick={() => { if (r.alerta?.area) ir({ t: 'area', id: r.alerta.area }); }}
          />
        </div>
        <div id="missoes"><MissoesDoDia r={r} /></div>
        <div id="proxima"><ProximaAcaoCard r={r} /></div>
        <div id="big3"><Big3Card r={r} /></div>
        <AlertaCard r={r} ir={ir} />
        <DiagnosticoCard r={r} ir={ir} />
      </div>
    </div>
  );
}

export function InicioDesktop({ ir }: { ir: Ir }) {
  const r = useResumo();
  const { user } = useAuth();
  return (
    <div className="p-6 space-y-4 max-w-[1700px] mx-auto">
      <header className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{saudacao(r.agora)}, {r.nome}</h1>
          <p className="text-mute text-[15px] italic mt-0.5 truncate">“{r.frase}”</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="painel px-4 py-2.5 w-[250px]">
            <div className="flex items-baseline justify-between text-sm">
              <span>Execução da semana: <Pct v={r.execSemana.pct} className="text-lg font-semibold" /></span>
              <Delta v={r.delta} />
            </div>
            <div className="mt-1.5"><Barra pct={r.execSemana.pct} cor="#3b82f6" alt={5} /></div>
          </div>
          <div className="painel px-4 py-2.5">
            <div className="text-sm num">Semana {r.semana.n} de 12</div>
            <SegmentosSemana n={r.semana.n} />
          </div>
          <button className="painel p-2.5 cursor-pointer" aria-label="Buscar"><Search size={16} className="text-mute" /></button>
          <button className="painel p-2.5 cursor-pointer" aria-label="Notificações" onClick={() => ir({ t: 'perfil' })}><Bell size={16} /></button>
          <button onClick={() => ir({ t: 'perfil' })} className="flex items-center gap-2 cursor-pointer">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-line2" />
              : <span className="w-9 h-9 rounded-full border border-line2 bg-panel2 flex items-center justify-center text-cyan"><Capacete size={18} /></span>}
            <span className="text-sm hidden 2xl:block">{r.nome}</span>
          </button>
        </div>
      </header>

      <ResumoAreas r={r} ir={ir} grade />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:grid-cols-[380px_minmax(0,1fr)_310px] items-start">
        {/* Zona esquerda */}
        <section className="painel p-4 lg:row-span-2 xl:row-span-1">
          <Titulo>O homem que estou construindo</Titulo>
          <CorpoMapa pcts={r.pcts} onSelect={(id) => ir({ t: 'area', id })} className="max-w-[440px] mx-auto" />
        </section>

        {/* Zona central */}
        <div className="space-y-4 min-w-0">
          <MissoesDoDia r={r} comFiltros />
          <Big3Card r={r} />
          <MapaExecucao r={r} />
        </div>

        {/* Zona direita */}
        <div className="space-y-4 min-w-0 lg:col-span-2 xl:col-span-1 grid gap-4 lg:grid-cols-2 xl:grid-cols-1 content-start">
          <ProximaAcaoCard r={r} />
          <AlertaCard r={r} ir={ir} />
          <AlimentacaoHoje r={r} ir={ir} />
          <TreinoHoje r={r} ir={ir} />
          <Consistencia r={r} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EvolucaoSemanal r={r} />
        <EvolucaoAreas r={r} />
      </div>

      <DiagnosticoCard r={r} ir={ir} largo />
    </div>
  );
}
