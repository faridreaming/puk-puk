import { Link } from "react-router";
import type { Habit } from "~/store/useHabitStore";
import { useHabitStore, getStreak } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { LivesIndicator } from "./LivesIndicator";
import { ActionButton } from "./ui/ActionButton";
import { Check, X, Flame, ChevronRight, Trophy, Undo2 } from "lucide-react";
import { useToday } from "~/store/useDevStore";
import { useDialogStore } from "~/store/useDialogStore";
import { getHabitIcon, getHabitColor } from "~/lib/habitMeta";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const undoToday = useHabitStore((s) => s.undoToday);
  const addToast = useToastStore((s) => s.addToast);
  const openDialog = useDialogStore((s) => s.openDialog);

  const today = useToday();
  const alreadyTrackedToday =
    habit.completedDates.includes(today) || habit.missedDates.includes(today);
  const completedToday = habit.completedDates.includes(today);

  const currentStage = habit.stages[habit.currentStageIndex];
  const isTargetPhase = habit.currentStageIndex >= habit.stages.length;
  const isComplete = false; // "Complete" that blocks check-ins no longer exists, it goes into Target Phase

  const streak = getStreak(habit.completedDates, habit.missedDates);
  const totalDaysTracked = habit.completedDates.length + habit.missedDates.length;
  const successRate = totalDaysTracked > 0
    ? Math.round((habit.completedDates.length / totalDaysTracked) * 100)
    : 0;

  const stageProgress = currentStage
    ? Math.min(100, (habit.currentStageProgress / currentStage.targetDays) * 100)
    : 0;

  const IconComponent = getHabitIcon(habit.icon);
  const colorTheme = getHabitColor(habit.color || "amber");

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

  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    openDialog({
      title: "Batalkan tanda hari ini?",
      message: completedToday
        ? "Status selesai hari ini akan dibatalkan."
        : "Status terlewat hari ini akan dibatalkan. Nyawa akan dikembalikan.",
      confirmLabel: "Ya, batalkan",
      variant: "warning",
      onConfirm: () => {
        undoToday(habit.id, today);
        addToast({ message: "Tanda hari ini dibatalkan.", type: "info" });
      },
    });
  };


  return (
    <div className="relative group bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <div className="p-4 sm:p-5">
        {/* Header row: icon + name + meta + arrow */}
        <Link
          to={`/kebiasaan/${habit.id}`}
          className="flex items-center gap-3 group/link"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorTheme.bg}`}>
            <IconComponent size={20} className={colorTheme.text} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] leading-tight truncate">
              {habit.name}
            </h3>
            {isTargetPhase ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 mt-0.5">
                <Trophy size={11} /> Fase Mempertahankan Target
              </span>
            ) : currentStage ? (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 block truncate">
                Tahap {habit.currentStageIndex + 1}/{habit.stages.length} · {currentStage.label}
              </span>
            ) : null}
          </div>
          <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 shrink-0 transition-transform group-hover/link:translate-x-0.5" />
        </Link>

        {/* Stage progress — flat inline style */}
        {!isTargetPhase && currentStage && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-semibold ${colorTheme.text}`}>
                {habit.currentStageProgress}/{currentStage.targetDays} hari
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                {Math.round(stageProgress)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorTheme.dot}`}
                style={{ width: `${stageProgress}%` }}
              />
            </div>
          </div>
        )}

        {isTargetPhase && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Target {habit.targetLabel}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                ∞
              </span>
            </div>
            <div className="h-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full overflow-hidden relative">
              <div
                className="absolute inset-0 bg-linear-to-r from-emerald-400/20 via-emerald-400 to-emerald-400/20 w-[200%] animate-[shimmer_3s_linear_infinite]"
              />
            </div>
          </div>
        )}

        {/* Meta chips — compact row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
              <Flame size={11} className="fill-amber-500 dark:fill-amber-400" />
              {streak}
            </span>
          )}
          <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
          {totalDaysTracked > 0 && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-600 ml-auto tabular-nums">
              {successRate}%
            </span>
          )}
        </div>

        {/* Action area */}
        <div className="mt-3">
          {alreadyTrackedToday ? (
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${completedToday
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
                }`}>
                {completedToday ? <Check size={15} strokeWidth={2.5} /> : <X size={15} strokeWidth={2.5} />}
                {completedToday ? "Selesai" : "Terlewat"}
              </span>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Undo2 size={11} />
                Batalkan
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <ActionButton
                variant="success"
                onClick={handleComplete}
                className="flex-1"
                size="sm"
              >
                <Check size={15} strokeWidth={2.5} />
                Selesai
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={handleMissed}
                className="flex-1"
                size="sm"
              >
                <X size={15} strokeWidth={2.5} />
                Terlewat
              </ActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
