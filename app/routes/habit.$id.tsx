import { Link, useNavigate } from "react-router";
import { useHabitStore, getStreak } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { useDialogStore } from "~/store/useDialogStore";
import { StageRoadmap } from "~/components/StageRoadmap";
import { WeeklyTracker } from "~/components/WeeklyTracker";
import { LivesIndicator } from "~/components/LivesIndicator";
import { PageShell } from "~/components/ui/PageShell";
import { Section } from "~/components/ui/Section";
import { ActionButton } from "~/components/ui/ActionButton";
import { SectionLabel } from "~/components/ui/SectionLabel";
import { StatCard } from "~/components/ui/StatCard";
import { IconButton } from "~/components/ui/IconButton";
import type { Route } from "./+types/habit.$id";
import { useState } from "react";
import { Pencil, Check, X, Undo2, Flame, RotateCcw, Trash2, Search, ChevronDown } from "lucide-react";
import { useToday } from "~/store/useDevStore";
import { HABIT_ICONS, HABIT_COLORS, getHabitIcon, getHabitColor } from "~/lib/habitMeta";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Detail Kebiasaan - Pukpuk` },
  ];
}

export default function HabitDetail({ params }: Route.ComponentProps) {
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === params.id));
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const resetHabit = useHabitStore((s) => s.resetHabit);
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const undoToday = useHabitStore((s) => s.undoToday);
  const editHabit = useHabitStore((s) => s.editHabit);
  const addToast = useToastStore((s) => s.addToast);
  const openDialog = useDialogStore((s) => s.openDialog);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showDangerZone, setShowDangerZone] = useState(false);
  const today = useToday();

  if (!habit) {
    return (
      <PageShell title="Tidak Ditemukan" backTo="/">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={48} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Kebiasaan tidak ditemukan</p>
          <Link to="/" className="text-amber-500 hover:text-amber-400 font-semibold">
            ← Kembali
          </Link>
        </div>
      </PageShell>
    );
  }

  const alreadyTrackedToday =
    habit.completedDates.includes(today) || habit.missedDates.includes(today);
  const completedToday = habit.completedDates.includes(today);
  const currentStage = habit.stages[habit.currentStageIndex];
  const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;
  const isComplete =
    isLastStage && currentStage && habit.currentStageProgress >= currentStage.targetDays;

  const totalDaysTracked = habit.completedDates.length + habit.missedDates.length;
  const successRate =
    totalDaysTracked > 0
      ? Math.round((habit.completedDates.length / totalDaysTracked) * 100)
      : 0;
  const streak = getStreak(habit.completedDates, habit.missedDates);

  const handleComplete = () => {
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
            addToast({ message: "Mantap! Satu langkah lebih dekat!", type: "success" });
          }
        }
      },
    });
  };

  const handleMissed = () => {
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
          } else {
            addToast({ message: "Terlewat hari ini. Besok coba lagi!", type: "info" });
          }
        }
      },
    });
  };

  const handleUndo = () => {
    const result = undoToday(habit.id, today);
    if (result.type === "undo") {
      addToast({ message: "Dibatalkan", type: "info", duration: 2000 });
    }
  };

  const handleReset = () => {
    openDialog({
      title: "Mulai ulang dari awal?",
      message: "Semua progress akan direset. Kamu akan kembali ke tahap pertama.",
      confirmLabel: "Ya, mulai ulang",
      variant: "warning",
      onConfirm: () => {
        resetHabit(habit.id);
        addToast({ message: "Direset ke awal", type: "info" });
      },
    });
  };

  const handleDelete = () => {
    openDialog({
      title: "Hapus kebiasaan ini?",
      message: "Semua data dan progress akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Ya, hapus",
      variant: "danger",
      onConfirm: () => {
        deleteHabit(habit.id);
        navigate("/");
      },
    });
  };

  const startEditing = () => {
    setEditName(habit.name);
    setEditIcon(habit.icon);
    setEditColor(habit.color || "amber");
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      editHabit(habit.id, { name: editName.trim(), icon: editIcon, color: editColor, targetLabel: editName.trim() });
      addToast({ message: "Tersimpan", type: "success", duration: 2000 });
    }
    setIsEditing(false);
  };

  const HabitIcon = getHabitIcon(habit.icon);
  const habitColor = getHabitColor(habit.color || "amber");

  return (
    <PageShell
      title={habit.name}
      backTo="/"
      headerRight={
        <IconButton icon={Pencil} onClick={startEditing} title="Edit" />
      }
    >
      <div className="space-y-6">
        {/* Edit panel */}
        {isEditing && (
          <Section className="border-amber-300 dark:border-amber-500/20">
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4">Edit Kebiasaan</h3>
            {/* Icon picker */}
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Ikon</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {HABIT_ICONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = editIcon === opt.name;
                const selColor = getHabitColor(editColor);
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setEditIcon(opt.name)}
                    title={opt.label}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isSelected
                      ? `${selColor.bg} ring-2 ${selColor.ring} scale-110`
                      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                      }`}
                  >
                    <IconComp size={16} className={isSelected ? selColor.text : ""} />
                  </button>
                );
              })}
            </div>
            {/* Color picker */}
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Warna</label>
            <div className="flex flex-wrap gap-2.5 mb-4">
              {HABIT_COLORS.map((c) => {
                const isSelected = editColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setEditColor(c.name)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full transition-all cursor-pointer ${c.dot} ${isSelected
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 " + c.ring + " scale-110"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                      }`}
                  />
                );
              })}
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all mb-4"
            />
            <div className="flex gap-2">
              <ActionButton variant="primary" onClick={saveEdit} className="flex-1">
                <Check size={16} /> Simpan
              </ActionButton>
              <ActionButton variant="ghost" onClick={() => setIsEditing(false)}>
                Batal
              </ActionButton>
            </div>
          </Section>
        )}

        {/* Desktop: two-column layout, Mobile: single column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6">
            {/* Stats bar — 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard
                value={streak}
                label="Streak"
                color="text-amber-500 dark:text-amber-400"
                icon={<Flame size={16} className="inline fill-amber-500 dark:fill-amber-400" />}
              />
              <StatCard
                value={habit.completedDates.length}
                label="Selesai"
                color="text-emerald-600 dark:text-emerald-400"
                icon={<Check size={16} className="inline" />}
              />
              <StatCard
                value={habit.missedDates.length}
                label="Terlewat"
                color="text-red-500 dark:text-red-400"
                icon={<X size={16} className="inline" />}
              />
              <StatCard
                value={`${successRate}%`}
                label="Sukses"
                color="text-blue-500 dark:text-blue-400"
              />
            </div>

            {/* Current stage + target info */}
            <Section>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Tahap Saat Ini</SectionLabel>
                <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
              </div>

              {!isComplete && currentStage ? (
                <div className="space-y-3">
                  {/* Current stage label + number */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      {habit.currentStageIndex + 1}/{habit.stages.length}
                    </span>
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{currentStage.label}</p>
                  </div>

                  {/* Stage progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 font-medium">Progres tahap</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {habit.currentStageProgress}/{currentStage.targetDays} hari
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (habit.currentStageProgress / currentStage.targetDays) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Final target */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Target akhir</span>
                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{habit.targetLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold text-sm text-center flex items-center justify-center gap-1.5">
                  <Check size={16} />
                  Selamat! Target tercapai: {habit.targetLabel}
                </div>
              )}
            </Section>

            {/* Daily action */}
            {!isComplete && (
              <Section>
                <SectionLabel className="mb-1">Hari Ini</SectionLabel>
                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{currentStage?.label}</p>
                {alreadyTrackedToday ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 min-h-[44px] py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5 ${completedToday
                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                        }`}
                    >
                      {completedToday ? <><Check size={16} /> Sudah selesai hari ini</> : <><X size={16} /> Terlewat hari ini</>}
                    </div>
                    <ActionButton variant="ghost" onClick={handleUndo} className="px-3">
                      <Undo2 size={16} />
                    </ActionButton>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <ActionButton variant="success" onClick={handleComplete} className="flex-1">
                      <Check size={16} /> Selesai
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={handleMissed} className="flex-1 sm:flex-none sm:px-5">
                      Terlewat
                    </ActionButton>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            {/* Stage Roadmap */}
            <Section title="Peta Tahapan">
              <StageRoadmap stages={habit.stages} currentStageIndex={habit.currentStageIndex} currentStageProgress={habit.currentStageProgress} />
            </Section>

            {/* Weekly Tracker */}
            <Section>
              <WeeklyTracker habitId={habit.id} completedDates={habit.completedDates} missedDates={habit.missedDates} createdAt={habit.createdAt} />
            </Section>
          </div>
        </div>

        {/* Danger Zone — collapsible on mobile */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-4 transition-colors">
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="flex items-center justify-between w-full text-left cursor-pointer group md:hidden mb-3"
          >
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-500 transition-colors">
              Zona Bahaya
            </span>
            <ChevronDown
              size={14}
              className={`text-zinc-400 transition-transform ${showDangerZone ? "rotate-180" : ""}`}
            />
          </button>

          <div className={`space-y-3 md:block ${showDangerZone ? "block" : "hidden"}`}>
            <button onClick={handleReset} className="w-full min-h-[44px] py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5">
              <RotateCcw size={14} />
              Mulai Ulang dari Awal
            </button>

            <button onClick={handleDelete} className="w-full min-h-[44px] py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-500 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-500/20 flex items-center justify-center gap-1.5">
              <Trash2 size={14} />
              Hapus Kebiasaan
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
