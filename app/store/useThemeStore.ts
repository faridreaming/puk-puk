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
      },

      getResolvedTheme: () => {
        const { theme } = get();
        if (theme === "system") {
          if (typeof window === "undefined") return "dark";
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return theme;
      },
    }),
    { name: "pukpuk-theme" }
  )
);
