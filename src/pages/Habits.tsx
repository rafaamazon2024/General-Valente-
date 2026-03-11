import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, Check, CheckCircle2, Circle } from 'lucide-react';
import { Habit, HabitLog, CATEGORIES, PRIORITIES } from '../types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    frequency: 'daily',
    suggested_time: '',
    priority: 'Média',
    description: '',
    active: 1
  });

  const weekDays = [0, 1, 2, 3, 4, 5, 6]; // Sun to Sat
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
  const displayDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  const fetchHabits = async () => {
    const res = await fetch('/api/habits');
    const data = await res.json();
    setHabits(data);
  };

  const fetchLogs = async () => {
    // Fetch logs for the current week (simplified: fetch all for now or filter by date range if API supported)
    // For now, we'll fetch logs day by day for the display or enhance the API
    const allLogs: HabitLog[] = [];
    for (const day of displayDays) {
      const res = await fetch(`/api/habit-logs?date=${format(day, 'yyyy-MM-dd')}`);
      const data = await res.json();
      allLogs.push(...data);
    }
    setLogs(allLogs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingHabit ? 'PUT' : 'POST';
    const url = editingHabit ? `/api/habits/${editingHabit.id}` : '/api/habits';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setEditingHabit(null);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      frequency: 'daily',
      suggested_time: '',
      priority: 'Média',
      description: '',
      active: 1
    });
    fetchHabits();
  };

  const toggleHabitDay = async (habitId: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = logs.find(l => l.habit_id === habitId && l.date === dateStr);
    const newStatus = existingLog ? (existingLog.status === 1 ? 0 : 1) : 1;

    await fetch('/api/habit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habit_id: habitId,
        date: dateStr,
        status: newStatus,
        check_time: format(new Date(), 'HH:mm')
      })
    });
    fetchLogs();
  };

  const deleteHabit = async (id: number) => {
    if (confirm('Deseja realmente excluir este hábito?')) {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      fetchHabits();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="BUSCAR_HABITOS..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)] uppercase tracking-widest text-xs"
        >
          <Plus size={18} /> Novo Hábito
        </button>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Hábito</th>
                {displayDays.map(day => (
                  <th key={day.toString()} className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
                    {format(day, 'EEE', { locale: ptBR })}
                    <span className="block text-[8px] opacity-50 mt-1">{format(day, 'dd/MM')}</span>
                  </th>
                ))}
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {habits.map((habit) => (
                <tr key={habit.id} className={`hover:bg-white/5 transition-colors ${!habit.active ? 'opacity-30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight">{habit.name}</span>
                      <span className="text-[10px] text-[#00ff9d] font-mono uppercase mt-1">{habit.category}</span>
                    </div>
                  </td>
                  {displayDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDone = logs.find(l => l.habit_id === habit.id && l.date === dateStr)?.status === 1;
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <td key={day.toString()} className="px-2 py-4 text-center">
                        <button 
                          onClick={() => toggleHabitDay(habit.id, day)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-[#00ff9d] text-black shadow-[0_0_10px_rgba(0,255,157,0.4)]' 
                              : isToday 
                                ? 'border border-[#00ff9d]/50 text-[#00ff9d] hover:bg-[#00ff9d]/10' 
                                : 'bg-white/5 text-gray-600 hover:bg-white/10'
                          }`}
                        >
                          {isDone ? <Check size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingHabit(habit);
                          setFormData(habit);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-[#00ff9d] transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-[#00ff9d]">
                {editingHabit ? 'EDITAR_HABITO' : 'NOVO_HABITO'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Nome do Hábito</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                  placeholder="EX: MEDITACAO_MATINAL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Prioridade</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    {PRIORITIES.slice(0, 3).map(p => <option key={p} value={p} className="bg-[#0a0a0a]">{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm h-24 resize-none"
                  placeholder="NOTAS_ADICIONAIS..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00ff9d] hover:bg-[#00cc7d] text-black p-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#00ff9d]/20 uppercase tracking-[0.2em] text-xs"
              >
                {editingHabit ? 'SALVAR_ALTERACOES' : 'INICIALIZAR_HABITO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
