import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getResolvedTheme: () => "light" | "dark";
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark" as Theme,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      getResolvedTheme: () => {
        const { theme } = get();
        if (theme === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return theme;
      },
    }),
    { name: "pukpuk-theme" }
  )
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("pukpuk-theme");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      applyTheme(state?.theme ?? "dark");
    } catch {
      applyTheme("dark");
    }
  } else {
    applyTheme("dark");
  }
}
