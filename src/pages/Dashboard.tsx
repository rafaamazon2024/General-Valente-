import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp, 
  Target, 
  AlertCircle,
  ChevronRight,
  MessageSquare,
  ListTodo,
  Calendar,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Habit, HabitLog, Task } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0 (Sun) to 6 (Sat)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, logsRes, tasksRes, noteRes] = await Promise.all([
        fetch('/api/habits'),
        fetch(`/api/habit-logs?date=${today}`),
        fetch('/api/tasks'),
        fetch(`/api/notes/${today}`)
      ]);

      const habitsData = await habitsRes.json();
      const logsData = await logsRes.json();
      const tasksData = await tasksRes.json();
      const noteData = await noteRes.json();

      // Filter habits for today
      const todayHabits = habitsData.filter((h: Habit) => {
        if (!h.active) return false;
        if (h.frequency === 'daily') return true;
        const freqArray = h.frequency.split(',');
        return freqArray.includes(dayOfWeek.toString());
      });

      setHabits(todayHabits);
      setLogs(logsData);
      setTasks(tasksData.filter((t: Task) => t.status !== 'Concluído' && t.status !== 'Arquivado'));
      setNote(noteData.note || '');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: number) => {
    const existingLog = logs.find(l => l.habit_id === habitId);
    const newStatus = existingLog ? (existingLog.status === 1 ? 0 : 1) : 1;
    
    try {
      await fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          date: today,
          status: newStatus,
          check_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const completeTask = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          status: 'Concluído',
          completed_at: today
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const saveNote = async () => {
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, note })
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const habitsDone = logs.filter(l => l.status === 1).length;
  const totalHabits = habits.length;
  const tasksDueToday = tasks.filter(t => t.deadline === today || (t.deadline && t.deadline < today)).length;
  const habitProgress = totalHabits > 0 ? Math.round((habitsDone / totalHabits) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center h-64 font-mono text-[#00ff9d]">INICIALIZANDO_SISTEMA...</div>;

  return (
    <div className="space-y-8">
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tighter text-[#00ff9d]">STATUS_OPERACIONAL</h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-full">
          <div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-[#00ff9d] uppercase tracking-widest">SISTEMA_ONLINE</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Consistência_Hoje" 
          value={`${habitsDone}/${totalHabits}`} 
          icon={<Target className="text-[#00ff9d]" />}
          progress={habitProgress}
          color="text-[#00ff9d]"
        />
        <StatCard 
          title="Demandas_Críticas" 
          value={tasksDueToday.toString()} 
          icon={<AlertCircle className="text-red-500" />}
          progress={0}
          subtitle="Ação Imediata"
          color="text-red-500"
        />
        <StatCard 
          title="Nível_Performance" 
          value={`${habitProgress}%`} 
          icon={<Activity className="text-[#00d4ff]" />}
          progress={habitProgress}
          color="text-[#00d4ff]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Habits List */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target size={80} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono font-bold tracking-widest text-gray-400 flex items-center gap-2 uppercase">
              <CheckCircle2 size={18} className="text-[#00ff9d]" />
              Protocolos_Diários
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 rounded-full uppercase tracking-wider">
              {habitsDone}/{totalHabits} COMPLETO
            </span>
          </div>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-gray-500 text-xs font-mono italic">NENHUM PROTOCOLO ATIVO PARA ESTE CICLO.</p>
            ) : (
              habits.map((habit) => {
                const isDone = logs.find(l => l.habit_id === habit.id)?.status === 1;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
                      isDone 
                        ? 'bg-[#00ff9d]/5 border-[#00ff9d]/30 text-[#00ff9d]' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#00ff9d]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-md transition-colors ${isDone ? 'bg-[#00ff9d] text-black' : 'bg-white/10 text-gray-600'}`}>
                        {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold tracking-tight ${isDone ? 'line-through opacity-50' : ''}`}>{habit.name.toUpperCase()}</p>
                        <p className="text-[10px] font-mono opacity-50 uppercase">{habit.category} • {habit.suggested_time || 'HORÁRIO_LIVRE'}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${isDone ? 'text-[#00ff9d]' : 'text-gray-600'}`} />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Tasks List */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ListTodo size={80} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono font-bold tracking-widest text-gray-400 flex items-center gap-2 uppercase">
              <Clock size={18} className="text-amber-500" />
              Demandas_Prioritárias
            </h3>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.deadline === today || (t.deadline && t.deadline < today)).length === 0 ? (
              <p className="text-gray-500 text-xs font-mono italic">SEM DEMANDAS CRÍTICAS NO MOMENTO.</p>
            ) : (
              tasks.filter(t => t.deadline === today || (t.deadline && t.deadline < today)).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => completeTask(task)}
                      className="text-gray-600 hover:text-[#00ff9d] transition-colors"
                    >
                      <Circle size={20} />
                    </button>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{task.title.toUpperCase()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border ${
                          task.priority === 'Urgente' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          task.priority === 'Alta' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1 uppercase">
                          <Calendar size={10} /> {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Daily Note */}
      <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-mono font-bold tracking-widest text-gray-400 flex items-center gap-2 mb-4 uppercase">
          <MessageSquare size={18} className="text-[#00d4ff]" />
          Diário_de_Bordo
        </h3>
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={saveNote}
            placeholder="REGISTRE SEUS INSIGHTS, VITÓRIAS OU IMPEDIMENTOS DO CICLO ATUAL..."
            className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00d4ff]/50 outline-none transition-all font-mono text-sm resize-none text-gray-300 placeholder:text-gray-700"
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            AUTO_SAVE_ENABLED
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, progress, subtitle, color }: { title: string, value: string, icon: React.ReactNode, progress?: number, subtitle?: string, color: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: color.replace('text-', '') }} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-mono font-bold ${color}`}>{value}</span>
        {subtitle && <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{subtitle}</span>}
      </div>
      {progress !== undefined && progress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full"
              style={{ backgroundColor: 'currentColor' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
