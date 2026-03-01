import { useToastStore } from "~/store/useToastStore";
import { Check, AlertTriangle, Info, PartyPopper } from "lucide-react";

const TOAST_STYLES = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    Icon: Check,
  },
  warning: {
    bg: "bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30",
    text: "text-red-700 dark:text-red-400",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    Icon: Info,
  },
  celebration: {
    bg: "bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    Icon: PartyPopper,
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-100 flex flex-col-reverse gap-2 max-w-sm w-full px-4">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const IconComponent = style.Icon;
        return (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
              shadow-lg cursor-pointer transition-all duration-300 ease-out
              ${toast.exiting ? "toast-exit" : "toast-enter"}
              ${style.bg}
            `}
            onClick={() => dismissToast(toast.id)}
          >
            <IconComponent size={18} className={`shrink-0 ${style.text}`} />
            <p className={`text-sm font-medium flex-1 ${style.text}`}>
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
