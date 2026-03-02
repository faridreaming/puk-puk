import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
  size?: number;
}

export function IconButton({
  icon: Icon,
  onClick,
  title,
  className = "",
  size = 16,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 ${className}`}
    >
      <Icon size={size} className="text-zinc-500 dark:text-zinc-400" />
    </button>
  );
}
