import { Sparkles } from "lucide-react";
import { getHabitIcon, getHabitColor } from "~/lib/habitMeta";
import { Modal } from "~/components/ui/Modal";
import { IconButton } from "~/components/ui/IconButton";
import { X } from "lucide-react";

export interface HabitTemplate {
  text: string;
  icon: string;
  color: string;
}

export const TEMPLATES: HabitTemplate[] = [
  { text: "Meditasi 30 menit", icon: "brain", color: "violet" },
  { text: "Olahraga 30 menit", icon: "dumbbell", color: "emerald" },
  { text: "Membaca 30 halaman", icon: "book-open", color: "blue" },
  { text: "Jogging 5 km", icon: "running", color: "orange" },
  { text: "Push-up 50 kali", icon: "dumbbell", color: "red" },
  { text: "Menulis 500 kata", icon: "pencil", color: "amber" },
];

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: HabitTemplate) => void;
}

export function TemplateModal({ open, onClose, onSelect }: TemplateModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Template Cepat
          </h2>
        </div>
        <IconButton icon={X} onClick={onClose} size={16} />
      </div>

      <p className="px-5 text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        Pilih template untuk langsung mengisi form
      </p>

      {/* Template grid */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const TemplateIcon = getHabitIcon(t.icon);
            const templateColor = getHabitColor(t.color);
            return (
              <button
                key={t.text}
                type="button"
                onClick={() => {
                  onSelect(t);
                  onClose();
                }}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${templateColor.bg}`}>
                  <TemplateIcon size={20} className={templateColor.text} />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-tight text-center">
                  {t.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
