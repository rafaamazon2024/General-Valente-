import React from 'react';
import { GenericRecord, AreaConfig } from '../../types';
import { Target, TrendingUp, Award } from 'lucide-react';

interface DynamicGoalsProps {
  config: AreaConfig;
  records: GenericRecord[];
}

export default function DynamicGoals({ config, records }: DynamicGoalsProps) {
  const getProgress = (record: GenericRecord) => {
    if (record.data.totalPaginas && record.data.paginaAtual !== undefined) {
      return Math.min(100, Math.round((record.data.paginaAtual / record.data.totalPaginas) * 100));
    }
    if (record.data.totalAulas && record.data.aulaAtual !== undefined) {
      return Math.min(100, Math.round((record.data.aulaAtual / record.data.totalAulas) * 100));
    }
    if (record.data.metaStreak && record.data.streakAtual !== undefined) {
      return Math.min(100, Math.round((record.data.streakAtual / record.data.metaStreak) * 100));
    }
    if (record.data.status === 'Lido' || record.data.status === 'Concluído' || record.data.status === 'Finalizado') {
      return 100;
    }
    return 0;
  };

  const getProgressColor = (percent: number) => {
    if (percent < 25) return '#ef4444'; // Red
    if (percent < 50) return '#f97316'; // Orange
    if (percent < 75) return '#eab308'; // Yellow
    if (percent < 100) return '#3b82f6'; // Blue
    return '#22c55e'; // Green
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {records.map((record) => {
        const progress = getProgress(record);
        const progressColor = getProgressColor(progress);
        return (
          <div key={record.id} className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300" style={{ backgroundColor: progressColor }} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <Target size={18} style={{ color: progressColor }} />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{record.type}</span>
            </div>

            <h4 className="text-lg font-bold text-gray-200 mb-4 truncate">
              {record.data.titulo || record.data.nome || record.data.projeto || record.data.atividade || 'Meta'}
            </h4>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Progresso</span>
                  <span className="text-2xl font-mono font-bold text-white">{progress}%</span>
                </div>
                {progress === 100 && <Award className="text-amber-500 animate-bounce" size={24} />}
              </div>

              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${progress}%`, backgroundColor: progressColor }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                <span>{record.data.paginaAtual || record.data.aulaAtual || record.data.streakAtual || 0} unidades</span>
                <span>{record.data.totalPaginas || record.data.totalAulas || record.data.metaStreak || '---'} total</span>
              </div>
            </div>
          </div>
        );
      })}
      {records.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
          NENHUMA_META_DEFINIDA
        </div>
      )}
    </div>
  );
}
