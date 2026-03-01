import { create } from "zustand";

interface DevStore {
  dateOverride: string | null; // ISO date string e.g. "2026-03-05"
  setDateOverride: (date: string | null) => void;
  jumpDays: (days: number) => void;
}

/** Format a Date to YYYY-MM-DD using LOCAL time (avoids UTC shift from toISOString) */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const useDevStore = create<DevStore>((set, get) => ({
  dateOverride: null,

  setDateOverride: (date) => set({ dateOverride: date }),

  jumpDays: (days) => {
    const current = get().dateOverride
      ? new Date(get().dateOverride + "T00:00:00")
      : new Date();
    current.setDate(current.getDate() + days);
    set({ dateOverride: formatLocalDate(current) });
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
  return formatLocalDate(new Date());
}

/**
 * Get a Date object for "today".
 * Non-reactive — use useTodayDate() in React components instead.
 */
export function getTodayDate(): Date {
  if (import.meta.env.DEV) {
    const override = useDevStore.getState().dateOverride;
    if (override) {
      const d = new Date(override + "T00:00:00");
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
  return formatLocalDate(new Date());
}

/**
 * React hook: subscribes to dev date override, returns Date object.
 */
export function useTodayDate(): Date {
  const override = useDevStore((s) => s.dateOverride);
  if (import.meta.env.DEV && override) {
    return new Date(override + "T00:00:00");
  }
  return new Date();
}
