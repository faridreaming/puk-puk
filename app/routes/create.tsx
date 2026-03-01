import { Link } from "react-router";
import { CreateHabitForm } from "~/components/CreateHabitForm";

export function meta() {
  return [
    { title: "Buat Kebiasaan Baru — Puk-Puk 🐣" },
  ];
}

export default function CreatePage() {
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
          <h1 className="text-lg font-bold text-zinc-100">Kebiasaan Baru</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <CreateHabitForm />
      </main>
    </div>
  );
}
