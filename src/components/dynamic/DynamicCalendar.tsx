import React, { useState } from 'react';
import { GenericRecord, AreaConfig } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DynamicCalendarProps {
  config: AreaConfig;
  records: GenericRecord[];
  selectedType: string;
}

export default function DynamicCalendar({ config, records, selectedType }: DynamicCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const typeRecords = records.filter(r => r.type === selectedType);

  const getRecordsForDay = (day: Date) => {
    return typeRecords.filter(r => {
      const dateStr = r.data.data || r.data.deadline || r.data.ultimoEncontro || r.data.dataInicio || r.data.dataFim;
      if (!dateStr) return false;
      return isSameDay(new Date(dateStr), day);
    });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-black/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mono font-bold tracking-widest text-[#d97706] uppercase">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-black/5 rounded-xl text-gray-500 hover:text-[#14120d] transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 hover:bg-black/5 rounded-xl text-[10px] font-mono font-bold text-gray-500 hover:text-[#14120d] uppercase tracking-widest">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-black/5 rounded-xl text-gray-500 hover:text-[#14120d] transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-black/5 border border-black/5 rounded-xl overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-black/5 p-2 text-center text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}

        {days.map((day, i) => {
          const dayRecords = getRecordsForDay(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={i}
              className={`min-h-[100px] p-2 bg-white/50 transition-colors hover:bg-black/5 ${!isCurrentMonth ? 'opacity-30' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-[#d97706]' : 'text-gray-500'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayRecords.map(r => (
                  <div
                    key={r.id}
                    className="text-[8px] font-mono p-1 rounded bg-black/5 border-l-2 truncate text-gray-700"
                    style={{ borderLeftColor: config.cor }}
                    title={r.data.titulo || r.data.nome}
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
