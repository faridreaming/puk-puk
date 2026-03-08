import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHabitStore } from "~/store/useHabitStore";
import { getHabitIcon, getHabitColor } from "~/lib/habitMeta";
import { IconColorPicker } from "~/components/IconColorPicker";
import type { HabitTemplate } from "~/components/TemplateModal";
import { useDialogStore } from "~/store/useDialogStore";
import { Lightbulb, Check, Flag, Rocket, Heart, Plus, X, ChevronDown, ChevronUp, RotateCcw, Info, Activity, CalendarDays, Ban } from "lucide-react";
import { Tooltip } from "~/components/ui/Tooltip";
import type { HabitCategory } from "~/store/useHabitStore";

// Smart Parser
interface ParsedHabit {
  activity: string;
  targetNumber: number;
  unit: string;
  category: HabitCategory;
}

function parseHabitInput(text: string): ParsedHabit | null {
  const t = text.trim();
  if (!t) return null;

  // 1. Abstinence Detection
  // Matches: "Tanpa sosmed 30 hari", "Berhenti merokok 14", "No fap 90" (hari is optional)
  const absRegex = /^(tanpa|berhenti|stop|no|puasa)\s+(.+?)\s+(\d+)\s*(hari)?$/i;
  const absMatch = t.match(absRegex);
  if (absMatch) {
    const action = absMatch[1]; // "Tanpa"
    const object = absMatch[2]; // "sosmed"
    const target = parseInt(absMatch[3], 10);
    return {
      activity: `${action} ${object}`, // Reconstruct "Tanpa sosmed"
      targetNumber: target,
      unit: "Hari",
      category: "abstinence",
    };
  }

  // Fallback Abstinence: if it ends in 'hari' but has no explicit quantity unit before it (simplistic heuristic)
  // E.g., "Tidak makan manis 30 hari"
  const absEndRegex = /^(.+?)\s+(\d+)\s+hari$/i;
  const absEndMatch = t.match(absEndRegex);
  if (absEndMatch) {
    // Exclude things that might be quantitative like "Lari 5 km 30 hari" (though that's rare in a single target)
    // If it reached here without matching the other regexes, it's either Abstinence or a weird quantitative. 
    // Let's assume Abstinence if the user explicitly wrote "hari" at the end.
    return {
      activity: absEndMatch[1],
      targetNumber: parseInt(absEndMatch[2], 10),
      unit: "Hari",
      category: "abstinence",
    };
  }

  // 2. Frequency Detection
  // Matches: "Olahraga 3x seminggu", "Baca buku 2 kali harian", "Renang 1x sebulan"
  const freqRegex = /^(.+?)\s+(\d+)\s*(x|kali)\s+(sehari|seminggu|sebulan|setahun|harian|mingguan|bulanan)$/i;
  const freqMatch = t.match(freqRegex);
  if (freqMatch) {
    let unitPeriod = freqMatch[4].toLowerCase();
    // Normalize to "sehari", "seminggu", "sebulan"
    if (unitPeriod === "harian") unitPeriod = "sehari";
    if (unitPeriod === "mingguan") unitPeriod = "seminggu";
    if (unitPeriod === "bulanan") unitPeriod = "sebulan";

    return {
      activity: freqMatch[1],
      targetNumber: parseInt(freqMatch[2], 10),
      unit: `x ${unitPeriod}`,
      category: "frequency",
    };
  }

  // 3. Quantitative (Fallback)
  // Matches: "Lari 5 km", "Meditasi 30 menit", "Minum air 2 L"
  // It looks for a number followed by an optional string unit.
  const quantRegex = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/;
  const quantMatch = t.match(quantRegex);
  if (quantMatch) {
    const rawNumber = quantMatch[2].replace(",", ".");
    const target = parseFloat(rawNumber);
    if (!isNaN(target)) {
      return {
        activity: quantMatch[1].trim(),
        targetNumber: target,
        unit: quantMatch[3] ? quantMatch[3].trim() : "x",
        category: "quantitative",
      };
    }
  }

  return null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

interface StageInput {
  label: string;
  targetCount: string;
  unit: string;
}



// Regex: extract activity name, target number, and unit
// e.g. "Meditasi 30 menit" → ["Meditasi", "30", "menit"]
// Removing Regex TARGET_REGEX since we will build the target from structured inputs.

function generateStages(targetNumber: number, activityUnit: string, category: HabitCategory): StageInput[] {
  const stages: StageInput[] = [];

  if (category === "abstinence") {
    // For Abstinence, the target IS the streak duration.
    // It doesn't make sense to build up fractions of a daily session.
    // We build stages as milestones: 3 Hari, 7 Hari, 14 Hari, 21 Hari, etc.
    const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];
    for (const milestone of milestones) {
      if (milestone >= targetNumber) break;
      stages.push({
        label: `Bertahan ${milestone} Hari`,
        targetCount: milestone.toString(),
        unit: "Hari",
      });
    }

    if (stages.length === 0 && targetNumber > 1) {
      stages.push({
        label: `Bertahan ${Math.ceil(targetNumber / 2)} Hari`,
        targetCount: Math.ceil(targetNumber / 2).toString(),
        unit: "Hari",
      });
    }
    return stages;
  }

  // Determine default tracking unit based on activity unit.
  const isFrequency = activityUnit.toLowerCase().startsWith("x") || activityUnit.toLowerCase() === "kali";
  let stageUnit = "Hari";
  let freqPeriodText = "hari"; // For label: "1x sehari"

  if (isFrequency) {
    if (activityUnit.includes("seminggu")) {
      stageUnit = "Minggu";
      freqPeriodText = "seminggu";
    } else if (activityUnit.includes("sebulan")) {
      stageUnit = "Bulan";
      freqPeriodText = "sebulan";
    } else {
      stageUnit = "Hari";
      freqPeriodText = "sehari";
    }
  }

  // Generate progressive stages up to 75% of target
  const fractions = [0.15, 0.3, 0.5, 0.75];

  for (const frac of fractions) {
    let value = Math.ceil(targetNumber * frac);
    if (targetNumber >= 20) {
      value = Math.ceil(value / 5) * 5; // Round up to nearest 5
    }
    // Clamp so the stage target doesn't reach the final target
    if (value >= targetNumber) value = targetNumber - 1;
    if (value < 1) value = 1;

    const targetFrames = stages.length === 0 ? "7" : "14";
    let label = `${value} ${activityUnit}`;

    if (isFrequency) {
      label = `${value}x ${freqPeriodText}`;
    }

    if (stages.length > 0 && stages[stages.length - 1].label === label) continue;

    stages.push({
      label,
      targetCount: targetFrames,
      unit: stageUnit,
    });
  }

  // Ensure at least one stage exists if target > 1
  if (stages.length === 0 && targetNumber > 1) {
    const value = Math.ceil(targetNumber / 2);
    let label = `${value} ${activityUnit}`;

    if (isFrequency) {
      label = `${value}x ${freqPeriodText}`;
    }

    stages.push({
      label,
      targetCount: "7",
      unit: stageUnit,
    });
  }

  return stages;
}

