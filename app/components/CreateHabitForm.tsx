import { useState } from "react";
import { useNavigate } from "react-router";
import { useHabitStore } from "~/store/useHabitStore";

interface StageInput {
  label: string;
  targetDays: string;
}

const TEMPLATES = [
  {
    name: "Meditasi",
    icon: "🧘",
    targetLabel: "Meditasi 30 menit sehari",
    stages: [
      { label: "3 menit/hari", targetDays: "7" },
      { label: "5 menit/hari", targetDays: "7" },
      { label: "10 menit/hari", targetDays: "14" },
      { label: "20 menit/hari", targetDays: "14" },
      { label: "30 menit/hari", targetDays: "21" },
    ],
  },
  {
    name: "Olahraga",
    icon: "🏃",
    targetLabel: "Olahraga 30 menit sehari",
    stages: [
      { label: "Jalan kaki 10 menit", targetDays: "7" },
      { label: "Jalan cepat 15 menit", targetDays: "7" },
      { label: "Jogging 15 menit", targetDays: "14" },
      { label: "Jogging 20 menit", targetDays: "14" },
      { label: "Olahraga 30 menit", targetDays: "21" },
    ],
  },
  {
    name: "Membaca",
    icon: "📚",
    targetLabel: "Membaca 30 halaman sehari",
    stages: [
      { label: "5 halaman/hari", targetDays: "7" },
      { label: "10 halaman/hari", targetDays: "7" },
      { label: "15 halaman/hari", targetDays: "14" },
      { label: "20 halaman/hari", targetDays: "14" },
      { label: "30 halaman/hari", targetDays: "21" },
    ],
  },
];

const EMOJI_OPTIONS = ["🧘", "🏃", "📚", "💪", "🎯", "✍️", "🎵", "🥗", "💤", "🧹", "💻", "🚫"];

export function CreateHabitForm() {
  const addHabit = useHabitStore((s) => s.addHabit);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [targetLabel, setTargetLabel] = useState("");
  const [maxLives, setMaxLives] = useState(3);
  const [stages, setStages] = useState<StageInput[]>([
    { label: "", targetDays: "7" },
  ]);

  const addStage = () => {
    setStages([...stages, { label: "", targetDays: "7" }]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const updateStage = (index: number, field: keyof StageInput, value: string) => {
    setStages(
      stages.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    setName(template.name);
    setIcon(template.icon);
    setTargetLabel(template.targetLabel);
    setStages(template.stages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !targetLabel.trim()) return;
    if (stages.some((s) => !s.label.trim() || !s.targetDays)) return;

    addHabit({
      name: name.trim(),
      icon,
      targetLabel: targetLabel.trim(),
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
    name.trim() &&
    targetLabel.trim() &&
    stages.length > 0 &&
    stages.every((s) => s.label.trim() && parseInt(s.targetDays) > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Templates */}
      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-3">
          Template Cepat
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-200 text-center cursor-pointer"
            >
              <span className="text-2xl block mb-1">{t.icon}</span>
              <span className="text-xs text-zinc-400">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emoji picker */}
      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">
          Ikon
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${icon === emoji
                  ? "bg-amber-500/20 ring-2 ring-amber-500 scale-110"
                  : "bg-zinc-800 hover:bg-zinc-700"
                }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="habit-name" className="block text-sm font-semibold text-zinc-400 mb-2">
          Nama Kebiasaan
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Meditasi"
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Target */}
      <div>
        <label htmlFor="habit-target" className="block text-sm font-semibold text-zinc-400 mb-2">
          Target Akhir
        </label>
        <input
          id="habit-target"
          type="text"
          value={targetLabel}
          onChange={(e) => setTargetLabel(e.target.value)}
          placeholder="Contoh: Meditasi 30 menit sehari"
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Lives */}
      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">
          Jumlah Nyawa
        </label>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxLives(n)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${maxLives === n
                  ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                }`}
            >
              {"❤️".repeat(n)}
            </button>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-zinc-400">
            Tahap-tahap (dari kecil ke besar)
          </label>
          <button
            type="button"
            onClick={addStage}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer font-semibold"
          >
            + Tahap
          </button>
        </div>
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="flex gap-2 items-start p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl"
            >
              <span className="text-xs text-zinc-600 mt-3 font-bold min-w-[24px]">
                {index + 1}.
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={stage.label}
                  onChange={(e) => updateStage(index, "label", e.target.value)}
                  placeholder={`Tahap ${index + 1}: contoh "5 menit/hari"`}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={stage.targetDays}
                    onChange={(e) => updateStage(index, "targetDays", e.target.value)}
                    min="1"
                    max="365"
                    className="w-20 px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <span className="text-xs text-zinc-600">hari</span>
                </div>
              </div>
              {stages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStage(index)}
                  className="text-zinc-600 hover:text-red-400 transition-colors mt-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 cursor-pointer ${isValid
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98]"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
      >
        Mulai Kebiasaan Baru 🚀
      </button>
    </form>
  );
}
