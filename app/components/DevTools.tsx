import { useState } from "react";
import { useDevStore, getToday } from "~/store/useDevStore";
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, Bug, X, ChevronDown } from "lucide-react";

export function DevTools() {
  const dateOverride = useDevStore((s) => s.dateOverride);
  const setDateOverride = useDevStore((s) => s.setDateOverride);
  const jumpDays = useDevStore((s) => s.jumpDays);

  // Only available in dev mode
  if (!import.meta.env.DEV) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const today = getToday();
  const realToday = new Date().toISOString().split("T")[0];
  const isOverridden = dateOverride !== null;

  // Collapsed: just a small floating pill
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-20 md:bottom-4 right-4 z-50
          w-10 h-10 rounded-full flex items-center justify-center
          transition-all active:scale-90 cursor-pointer
          shadow-lg backdrop-blur-xl
          ${isOverridden
            ? "bg-violet-500 text-white shadow-violet-500/30 animate-pulse"
            : "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 shadow-black/10 dark:shadow-black/30 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }
        `}
        title="Buka DevTools"
      >
        <Bug size={18} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 w-72">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden transition-all">
        {/* Header — always visible */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100 dark:border-violet-500/10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-violet-600 dark:text-violet-400 cursor-pointer group"
          >
            <Bug size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">DevTools</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""} text-violet-400`}
            />
          </button>
          <div className="flex items-center gap-1">
            {isOverridden && (
              <button
                onClick={() => setDateOverride(null)}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 cursor-pointer font-medium flex items-center gap-0.5"
                title="Reset ke hari ini"
              >
                <RotateCcw size={10} />
                Reset
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="px-4 py-3 space-y-3">
            {/* Date indicator badge */}
            {isOverridden && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  Time Travel aktif — bukan hari sebenarnya
                </span>
              </div>
            )}

            {/* Current date display */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-violet-500 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {new Date(today + "T00:00:00").toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                {isOverridden && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                    Asli: {new Date(realToday + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>

            {/* Time travel controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => jumpDays(-7)}
                className="px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold hover:bg-violet-100 dark:hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
              >
                -7
              </button>
              <button
                onClick={() => jumpDays(-1)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <input
                type="date"
                value={today}
                onChange={(e) => setDateOverride(e.target.value || null)}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
              <button
                onClick={() => jumpDays(1)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => jumpDays(7)}
                className="px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold hover:bg-violet-100 dark:hover:bg-violet-500/15 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
              >
                +7
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
