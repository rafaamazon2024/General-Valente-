import React from 'react';
import { GenericRecord, AreaConfig } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DynamicCalendarProps {
  config: AreaConfig;
  records: GenericRecord[];
}

export default function DynamicCalendar({ config, records }: DynamicCalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getRecordsForDay = (day: Date) => {
    return records.filter(r => {
      const dateStr = r.data.data || r.data.deadline || r.data.ultimoEncontro;
      if (!dateStr) return false;
      return isSameDay(new Date(dateStr), day);
    });
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mono font-bold tracking-widest text-[#00ff9d] uppercase">
          {format(today, 'MMMM yyyy', { locale: ptBR })}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-black/60 p-2 text-center text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
        
        {days.map((day, i) => {
          const dayRecords = getRecordsForDay(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          const isToday = isSameDay(day, today);

          return (
            <div 
              key={i} 
              className={`min-h-[100px] p-2 bg-black/40 transition-colors hover:bg-white/5 ${!isCurrentMonth ? 'opacity-20' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-[#00ff9d]' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayRecords.map(r => (
                  <div 
                    key={r.id} 
                    className="text-[8px] font-mono p-1 rounded bg-white/5 border-l-2 truncate"
                    style={{ borderLeftColor: config.cor }}
                  >
                    {r.data.titulo || r.data.nome || r.data.projeto || r.data.atividade || 'Evento'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
