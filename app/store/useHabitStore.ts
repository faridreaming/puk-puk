import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface HabitStore {
  habits: Habit[];
  addHabit: (data: Omit<Habit, "id" | "lives" | "completedDates" | "missedDates" | "currentStageProgress" | "createdAt" | "currentStageIndex">) => void;
  markComplete: (habitId: string, date: string) => void;
  markMissed: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  resetHabit: (habitId: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (data) => {
        const newHabit: Habit = {
          ...data,
          id: generateId(),
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
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            if (habit.completedDates.includes(date) || habit.missedDates.includes(date)) return habit;

            const newProgress = habit.currentStageProgress + 1;
            const currentStage = habit.stages[habit.currentStageIndex];
            const reachedTarget = currentStage && newProgress >= currentStage.targetDays;
            const isLastStage = habit.currentStageIndex >= habit.stages.length - 1;

            if (reachedTarget && !isLastStage) {
              // Advance to next stage
              return {
                ...habit,
                completedDates: [...habit.completedDates, date],
                currentStageIndex: habit.currentStageIndex + 1,
                currentStageProgress: 0,
                lives: habit.maxLives, // Restore lives on stage up
              };
            }

            return {
              ...habit,
              completedDates: [...habit.completedDates, date],
              currentStageProgress: reachedTarget ? currentStage.targetDays : newProgress,
            };
          }),
        }));
      },

      markMissed: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;
            if (habit.completedDates.includes(date) || habit.missedDates.includes(date)) return habit;

            const newLives = habit.lives - 1;

            if (newLives <= 0) {
              // Drop to previous stage or reset current stage
              const newStageIndex = Math.max(0, habit.currentStageIndex - 1);
              return {
                ...habit,
                missedDates: [...habit.missedDates, date],
                lives: habit.maxLives, // Restore lives
                currentStageIndex: newStageIndex,
                currentStageProgress: 0, // Reset progress
              };
            }

            return {
              ...habit,
              missedDates: [...habit.missedDates, date],
              lives: newLives,
            };
          }),
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
