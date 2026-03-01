import { Link, useNavigate } from "react-router";
import { useHabitStore } from "~/store/useHabitStore";
import { StageRoadmap } from "~/components/StageRoadmap";
import { WeeklyTracker } from "~/components/WeeklyTracker";
import { LivesIndicator } from "~/components/LivesIndicator";
import type { Route } from "./+types/habit.$id";
import { useState } from "react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Detail Kebiasaan — Puk-Puk 🐣` },
  ];
}

export default function HabitDetail({ params }: Route.ComponentProps) {
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === params.id));
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const resetHabit = useHabitStore((s) => s.resetHabit);
  const markComplete = useHabitStore((s) => s.markComplete);
  const markMissed = useHabitStore((s) => s.markMissed);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!habit) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-zinc-400 mb-4">Kebiasaan tidak ditemukan</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300 font-semibold">
            ← Kembali
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

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>{habit.icon}</span>
              {habit.name}
            </h1>
          </div>
          <LivesIndicator lives={habit.lives} maxLives={habit.maxLives} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Target */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">
            Target Akhir
          </p>
          <p className="text-lg font-bold text-zinc-100">{habit.targetLabel}</p>
          {isComplete && (
            <div className="mt-3 px-4 py-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold text-sm text-center">
              🎉 Selamat! Target tercapai!
            </div>
          )}
        </div>

        {/* Daily action */}
        {!isComplete && (
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">
              Hari Ini
            </p>
            <p className="text-base font-semibold text-zinc-300 mb-4">
              {currentStage?.label}
            </p>
            {alreadyTrackedToday ? (
              <div
                className={`py-3 rounded-xl text-center text-sm font-semibold ${completedToday
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                  }`}
              >
                {completedToday ? "✓ Sudah selesai hari ini" : "✗ Terlewat hari ini"}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => markComplete(habit.id, today)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Selesai ✓
                </button>
                <button
                  onClick={() => markMissed(habit.id, today)}
                  className="py-3 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer border border-zinc-700"
                >
                  Terlewat
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage Roadmap */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-4">
            Peta Tahapan
          </p>
          <StageRoadmap
            stages={habit.stages}
            currentStageIndex={habit.currentStageIndex}
            currentStageProgress={habit.currentStageProgress}
          />
        </div>

        {/* Weekly Tracker */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5">
          <WeeklyTracker
            completedDates={habit.completedDates}
            missedDates={habit.missedDates}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{habit.completedDates.length}</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Selesai</p>
          </div>
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{habit.missedDates.length}</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Terlewat</p>
          </div>
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{successRate}%</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Sukses</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-zinc-800/50 space-y-3">
          <button
            onClick={() => {
              resetHabit(habit.id);
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-500 text-sm font-medium transition-all cursor-pointer border border-zinc-800"
          >
            Mulai Ulang dari Awal
          </button>

          {showDeleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deleteHabit(habit.id);
                  navigate("/");
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-all cursor-pointer border border-red-500/20"
              >
                Ya, hapus
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm font-medium transition-all cursor-pointer border border-zinc-700"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 text-sm font-medium transition-all cursor-pointer border border-zinc-800 hover:border-red-500/20"
            >
              Hapus Kebiasaan
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
