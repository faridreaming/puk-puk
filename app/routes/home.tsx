import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useHabitStore } from "~/store/useHabitStore";
import { HabitCard } from "~/components/HabitCard";
import { EmptyState } from "~/components/EmptyState";
import { DataManager } from "~/components/DataManager";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Plus } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Puk-Puk - Bangun Kebiasaan Perlahan" },
    { name: "description", content: "Aplikasi habit tracker yang mendukung perubahan bertahap" },
  ];
}

export default function Home() {
  const habits = useHabitStore((s) => s.habits);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              🐣 Puk-Puk
            </h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">Perlahan, tapi pasti.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block">
              <DataManager />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Mobile: data manager */}
            <div className="flex justify-end mb-4 sm:hidden">
              <DataManager />
            </div>

            {/* Responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      {habits.length > 0 && (
        <Link
          to="/buat"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-linear-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 active:scale-90 z-50"
        >
          <Plus size={28} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
