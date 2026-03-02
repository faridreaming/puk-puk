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
        // Sync DOM immediately
        if (typeof document !== "undefined") {
          const resolved =
            theme === "system"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
              : theme;
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(resolved);
        }
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
