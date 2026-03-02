import { Link } from "react-router";
import type { Habit } from "~/store/useHabitStore";
import { useHabitStore, getStreak } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { LivesIndicator } from "./LivesIndicator";
import { WeeklyTracker } from "./WeeklyTracker";
import { ActionButton } from "./ui/ActionButton";
import { Check, X, Flame, ChevronRight, Trophy } from "lucide-react";
import { useToday } from "~/store/useDevStore";
import { useDialogStore } from "~/store/useDialogStore";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const addToast = useToastStore((s) => s.addToast);
  const openDialog = useDialogStore((s) => s.openDialog);

  const today = useToday();
  const alreadyTrackedToday =
    habit.completedDates.includes(today) || habit.missedDates.includes(today);
  const completedToday = habit.completedDates.includes(today);

  const currentStage = habit.stages[habit.currentStageIndex];
  const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;
  const isComplete =
    isLastStage && currentStage && habit.currentStageProgress >= currentStage.targetDays;

  const streak = getStreak(habit.completedDates, habit.missedDates);
  const totalDaysTracked = habit.completedDates.length + habit.missedDates.length;
  const successRate = totalDaysTracked > 0
    ? Math.round((habit.completedDates.length / totalDaysTracked) * 100)
    : 0;

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    openDialog({
      title: "Tandai selesai?",
      message: `Tandai "${habit.name}" sebagai selesai untuk hari ini.`,
      confirmLabel: "Ya, selesai",
      variant: "info",
      onConfirm: () => {
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
      },
    });
  };

  const handleMissed = (e: React.MouseEvent) => {
    e.preventDefault();
    openDialog({
      title: "Tandai terlewat?",
      message: "Hari ini akan ditandai sebagai terlewat. Nyawa akan berkurang.",
      confirmLabel: "Ya, terlewat",
      variant: "warning",
      onConfirm: () => {
        const result = markMissed(habit.id, today);
        if (result.type === "missed") {
          if (result.stageDown) {
            addToast({ message: "Turun tahap. Tidak apa-apa, mulai lagi perlahan.", type: "warning", duration: 4000 });
          } else if (result.livesLeft === 1) {
            addToast({ message: "Nyawa tersisa 1. Hati-hati, kamu bisa!", type: "warning" });
          } else {
            addToast({ message: "Terlewat hari ini. Besok coba lagi!", type: "info" });
          }
        }
      },
    });
  };


  return (
    <div className="relative group bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">

      <div className="p-5">
        {/* Header: icon + info + link arrow */}
        <Link
          to={`/kebiasaan/${habit.id}`}
          className="flex items-center gap-3 mb-4 group/link"
        >
          {/* Icon container */}
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0 transition-colors group-hover/link:bg-zinc-200 dark:group-hover/link:bg-zinc-700">
            {habit.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight truncate">
              {habit.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              {isComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <Trophy size={11} /> Target tercapai!
                </span>
              ) : (
                <>Tahap {habit.currentStageIndex + 1}/{habit.stages.length}: {currentStage?.label}</>
              )}
            </p>
          </div>
          <ChevronRight size={16} className="text-zinc-400 dark:text-zinc-600 shrink-0 transition-transform group-hover/link:translate-x-0.5" />
        </Link>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              <Flame size={12} className="fill-amber-500 dark:fill-amber-400" />
              {streak}
            </span>
          )}
          <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
          {totalDaysTracked > 0 && (
            <span className="text-zinc-400 dark:text-zinc-600 ml-auto tabular-nums">
              {successRate}% sukses
            </span>
          )}
        </div>

        {/* Weekly Tracker */}
        {!isComplete && (
          <div className="mb-4">
            <WeeklyTracker habitId={habit.id} completedDates={habit.completedDates} missedDates={habit.missedDates} createdAt={habit.createdAt} />
          </div>
        )}

        {/* Action buttons — using ActionButton for consistency & touch-friendly sizing */}
        {!isComplete && (
          <div className="flex gap-2">
            {alreadyTrackedToday ? (
              <div
                className={`flex-1 flex items-center justify-center min-h-[44px] py-2.5 rounded-xl text-center text-sm font-medium gap-1.5 box-border ${completedToday
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/15"
                  : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200/60 dark:border-red-500/15"
                  }`}
              >
                {completedToday ? <><Check size={16} strokeWidth={2.5} /> Selesai</> : <><X size={16} strokeWidth={2.5} /> Terlewat</>}
              </div>
            ) : (
              <>
                <ActionButton
                  variant="success"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  <Check size={16} strokeWidth={2.5} />
                  Tandai Selesai
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  onClick={handleMissed}
                  className="flex-1"
                >
                  <X size={16} strokeWidth={2.5} />
                  Tandai Terlewat
                </ActionButton>
              </>
            )}
          </div>
        )}

        {/* Completed state */}
        {isComplete && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/15">
            <Trophy size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Selamat! Target tercapai!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
