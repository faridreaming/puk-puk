import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CreateHabitForm } from "~/components/CreateHabitForm";
import { TemplateModal } from "~/components/TemplateModal";
import type { HabitTemplate } from "~/components/TemplateModal";
import { PageShell } from "~/components/ui/PageShell";

export function meta() {
  return [
    { title: "Buat Kebiasaan Baru - Pukpuk" },
  ];
}

export default function CreatePage() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);

  return (
    <PageShell
      title="Kebiasaan Baru"
      backTo="/"
      headerRight={
        <button
          type="button"
          onClick={() => setShowTemplates(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all cursor-pointer active:scale-95"
        >
          <Sparkles size={14} />
          Template
        </button>
      }
    >
      <CreateHabitForm selectedTemplate={selectedTemplate} />
      <TemplateModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(t) => setSelectedTemplate({ ...t })}
      />
    </PageShell>
  );
}
