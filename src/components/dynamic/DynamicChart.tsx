import React, { useState } from 'react';
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
  Legend
} from 'recharts';
import { AreaConfig, GenericRecord } from '../../types';
import StreakCalendar from './StreakCalendar';

interface DynamicChartProps {
  config: AreaConfig;
  records: GenericRecord[];
  onFilterRequest?: (filters: any, type?: string) => void;
}

export default function DynamicChart({ config, records, onFilterRequest }: DynamicChartProps) {
  const [hiddenSegments, setHiddenSegments] = useState<string[]>([]);
  const COLORS = [config.cor, '#00d4ff', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl opacity-50">{config.icon}</span>
        </div>
        <h3 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest">Nenhum dado disponível</h3>
        <p className="text-[10px] font-mono text-gray-600 mt-2 uppercase tracking-widest">Adicione seu primeiro item para ver as estatísticas!</p>
      </div>
    );
  }

  // Data for Pie Chart (Distribution by Type)
  const pieData = config.tiposItem.map(type => ({
    name: type.toUpperCase(),
    value: records.filter(r => r.type === type).length,
    type: type
  })).filter(d => d.value > 0 && !hiddenSegments.includes(d.name));

  // Data for Bar Chart (Status/Category)
  const barData = config.colunasKanban.map(col => ({
    name: col,
    count: records.filter(r => {
      const status = r.data.status || r.data.tipo || r.data.categoria;
      return status === col;
    }).length
  }));

  // Data for Line Chart (Temporal Evolution)
  const lineData = records
    .filter(r => r.data.data || r.created_at)
    .map(r => ({
      date: new Date(r.data.data || r.created_at).toLocaleDateString('pt-BR'),
      timestamp: new Date(r.data.data || r.created_at).getTime(),
      value: Number(r.data.valor) || 1
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce((acc: any[], curr) => {
      const existing = acc.find(d => d.date === curr.date);
      if (existing) {
        existing.value += curr.value;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-mono font-bold text-[#00ff9d] uppercase mb-1">{label || payload[0].name}</p>
          <p className="text-xs text-white font-bold">
            {payload[0].value} {payload[0].name === 'value' ? 'R$' : 'Itens'}
          </p>
        </div>
      );
    }
    return null;
  };

  const toggleSegment = (name: string) => {
    setHiddenSegments(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {config.graficos.includes('pizza') && pieData.length > 0 && (
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm hover:border-white/20 transition-all">
          <h3 className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Distribuição_Por_Tipo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={500}
                  onClick={(data: any) => onFilterRequest?.({}, data.type)}
                  className="cursor-pointer"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  onClick={(data) => toggleSegment(data.value)}
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {config.graficos.includes('barras') && (
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm hover:border-white/20 transition-all">
          <h3 className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Status_Geral</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar 
                  dataKey="count" 
                  fill={config.cor} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={500}
                  onClick={(data) => onFilterRequest?.({ statusFilter: [data.name] })}
                  className="cursor-pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {config.graficos.includes('linha') && lineData.length > 0 && (
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm hover:border-white/20 transition-all lg:col-span-2">
          <h3 className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-6 uppercase">Evolução_Temporal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={config.cor} 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: config.cor, strokeWidth: 2, stroke: '#0a0a0a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Streak Calendars for Habits */}
      {records.filter(r => r.type === 'habito').map(habit => (
        <div key={habit.id} className="lg:col-span-2">
          <StreakCalendar 
            streak={habit.data.streakAtual || 0} 
            color={config.cor} 
          />
        </div>
      ))}
    </div>
  );
}
