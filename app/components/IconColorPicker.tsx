import { useState, useRef, useEffect } from "react";
import { HABIT_ICONS, HABIT_COLORS, getHabitIcon, getHabitColor } from "~/lib/habitMeta";

interface IconColorPickerProps {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  /** Compact mode: just a square icon button trigger (for inline use) */
  compact?: boolean;
}

export function IconColorPicker({ icon, color, onIconChange, onColorChange, compact }: IconColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const SelectedIcon = getHabitIcon(icon);
  const selectedColor = getHabitColor(color);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          title="Pilih ikon & warna"
          className={`w-[52px] h-full rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${selectedColor.bg} ${selectedColor.border} ${open
            ? "ring-2 ring-amber-500/20"
            : ""
            }`}
        >
          <SelectedIcon size={22} className={selectedColor.text} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${open
            ? "border-amber-500/50 ring-2 ring-amber-500/20 bg-zinc-50 dark:bg-zinc-800/70"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selectedColor.bg}`}>
            <SelectedIcon size={20} className={selectedColor.text} />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Ikon & Warna
            </span>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {HABIT_ICONS.find((i) => i.name === icon)?.label ?? "Target"} · {HABIT_COLORS.find((c) => c.name === color)?.label ?? "Kuning"}
            </p>
          </div>
        </button>
      )}

      {/* Dropdown panel — floating */}
      {open && (
        <div className="absolute z-50 left-0 mt-2 w-max max-w-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/15 dark:shadow-black/40 p-4 space-y-4">
            {/* Icons grid */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Ikon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {HABIT_ICONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => onIconChange(opt.name)}
                      title={opt.label}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${isSelected
                        ? `${selectedColor.bg} ring-2 ${selectedColor.ring} scale-110`
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                    >
                      <IconComp size={16} className={isSelected ? selectedColor.text : ""} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* Colors */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Warna
              </label>
              <div className="flex flex-wrap gap-2.5">
                {HABIT_COLORS.map((c) => {
                  const isSelected = color === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => onColorChange(c.name)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${c.dot} ${isSelected
                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 " + c.ring + " scale-110"
                        : "hover:scale-110 opacity-80 hover:opacity-100"
                        }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
