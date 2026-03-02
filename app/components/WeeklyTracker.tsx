import { useState, useEffect, useRef } from "react";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToday, useTodayDate } from "~/store/useDevStore";
import { useHabitStore } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";

interface WeeklyTrackerProps {
  habitId: string;
  completedDates: string[];
  missedDates: string[];
  createdAt: string;
}

/** Format a Date to YYYY-MM-DD using LOCAL time (avoids UTC shift from toISOString) */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(referenceDate: Date, todayStr: string) {
  const dayOfWeek = referenceDate.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - ((dayOfWeek + 6) % 7));

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(d);
    return {
      date: dateStr,
      dayLabel: days[i],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    };
  });
}

function getWeekLabel(referenceDate: Date, todayDate: Date): string {
  const refWeekStart = new Date(referenceDate);
  const refDow = refWeekStart.getDay();
  refWeekStart.setDate(refWeekStart.getDate() - ((refDow + 6) % 7));

  const todayWeekStart = new Date(todayDate);
  const todayDow = todayWeekStart.getDay();
  todayWeekStart.setDate(todayWeekStart.getDate() - ((todayDow + 6) % 7));

  const diffMs = refWeekStart.getTime() - todayWeekStart.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

  if (diffWeeks === 0) return "Minggu Ini";
  if (diffWeeks === -1) return "Minggu Lalu";
  if (diffWeeks === 1) return "Minggu Depan";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const endOfWeek = new Date(refWeekStart);
  endOfWeek.setDate(refWeekStart.getDate() + 6);

  return `${refWeekStart.getDate()} ${monthNames[refWeekStart.getMonth()]} – ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}`;
}

export function WeeklyTracker({ habitId, completedDates, missedDates, createdAt }: WeeklyTrackerProps) {
  // Extract just the date part from createdAt ISO string
  const createdDateStr = createdAt.split("T")[0];
  const todayStr = useToday();
  const todayDate = useTodayDate();

  const [weekOffset, setWeekOffset] = useState(0);
  const referenceDate = new Date(todayDate);
  referenceDate.setDate(todayDate.getDate() + weekOffset * 7);

  const weekDates = getWeekDates(referenceDate, todayStr);
  const weekLabel = getWeekLabel(referenceDate, todayDate);

  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const addToast = useToastStore((s) => s.addToast);

  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [exitingDate, setExitingDate] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Stats for this week
  const weekCompleted = weekDates.filter(d => completedDates.includes(d.date)).length;
  const weekMissed = weekDates.filter(d => missedDates.includes(d.date)).length;
  const weekTotal = weekCompleted + weekMissed;

  const closePopover = () => {
    if (!activeDate) return;
    setExitingDate(activeDate);
    setTimeout(() => {
      setActiveDate(null);
      setExitingDate(null);
    }, 150);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        closePopover();
      }
    }

    if (activeDate) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDate]);

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
    setExitingDate(null);
  };

  const handleMissed = (date: string) => {
    const result = markMissed(habitId, date);
    if (result.type === "missed") {
      addToast({
        message: result.stageDown ? "Nyawa habis, turun tahap" : `Sisa ${result.livesLeft} nyawa`,
        type: "warning",
        duration: 2500,
      });
    }
    setActiveDate(null);
    setExitingDate(null);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      {/* Week navigation header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft size={14} className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <div className="text-center">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {weekLabel}
          </span>
          {weekTotal > 0 && (
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[10px] text-emerald-500 font-medium">{weekCompleted} selesai</span>
              {weekMissed > 0 && (
                <span className="text-[10px] text-red-400 font-medium">{weekMissed} terlewat</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
          className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} className="text-zinc-500 dark:text-zinc-400" />
        </button>
      </div>

      {/* Day cells grid */}
      <div className="flex items-start gap-1.5">
        {weekDates.map(({ date, dayLabel, dayNumber, isToday, isPast }) => {
          const isCompleted = completedDates.includes(date);
          const isMissed = missedDates.includes(date);
          const isBeforeCreation = date < createdDateStr;
          const isFuture = !isToday && !isPast;
          const isUnfilled = isPast && !isCompleted && !isMissed && !isBeforeCreation;
          const isDisabled = isFuture || isBeforeCreation;
          const isActive = activeDate === date;
          const isExiting = exitingDate === date;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1.5 relative">
              {/* Day label */}
              <span
                className={`text-[10px] font-bold tracking-wider uppercase ${isToday
                  ? "text-amber-500 dark:text-amber-400"
                  : isCompleted
                    ? "text-emerald-500 dark:text-emerald-400"
                    : isMissed
                      ? "text-red-400 dark:text-red-500"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
              >
                {dayLabel}
              </span>

              {/* Action popover for unfilled past days */}
              {isActive && (
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white dark:bg-zinc-800 rounded-xl shadow-xl shadow-black/15 dark:shadow-black/40 p-1.5 border border-zinc-200 dark:border-zinc-700 z-10 transition-all duration-150 ${isExiting
                  ? "opacity-0 scale-90 translate-y-1"
                  : "opacity-100 scale-100 translate-y-0 animate-[fadeIn_0.15s_ease-out]"
                  }`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleComplete(date); }}
                    className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm shadow-emerald-500/30"
                    title="Selesai"
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMissed(date); }}
                    className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm shadow-red-500/30"
                    title="Terlewat"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              )}

              {/* Day cell */}
              <div
                onClick={() => {
                  if (isUnfilled) {
                    if (isActive) {
                      closePopover();
                    } else {
                      setActiveDate(date);
                    }
                  }
                }}
                className={`
                  w-full aspect-square max-w-[44px] min-w-[36px] rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200 relative overflow-hidden
                  ${isCompleted
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                    : isMissed
                      ? "bg-red-500/12 text-red-500 dark:text-red-400 ring-1 ring-red-500/15"
                      : isToday
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/50 shadow-sm shadow-amber-500/10"
                        : isUnfilled
                          ? `bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 ring-1 ring-dashed ring-amber-400/30 cursor-pointer hover:bg-amber-500/10 hover:ring-amber-400/50 active:scale-95 ${isActive ? "ring-amber-400/60 bg-amber-500/15" : ""}`
                          : "bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-300 dark:text-zinc-700"
                  }
                `}
              >
                {/* Completion indicator */}
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : isMissed ? (
                  <X size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold tabular-nums">{dayNumber}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini progress bar for the week */}
      {weekTotal > 0 && (
        <div className="mt-3 h-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden flex">
          {weekCompleted > 0 && (
            <div
              className="h-full bg-emerald-500/70 rounded-full transition-all duration-500"
              style={{ width: `${(weekCompleted / 7) * 100}%` }}
            />
          )}
          {weekMissed > 0 && (
            <div
              className="h-full bg-red-500/50 rounded-full transition-all duration-500"
              style={{ width: `${(weekMissed / 7) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
