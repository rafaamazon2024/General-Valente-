import React from 'react';
import { AreaConfig, GenericRecord } from '../../types';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface DynamicKanbanProps {
  config: AreaConfig;
  records: GenericRecord[];
  onEdit: (record: GenericRecord) => void;
  onDelete: (id: number) => void;
  onAdd: (status: string) => void;
}

export default function DynamicKanban({ config, records, onEdit, onDelete, onAdd }: DynamicKanbanProps) {
  function getStatusField(cfg: AreaConfig) {
    // Try to find a select field that matches the kanban columns
    for (const type of cfg.tiposItem) {
      const field = cfg.campos[type].find(f => f.tipo === 'select' && f.options?.some(opt => cfg.colunasKanban.includes(opt)));
      if (field) return field.nome;
    }
    return 'status';
  }

  const statusFieldName = getStatusField(config);

  function recordDataToStatus(data: any) {
    return data[statusFieldName] || config.colunasKanban[0];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {config.colunasKanban.map((column) => (
        <div key={column} className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">
              {column} <span className="ml-2 opacity-30">({records.filter(r => recordDataToStatus(r.data) === column).length})</span>
            </h3>
            <button 
              onClick={() => onAdd(column)}
              className="p-1 hover:bg-white/5 rounded-md text-gray-500 hover:text-[#00ff9d] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="flex flex-col gap-3 min-h-[200px]">
            {records
              .filter(r => recordDataToStatus(r.data) === column)
              .map((record) => (
                <div 
                  key={record.id}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-xl hover:border-white/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-[#00ff9d] uppercase tracking-widest">{record.type}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(record)} className="p-1 text-gray-500 hover:text-white"><Edit2 size={12} /></button>
                      <button onClick={() => onDelete(record.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-200 mb-2">
                    {record.data.titulo || record.data.nome || record.data.projeto || record.data.atividade || record.data.item || 'Sem Título'}
                  </h4>
                  
                  {/* Progress Bars */}
                  {record.data.totalPaginas && record.data.paginaAtual !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1 uppercase">
                        <span>Progresso</span>
                        <span>{Math.round((record.data.paginaAtual / record.data.totalPaginas) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, (record.data.paginaAtual / record.data.totalPaginas) * 100)}%`,
                            backgroundColor: config.cor 
                          }}
                        />
                      </div>
                      <div className="text-[8px] font-mono text-gray-600 mt-1 text-right">
                        {record.data.paginaAtual}/{record.data.totalPaginas} PÁGINAS
                      </div>
                    </div>
                  )}

                  {record.data.totalAulas && record.data.aulaAtual !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1 uppercase">
                        <span>Conclusão</span>
                        <span>{Math.round((record.data.aulaAtual / record.data.totalAulas) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, (record.data.aulaAtual / record.data.totalAulas) * 100)}%`,
                            backgroundColor: config.cor 
                          }}
                        />
                      </div>
                      <div className="text-[8px] font-mono text-gray-600 mt-1 text-right">
                        {record.data.aulaAtual}/{record.data.totalAulas} AULAS
                      </div>
                    </div>
                  )}

                  {record.data.metaStreak && record.data.streakAtual !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1 uppercase">
                        <span>Streak</span>
                        <span>{Math.round((record.data.streakAtual / record.data.metaStreak) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, (record.data.streakAtual / record.data.metaStreak) * 100)}%`,
                            backgroundColor: config.cor 
                          }}
                        />
                      </div>
                      <div className="text-[8px] font-mono text-gray-600 mt-1 text-right">
                        {record.data.streakAtual}/{record.data.metaStreak} DIAS
                      </div>
                    </div>
                  )}

                  {record.data.valor && (
                    <p className="text-xs font-mono text-amber-500 mt-2">
                      {record.data.tipo === 'Despesa' ? '-' : '+'} R$ {Number(record.data.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
