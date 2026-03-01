import { useThemeStore } from "~/store/useThemeStore";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options = [
    { value: "light" as const, icon: Sun, label: "Terang" },
    { value: "dark" as const, icon: Moon, label: "Gelap" },
    { value: "system" as const, icon: Monitor, label: "Sistem" },
  ];

  return (
    <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${theme === opt.value
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            title={opt.label}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
