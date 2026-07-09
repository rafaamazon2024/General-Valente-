import React from 'react';
import { AreaConfig, GenericRecord } from '../../types';
import { Edit2, Trash2, Plus, GripVertical } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';

interface DynamicKanbanProps {
  config: AreaConfig;
  records: GenericRecord[];
  selectedType: string;
  onEdit: (record: GenericRecord) => void;
  onDelete: (id: string | number) => void;
  onAdd: (status: string) => void;
  onStatusChange: (record: GenericRecord, newStatus: string) => void;
}

interface KanbanCardProps {
  record: GenericRecord;
  config: AreaConfig;
  onEdit: (record: GenericRecord) => void;
  onDelete: (id: string | number) => void;
  key?: any;
}

function KanbanCard({ record, config, onEdit, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: record.id.toString(),
    data: { record }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/50 backdrop-blur-xl border border-black/10 p-4 rounded-xl hover:border-black/20 transition-all group ${isDragging ? 'opacity-50 z-50 ring-2 ring-[#d97706]' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-gray-700">
            <GripVertical size={12} />
          </div>
          <span className="text-[13px] font-mono text-[#d97706] uppercase tracking-widest">{record.type}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(record)} className="p-1 text-gray-500 hover:text-[#14120d]"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(record.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={12} /></button>
        </div>
      </div>
      <h4 className="text-sm font-bold text-gray-700 mb-2">
        {record.data.titulo || record.data.nome || record.data.projeto || record.data.atividade || record.data.item || 'Sem Título'}
      </h4>

      {/* Content Snippet */}
      {(record.data.conteudo || record.data.descricao) && (
        <p className="text-[14px] text-gray-500 line-clamp-3 font-mono leading-relaxed mb-2">
          {record.data.conteudo || record.data.descricao}
        </p>
      )}

      {/* Progress Bars */}
      {record.data.totalPaginas && record.data.paginaAtual !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-[13px] font-mono text-gray-500 mb-1 uppercase">
            <span>Progresso</span>
            <span>{Math.round((record.data.paginaAtual / record.data.totalPaginas) * 100)}%</span>
          </div>
          <div className="w-full bg-black/5 h-1 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (record.data.paginaAtual / record.data.totalPaginas) * 100)}%`,
                backgroundColor: config.cor
              }}
            />
          </div>
        </div>
      )}

      {record.data.valor && (
        <p className="text-xs font-mono text-amber-600 mt-2">
          {record.data.tipo === 'Despesa' ? '-' : '+'} R$ {Number(record.data.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({ column, records, config, onEdit, onDelete, onAdd, recordDataToStatus }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: column,
  });

  return (
    <div ref={setNodeRef} className={`flex flex-col gap-4 rounded-2xl transition-colors ${isOver ? 'bg-black/5' : ''}`}>
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[14px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">
          {column} <span className="ml-2 opacity-30">({records.filter((r: any) => recordDataToStatus(r.data) === column).length})</span>
        </h3>
        <button
          onClick={() => onAdd(column)}
          className="p-1 hover:bg-black/5 rounded-md text-gray-500 hover:text-[#d97706] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      
      <div className="flex flex-col gap-3 min-h-[200px]">
        {records
          .filter((r: any) => recordDataToStatus(r.data) === column)
          .map((record: any) => (
            <KanbanCard 
              key={record.id} 
              record={record} 
              config={config} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
      </div>
    </div>
  );
}

export default function DynamicKanban({ config, records, selectedType, onEdit, onDelete, onAdd, onStatusChange }: DynamicKanbanProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const typeRecords = React.useMemo(() => {
    return records.filter(r => r.type === selectedType);
  }, [records, selectedType]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  function getStatusField(cfg: AreaConfig, type: string) {
    const fields = cfg.campos[type] || [];
    const field = fields.find(f => f.tipo === 'select' && f.options?.some(opt => cfg.colunasKanban.includes(opt)));
    return field ? field.nome : 'status';
  }

  const statusFieldName = getStatusField(config, selectedType);

  function recordDataToStatus(data: any) {
    return data[statusFieldName] || config.colunasKanban[0];
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const record = active.data.current?.record as GenericRecord;
      const newStatus = over.id as string;
      
      if (record && recordDataToStatus(record.data) !== newStatus) {
        onStatusChange(record, newStatus);
      }
    }
    
    setActiveId(null);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.colunasKanban.map((column) => (
          <KanbanColumn 
            key={column}
            column={column}
            records={typeRecords}
            config={config}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
            recordDataToStatus={recordDataToStatus}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-white/80 backdrop-blur-2xl border border-[#d97706]/50 p-4 rounded-xl shadow-2xl opacity-90 scale-105">
            <h4 className="text-sm font-bold text-[#14120d]">
              {records.find(r => r.id.toString() === activeId)?.data.titulo || 'Arrastando...'}
            </h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
