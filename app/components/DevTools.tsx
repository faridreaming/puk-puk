import { useDevStore, getToday } from "~/store/useDevStore";
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, Clock } from "lucide-react";

export function DevTools() {
  const dateOverride = useDevStore((s) => s.dateOverride);
  const setDateOverride = useDevStore((s) => s.setDateOverride);
  const jumpDays = useDevStore((s) => s.jumpDays);

  // Only show when VITE_SHOW_DEV_TOOLS=true
  if (import.meta.env.VITE_SHOW_DEV_TOOLS !== "true") return null;

  const today = getToday();
  const realToday = new Date().toISOString().split("T")[0];
  const isOverridden = dateOverride !== null;

  return (
    <div className="fixed bottom-4 right-32 z-50 max-w-xs">
      <div className="bg-violet-50 dark:bg-violet-950/90 backdrop-blur-xl border border-violet-200 dark:border-violet-500/30 rounded-2xl shadow-xl shadow-violet-500/10 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
            <Clock size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Dev Time Travel</span>
          </div>
          {isOverridden && (
            <button
              onClick={() => setDateOverride(null)}
              className="text-xs text-violet-500 hover:text-violet-400 cursor-pointer flex items-center gap-1"
              title="Reset ke hari ini"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        {/* Current date display */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-violet-500 dark:text-violet-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
              {new Date(today + "T00:00:00").toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {isOverridden && (
              <p className="text-[10px] text-violet-500 dark:text-violet-500">
                Asli: {realToday}
              </p>
            )}
          </div>
        </div>

        {/* Quick jump buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => jumpDays(-7)}
            className="px-2 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-all cursor-pointer"
          >
            -7d
          </button>
          <button
            onClick={() => jumpDays(-1)}
            className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={today}
            onChange={(e) => setDateOverride(e.target.value || null)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-500/30 text-sm text-zinc-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
          />
          <button
            onClick={() => jumpDays(1)}
            className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => jumpDays(7)}
            className="px-2 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-all cursor-pointer"
          >
            +7d
          </button>
        </div>
      </div>
    </div>
  );
}
