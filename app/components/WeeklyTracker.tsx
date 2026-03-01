interface WeeklyTrackerProps {
  completedDates: string[];
  missedDates: string[];
}

function getWeekDates(): { date: string; dayLabel: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Get Monday

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      dayLabel: days[i],
      isToday: dateStr === today.toISOString().split("T")[0],
    };
  });
}

export function WeeklyTracker({ completedDates, missedDates }: WeeklyTrackerProps) {
  const weekDates = getWeekDates();

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Minggu Ini
      </h3>
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map(({ date, dayLabel, isToday }) => {
          const isCompleted = completedDates.includes(date);
          const isMissed = missedDates.includes(date);
          const isFuture = new Date(date) > new Date();

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${isToday ? "text-amber-400" : "text-zinc-600"}`}>
                {dayLabel}
              </span>
              <div
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : isMissed
                      ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                      : isToday
                        ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40"
                        : isFuture
                          ? "bg-zinc-800/50 text-zinc-700"
                          : "bg-zinc-800/50 text-zinc-600"
                  }
                `}
              >
                {isCompleted ? "✓" : isMissed ? "✗" : new Date(date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
