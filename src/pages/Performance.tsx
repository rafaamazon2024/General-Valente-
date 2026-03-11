import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, Target, Award, Zap, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function Performance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 font-mono text-[#00ff9d]">ANALISANDO_DADOS_SISTEMA...</div>;

  const COLORS = ['#00ff9d', '#00d4ff', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Summary Phrase */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#00ff9d]/5 border border-[#00ff9d]/20 rounded-3xl p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-50" />
        <Activity className="mx-auto mb-4 text-[#00ff9d] animate-pulse" size={32} />
        <h2 className="text-xl font-mono font-bold tracking-widest text-[#00ff9d] mb-2 uppercase">Relatório do Comandante</h2>
        <p className="text-lg font-medium text-gray-300 italic">"{data.summaryPhrase}"</p>
      </motion.section>

      {/* Summary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <IndicatorCard title="Consistência" value={`${Math.round(data.performanceHistory.reduce((acc: any, c: any) => acc + c.habitScore, 0) / data.performanceHistory.length)}%`} icon={<Zap className="text-amber-500" />} color="bg-amber-500/10" />
        <IndicatorCard title="Performance" value={`${Math.round(data.performanceHistory.reduce((acc: any, c: any) => acc + c.overall, 0) / data.performanceHistory.length)}%`} icon={<TrendingUp className="text-[#00ff9d]" />} color="bg-[#00ff9d]/10" />
        <IndicatorCard title="Tarefas" value={data.taskDistribution.reduce((acc: any, c: any) => acc + c.count, 0).toString()} icon={<Target className="text-[#00d4ff]" />} color="bg-[#00d4ff]/10" />
        <IndicatorCard title="Áreas" value={data.taskDistribution.length.toString()} icon={<Activity className="text-purple-500" />} color="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Evolution */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Evolução_Performance_30D</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#666' }} 
                  tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="#00ff9d" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#00ff9d', strokeWidth: 0 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Radar Chart (Wheel of Life) */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Equilíbrio_Roda_Vida</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.perHabitStats.slice(0, 6).map((h: any) => ({
                subject: h.name.substring(0, 10),
                A: h.total_logs > 0 ? (h.completed_logs / h.total_logs) * 100 : 0,
                fullMark: 100
              }))}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#00d4ff"
                  fill="#00d4ff"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Per Habit Stats */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Estatísticas_Por_Hábito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.perHabitStats.map((habit: any) => {
              const score = habit.total_logs > 0 ? Math.round((habit.completed_logs / habit.total_logs) * 100) : 0;
              return (
                <div key={habit.name} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{habit.name}</p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase">{habit.completed_logs} / {habit.total_logs} CHECK-INS</p>
                  </div>
                  <div className={`text-lg font-mono font-bold ${score > 80 ? 'text-[#00ff9d]' : score > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {score}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function IndicatorCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4 shadow-inner`}>
        {icon}
      </div>
      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-mono font-bold">{value}</p>
    </div>
  );
}
