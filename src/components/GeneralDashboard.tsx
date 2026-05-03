import React, { useState } from 'react';
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
import { Award, Zap, Target, TrendingUp, Plus, Info, ChevronRight, BookOpen } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { useAuth } from './AuthContext';
import { db, doc, onSnapshot as onSnapshotFirestore } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface GeneralDashboardProps {
  onNavigate?: (areaId: string) => void;
}

export default function GeneralDashboard({ onNavigate }: GeneralDashboardProps) {
  const { user } = useAuth();
  const { records: allRecords, loading: recordsLoading } = useRecords();
  const [userSettings, setUserSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  React.useEffect(() => {
    if (!user) return;
    const unsub = onSnapshotFirestore(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserSettings(doc.data());
      }
      setSettingsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const loading = recordsLoading || settingsLoading;

  // Calculate scores per area (0-100)
  const areaScores = CONFIG_AREAS.map(area => {
    const areaRecords = allRecords.filter(r => r.area_id === area.id);
    if (areaRecords.length === 0) return { id: area.id, name: area.nome, score: 0, full: 100, color: area.cor, count: 0 };
    
    // Simple score logic: % of items that are "Done/Lido/Concluido"
    const completed = areaRecords.filter(r => {
      const status = r.data.status || r.data.tipo || r.data.categoria;
      return ['Lido', 'Concluído', 'Finalizado', 'Realizado', 'Pago', 'Feito', 'Mestre'].includes(status);
    }).length;
    
    const score = Math.round((completed / areaRecords.length) * 100);
    return { id: area.id, name: area.nome, score: score || 20, full: 100, color: area.cor, count: areaRecords.length }; // Min 20 for visual
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
      {/* Guia de Início Rápido */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative">
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                title="Fechar Guia"
              >
                <Plus size={18} className="rotate-45" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/20 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-[#00ff9d]" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Guia_De_Inicializacao_Sistemica</h3>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Como_Operar_Seu_LIFE_OS</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 group hover:border-[#00ff9d]/30 transition-all">
                      <div className="text-[#00ff9d] mt-0.5"><ChevronRight size={14} /></div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-200">1. Navegue Pelas Áreas</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase mt-1">Use o menu lateral para acessar Saúde, Finanças, Carreira, etc.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 group hover:border-[#00d4ff]/30 transition-all">
                      <div className="text-[#00d4ff] mt-0.5"><ChevronRight size={14} /></div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-200">2. Adicione Registros</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase mt-1">Clique em <span className="text-white">+ NOVO REGISTRO</span> em qualquer área para alimentar o sistema.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 group hover:border-amber-500/30 transition-all">
                      <div className="text-amber-500 mt-0.5"><ChevronRight size={14} /></div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-200">3. Expanda sua Roda</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase mt-1">Conclua itens para ver seu Score Global e a Roda da Vida Digital crescerem.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-black/20 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                      <div className="text-purple-500 mt-0.5"><ChevronRight size={14} /></div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-200">4. Domine as Visualizações</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase mt-1">Alterne entre Kanban, Tabela e Calendário para gerenciar cada área.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta Suprema */}
      {userSettings?.supreme_goal && (
        <div className="bg-gradient-to-r from-[#00ff9d]/10 to-transparent border border-[#00ff9d]/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award size={120} className="text-[#00ff9d]" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono font-bold text-[#00ff9d] uppercase tracking-[0.5em] mb-4">Meta_Suprema_2026</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl">
              "{userSettings.supreme_goal}"
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
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-8 hover:border-white/20 transition-all">
          <h3 className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] text-gray-500 mb-4 sm:mb-8 uppercase text-center">Roda_Da_Vida_Digital</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={window.innerWidth < 640 ? "60%" : "80%"} data={areaScores}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: window.innerWidth < 640 ? 8 : 10 }} />
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
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-8 hover:border-white/20 transition-all">
          <h3 className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] text-gray-500 mb-4 sm:mb-8 uppercase text-center">Performance_Por_Área</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaScores} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: window.innerWidth < 640 ? 8 : 10 }} width={window.innerWidth < 640 ? 80 : 120} />
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

      {/* Tarefas do Dia por Área */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#00ff9d] rounded-full" />
          <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-white uppercase">Tarefas_Do_Dia_Por_Área</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONFIG_AREAS.map(area => {
            const areaTasks = allRecords.filter(r => 
              r.area_id === area.id && 
              (r.type === 'tarefa' || r.type === 'projeto' || r.type === 'meta' || r.type === 'acao') &&
              r.data.status !== 'Concluído' && 
              r.data.status !== 'Finalizado' &&
              r.data.status !== 'Feito'
            );

            if (areaTasks.length === 0) return null;

            return (
              <div key={area.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{area.icon}</span>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">{area.nome}</h4>
                  <span className="ml-auto text-[10px] font-mono text-gray-500">{areaTasks.length}</span>
                </div>
                
                <div className="space-y-3 flex-1">
                  {areaTasks.slice(0, 3).map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: area.cor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-200 truncate">
                          {task.data.titulo || task.data.nome || task.data.projeto || task.data.item}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{task.data.status || 'Pendente'}</span>
                          {task.data.deadline && (
                            <span className="text-[8px] font-mono text-amber-500/70 uppercase tracking-widest">
                              {new Date(task.data.deadline).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {areaTasks.length > 3 && (
                    <button 
                      onClick={() => onNavigate?.(area.id)}
                      className="w-full py-2 text-[9px] font-mono text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      + {areaTasks.length - 3} outras tarefas
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => onNavigate?.(area.id)}
                  className="mt-4 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-mono font-bold text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all"
                >
                  Gerenciar Área
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bloco de Notas Rápido */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#94a3b8] rounded-full" />
          <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-white uppercase">Bloco_De_Notas_Recentes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allRecords
            .filter(r => r.area_id === 'notas')
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 4)
            .map((note, idx) => (
              <button 
                key={idx}
                onClick={() => onNavigate?.('notas')}
                className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[8px] font-mono text-[#94a3b8] uppercase tracking-widest">{note.data.categoria || 'Nota'}</span>
                  {note.data.status === 'Fixado' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                </div>
                <h4 className="text-xs font-bold text-gray-200 mb-2 group-hover:text-white transition-colors truncate">{note.data.titulo}</h4>
                <p className="text-[10px] font-mono text-gray-500 line-clamp-3 leading-relaxed">
                  {note.data.conteudo}
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-gray-600 uppercase">
                    {new Date(note.created_at || '').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          
          <button 
            onClick={() => onNavigate?.('notas')}
            className="bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all min-h-[160px]"
          >
            <Plus size={24} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Nova_Nota</span>
          </button>
        </div>
      </section>
    </div>
  );
}
