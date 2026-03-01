import { create } from "zustand";

interface DevStore {
  dateOverride: string | null; // ISO date string e.g. "2026-03-05"
  setDateOverride: (date: string | null) => void;
  jumpDays: (days: number) => void;
}

export const useDevStore = create<DevStore>((set, get) => ({
  dateOverride: null,

  setDateOverride: (date) => set({ dateOverride: date }),

  jumpDays: (days) => {
    const current = get().dateOverride
      ? new Date(get().dateOverride!)
      : new Date();
    current.setDate(current.getDate() + days);
    set({ dateOverride: current.toISOString().split("T")[0] });
  },
}));

/**
 * Get today's date string (YYYY-MM-DD).
 * Non-reactive — use useToday() in React components instead.
 */
export function getToday(): string {
  if (import.meta.env.DEV) {
    const override = useDevStore.getState().dateOverride;
    if (override) return override;
  }
  return new Date().toISOString().split("T")[0];
}

/**
 * Get a Date object for "today".
 * Non-reactive — use useTodayDate() in React components instead.
 */
export function getTodayDate(): Date {
  if (import.meta.env.DEV) {
    const override = useDevStore.getState().dateOverride;
    if (override) {
      const d = new Date(override);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  return new Date();
}

/**
 * React hook: subscribes to dev date override so components re-render on change.
 */
export function useToday(): string {
  const override = useDevStore((s) => s.dateOverride);
  if (import.meta.env.DEV && override) return override;
  return new Date().toISOString().split("T")[0];
}

/**
 * React hook: subscribes to dev date override, returns Date object.
 */
export function useTodayDate(): Date {
  const override = useDevStore((s) => s.dateOverride);
  if (import.meta.env.DEV && override) {
    const d = new Date(override);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return new Date();
}
