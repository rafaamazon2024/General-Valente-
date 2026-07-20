import React from 'react';
import { dateStrDaysAgo } from '../../utils/date';

interface StreakCalendarProps {
  streak: number;
  color: string;
  name?: string;
  completedDates?: Set<string>;
}

export default function StreakCalendar({ streak, color, name, completedDates }: StreakCalendarProps) {
  // Últimas 12 semanas (84 dias), do mais antigo pro mais recente, com dado real de
  // habito_logs (dias em que o hábito foi marcado como feito).
  const days = Array.from({ length: 84 }, (_, i) => {
    const date = dateStrDaysAgo(83 - i);
    const isFilled = completedDates?.has(date) ?? false;
    return { date, isFilled };
  });

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-black/10 p-4 rounded-2xl hover:border-black/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-mono font-bold text-gray-500 uppercase tracking-widest">{name || 'CALENDÁRIO_DE_STREAK'}</h3>
          <p className="text-[12px] font-mono text-gray-500 uppercase tracking-widest">Últimas 12 semanas</p>
        </div>
        <div className="flex items-center gap-2 bg-black/5 px-3 py-1 rounded-lg border border-black/5">
          <span className="text-xl font-mono font-bold text-[#14120d]">{streak}</span>
          <span className="text-[12px] font-mono text-gray-500 uppercase leading-none">DIAS<br/>STREAK</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
          {days.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className="w-2.5 h-2.5 rounded-sm transition-all duration-500"
              style={{
                backgroundColor: day.isFilled ? color : 'rgba(20, 18, 13, 0.06)',
                opacity: day.isFilled ? 1 : 0.4
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
