interface SectionProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ title, className = "", children }: SectionProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors ${className}`}
    >
      {title && (
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
