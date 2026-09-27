import React from 'react';
import {
  BookOpen, BriefcaseBusiness, Check, ChevronRight, CircleDollarSign,
  HeartPulse, Leaf, Sparkles, TrendingUp,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useRecords } from '../hooks/useRecords';
import { useHabitosHoje } from '../hooks/useHabitosHoje';
import { useHabitoLogsHistory } from '../hooks/useHabitoLogsHistory';
import { getRecordProgress } from '../utils/progress';

export type PriorityView = 'hoje' | 'prioridades' | 'evolucao';

interface Props {
  view: PriorityView;
  onNavigate?: (areaId: string) => void;
}

const PRIORITIES = [
  { id: 'saude', label: 'Saúde', action: 'Treino ou caminhada', color: '#239267', icon: HeartPulse },
  { id: 'financas', label: 'Finanças', action: 'Uma ação de receita', color: '#e67e22', icon: CircleDollarSign },
  { id: 'carreira', label: 'Carreira', action: 'Estudo ou ativo profissional', color: '#2778b9', icon: BriefcaseBusiness },
  { id: 'espiritualidade', label: 'Espiritualidade', action: 'Prática espiritual', color: '#8057c7', icon: Leaf },
  { id: 'desenvolvimento', label: 'Leitura & Desenvolvimento', action: 'Leitura aprofundada', color: '#b88718', icon: BookOpen },
] as const;

const DONE = ['Lido', 'Concluído', 'Finalizado', 'Realizado', 'Pago', 'Feito', 'Mestre'];
const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export default function PriorityDashboard({ view, onNavigate }: Props) {
  const { records, loading } = useRecords();
  const { habitosAtivos, feitosHoje, toggleHabito, loading: habitsLoading } = useHabitosHoje();
  const { logs, loading: historyLoading } = useHabitoLogsHistory();

  const days = React.useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return { date: date.toISOString().slice(0, 10), label: dayNames[date.getDay()] };
  }), []);

  const data = PRIORITIES.map(priority => {
    const areaRecords = records.filter(record => record.area_id === priority.id);
    const habits = habitosAtivos.filter(record => record.area_id === priority.id);
    const primaryHabit = habits[0];
    const checkedToday = primaryHabit
      ? feitosHoje.includes(String(primaryHabit.id))
      : areaRecords.some(record => DONE.includes(record.data?.status) && record.updated_at?.slice(0, 10) === days[6].date);
    const week = days.map(day => {
      const log = logs.find(item => item.date === day.date);
      return habits.length > 0 && habits.some(habit => log?.habitos_feitos?.includes(String(habit.id)));
    });
    const weekDone = week.filter(Boolean).length;
    const score = areaRecords.length
      ? Math.round(areaRecords.reduce((sum, record) => sum + getRecordProgress(record), 0) / areaRecords.length)
      : 0;
    return { ...priority, areaRecords, primaryHabit, checkedToday, week, weekDone, score };
  });

  if (loading || habitsLoading || historyLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#d97706]/20 border-t-[#d97706] rounded-full animate-spin" /></div>;
  }

  if (view === 'hoje') return <TodayView data={data} onNavigate={onNavigate} toggleHabito={toggleHabito} />;
  if (view === 'prioridades') return <PrioritiesView data={data} days={days} onNavigate={onNavigate} />;
  return <EvolutionView data={data} />;
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><h2 className="text-3xl font-bold tracking-tight uppercase">{title}</h2><p className="mt-1 text-[12px] font-mono uppercase tracking-[0.24em] text-gray-500">{subtitle}</p></div>;
}

