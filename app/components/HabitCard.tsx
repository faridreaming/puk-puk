import { Link } from "react-router";
import type { Habit } from "~/store/useHabitStore";
import { useHabitStore } from "~/store/useHabitStore";
import { LivesIndicator } from "./LivesIndicator";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);

  const today = new Date().toISOString().split("T")[0];
  const alreadyTrackedToday =
    habit.completedDates.includes(today) || habit.missedDates.includes(today);
  const completedToday = habit.completedDates.includes(today);
  const missedToday = habit.missedDates.includes(today);

  const currentStage = habit.stages[habit.currentStageIndex];
  const progress = currentStage
    ? Math.min((habit.currentStageProgress / currentStage.targetDays) * 100, 100)
    : 0;
  const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;
  const isComplete =
    isLastStage && currentStage && habit.currentStageProgress >= currentStage.targetDays;

  return (
    <div className="relative group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      {/* Header */}
      <Link
        to={`/kebiasaan/${habit.id}`}
        className="flex items-start justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h3 className="font-bold text-zinc-100 text-lg leading-tight">
              {habit.name}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              {isComplete ? (
                <span className="text-emerald-400 font-semibold">🎉 Target tercapai!</span>
              ) : (
                <>
                  Tahap {habit.currentStageIndex + 1}: {currentStage?.label}
                </>
              )}
            </p>
          </div>
        </div>
        <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
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
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isComplete && (
        <div className="flex gap-2">
          {alreadyTrackedToday ? (
            <div
              className={`flex-1 py-2.5 rounded-xl text-center text-sm font-semibold ${completedToday
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
                }`}
            >
              {completedToday ? "✓ Sudah selesai hari ini" : "✗ Terlewat hari ini"}
            </div>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  markComplete(habit.id, today);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Selesai ✓
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  markMissed(habit.id, today);
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer border border-zinc-700"
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
