import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useHabitStore } from "~/store/useHabitStore";
import { HabitCard } from "~/components/HabitCard";
import { EmptyState } from "~/components/EmptyState";
import { DataManager } from "~/components/DataManager";
import { ThemeToggle } from "~/components/ThemeToggle";
import { PageShell } from "~/components/ui/PageShell";
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
    <PageShell
      title="🐣 Puk-Puk"
      subtitle="Perlahan, tapi pasti."
      headerRight={
        <>
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <DataManager />
            <Link
              to="/buat"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-amber-500/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              Tambah
            </Link>
          </div>
        </>
      }
    >
      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop: data manager already in header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
