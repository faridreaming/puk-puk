import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "info" | "celebration";
  duration?: number;
  exiting?: boolean;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "exiting">) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const duration = toast.duration ?? 3000;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, exiting: false }],
    }));

    // Start exit animation before removal
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      }));

      // Remove after animation completes
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 300);
    }, duration);
  },

  dismissToast: (id) => {
    // Trigger exit animation
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    }));

    // Remove after animation
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 300);
  },
}));
