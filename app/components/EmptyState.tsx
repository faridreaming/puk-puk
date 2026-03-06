import { Link } from "react-router";
import { Plus, ArrowRight } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 animate-bounce">
        <img src="/logo.svg" alt="Pukpuk" className="w-20 h-20 drop-shadow-md mx-auto" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
        Belum ada kebiasaan
      </h2>
      <p className="text-zinc-500 mb-8 max-w-sm leading-relaxed">
        Mulai dari langkah kecil. Tidak perlu langsung besar.
        <br />
        <span className="text-amber-500 dark:text-amber-400/80">Perlahan, tapi pasti.</span>
      </p>
      <Link
        to="/buat"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 active:scale-95"
      >
        Buat Kebiasaan Pertama
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
