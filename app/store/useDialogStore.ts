import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "warning" | "info";
  onConfirm: (() => void) | null;
}

interface DialogStore extends DialogState {
  openDialog: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  confirmLabel: "Ya",
  cancelLabel: "Batal",
  variant: "danger",
  onConfirm: null,

  openDialog: (opts) =>
    set({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? "Ya",
      cancelLabel: opts.cancelLabel ?? "Batal",
      variant: opts.variant ?? "danger",
      onConfirm: opts.onConfirm,
    }),

  closeDialog: () =>
    set({
      isOpen: false,
      onConfirm: null,
    }),
}));
