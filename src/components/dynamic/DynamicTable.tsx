import React, { useState, useMemo } from 'react';
import { AreaField, GenericRecord } from '../../types';
import { Edit2, Trash2, Search, Filter, ChevronDown, X } from 'lucide-react';

interface DynamicTableProps {
  fields: AreaField[];
  records: GenericRecord[];
  onEdit: (record: GenericRecord) => void;
  onDelete: (id: number) => void;
  color: string;
  externalFilters?: {
    searchTerm?: string;
    statusFilter?: string[];
    categoryFilter?: string[];
  };
  onFiltersChange?: (filters: any) => void;
}

export default function DynamicTable({ 
  fields, 
  records, 
  onEdit, 
  onDelete, 
  color,
  externalFilters,
  onFiltersChange
}: DynamicTableProps) {
  const searchTerm = externalFilters?.searchTerm || '';
  const statusFilter = externalFilters?.statusFilter || [];
  const categoryFilter = externalFilters?.categoryFilter || [];
  const [sortBy, setSortBy] = useState('recent');

  const setSearchTerm = (val: string) => onFiltersChange?.({ ...externalFilters, searchTerm: val });
  const setStatusFilter = (val: string[]) => onFiltersChange?.({ ...externalFilters, statusFilter: val });
  const setCategoryFilter = (val: string[]) => onFiltersChange?.({ ...externalFilters, categoryFilter: val });

  const getProgress = (record: GenericRecord) => {
    if (record.data.totalPaginas && record.data.paginaAtual !== undefined) {
      return {
        current: record.data.paginaAtual,
        total: record.data.totalPaginas,
        percent: Math.min(100, Math.round((record.data.paginaAtual / record.data.totalPaginas) * 100)),
        label: 'Páginas'
      };
    }
    if (record.data.totalAulas && record.data.aulaAtual !== undefined) {
      return {
        current: record.data.aulaAtual,
        total: record.data.totalAulas,
        percent: Math.min(100, Math.round((record.data.aulaAtual / record.data.totalAulas) * 100)),
        label: 'Aulas'
      };
    }
    if (record.data.metaStreak && record.data.streakAtual !== undefined) {
      return {
        current: record.data.streakAtual,
        total: record.data.metaStreak,
        percent: Math.min(100, Math.round((record.data.streakAtual / record.data.metaStreak) * 100)),
        label: 'Streak'
      };
    }
    return null;
  };

  const getProgressColor = (percent: number) => {
    if (percent <= 25) return '#ef4444';
    if (percent <= 50) return '#f59e0b';
    if (percent <= 75) return '#eab308';
    if (percent < 100) return '#3b82f6';
    return '#10b981';
  };

  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        Object.values(r.data).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Status Filter
    if (statusFilter.length > 0) {
      result = result.filter(r => statusFilter.includes(r.data.status));
    }

    // Category Filter
    if (categoryFilter.length > 0) {
      result = result.filter(r => categoryFilter.includes(r.data.categoria));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'az':
          return String(a.data.titulo || a.data.nome || '').localeCompare(String(b.data.titulo || b.data.nome || ''));
        case 'za':
          return String(b.data.titulo || b.data.nome || '').localeCompare(String(a.data.titulo || a.data.nome || ''));
        case 'high_progress': {
          const progA = getProgress(a)?.percent || 0;
          const progB = getProgress(b)?.percent || 0;
          return progB - progA;
        }
        case 'low_progress': {
          const progA = getProgress(a)?.percent || 0;
          const progB = getProgress(b)?.percent || 0;
          return progA - progB;
        }
        case 'deadline':
          return new Date(a.data.deadline || '9999').getTime() - new Date(b.data.deadline || '9999').getTime();
        case 'value':
          return (Number(b.data.valor) || 0) - (Number(a.data.valor) || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [records, searchTerm, statusFilter, categoryFilter, sortBy]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    records.forEach(r => {
      if (r.data.status) statuses.add(r.data.status);
    });
    return Array.from(statuses);
  }, [records]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    records.forEach(r => {
      if (r.data.categoria) categories.add(r.data.categoria);
    });
    return Array.from(categories);
  }, [records]);

  const renderValue = (field: AreaField, value: any, record: GenericRecord) => {
    if (field.tipo === 'progress') {
      const progress = value || 0;
      return (
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full transition-all duration-500" 
            style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
          />
        </div>
      );
    }
    
    if (field.nome === 'paginaAtual' || field.nome === 'aulaAtual' || field.nome === 'streakAtual') {
      return value;
    }

    if (field.tipo === 'date' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }

    if (field.nome === 'valor' && value) {
      const isNegative = record.data.tipo === 'Despesa';
      return (
        <span className={isNegative ? 'text-red-400' : 'text-emerald-400'}>
          {isNegative ? '-' : '+'} R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      );
    }

    if (field.tipo === 'checkbox') {
      return value ? '✅' : '❌';
    }

    return value || '---';
  };

  const hasActiveFilters = searchTerm || statusFilter.length > 0 || categoryFilter.length > 0 || sortBy !== 'recent';

  const clearFilters = () => {
    onFiltersChange?.({});
    setSortBy('recent');
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="BUSCAR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-xs uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-[#00ff9d]/50"
          >
            <option value="recent">Mais Recente</option>
            <option value="oldest">Mais Antigo</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="high_progress">Maior Progresso</option>
            <option value="low_progress">Menor Progresso</option>
            <option value="deadline">Deadline Próximo</option>
            <option value="value">Maior Valor</option>
          </select>

          {availableStatuses.length > 0 && (
            <div className="relative group">
              <button className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                Status <ChevronDown size={12} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 hidden group-hover:block z-50 shadow-2xl">
                {availableStatuses.map(status => (
                  <label key={status} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) setStatusFilter([...statusFilter, status]);
                        else setStatusFilter(statusFilter.filter(s => s !== status));
                      }}
                      className="rounded border-white/10 bg-white/5 text-[#00ff9d]"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {availableCategories.length > 0 && (
            <div className="relative group">
              <button className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                Categoria <ChevronDown size={12} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 hidden group-hover:block z-50 shadow-2xl">
                {availableCategories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryFilter.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) setCategoryFilter([...categoryFilter, cat]);
                        else setCategoryFilter(categoryFilter.filter(c => c !== cat));
                      }}
                      className="rounded border-white/10 bg-white/5 text-[#00ff9d]"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 hover:bg-white/5 rounded-xl text-red-500 transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest"
            >
              <X size={14} /> Limpar
            </button>
          )}
        </div>

        <div className="ml-auto font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          Mostrando {filteredRecords.length} de {records.length} itens
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {fields.map(field => (
                  <th key={field.nome} className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.map((record) => {
                const progress = getProgress(record);
                return (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    {fields.map(field => (
                      <td key={field.nome} className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-200">
                          {renderValue(field, record.data[field.nome], record)}
                        </div>
                        {/* Progress bar logic for specific items */}
                        {((field.nome === 'titulo' || field.nome === 'nome') && progress) && (
                          <div className="mt-2 w-32">
                            <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1">
                              <span>{progress.percent}%</span>
                              <span>{progress.current}/{progress.total} {progress.label}</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500" 
                                style={{ 
                                  width: `${progress.percent}%`,
                                  backgroundColor: getProgressColor(progress.percent) 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(record)}
                          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-[#00ff9d] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                    NENHUM_REGISTRO_ENCONTRADO
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
