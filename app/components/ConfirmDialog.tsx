import { useDialogStore } from "~/store/useDialogStore";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ActionButton } from "~/components/ui/ActionButton";
import { IconButton } from "~/components/ui/IconButton";

const DIALOG_VARIANT_TO_BUTTON: Record<string, "danger" | "warning" | "info"> = {
  danger: "danger",
  warning: "warning",
  info: "info",
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

  const buttonVariant = DIALOG_VARIANT_TO_BUTTON[variant] ?? "info";

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
          <IconButton icon={X} onClick={closeDialog} size={16} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-3">
          <ActionButton variant="ghost" onClick={closeDialog} className="flex-1">
            {cancelLabel}
          </ActionButton>
          <ActionButton variant={buttonVariant} onClick={handleConfirm} className="flex-1" autoFocus>
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
