import { useDialogStore } from "~/store/useDialogStore";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const VARIANT_STYLES = {
  danger: {
    confirmBtn:
      "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20",
  },
  warning: {
    confirmBtn:
      "bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20",
  },
  info: {
    confirmBtn:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20",
  },
};

export function ConfirmDialog() {
  const { isOpen, isExiting, title, message, confirmLabel, cancelLabel, variant, onConfirm, closeDialog, _finishClose } =
    useDialogStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeDialog]);

  // After exit animation finishes, actually unmount
  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(_finishClose, 200);
    return () => clearTimeout(timer);
  }, [isExiting, _finishClose]);

  if (!isOpen) return null;

  const style = VARIANT_STYLES[variant];

  const handleConfirm = () => {
    onConfirm?.();
    closeDialog();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeDialog();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-200 flex items-center justify-center backdrop-blur-sm p-4 transition-opacity duration-200 ${isExiting ? "opacity-0" : "opacity-100 animate-[fadeIn_0.15s_ease-out]"
        } bg-black/40 dark:bg-black/60`}
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 w-full max-w-sm transition-all duration-200 ${isExiting
            ? "opacity-0 scale-95 translate-y-2"
            : "animate-[dialogIn_0.2s_ease-out]"
          }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={closeDialog}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-3">
          <button
            onClick={closeDialog}
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer border border-zinc-200 dark:border-zinc-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${style.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
