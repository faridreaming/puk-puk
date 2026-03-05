import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getToday, getTodayDate } from "~/store/useDevStore";

// --- Types ---

export interface HabitStage {
  id: string;
  label: string;
  targetDays: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetLabel: string;
  stages: HabitStage[];
  currentStageIndex: number;
  lives: number;
  maxLives: number;
  completedDates: string[];
  missedDates: string[];
  currentStageProgress: number;
  createdAt: string;
}

// Return type for actions that produce feedback
export type ActionResult =
  | { type: "complete"; stageUp: boolean }
  | { type: "missed"; livesLeft: number; stageDown: boolean }
  | { type: "undo" }
  | { type: "none" };

interface HabitStore {
  habits: Habit[];
  addHabit: (data: Omit<Habit, "id" | "lives" | "completedDates" | "missedDates" | "currentStageProgress" | "createdAt" | "currentStageIndex">) => void;

  markComplete: (habitId: string, date: string) => ActionResult;
  markMissed: (habitId: string, date: string) => ActionResult;
  undoToday: (habitId: string, date: string) => ActionResult;
  editHabit: (habitId: string, data: { name?: string; icon?: string; color?: string; targetLabel?: string; maxLives?: number }) => void;
  deleteHabit: (habitId: string) => void;
  resetHabit: (habitId: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Calculate current streak
export function getStreak(completedDates: string[], missedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort().reverse();
  const today = getTodayDate();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  // If today isn't tracked yet, start checking from yesterday
  const todayStr = getToday();
  if (!sorted.includes(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (sorted.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (data) => {
        const newHabit: Habit = {
          ...data,
          id: generateId(),
          color: data.color || "amber",
          currentStageIndex: 0,
          lives: data.maxLives,
          completedDates: [],
          missedDates: [],
          currentStageProgress: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      markComplete: (habitId, date) => {
        let result: ActionResult = { type: "none" };

        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            if (habit.completedDates.includes(date) || habit.missedDates.includes(date)) return habit;

            const newProgress = habit.currentStageProgress + 1;
            const currentStage = habit.stages[habit.currentStageIndex];
            const reachedTarget = currentStage && newProgress >= currentStage.targetDays;
            const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;

            if (reachedTarget && !isLastStage) {
              result = { type: "complete", stageUp: true };
              return {
                ...habit,
                completedDates: [...habit.completedDates, date],
                currentStageIndex: habit.currentStageIndex + 1,
                currentStageProgress: 0,
                lives: habit.maxLives,
              };
            }

            result = { type: "complete", stageUp: false };
            return {
              ...habit,
              completedDates: [...habit.completedDates, date],
              currentStageProgress: reachedTarget ? currentStage.targetDays : newProgress,
            };
          }),
        }));

        return result;
      },

      markMissed: (habitId, date) => {
        let result: ActionResult = { type: "none" };

        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            if (habit.completedDates.includes(date) || habit.missedDates.includes(date)) return habit;

            const newLives = habit.lives - 1;

            if (newLives <= 0) {
              const newStageIndex = Math.max(0, habit.currentStageIndex - 1);
              result = { type: "missed", livesLeft: 0, stageDown: habit.currentStageIndex > 0 };
              return {
                ...habit,
                missedDates: [...habit.missedDates, date],
                lives: habit.maxLives,
                currentStageIndex: newStageIndex,
                currentStageProgress: 0,
              };
            }

            result = { type: "missed", livesLeft: newLives, stageDown: false };
            return {
              ...habit,
              missedDates: [...habit.missedDates, date],
              lives: newLives,
            };
          }),
        }));

        return result;
      },

      undoToday: (habitId, date) => {
        let result: ActionResult = { type: "none" };

        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;

            const wasCompleted = habit.completedDates.includes(date);
            const wasMissed = habit.missedDates.includes(date);

            if (!wasCompleted && !wasMissed) return habit;

            result = { type: "undo" };

            if (wasCompleted) {
              // Undo completion — revert progress
              return {
                ...habit,
                completedDates: habit.completedDates.filter((d) => d !== date),
                currentStageProgress: Math.max(0, habit.currentStageProgress - 1),
              };
            }

            // Undo missed — restore life (simple restore, doesn't handle stage-down undo perfectly)
            return {
              ...habit,
              missedDates: habit.missedDates.filter((d) => d !== date),
              lives: Math.min(habit.maxLives, habit.lives + 1),
            };
          }),
        }));

        return result;
      },

      editHabit: (habitId, data) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                ...habit,
                ...(data.name !== undefined && { name: data.name }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.targetLabel !== undefined && { targetLabel: data.targetLabel }),
                ...(data.maxLives !== undefined && {
                  maxLives: data.maxLives,
                  lives: Math.min(habit.lives, data.maxLives),
                }),
              }
              : habit
          ),
        }));
      },

      deleteHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
        }));
      },

      resetHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                ...habit,
                currentStageIndex: 0,
                currentStageProgress: 0,
                lives: habit.maxLives,
                completedDates: [],
                missedDates: [],
              }
              : habit
          ),
        }));
      },

      exportData: () => {
        const { habits } = get();
        return JSON.stringify({ habits, exportedAt: new Date().toISOString() }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data && Array.isArray(data.habits)) {
            set({ habits: data.habits });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "pukpuk-habits",
    }
  )
);
