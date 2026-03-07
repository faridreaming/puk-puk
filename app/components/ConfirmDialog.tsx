import { useDialogStore } from "~/store/useDialogStore";
import { X } from "lucide-react";
import { ActionButton } from "~/components/ui/ActionButton";
import { IconButton } from "~/components/ui/IconButton";
import { Modal } from "~/components/ui/Modal";

const DIALOG_VARIANT_TO_BUTTON: Record<string, "danger" | "warning" | "info"> = {
  danger: "danger",
  warning: "warning",
  info: "info",
};

export function ConfirmDialog() {
  const { isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm, closeDialog } =
    useDialogStore();

  const buttonVariant = DIALOG_VARIANT_TO_BUTTON[variant] ?? "info";

  const handleConfirm = () => {
    onConfirm?.();
    closeDialog();
  };

  return (
    <Modal open={isOpen} onClose={closeDialog}>
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
    </Modal>
  );
}
