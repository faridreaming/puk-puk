import { Heart } from "lucide-react";

interface LivesIndicatorProps {
  lives: number;
  maxLives: number;
}

export function LivesIndicator({ lives, maxLives }: LivesIndicatorProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxLives }, (_, i) => (
        <Heart
          key={i}
          size={14}
          className={`transition-all duration-300 ${i < lives
              ? "text-red-500 fill-red-500 animate-[heartbeat_2s_ease-in-out_infinite]"
              : "text-zinc-400 dark:text-zinc-700"
            }`}
          style={i < lives ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  );
}
