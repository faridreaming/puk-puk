import { useState } from "react";
import { Link } from "react-router";
import type { Habit } from "~/store/useHabitStore";
import { useHabitStore, getStreak } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { LivesIndicator } from "./LivesIndicator";
import { Check, X, Undo2, Flame } from "lucide-react";
import { useToday } from "~/store/useDevStore";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const undoToday = useHabitStore((s) => s.undoToday);
  const addToast = useToastStore((s) => s.addToast);
  const [showMissedConfirm, setShowMissedConfirm] = useState(false);

  const today = useToday();
  const alreadyTrackedToday =
    habit.completedDates.includes(today) || habit.missedDates.includes(today);
  const completedToday = habit.completedDates.includes(today);

  const currentStage = habit.stages[habit.currentStageIndex];
  const progress = currentStage
    ? Math.min((habit.currentStageProgress / currentStage.targetDays) * 100, 100)
    : 0;
  const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;
  const isComplete =
    isLastStage && currentStage && habit.currentStageProgress >= currentStage.targetDays;

  const streak = getStreak(habit.completedDates, habit.missedDates);

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = markComplete(habit.id, today);
    if (result.type === "complete") {
      if (result.stageUp) {
        addToast({ message: "Naik tahap! Lanjutkan, kamu hebat!", type: "celebration", duration: 4000 });
      } else {
        const messages = [
          "Mantap! Satu langkah lebih dekat!",
          "Kerja bagus! Teruskan!",
          "Konsisten itu kunci!",
          "Hari ini berhasil!",
        ];
        addToast({ message: messages[Math.floor(Math.random() * messages.length)], type: "success" });
      }
    }
  };

  const handleMissed = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = markMissed(habit.id, today);
    setShowMissedConfirm(false);
    if (result.type === "missed") {
      if (result.stageDown) {
        addToast({ message: "Turun tahap. Tidak apa-apa, mulai lagi perlahan.", type: "warning", duration: 4000 });
      } else if (result.livesLeft === 1) {
        addToast({ message: "Nyawa tersisa 1. Hati-hati, kamu bisa!", type: "warning" });
      } else {
        addToast({ message: "Terlewat hari ini. Besok coba lagi!", type: "info" });
      }
    }
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = undoToday(habit.id, today);
    if (result.type === "undo") {
      addToast({ message: "Dibatalkan", type: "info", duration: 2000 });
    }
  };

  return (
    <div className="relative group bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      {/* Header */}
      <Link
        to={`/kebiasaan/${habit.id}`}
        className="flex items-start justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg leading-tight">
              {habit.name}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              {isComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Target tercapai!</span>
              ) : (
                <>
                  Tahap {habit.currentStageIndex + 1}: {currentStage?.label}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
          {streak > 0 && (
            <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400/80 flex items-center gap-0.5">
              <Flame size={10} className="fill-amber-500 dark:fill-amber-400" />
              {streak} hari
            </span>
          )}
        </div>
      </Link>

      {/* Progress bar */}
      {!isComplete && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Progress tahap</span>
            <span>
              {habit.currentStageProgress}/{currentStage?.targetDays} hari
            </span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-linear-to-r from-amber-500 to-orange-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isComplete && (
        <div className="flex gap-2">
          {alreadyTrackedToday ? (
            <div className="flex-1 flex items-center gap-2">
              <div
                className={`flex-1 py-2.5 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5 ${completedToday
                  ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                  }`}
              >
                {completedToday ? <><Check size={14} /> Selesai hari ini</> : <><X size={14} /> Terlewat hari ini</>}
              </div>
              <button
                onClick={handleUndo}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700/50"
                title="Batalkan"
              >
                <Undo2 size={14} />
              </button>
            </div>
          ) : showMissedConfirm ? (
            <>
              <button
                onClick={handleMissed}
                className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 font-semibold text-sm transition-all active:scale-95 cursor-pointer border border-red-200 dark:border-red-500/20"
              >
                Ya, terlewat
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMissedConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleComplete}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                Selesai
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMissedConfirm(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                Terlewat
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
