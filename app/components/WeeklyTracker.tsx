import { useState } from "react";
import { Check, X } from "lucide-react";
import { useToday, useTodayDate } from "~/store/useDevStore";
import { useHabitStore } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";

interface WeeklyTrackerProps {
  habitId: string;
  completedDates: string[];
  missedDates: string[];
}

/** Format a Date to YYYY-MM-DD using LOCAL time (avoids UTC shift from toISOString) */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(today: Date, todayStr: string) {
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(d);
    return {
      date: dateStr,
      dayLabel: days[i],
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    };
  });
}

export function WeeklyTracker({ habitId, completedDates, missedDates }: WeeklyTrackerProps) {
  const todayStr = useToday();
  const todayDate = useTodayDate();
  const weekDates = getWeekDates(todayDate, todayStr);
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const addToast = useToastStore((s) => s.addToast);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const handleComplete = (date: string) => {
    const result = markComplete(habitId, date);
    if (result.type === "complete") {
      addToast({
        message: result.stageUp ? "Naik tahap!" : "Dicatat selesai!",
        type: "success",
        duration: 2000,
      });
    }
    setActiveDate(null);
  };

  const handleMissed = (date: string) => {
    const result = markMissed(habitId, date);
    if (result.type === "missed") {
      addToast({
        message: result.stageDown ? "Nyawa habis, turun tahap" : `Sisa ${result.livesLeft} nyawa`,
        type: result.stageDown ? "error" : "warning",
        duration: 2500,
      });
    }
    setActiveDate(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-1">
        {weekDates.map(({ date, dayLabel, isToday, isPast }) => {
          const isCompleted = completedDates.includes(date);
          const isMissed = missedDates.includes(date);
          const isFuture = !isToday && !isPast;
          const isUnfilled = isPast && !isCompleted && !isMissed;
          const isActive = activeDate === date;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 relative">
              <span
                className={`text-[10px] font-semibold tracking-wide ${isToday
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-400 dark:text-zinc-600"
                  }`}
              >
                {dayLabel}
              </span>

              {/* Action popover for unfilled past days */}
              {isActive && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg shadow-black/15 dark:shadow-black/40 p-1 border border-zinc-200 dark:border-zinc-700 z-10 animate-[fadeIn_0.15s_ease-out]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleComplete(date); }}
                    className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                    title="Selesai"
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMissed(date); }}
                    className="w-7 h-7 rounded-md bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                    title="Terlewat"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              )}

              <div
                onClick={() => {
                  if (isUnfilled) setActiveDate(isActive ? null : date);
                }}
                className={`
                  w-full aspect-square max-w-[36px] rounded-lg flex items-center justify-center text-xs font-bold
                  transition-all duration-200
                  ${isCompleted
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : isMissed
                      ? "bg-red-500/15 text-red-500 dark:text-red-400"
                      : isToday
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1.5 ring-amber-400/50"
                        : isUnfilled
                          ? `bg-amber-500/10 text-amber-600/60 dark:text-amber-500/50 ring-1 ring-dashed ring-amber-400/30 cursor-pointer hover:bg-amber-500/20 hover:ring-amber-400/50 ${isActive ? "ring-amber-400/60 bg-amber-500/20" : ""}`
                          : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-300 dark:text-zinc-700"
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : isMissed ? (
                  <X size={14} strokeWidth={3} />
                ) : (
                  <span className="text-[11px] tabular-nums">{new Date(date + "T00:00:00").getDate()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
