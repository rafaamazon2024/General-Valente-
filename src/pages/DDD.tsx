import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Filter, MoreVertical, CheckCircle2, Circle, Clock, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, Habit, CATEGORIES, PRIORITIES, TASK_STATUS } from '../types';
import { format } from 'date-fns';

export default function DDD() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [failReasonId, setFailReasonId] = useState<number | null>(null);
  const [failReasonText, setFailReasonText] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Média',
    category: CATEGORIES[0],
    deadline: new Date().toISOString().split('T')[0],
    status: 'A Fazer',
    observations: '',
    habit_id: null as number | null
  });

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const fetchHabits = async () => {
    const res = await fetch('/api/habits');
    const data = await res.json();
    setHabits(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      priority: 'Média',
      category: CATEGORIES[0],
      deadline: new Date().toISOString().split('T')[0],
      status: 'A Fazer',
      observations: '',
      habit_id: null
    });
    fetchTasks();
  };

  const setTaskStatus = async (task: Task, status: string) => {
    if (status === 'Não Feito') {
      setFailReasonId(task.id);
      return;
    }

    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...task, 
        status,
        completed_at: status === 'Concluído' ? new Date().toISOString().split('T')[0] : null,
        fail_reason: null
      })
    });
    fetchTasks();
  };

  const submitFailReason = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...task, 
        status: 'Não Feito',
        fail_reason: failReasonText,
        completed_at: null
      })
    });
    setFailReasonId(null);
    setFailReasonText('');
    fetchTasks();
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgente': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Alta': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Média': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="PESQUISAR_DEMANDAS..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)] uppercase tracking-widest text-xs"
        >
          <Plus size={18} /> Nova Demanda
        </button>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Demanda</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Hábito Relacionado</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Prioridade</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Prazo</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr className={`hover:bg-white/5 transition-colors ${task.status === 'Concluído' ? 'opacity-30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setTaskStatus(task, 'Concluído')}
                          className={`p-1.5 rounded-lg transition-all ${task.status === 'Concluído' ? 'bg-[#00ff9d] text-black' : 'bg-white/5 text-gray-500 hover:text-[#00ff9d]'}`}
                          title="Concluído"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => setTaskStatus(task, 'Não Feito')}
                          className={`p-1.5 rounded-lg transition-all ${task.status === 'Não Feito' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 hover:text-red-500'}`}
                          title="Não Feito"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold text-sm ${task.status === 'Concluído' ? 'line-through' : ''}`}>{task.title}</p>
                      {task.fail_reason && (
                        <p className="text-[10px] text-red-400 font-mono mt-1 italic">MOTIVO: {task.fail_reason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-[#00d4ff]">
                        {habits.find(h => h.id === task.habit_id)?.name || 'Nenhum'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <Calendar size={14} />
                        {task.deadline ? format(new Date(task.deadline), 'dd/MM/yy') : '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setEditingTask(task);
                          setFormData({
                            title: task.title,
                            priority: task.priority,
                            category: task.category,
                            deadline: task.deadline,
                            status: task.status,
                            observations: task.observations,
                            habit_id: task.habit_id
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-[#00ff9d] transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                  {failReasonId === task.id && (
                    <tr className="bg-red-500/5">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest whitespace-nowrap">Por que não foi feita?</label>
                          <input 
                            autoFocus
                            value={failReasonText}
                            onChange={e => setFailReasonText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitFailReason(task)}
                            className="flex-1 bg-white/5 border border-red-500/30 rounded-lg p-2 text-sm outline-none focus:border-red-500/60"
                            placeholder="Descreva o impedimento..."
                          />
                          <button 
                            onClick={() => submitFailReason(task)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                          >
                            Registrar
                          </button>
                          <button onClick={() => setFailReasonId(null)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
                {editingTask ? 'EDITAR_DEMANDA' : 'NOVA_DEMANDA'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Tarefa / Demanda</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                  placeholder="O QUE PRECISA SER FEITO?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Hábito Relacionado</label>
                  <select 
                    value={formData.habit_id || ''}
                    onChange={e => setFormData({...formData, habit_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a]">Nenhum</option>
                    {habits.map(h => <option key={h.id} value={h.id} className="bg-[#0a0a0a]">{h.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Prioridade</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#0a0a0a]">{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Prazo</label>
                  <input 
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Status Inicial</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ff9d]/50 outline-none transition-all font-mono text-sm appearance-none"
                  >
                    {TASK_STATUS.map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00ff9d] hover:bg-[#00cc7d] text-black p-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#00ff9d]/20 uppercase tracking-[0.2em] text-xs"
              >
                {editingTask ? 'SALVAR_ALTERACOES' : 'INICIALIZAR_DEMANDA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
