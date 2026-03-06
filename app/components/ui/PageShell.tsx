import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

interface PageShellProps {
  title: React.ReactNode;
  subtitle?: string;
  backTo?: string;
  headerRight?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
};

export function PageShell({
  title,
  subtitle,
  backTo,
  headerRight,
  maxWidth = "lg",
  children,
}: PageShellProps) {
  const mw = MAX_WIDTH_MAP[maxWidth];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 transition-colors">
        <div className={`${mw} mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3`}>
          {backTo && (
            <Link
              to={backTo}
              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <ChevronLeft size={20} className="text-zinc-500 dark:text-zinc-400" />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
            </div>
          )}
        </div>
      </header>

      {/* Main content — pb-24 for bottom nav clearance on mobile */}
      <main className={`${mw} mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6`}>
        {children}
      </main>
    </div>
  );
}
