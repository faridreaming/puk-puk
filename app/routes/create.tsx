import { Link } from "react-router";
import { CreateHabitForm } from "~/components/CreateHabitForm";
import { ChevronLeft } from "lucide-react";

export function meta() {
  return [
    { title: "Buat Kebiasaan Baru - Puk-Puk 🐣" },
  ];
}

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} className="text-zinc-500 dark:text-zinc-400" />
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kebiasaan Baru</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <CreateHabitForm />
      </main>
    </div>
  );
}
