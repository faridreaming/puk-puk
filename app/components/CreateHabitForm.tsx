import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useHabitStore } from "~/store/useHabitStore";
import { HABIT_ICONS, HABIT_COLORS, getHabitIcon, getHabitColor } from "~/lib/habitMeta";
import { Lightbulb, Check, Flag, Rocket, Heart, Plus, X, CopyPlus, Info, Trash2, Settings2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface StageInput {
  label: string;
  targetDays: string;
}

const TEMPLATES = [
  { text: "Meditasi 30 menit", icon: "brain", color: "violet" },
  { text: "Olahraga 30 menit", icon: "dumbbell", color: "emerald" },
  { text: "Membaca 30 halaman", icon: "book-open", color: "blue" },
  { text: "Jogging 5 km", icon: "running", color: "orange" },
  { text: "Push-up 50 kali", icon: "dumbbell", color: "rose" },
  { text: "Menulis 500 kata", icon: "pencil", color: "cyan" },
];

// Regex: extract activity name, target number, and unit
// e.g. "Meditasi 30 menit" → ["Meditasi", "30", "menit"]
// e.g. "Push-up 50 kali" → ["Push-up", "50", "kali"]
const TARGET_REGEX = /^(.+?)\s+(\d+)\s*(.+)$/;

function generateStages(targetNumber: number, unit: string): StageInput[] {
  // Generate 5 progressive stages
  // Use nice round-ish fractions: ~15%, ~30%, ~50%, ~75%, 100%
  const fractions = [0.15, 0.3, 0.5, 0.75, 1.0];
  const stages: StageInput[] = [];

  for (const frac of fractions) {
    let value = Math.ceil(targetNumber * frac);
    // Make values "rounder" for better UX
    if (targetNumber >= 20) {
      value = Math.ceil(value / 5) * 5; // Round up to nearest 5
    }
    // Clamp to max
    if (value > targetNumber) value = targetNumber;

    const label = `${value} ${unit}`;
    // Avoid duplicate stages
    if (stages.length > 0 && stages[stages.length - 1].label === label) continue;

    stages.push({
      label,
      targetDays: value === targetNumber ? "21" : stages.length < 2 ? "7" : "14",
    });
  }

  // Ensure last stage is exactly the target
  if (stages.length > 0) {
    const last = stages[stages.length - 1];
    if (last.label !== `${targetNumber} ${unit}`) {
      stages.push({
        label: `${targetNumber} ${unit}`,
        targetDays: "21",
      });
    }
  }

  return stages;
}

export function CreateHabitForm() {
  const addHabit = useHabitStore((s) => s.addHabit);
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [icon, setIcon] = useState("target");
  const [color, setColor] = useState("amber");
  const [maxLives, setMaxLives] = useState(3);
  const [manualStages, setManualStages] = useState<StageInput[] | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Parse input with regex
  const parsed = useMemo(() => {
    const match = input.trim().match(TARGET_REGEX);
    if (!match) return null;
    return {
      activity: match[1].trim(),
      targetNumber: parseInt(match[2]),
      unit: match[3].trim(),
    };
  }, [input]);

  // Auto-generate stages from parsed input
  const autoStages = useMemo(() => {
    if (!parsed) return null;
    return generateStages(parsed.targetNumber, parsed.unit);
  }, [parsed]);

  // Use manual stages if user edited them, otherwise auto
  const stages = manualStages ?? autoStages;

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    setInput(template.text);
    setIcon(template.icon);
    setColor(template.color);
    setManualStages(null);
  };

  const updateStage = (index: number, field: keyof StageInput, value: string) => {
    const current = stages ?? [];
    const updated = current.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setManualStages(updated);
  };

  const addStage = () => {
    const current = stages ?? [];
    setManualStages([...current, { label: "", targetDays: "7" }]);
  };

  const removeStage = (index: number) => {
    const current = stages ?? [];
    if (current.length > 1) {
      setManualStages(current.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !stages || stages.length === 0) return;
    if (stages.some((s) => !s.label.trim() || !s.targetDays)) return;

    addHabit({
      name: input.trim(),
      icon,
      color,
      targetLabel: input.trim(),
      maxLives,
      stages: stages.map((s, i) => ({
        id: `stage-${Date.now()}-${i}`,
        label: s.label.trim(),
        targetDays: parseInt(s.targetDays) || 7,
      })),
    });

    navigate("/");
  };

  const isValid =
    input.trim() &&
    stages &&
    stages.length > 0 &&
    stages.every((s) => s.label.trim() && parseInt(s.targetDays) > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Templates Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center justify-between w-full group mb-3 cursor-pointer"
        >
          <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors cursor-pointer pointer-events-none">
            Template Cepat
          </label>
          <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-all">
            {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${showTemplates ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 pb-2">
              {TEMPLATES.map((t) => {
                const TemplateIcon = getHabitIcon(t.icon);
                const templateColor = getHabitColor(t.color);
                return (
                  <button
                    key={t.text}
                    type="button"
                    onClick={() => {
                      applyTemplate(t);
                      setShowTemplates(false);
                    }}
                    tabIndex={showTemplates ? 0 : -1}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <TemplateIcon size={22} className={templateColor.text} />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight text-center">{t.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Icon + Color picker */}
      <div className="space-y-4">
        {/* Icon picker */}
        <div>
          <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            Ikon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {HABIT_ICONS.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = icon === opt.name;
              const selectedColor = getHabitColor(color);
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setIcon(opt.name)}
                  title={opt.label}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${isSelected
                    ? `${selectedColor.bg} ring-2 ${selectedColor.ring} scale-110`
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                >
                  <IconComp size={18} className={isSelected ? selectedColor.text : ""} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            Warna
          </label>
          <div className="flex flex-wrap gap-2.5">
            {HABIT_COLORS.map((c) => {
              const isSelected = color === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${c.dot} ${isSelected
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 " + c.ring + " scale-110"
                    : "hover:scale-110 opacity-80 hover:opacity-100"
                    }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Single input: Target Kebiasaan */}
      <div>
        <label htmlFor="habit-input" className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
          Target Kebiasaan
        </label>
        <input
          id="habit-input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setManualStages(null);
          }}
          placeholder='Contoh: "Meditasi 30 menit", "Push-up 50 kali"'
          className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-lg"
        />
        {input.trim() && !parsed && (
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2 flex items-center gap-1">
            <Lightbulb size={12} className="text-amber-500 shrink-0" />
            Tulis dengan format: <span className="text-zinc-600 dark:text-zinc-400 font-mono">[kebiasaan] [angka] [satuan]</span>
          </p>
        )}
        {parsed && (
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 flex items-center gap-1">
            <Check size={12} className="shrink-0" /> Terdeteksi: <span className="font-semibold">{parsed.activity}</span> dengan target <span className="font-semibold">{parsed.targetNumber} {parsed.unit}</span>
          </p>
        )}
      </div>

      {/* Lives */}
      <div>
        <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
          Jumlah Nyawa
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 2, label: "Hardcore" },
            { value: 3, label: "Standar" },
            { value: 4, label: "Santai" },
            { value: 5, label: "Paling Santai" }
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMaxLives(value)}
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${maxLives === value
                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-2 ring-red-500/50"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: value }, (_, i) => <Heart key={i} size={14} className="fill-current" />)}
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">Nyawa berkurang saat kamu terlewat satu hari. Jika habis, kamu akan <strong>turun ke tahap sebelumnya</strong> untuk mengumpulkan niat lagi perlahan.</p>
      </div>

      {/* Stages — visual roadmap */}
      {stages && stages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Peta Perjalananmu
              </label>
              {!manualStages && (
                <span className="text-[10px] text-zinc-600">Otomatis dari targetmu (bisa diedit)</span>
              )}
            </div>
            <button
              type="button"
              onClick={addStage}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer font-semibold flex items-center gap-1"
            >
              <Plus size={12} /> Tahap
            </button>
          </div>

          <div className="relative bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 pt-5 transition-colors">
            <div className="relative space-y-1">
              {/* Vertical connector line */}
              <div
                className="absolute left-[13.5px] top-0 bottom-0 w-0.5"
                style={{
                  background: "linear-gradient(180deg, #f59e0b 0%, #10b981 100%)",
                  opacity: 0.3,
                }}
              />
              {stages.map((stage, index) => {
                const isFirst = index === 0;
                const isLast = index === stages.length - 1;
                // Gradient from amber to emerald
                const hue = stages.length > 1
                  ? Math.round(45 + (index / (stages.length - 1)) * (155 - 45))
                  : 45;

                return (
                  <div key={index} className="relative flex items-start gap-3 group">
                    {/* Node */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, hsl(${hue}, 80%, 55%), hsl(${hue}, 70%, 45%))`,
                          boxShadow: `0 0 10px hsla(${hue}, 80%, 55%, 0.3)`,
                        }}
                      >
                        {isLast ? <Flag size={12} strokeWidth={3.5} /> : index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `hsl(${hue}, 70%, 60%)` }}>
                          {isFirst ? "Mulai" : isLast ? "Target" : `Tahap ${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={stage.label}
                          onChange={(e) => updateStage(index, "label", e.target.value)}
                          placeholder={`Tahap ${index + 1}`}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            value={stage.targetDays}
                            onChange={(e) => updateStage(index, "targetDays", e.target.value)}
                            min="1"
                            max="365"
                            className="w-14 px-2 py-1.5 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                          />
                          <span className="text-[10px] text-zinc-600">hari</span>
                        </div>
                        {stages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStage(index)}
                            className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-600">
              <span>{stages.length} tahap</span>
              <span>
                Total ±{stages.reduce((sum, s) => sum + (parseInt(s.targetDays) || 0), 0)} hari
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${isValid
          ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98]"
          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
          }`}
      >
        <Rocket size={18} />
        Mulai Kebiasaan Baru
      </button>
    </form>
  );
}