function TodayView({ data, onNavigate, toggleHabito }: any) {
  const done = data.filter((item: any) => item.checkedToday).length;
  return <div className="max-w-4xl mx-auto">
    <PageTitle title="Hoje" subtitle="Um dia melhor começa com foco" />
    <div className="grid lg:grid-cols-[1fr_190px] gap-5 mb-6">
      <div className="bg-white/60 border border-black/10 rounded-3xl p-6 flex items-center gap-4"><Sparkles className="text-[#d97706]" /><p className="text-lg font-semibold">Pequenas ações diárias constroem resultados extraordinários.</p></div>
      <div className="bg-white/60 border border-black/10 rounded-3xl p-5 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full grid place-items-center" style={{ background: `conic-gradient(#d97706 ${done / 5 * 360}deg, #e8e4dc 0)` }}><div className="w-20 h-20 rounded-full bg-[#f7f5f0] grid place-items-center text-center"><div><strong className="text-2xl">{done}/5</strong><p className="text-[10px] font-mono uppercase text-gray-500">prioridades</p></div></div></div>
      </div>
    </div>
    <div className="space-y-3">{data.map((item: any) => { const Icon = item.icon; return <button key={item.id} onClick={() => item.primaryHabit ? toggleHabito(String(item.primaryHabit.id)) : onNavigate?.(item.id)} className="w-full bg-white/70 border border-black/10 rounded-2xl p-4 flex items-center gap-4 text-left hover:-translate-y-0.5 hover:shadow-md transition-all" style={{ borderLeftColor: item.color, borderLeftWidth: 5 }}>
      <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: `${item.color}16`, color: item.color }}><Icon size={22} /></div>
      <div className="flex-1"><p className="text-sm font-bold uppercase tracking-wide">{item.label}</p><p className="text-sm text-gray-500 mt-0.5">{item.primaryHabit?.data?.nome || item.action}</p></div>
      <div className={`w-8 h-8 rounded-lg border-2 grid place-items-center ${item.checkedToday ? 'text-white' : 'text-transparent'}`} style={{ borderColor: item.color, backgroundColor: item.checkedToday ? item.color : 'transparent' }}><Check size={18} /></div>
    </button> })}</div>
    <div className="mt-6 rounded-2xl bg-[#d97706] text-white px-6 py-4 flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[0.2em]">Progresso do dia</span><strong>{Math.round(done / 5 * 100)}%</strong></div>
  </div>;
}

function PrioritiesView({ data, days, onNavigate }: any) {
  return <div><PageTitle title="Prioridades" subtitle="Hábitos de hoje, conquistas de amanhã" />
    <div className="grid gap-3 mb-6">{data.map((item: any) => { const Icon = item.icon; return <button key={item.id} onClick={() => onNavigate?.(item.id)} className="bg-white/60 border border-black/10 rounded-2xl p-4 grid grid-cols-[44px_1fr_auto] items-center gap-4 text-left hover:border-black/20 transition-all"><div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: `${item.color}16`, color: item.color }}><Icon size={21} /></div><div><div className="flex justify-between mb-2"><strong className="uppercase text-sm">{item.label}</strong><span className="font-mono text-xs text-gray-500">{item.weekDone}/7</span></div><div className="h-2 bg-black/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${item.weekDone / 7 * 100}%`, backgroundColor: item.color }} /></div></div><ChevronRight className="text-gray-400" size={18} /></button> })}</div>
    <section className="bg-white/60 border border-black/10 rounded-3xl p-5 overflow-x-auto"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5">Visão da semana</h3><div className="min-w-[680px] grid grid-cols-[220px_repeat(7,1fr)] gap-2 items-center"><div />{days.map((day: any) => <div key={day.date} className="text-center text-[11px] font-mono text-gray-500">{day.label}</div>)}{data.map((item: any) => <React.Fragment key={item.id}><div className="font-bold text-xs uppercase py-2">{item.label}</div>{item.week.map((checked: boolean, index: number) => <div key={index} className="flex justify-center"><div className="w-6 h-6 rounded-md border grid place-items-center" style={{ borderColor: checked ? item.color : '#d1d5db', backgroundColor: checked ? item.color : 'transparent' }}>{checked && <Check size={14} className="text-white" />}</div></div>)}</React.Fragment>)}</div></section>
  </div>;
}

function EvolutionView({ data }: any) {
  const consistency = Math.round(data.reduce((sum: number, item: any) => sum + item.weekDone, 0) / 35 * 100);
  const chartData = data.map((item: any) => ({ name: item.label.replace(' & ', ' / '), score: item.score, color: item.color }));
  return <div><PageTitle title="Evolução" subtitle="Dados de hoje. Uma vida melhor amanhã." />
    <div className="grid lg:grid-cols-[1fr_260px] gap-6 mb-6"><section className="bg-white/60 border border-black/10 rounded-3xl p-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] mb-4">Visão semanal</h3><div className="h-[330px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={chartData}><PolarGrid stroke="#dedad2" /><PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#5b5b5b' }} /><Radar dataKey="score" stroke="#d97706" fill="#d97706" fillOpacity={0.22} /></RadarChart></ResponsiveContainer></div></section><section className="bg-white/60 border border-black/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center"><TrendingUp className="text-[#d97706] mb-3" /><strong className="text-4xl">{consistency}%</strong><p className="font-mono text-xs uppercase tracking-widest text-gray-500 mt-2">de consistência</p><p className="mt-5 text-sm text-gray-500">Consistência transforma intenções em resultados.</p></section></div>
    <section className="bg-white/60 border border-black/10 rounded-3xl p-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] mb-4">Consistência por prioridade</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ece8e0" /><XAxis type="number" domain={[0,100]} hide /><YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="score" radius={[0,8,8,0]}>{chartData.map((item: any) => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer></div></section>
  </div>;
}
