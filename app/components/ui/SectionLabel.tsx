interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p className={`text-xs text-zinc-500 font-semibold uppercase tracking-wider ${className}`}>
      {children}
    </p>
  );
}
