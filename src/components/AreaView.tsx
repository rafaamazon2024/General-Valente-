import React, { useState, useEffect } from 'react';
import { AreaConfig, GenericRecord } from '../types';
import { Plus, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, Kanban as KanbanIcon, Target as TargetIcon } from 'lucide-react';
import DynamicForm from './dynamic/DynamicForm';
import DynamicTable from './dynamic/DynamicTable';
import DynamicKanban from './dynamic/DynamicKanban';
import DynamicChart from './dynamic/DynamicChart';
import DynamicCalendar from './dynamic/DynamicCalendar';
import DynamicGoals from './dynamic/DynamicGoals';
import { useRecords } from '../hooks/useRecords';

interface AreaViewProps {
  config: AreaConfig;
}

export default function AreaView({ config }: AreaViewProps) {
  const { records, addRecord, updateRecord, removeRecord } = useRecords(config.id);
  const [activeView, setActiveView] = useState(config.views[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GenericRecord | null>(null);
  const [selectedType, setSelectedType] = useState(config.tiposItem[0]);
  const [externalFilters, setExternalFilters] = useState<{
    searchTerm?: string;
    statusFilter?: string[];
    categoryFilter?: string[];
  }>({});

  useEffect(() => {
    setActiveView(config.views[0]);
    setSelectedType(config.tiposItem[0]);
    setExternalFilters({});
  }, [config]);

  const handleFilterRequest = (filters: any, type?: string) => {
    if (type) setSelectedType(type);
    setExternalFilters(filters);
    setActiveView('Tabela');
  };

  const handleAdd = (status?: string) => {
    setEditingRecord(null);
    setSelectedType(config.tiposItem[0]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: GenericRecord) => {
    setEditingRecord(record);
    setSelectedType(record.type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      await removeRecord(String(id));
    }
  };

  const handleSubmit = async (formData: any) => {
    if (editingRecord) {
      await updateRecord(String(editingRecord.id), {
        data: formData
      });
    } else {
      await addRecord({
        area_id: config.id,
        type: selectedType,
        data: formData
      });
    }

    setIsModalOpen(false);
  };

  const handleStatusChange = async (record: GenericRecord, newStatus: string) => {
    const statusFieldName = getStatusField(config);
    const updatedData = { ...record.data, [statusFieldName]: newStatus };
    
    await updateRecord(String(record.id), {
      data: updatedData
    });
  };

  function getStatusField(cfg: AreaConfig) {
    for (const type of cfg.tiposItem) {
      const field = cfg.campos[type].find(f => f.tipo === 'select' && f.options?.some(opt => cfg.colunasKanban.includes(opt)));
      if (field) return field.nome;
    }
    return 'status';
  }

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard': return <DynamicChart config={config} records={records} selectedType={selectedType} onFilterRequest={handleFilterRequest} />;
      case 'Tabela': return (
        <DynamicTable 
          fields={config.campos[selectedType] || []} 
          records={records} 
          selectedType={selectedType}
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          color={config.cor}
          externalFilters={externalFilters}
          onFiltersChange={setExternalFilters}
        />
      );
      case 'Calendário': return <DynamicCalendar config={config} records={records} selectedType={selectedType} />;
      case 'Kanban': return (
        <DynamicKanban 
          config={config} 
          records={records} 
          selectedType={selectedType}
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onAdd={handleAdd} 
          onStatusChange={handleStatusChange}
        />
      );
      case 'Metas': return (
        <DynamicGoals 
          config={config} 
          records={records} 
          selectedType={selectedType} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
      default: return null;
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'Dashboard': return <LayoutGrid size={16} />;
      case 'Tabela': return <TableIcon size={16} />;
      case 'Calendário': return <CalendarIcon size={16} />;
      case 'Kanban': return <KanbanIcon size={16} />;
      case 'Metas': return <TargetIcon size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ backgroundColor: `${config.cor}20`, color: config.cor }}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold tracking-tighter text-white uppercase">{config.nome}</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">SISTEMA_OPERACIONAL_ATIVO</p>
          </div>
        </div>
        <button 
          onClick={() => handleAdd()}
          className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg uppercase tracking-widest text-xs text-black"
          style={{ backgroundColor: config.cor }}
        >
          <Plus size={18} /> Novo Registro
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar scroll-smooth">
        {config.views.map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
              activeView === view 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {getViewIcon(view)}
            {view}
          </button>
        ))}
      </div>

      {/* Type Selector (if multiple types) */}
      {config.tiposItem.length > 1 && (activeView === 'Tabela' || activeView === 'Metas') && (
        <div className="flex items-center gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {config.tiposItem.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] pb-2 transition-all relative whitespace-nowrap ${
                selectedType === type ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {type}
              {selectedType === type && (
                <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: config.cor }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {renderView()}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <DynamicForm 
          title={editingRecord ? `EDITAR_${selectedType.toUpperCase()}` : `NOVO_${selectedType.toUpperCase()}`}
          fields={config.campos[selectedType] || []}
          initialData={editingRecord?.data}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
