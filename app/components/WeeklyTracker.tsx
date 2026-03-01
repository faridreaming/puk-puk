import { Check, X } from "lucide-react";
import { useToday, useTodayDate } from "~/store/useDevStore";

interface WeeklyTrackerProps {
  completedDates: string[];
  missedDates: string[];
}

function getWeekDates(today: Date, todayStr: string): { date: string; dayLabel: string; isToday: boolean }[] {
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      dayLabel: days[i],
      isToday: dateStr === todayStr,
    };
  });
}

export function WeeklyTracker({ completedDates, missedDates }: WeeklyTrackerProps) {
  const todayStr = useToday();
  const todayDate = useTodayDate();
  const weekDates = getWeekDates(todayDate, todayStr);

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Minggu Ini
      </h3>
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map(({ date, dayLabel, isToday }) => {
          const isCompleted = completedDates.includes(date);
          const isMissed = missedDates.includes(date);
          const isFuture = new Date(date) > todayDate;

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${isToday ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                {dayLabel}
              </span>
              <div
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-500/30"
                    : isMissed
                      ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-500/30"
                      : isToday
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-500/40"
                        : isFuture
                          ? "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-700"
                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600"
                  }
                `}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : isMissed ? <X size={16} strokeWidth={2.5} /> : new Date(date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
