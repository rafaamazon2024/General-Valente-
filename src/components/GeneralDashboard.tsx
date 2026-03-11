import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { CONFIG_AREAS } from '../config/areas';
import { GenericRecord } from '../types';
import { Award, Zap, Target, TrendingUp } from 'lucide-react';

interface GeneralDashboardProps {
  onNavigate?: (areaId: string) => void;
}

export default function GeneralDashboard({ onNavigate }: GeneralDashboardProps) {
  const [allRecords, setAllRecords] = useState<GenericRecord[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/records-all').then(res => res.ok ? res.json() : []),
      fetch('/api/settings').then(res => res.ok ? res.json() : null)
    ]).then(([records, settingsData]) => {
      setAllRecords(records || []);
      setSettings(settingsData);
    }).catch(err => {
      console.error("Erro ao carregar dados:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Calculate scores per area (0-100)
  const areaScores = CONFIG_AREAS.map(area => {
    const records = allRecords.filter(r => r.area_id === area.id);
    if (records.length === 0) return { id: area.id, name: area.nome, score: 0, full: 100, color: area.cor, count: 0 };
    
    // Simple score logic: % of items that are "Done/Lido/Concluido"
    const completed = records.filter(r => {
      const status = r.data.status || r.data.tipo || r.data.categoria;
      return ['Lido', 'Concluído', 'Finalizado', 'Realizado', 'Pago', 'Feito', 'Mestre'].includes(status);
    }).length;
    
    const score = Math.round((completed / records.length) * 100);
    return { id: area.id, name: area.nome, score: score || 20, full: 100, color: area.cor, count: records.length }; // Min 20 for visual
  });

  const overallScore = Math.round(areaScores.reduce((acc, curr) => acc + curr.score, 0) / areaScores.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00ff9d]/20 border-t-[#00ff9d] rounded-full animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Sincronizando_Dados...</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-mono font-bold text-[#00ff9d] uppercase mb-1">{data.name}</p>
          <p className="text-xs text-white font-bold">{data.score}% Completo</p>
          <p className="text-[9px] text-gray-500 mt-1 uppercase">{data.count} Itens Registrados</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Meta Suprema */}
      {settings?.supreme_goal && (
        <div className="bg-gradient-to-r from-[#00ff9d]/10 to-transparent border border-[#00ff9d]/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award size={120} className="text-[#00ff9d]" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono font-bold text-[#00ff9d] uppercase tracking-[0.5em] mb-4">Meta_Suprema_2026</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl">
              "{settings.supreme_goal}"
            </h2>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-[#00ff9d]/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-[#00ff9d]" />
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Score_Global</p>
          <h3 className="text-4xl font-mono font-bold text-white">{overallScore}%</h3>
          <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#00ff9d] transition-all duration-1000" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-[#00d4ff]/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={64} className="text-[#00d4ff]" />
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Registros_Totais</p>
          <h3 className="text-4xl font-mono font-bold text-white">{allRecords.length}</h3>
          <p className="text-[10px] font-mono text-[#00d4ff] mt-4 uppercase tracking-widest">SISTEMA_OPERACIONAL</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={64} className="text-amber-500" />
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Áreas_Ativas</p>
          <h3 className="text-4xl font-mono font-bold text-white">{CONFIG_AREAS.filter(a => allRecords.some(r => r.area_id === a.id)).length}</h3>
          <p className="text-[10px] font-mono text-amber-500 mt-4 uppercase tracking-widest">MAPA_DA_VIDA</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-purple-500" />
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Status_Geral</p>
          <h3 className="text-4xl font-mono font-bold text-white">ESTÁVEL</h3>
          <p className="text-[10px] font-mono text-purple-500 mt-4 uppercase tracking-widest">SINCRONIZADO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
          <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-gray-500 mb-8 uppercase text-center">Roda_Da_Vida_Digital</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={areaScores}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#00ff9d"
                  fill="#00ff9d"
                  fillOpacity={0.3}
                  animationDuration={1000}
                  onClick={(data) => onNavigate?.(data.id)}
                  className="cursor-pointer hover:fill-opacity-50 transition-all"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Comparative Bars */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
          <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-gray-500 mb-8 uppercase text-center">Performance_Por_Área</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaScores} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: 10 }} width={120} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar 
                  dataKey="score" 
                  radius={[0, 4, 4, 0]} 
                  animationDuration={1000}
                  onClick={(data) => onNavigate?.(data.id)}
                  className="cursor-pointer"
                >
                  {areaScores.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Area Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {areaScores.map((area) => (
          <button 
            key={area.name} 
            onClick={() => onNavigate?.(area.id)}
            className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{CONFIG_AREAS.find(a => a.nome === area.name)?.icon}</span>
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">{area.name}</span>
            <span className="text-lg font-mono font-bold text-white">{area.score}%</span>
            <div className="w-full bg-white/5 h-0.5 mt-2 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000" style={{ width: `${area.score}%`, backgroundColor: area.color }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
