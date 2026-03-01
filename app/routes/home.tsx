import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useHabitStore } from "~/store/useHabitStore";
import { HabitCard } from "~/components/HabitCard";
import { EmptyState } from "~/components/EmptyState";
import { DataManager } from "~/components/DataManager";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Puk-Puk 🐣 — Bangun Kebiasaan Perlahan" },
    { name: "description", content: "Aplikasi habit tracker yang mendukung perubahan bertahap" },
  ];
}

export default function Home() {
  const habits = useHabitStore((s) => s.habits);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
              🐣 Puk-Puk
            </h1>
            <p className="text-[11px] text-zinc-600 mt-0.5">Perlahan, tapi pasti.</p>
          </div>
          <DataManager />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {habits.length > 0 && (
        <Link
          to="/buat"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 active:scale-90 z-50"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  );
}
