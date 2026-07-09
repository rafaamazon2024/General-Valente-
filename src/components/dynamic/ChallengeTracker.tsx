import React, { useState } from 'react';
import { Plus, X, Check, Trophy } from 'lucide-react';
import { AreaConfig, GenericRecord } from '../../types';
import { format, addDays, parseISO, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  config: AreaConfig;
  records: GenericRecord[];
  onDelete: (id: string | number) => void;
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: Partial<GenericRecord>) => Promise<void>;
}

export default function ChallengeTracker({ config, records, onDelete, onAdd, onUpdate }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    duracao: 30,
  });

  const desafios = records.filter(r => r.type === 'desafio');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      nome: formData.nome,
      dataInicio: formData.dataInicio,
      duracao: Number(formData.duracao),
      checkedDays: [],
    });
    setIsFormOpen(false);
    setFormData({ nome: '', dataInicio: format(new Date(), 'yyyy-MM-dd'), duracao: 30 });
  };

  const toggleDay = async (record: GenericRecord, dayIndex: number) => {
    const currentChecked: number[] = Array.isArray(record.data?.checkedDays)
      ? record.data.checkedDays
      : [];
    const newChecked = currentChecked.includes(dayIndex)
      ? currentChecked.filter((d: number) => d !== dayIndex)
      : [...currentChecked, dayIndex].sort((a: number, b: number) => a - b);
    await onUpdate(String(record.id), { data: { ...record.data, checkedDays: newChecked } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-[14px] font-mono text-gray-500 uppercase tracking-widest">
          {desafios.length} desafio{desafios.length !== 1 ? 's' : ''} ativo{desafios.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-mono font-bold uppercase tracking-widest text-black transition-all"
          style={{ backgroundColor: config.cor }}
        >
          <Plus size={14} /> Novo Desafio
        </button>
      </div>

      {desafios.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-black/10 rounded-2xl">
          <Trophy size={40} className="text-gray-400 mb-4" />
          <p className="text-[15px] font-mono text-gray-500 uppercase tracking-widest">NENHUM_DESAFIO_DEFINIDO</p>
          <p className="text-[14px] text-gray-500 mt-2">Crie seu primeiro desafio e marque cada dia que completar</p>
        </div>
      )}

      {desafios.map(record => {
        const { nome, dataInicio, duracao, checkedDays = [] } = record.data || {};
        const days = Number(duracao) || 30;
        const checked: number[] = Array.isArray(checkedDays) ? checkedDays : [];
        const progress = days > 0 ? Math.round((checked.length / days) * 100) : 0;
        const startDate = dataInicio ? parseISO(dataInicio) : new Date();

        return (
          <div key={String(record.id)} className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-mono font-bold text-[#14120d] uppercase tracking-wider">{nome || 'Desafio'}</h3>
                <p className="text-[14px] font-mono text-gray-500 mt-1">
                  {checked.length}/{days} dias · {progress}% completo
                  {dataInicio && ` · início ${format(startDate, 'dd/MM/yyyy')}`}
                </p>
              </div>
              <button
                onClick={() => { if (window.confirm('Excluir este desafio?')) onDelete(record.id); }}
                className="p-2 hover:bg-black/5 rounded-lg text-gray-500 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: config.cor }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: days }, (_, i) => {
                const isDone = checked.includes(i);
                const dayDate = addDays(startDate, i);
                const todayDay = isToday(dayDate);
                const futureDay = isFuture(dayDate) && !todayDay;

                return (
                  <button
                    key={i}
                    onClick={() => !futureDay && toggleDay(record, i)}
                    title={`Dia ${i + 1} — ${format(dayDate, 'dd/MM/yyyy', { locale: ptBR })}`}
                    className={`w-9 h-9 rounded-lg text-[14px] font-mono font-bold transition-all flex items-center justify-center ${isDone ? 'text-black shadow-lg' : todayDay ? 'border-2 hover:opacity-80' : futureDay ? 'bg-black/[0.03] text-gray-400 cursor-default opacity-40' : 'bg-black/5 text-gray-500 hover:bg-black/10'}`}
                    style={isDone ? { backgroundColor: config.cor } : todayDay ? { borderColor: config.cor, color: config.cor } : {}}
                  >
                    {isDone ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </button>
                );
              })}
            </div>

            {progress === 100 && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl border"
                style={{ borderColor: `${config.cor}40`, backgroundColor: `${config.cor}15` }}
              >
                <Trophy size={16} style={{ color: config.cor }} />
                <p
                  className="text-[14px] font-mono font-bold uppercase tracking-widest"
                  style={{ color: config.cor }}
                >
                  DESAFIO_CONCLUÍDO! PARABÉNS! 🎉
                </p>
              </div>
            )}
          </div>
        );
      })}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="bg-white border border-black/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-black/10 flex items-center justify-between bg-black/5">
              <h3
                className="text-sm font-mono font-bold tracking-widest uppercase"
                style={{ color: config.cor }}
              >
                NOVO_DESAFIO
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[14px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                  Nome do Desafio *
                </label>
                <input
                  required
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-black/30 outline-none font-mono text-sm transition-colors"
                  placeholder="Ex: Academia 30 dias"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={e => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-black/30 outline-none font-mono text-sm transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                  Duração (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.duracao}
                  onChange={e => setFormData({ ...formData, duracao: Number(e.target.value) })}
                  className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-[#14120d] focus:border-black/30 outline-none font-mono text-sm transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full p-4 rounded-2xl font-bold transition-all uppercase tracking-[0.2em] text-xs text-black"
                style={{ backgroundColor: config.cor }}
              >
                CRIAR_DESAFIO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}