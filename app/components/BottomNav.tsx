import { Link, useLocation } from "react-router";
import { Home, Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import { DataManager } from "~/components/DataManager";

export function BottomNav() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const isHome = location.pathname === "/";
  const isCreate = location.pathname === "/buat";

  return (
    <>
      {/* Settings overlay */}
      {showSettings && (
        <div
          className="fixed inset-0 z-98 bg-black/30 dark:bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setShowSettings(false)}
        />
      )}
      {showSettings && (
        <div className="fixed bottom-[76px] right-4 z-99 md:hidden animate-[dialogIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 p-4 space-y-3 min-w-[200px]">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pengaturan Data</p>
            <DataManager />
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-97 md:hidden">
        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${isHome
                ? "text-amber-500"
                : "text-zinc-400 dark:text-zinc-600 active:text-zinc-600 dark:active:text-zinc-400"
                }`}
            >
              <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">Beranda</span>
            </Link>

            {/* Center: Add button */}
            <Link
              to="/buat"
              className={`flex items-center justify-center w-14 h-14 -mt-5 rounded-2xl shadow-xl transition-all active:scale-90 ${isCreate
                ? "bg-amber-400 shadow-amber-400/40"
                : "bg-linear-to-br from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50"
                }`}
            >
              <Plus size={28} strokeWidth={2.5} className="text-white" />
            </Link>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer ${showSettings
                ? "text-amber-500"
                : "text-zinc-400 dark:text-zinc-600 active:text-zinc-600 dark:active:text-zinc-400"
                }`}
            >
              <Settings2 size={22} strokeWidth={showSettings ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">Lainnya</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