interface CreateHabitFormProps {
  selectedTemplate?: HabitTemplate | null;
}

export function CreateHabitForm({ selectedTemplate }: CreateHabitFormProps) {
  const addHabit = useHabitStore((s) => s.addHabit);
  const navigate = useNavigate();
  const { openDialog } = useDialogStore();

  const [input, setInput] = useState("");

  const [icon, setIcon] = useState("target");
  const [color, setColor] = useState("amber");
  const [maxLives, setMaxLives] = useState(3);
  const [manualStages, setManualStages] = useState<StageInput[] | null>(null);

  // UI State
  const [isManualMode, setIsManualMode] = useState(false);

  // Apply template when selected from modal
  useEffect(() => {
    if (selectedTemplate) {
      setInput(`${selectedTemplate.text} `); // Added space to prompt user for target
      setIcon(selectedTemplate.icon);
      colorTheme: selectedTemplate.color; // typo fix while we're here
      setColor(selectedTemplate.color);
      setManualStages(null);
    }
  }, [selectedTemplate]);

  // Build structured target based on input string
  const targetData = useMemo(() => {
    return parseHabitInput(input);
  }, [input]);

  // Auto-generate stages from structured input
  const autoStages = useMemo(() => {
    if (!targetData) return null;
    return generateStages(targetData.targetNumber, targetData.unit, targetData.category);
  }, [targetData]);

  // Use manual stages if user edited them, otherwise auto
  const stages = manualStages ?? autoStages;


  const updateStage = (index: number, field: keyof StageInput, value: string) => {
    const current = stages ?? [];
    const updated = current.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setManualStages(updated);
  };

  const addStage = () => {
    const current = stages ?? [];
    const inheritUnit = current.length > 0 ? current[current.length - 1].unit : "Hari";
    setManualStages([...current, { label: "", targetCount: "7", unit: inheritUnit }]);
  };

  const handleReset = () => {
    openDialog({
      title: "Reset Form?",
      message: "Apakah kamu yakin ingin mengembalikan form ke pengaturan awal? Semua data yang sudah diisi akan hilang.",
      confirmLabel: "Reset",
      cancelLabel: "Batal",
      variant: "danger",
      onConfirm: () => {
        setInput("");
        setIcon("target");
        setColor("amber");
        setMaxLives(3);
        setManualStages(null);
      },
    });
  };

  const removeStage = (index: number) => {
    const current = stages ?? [];
    if (current.length > 1) {
      setManualStages(current.filter((_, i) => i !== index));
    }
  };

  const handleRemoveStage = (index: number) => {
    openDialog({
      title: "Hapus Tahap?",
      message: "Apakah kamu yakin ingin menghapus tahap ini?",
      confirmLabel: "Hapus",
      cancelLabel: "Batal",
      variant: "danger",
      onConfirm: () => removeStage(index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetData || !stages || stages.length === 0) return;
    if (stages.some((s) => !s.label.trim() || !s.targetCount)) return;

    addHabit({
      name: targetData.activity.trim(),
      icon,
      color,
      category: targetData.category,
      targetLabel: `${targetData.targetNumber} ${targetData.unit}`,
      maxLives,
      stages: stages.map((s, i) => ({
        id: generateId(),
        label: s.label || `Tahap ${i + 1}`,
        targetCount: parseInt(s.targetCount) || 7,
        unit: s.unit || "Hari",
      })),
    });

    navigate("/");
  };

  const isValid =
    targetData !== null &&
    stages &&
    stages.length > 0 &&
    stages.every((s) => s.label.trim() && parseInt(s.targetCount) > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">



      {/* Habit Details Group */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Target Kebiasaan
            </label>
            <Tooltip content={"Ketik target kebiasaanmu secara natural.\nContoh format penulisan:\n• Kuantitas: Lari 5 km\n• Frekuensi: Olahraga 3x seminggu atau Baca 2x sehari\n• Pantangan: Berhenti merokok 30 hari"}>
              <Info size={14} className="text-zinc-400 cursor-pointer hover:text-amber-500 transition-colors" />
            </Tooltip>
          </div>
          {(input || (stages && stages.length > 0) || maxLives !== 3 || color !== "amber" || icon !== "target") && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset Form
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-stretch gap-3">
            <IconColorPicker icon={icon} color={color} onIconChange={setIcon} onColorChange={setColor} compact />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setManualStages(null); }}
                placeholder='Contoh: "Lari 5 km" atau "Olahraga 3x mingguan"'
                className="w-full h-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm font-medium"
              />
            </div>
          </div>
          {targetData && input.trim() && (
            <div className="flex items-center gap-1.5 px-1 text-xs">
              <Check size={14} className="text-emerald-500 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400">
                Terdeteksi: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{targetData.activity}</span> dengan target <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {targetData.category === "frequency" ? `${targetData.targetNumber}${targetData.unit?.toLowerCase()}` : `${targetData.targetNumber} ${targetData.unit?.toLowerCase()}`}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lives */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Jumlah Nyawa
          </label>
          <Tooltip content="Nyawa berkurang saat kamu terlewat satu hari. Jika habis, kamu akan turun ke tahap sebelumnya untuk mengumpulkan niat lagi perlahan.">
            <Info size={14} className="text-zinc-400 cursor-pointer hover:text-amber-500 transition-colors" />
          </Tooltip>
        </div>
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
      </div>

      {/* Stages — visual roadmap */}
      {stages && stages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Peta Perjalananmu
              </label>
              <Tooltip content="Membagi target menjadi tahap-tahap kecil agar tidak membebani. Hari bisa diubah sesuai keinginanmu.">
                <Info size={14} className="text-zinc-400 cursor-pointer hover:text-amber-500 transition-colors" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualMode(!isManualMode)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1 ${isManualMode ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300" : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                {isManualMode ? "Selesai Edit" : "Edit Manual"}
              </button>
              {isManualMode && (
                <button
                  type="button"
                  onClick={addStage}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer font-semibold flex items-center gap-1"
                >
                  <Plus size={12} /> Tahap
                </button>
              )}
            </div>
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
                          {isFirst ? "Mulai" : `Tahap ${index + 1}`}
                        </span>
                      </div>

                      {!isManualMode ? (
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {stage.label}
                          </div>
                          <div className="px-3 py-2 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap shrink-0">
                            {stage.targetCount} {stage.unit}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 w-full">
                          <input
                            type="text"
                            value={stage.label}
                            onChange={(e) => updateStage(index, "label", e.target.value)}
                            placeholder={`Tahap ${index + 1}`}
                            className="flex-[1_1_180px] min-w-0 px-3 py-1.5 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                          />
                          <div className="flex flex-1 sm:flex-none justify-end gap-2 shrink-0">
                            <div className="flex items-center bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden transition-colors focus-within:ring-1 focus-within:ring-amber-500/40 focus-within:border-amber-500/40">
                              <input
                                type="number"
                                value={stage.targetCount}
                                onChange={(e) => updateStage(index, "targetCount", e.target.value)}
                                min="1"
                                max="365"
                                className="w-12 sm:w-14 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 text-center bg-transparent border-none focus:outline-none"
                              />
                              <div className="flex bg-zinc-50 dark:bg-zinc-800/80 border-l border-zinc-200 dark:border-zinc-700/50">
                                <input
                                  type="text"
                                  value={stage.unit}
                                  onChange={(e) => updateStage(index, "unit", e.target.value)}
                                  className="w-16 sm:w-20 px-2 py-1.5 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-transparent border-none focus:outline-none text-center"
                                />
                              </div>
                            </div>
                            {stages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStage(index)}
                                className="px-2.5 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors shrink-0 flex items-center justify-center font-medium shadow-sm cursor-pointer"
                              >
                                <span className="hidden sm:inline">Hapus</span>
                                <X size={16} className="sm:hidden" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Static Target Block */}
              {targetData && (
                <div className="relative flex items-start gap-3 group mt-2">
                  {/* Node */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md bg-linear-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/30 shrink-0"
                    >
                      <Flag size={12} strokeWidth={3.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        Target
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full opacity-80 pointer-events-none">
                      <div className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                        {targetData.category === "frequency" ? `${targetData.targetNumber}${targetData.unit}` : `${targetData.targetNumber} ${targetData.unit}`}
                      </div>
                      <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap shrink-0">
                        Tanpa Batas
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-500 dark:text-zinc-600">
              <span className="font-medium">{stages.length} tahap</span>
              {targetData?.category === "abstinence" ? (
                <span>Target: Bertahan 1 hari demi 1 hari hingga mencapai {targetData?.targetNumber} hari.</span>
              ) : (
                <span>Total ±{stages.reduce((sum, s) => sum + (parseInt(s.targetCount) || 0), 0)} {stages.length > 0 ? stages[0].unit : (targetData?.unit || "sesi")}</span>
              )}
            </div>
          </div>
        </div>
      )
      }

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
    </form >
  );
}
