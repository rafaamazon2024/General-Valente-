import React from 'react';

interface StreakCalendarProps {
  streak: number;
  color: string;
}

export default function StreakCalendar({ streak, color }: StreakCalendarProps) {
  // Generate a mock grid for the last 12 weeks (84 days)
  const days = Array.from({ length: 84 }, (_, i) => {
    // Mock logic: higher streak means more filled squares recently
    const isFilled = i > 84 - streak - (Math.random() * 5);
    const opacity = isFilled ? (Math.random() * 0.5 + 0.5) : 0.05;
    return { isFilled, opacity };
  });

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">CALENDÁRIO_DE_STREAK</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{streak}</span>
          <span className="text-[10px] font-mono text-gray-500 uppercase">DIAS_ATUAIS</span>
        </div>
      </div>
      
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-fit">
        {days.map((day, i) => (
          <div 
            key={i}
            className="w-3 h-3 rounded-sm transition-all duration-500"
            style={{ 
              backgroundColor: day.isFilled ? color : 'rgba(255, 255, 255, 0.05)',
              opacity: day.opacity
            }}
          />
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-[8px] font-mono text-gray-600 uppercase tracking-widest">
        <span>12 SEMANAS ATRÁS</span>
        <span>HOJE</span>
      </div>
    </div>
  );
}
