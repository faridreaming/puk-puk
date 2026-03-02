interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, color, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center transition-colors">
      <p className={`text-xl font-bold ${color} flex items-center justify-center gap-1`}>
        {icon} {value}
      </p>
      <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
