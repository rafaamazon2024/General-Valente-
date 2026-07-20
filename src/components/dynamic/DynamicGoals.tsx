import React from 'react';
import { GenericRecord, AreaConfig } from '../../types';
import { Target, Award, Edit2, Trash2, Check } from 'lucide-react';
import { getRecordProgress, DONE_STATUSES } from '../../utils/progress';

interface DynamicGoalsProps {
  config: AreaConfig;
  records: GenericRecord[];
  selectedType: string;
  onEdit: (record: GenericRecord) => void;
  onDelete: (id: string | number) => void;
  onUpdateRecord: (id: string, record: Partial<GenericRecord>) => Promise<void>;
}

// Pra tipos que têm campo "status" com uma opção reconhecida como concluída (ver
// DONE_STATUSES), o card ganha um botão de marcar feito/desfazer sem abrir o form de
// edição - mesma ideia do check diário de hábitos, aplicada a metas/tarefas em geral.
function getStatusOptions(config: AreaConfig, type: string): string[] | undefined {
  return config.campos[type]?.find(f => f.nome === 'status')?.options;
}

function getDoneValue(options?: string[]): string | undefined {
  return options?.find(o => DONE_STATUSES.includes(o));
}

function getUndoneValue(options?: string[]): string | undefined {
  return options?.find(o => !DONE_STATUSES.includes(o)) ?? options?.[0];
}

export default function DynamicGoals({ config, records, selectedType, onEdit, onDelete, onUpdateRecord }: DynamicGoalsProps) {
  const typeRecords = records.filter(r => r.type === selectedType);
  const getProgress = getRecordProgress;

  const statusOptions = getStatusOptions(config, selectedType);
  const doneValue = getDoneValue(statusOptions);
  const undoneValue = getUndoneValue(statusOptions);

  const toggleDone = (record: GenericRecord) => {
    if (!doneValue) return;
    const isDone = record.data.status === doneValue;
    onUpdateRecord(String(record.id), { data: { ...record.data, status: isDone ? undoneValue : doneValue } });
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
      {typeRecords.map((record) => {
        const progress = getProgress(record);
        const progressColor = getProgressColor(progress);
        const isDone = doneValue && record.data.status === doneValue;
        return (
          <div key={record.id} className="bg-white/50 backdrop-blur-xl border border-black/10 p-6 rounded-2xl relative overflow-hidden group hover:border-black/20 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300" style={{ backgroundColor: progressColor }} />

            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-black/5 rounded-lg">
                <Target size={18} style={{ color: progressColor }} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {doneValue && (
                  <button
                    onClick={() => toggleDone(record)}
                    title={isDone ? 'Desfazer' : 'Marcar feito'}
                    className={`p-1.5 rounded-lg transition-all ${isDone ? 'text-[#10b981] hover:bg-[#10b981]/10' : 'text-gray-500 hover:bg-black/5 hover:text-[#10b981]'}`}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => onEdit(record)} className="p-1.5 hover:bg-black/5 rounded-lg text-gray-500 hover:text-[#14120d] transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(record.id)} className="p-1.5 hover:bg-black/5 rounded-lg text-gray-500 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-700 mb-4 truncate">
              {record.data.titulo || record.data.nome || record.data.projeto || record.data.atividade || 'Meta'}
            </h4>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[14px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Progresso</span>
                  <span className="text-2xl font-mono font-bold text-[#14120d]">{progress}%</span>
                </div>
                {progress === 100 && <Award className="text-amber-600 animate-bounce" size={24} />}
              </div>

              <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${progress}%`, backgroundColor: progressColor }}
                />
              </div>

              <div className="flex justify-between text-[13px] font-mono text-gray-500 uppercase tracking-widest">
                <span>{record.data.paginaAtual || record.data.aulaAtual || record.data.streakAtual || 0} unidades</span>
                <span>{record.data.totalPaginas || record.data.totalAulas || record.data.metaStreak || '---'} total</span>
              </div>
            </div>
          </div>
        );
      })}
      {typeRecords.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest border border-dashed border-black/10 rounded-2xl">
          NENHUMA_META_DEFINIDA_PARA_{selectedType.toUpperCase()}
        </div>
      )}
    </div>
  );
}
