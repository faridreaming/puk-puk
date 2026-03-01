import { Link, useNavigate } from "react-router";
import { useHabitStore, getStreak } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { StageRoadmap } from "~/components/StageRoadmap";
import { WeeklyTracker } from "~/components/WeeklyTracker";
import { LivesIndicator } from "~/components/LivesIndicator";
import type { Route } from "./+types/habit.$id";
import { useState } from "react";
import { ChevronLeft, Pencil, Check, X, Undo2, Flame, RotateCcw, Trash2, Search } from "lucide-react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Detail Kebiasaan - Puk-Puk 🐣` },
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
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMissedConfirm, setShowMissedConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  if (!habit) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Search size={48} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Kebiasaan tidak ditemukan</p>
          <Link to="/" className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-1">
            <ChevronLeft size={16} />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
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
    const result = markComplete(habit.id, today);
    if (result.type === "complete") {
      if (result.stageUp) {
        addToast({ message: "Naik tahap! Lanjutkan, kamu hebat!", type: "celebration", duration: 4000 });
      } else {
        addToast({ message: "Mantap! Satu langkah lebih dekat!", type: "success" });
      }
    }
  };

  const handleMissed = () => {
    const result = markMissed(habit.id, today);
    setShowMissedConfirm(false);
    if (result.type === "missed") {
      if (result.stageDown) {
        addToast({ message: "Turun tahap. Tidak apa-apa, mulai lagi perlahan.", type: "warning", duration: 4000 });
      } else {
        addToast({ message: "Terlewat hari ini. Besok coba lagi!", type: "info" });
      }
    }
  };

  const handleUndo = () => {
    const result = undoToday(habit.id, today);
    if (result.type === "undo") {
      addToast({ message: "Dibatalkan", type: "info", duration: 2000 });
    }
  };

  const startEditing = () => {
    setEditName(habit.name);
    setEditIcon(habit.icon);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      editHabit(habit.id, { name: editName.trim(), icon: editIcon, targetLabel: editName.trim() });
      addToast({ message: "Tersimpan", type: "success", duration: 2000 });
    }
    setIsEditing(false);
  };

  const EMOJI_OPTIONS = ["🧘", "🏃", "📚", "💪", "🎯", "✍️", "🎵", "🥗", "💤", "🧹", "💻", "🚫"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} className="text-zinc-500 dark:text-zinc-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{habit.icon}</span>
              {habit.name}
            </h1>
          </div>
          <button
            onClick={startEditing}
            className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil size={16} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Edit dialog */}
        {isEditing && (
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-amber-300 dark:border-amber-500/20 rounded-2xl p-5 space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Edit Kebiasaan</h3>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEditIcon(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${editIcon === emoji
                      ? "bg-amber-100 dark:bg-amber-500/20 ring-2 ring-amber-500 scale-110"
                      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                Simpan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Desktop: two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: streak, label: "Streak", color: "text-amber-500 dark:text-amber-400", icon: <Flame size={16} className="inline fill-amber-500 dark:fill-amber-400" /> },
                { value: habit.completedDates.length, label: "Selesai", color: "text-emerald-600 dark:text-emerald-400", icon: <Check size={16} className="inline" /> },
                { value: habit.missedDates.length, label: "Terlewat", color: "text-red-500 dark:text-red-400", icon: <X size={16} className="inline" /> },
                { value: `${successRate}%`, label: "Sukses", color: "text-blue-500 dark:text-blue-400", icon: null },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center transition-colors">
                  <p className={`text-xl font-bold ${stat.color} flex items-center justify-center gap-1`}>
                    {stat.icon} {stat.value}
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Target + lives */}
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Target Akhir</p>
                <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{habit.targetLabel}</p>
              {isComplete && (
                <div className="mt-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold text-sm text-center flex items-center justify-center gap-1.5">
                  <Check size={16} />
                  Selamat! Target tercapai!
                </div>
              )}
            </div>

            {/* Daily action */}
            {!isComplete && (
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Hari Ini</p>
                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{currentStage?.label}</p>
                {alreadyTrackedToday ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5 ${completedToday
                          ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                        }`}
                    >
                      {completedToday ? <><Check size={16} /> Sudah selesai hari ini</> : <><X size={16} /> Terlewat hari ini</>}
                    </div>
                    <button
                      onClick={handleUndo}
                      className="py-3 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700/50"
                    >
                      <Undo2 size={16} />
                    </button>
                  </div>
                ) : showMissedConfirm ? (
                  <div className="flex gap-2">
                    <button onClick={handleMissed} className="flex-1 py-3 rounded-xl bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 font-semibold text-sm transition-all active:scale-95 cursor-pointer border border-red-200 dark:border-red-500/20">
                      Ya, terlewat
                    </button>
                    <button onClick={() => setShowMissedConfirm(false)} className="py-3 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700">
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleComplete} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5">
                      <Check size={16} />
                      Selesai
                    </button>
                    <button onClick={() => setShowMissedConfirm(true)} className="py-3 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700">
                      Terlewat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Stage Roadmap */}
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-4">Peta Tahapan</p>
              <StageRoadmap stages={habit.stages} currentStageIndex={habit.currentStageIndex} currentStageProgress={habit.currentStageProgress} />
            </div>

            {/* Weekly Tracker */}
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors">
              <WeeklyTracker completedDates={habit.completedDates} missedDates={habit.missedDates} />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 space-y-3 transition-colors">
          {showResetConfirm ? (
            <div className="flex gap-2">
              <button onClick={() => { resetHabit(habit.id); setShowResetConfirm(false); addToast({ message: "Direset ke awal", type: "info" }); }} className="flex-1 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-semibold transition-all cursor-pointer border border-amber-200 dark:border-amber-500/20">
                Ya, mulai ulang
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5">
              <RotateCcw size={14} />
              Mulai Ulang dari Awal
            </button>
          )}

          {showDeleteConfirm ? (
            <div className="flex gap-2">
              <button onClick={() => { deleteHabit(habit.id); navigate("/"); }} className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-all cursor-pointer border border-red-200 dark:border-red-500/20">
                Ya, hapus
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-500 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-500/20 flex items-center justify-center gap-1.5">
              <Trash2 size={14} />
              Hapus Kebiasaan
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
