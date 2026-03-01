import { useRef } from "react";
import { useHabitStore } from "~/store/useHabitStore";
import { useToastStore } from "~/store/useToastStore";
import { Download, Upload } from "lucide-react";

export function DataManager() {
  const exportData = useHabitStore((s) => s.exportData);
  const importData = useHabitStore((s) => s.importData);
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pukpuk-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importData(json);
      if (success) {
        addToast({ message: "Data berhasil diimpor!", type: "success" });
      } else {
        addToast({ message: "Gagal mengimpor data. Format file tidak valid.", type: "warning" });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/50"
      >
        <Download size={14} />
        Ekspor
      </button>
      <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/50">
        <Upload size={14} />
        Impor
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}
