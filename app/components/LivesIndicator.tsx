interface LivesIndicatorProps {
  lives: number;
  maxLives: number;
}

export function LivesIndicator({ lives, maxLives }: LivesIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxLives }, (_, i) => (
        <span
          key={i}
          className={`text-lg transition-all duration-300 ${i < lives
              ? "scale-100 animate-[heartbeat_1.5s_ease-in-out_infinite]"
              : "scale-90 opacity-40 grayscale"
            }`}
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        >
          {i < lives ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
