import type { HabitStage } from "~/store/useHabitStore";
import { Check, Flag } from "lucide-react";

interface StageRoadmapProps {
  stages: HabitStage[];
  currentStageIndex: number;
  currentStageProgress: number;
}

export function StageRoadmap({
  stages,
  currentStageIndex,
  currentStageProgress,
}: StageRoadmapProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-0 w-full">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isLast = index === stages.length - 1;
          const stageTarget = stage.targetCount ?? stage.targetDays ?? 1;
          const stageUnit = stage.unit ?? "Hari";

          const progress = isCurrent
            ? Math.min((currentStageProgress / stageTarget) * 100, 100)
            : isCompleted
              ? 100
              : 0;

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 relative
                    ${isCompleted
                      ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : isCurrent
                        ? "bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_16px_rgba(251,191,36,0.5)] scale-110"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-2 border-zinc-300 dark:border-zinc-700"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : isLast ? (
                    <Flag size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 text-center max-w-[80px] truncate ${isCurrent
                    ? "text-amber-500 dark:text-amber-400 font-semibold"
                    : isCompleted
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-600"
                    }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {currentStageProgress}/{stageTarget} {stageUnit.toLowerCase()}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="flex-1 h-1 mx-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative self-start mt-5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: isCompleted
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : isCurrent
                          ? "linear-gradient(90deg, #f59e0b, #f97316)"
                          : "transparent",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
