interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "success" | "danger" | "ghost" | "primary" | "warning" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  success: [
    "bg-emerald-500 text-white border border-emerald-400/30",
    "shadow-md shadow-emerald-500/20",
    "hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30",
    "active:bg-emerald-600 active:shadow-sm",
    "focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
  danger: [
    "bg-red-600 text-white border border-red-500/30",
    "shadow-md shadow-red-500/20",
    "hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30",
    "active:bg-red-700 active:shadow-sm",
    "focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
  warning: [
    "bg-amber-500 text-white border border-amber-400/30",
    "shadow-md shadow-amber-500/20",
    "hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30",
    "active:bg-amber-600 active:shadow-sm",
    "focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
  info: [
    "bg-blue-600 text-white border border-blue-500/30",
    "shadow-md shadow-blue-500/20",
    "hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30",
    "active:bg-blue-700 active:shadow-sm",
    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
  ghost: [
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50",
    "hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300",
    "active:bg-zinc-300 dark:active:bg-zinc-600",
    "focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
  primary: [
    "bg-linear-to-r from-amber-500 to-orange-500 text-white border-0",
    "shadow-lg shadow-amber-500/25",
    "hover:from-amber-400 hover:to-orange-400 hover:shadow-xl hover:shadow-amber-500/40",
    "active:from-amber-600 active:to-orange-600 active:shadow-md",
    "focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900",
  ].join(" "),
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "min-h-[36px] py-2 px-3 text-xs rounded-lg",
  md: "min-h-[44px] py-2.5 px-4 text-sm rounded-xl",
};

export function ActionButton({
  variant = "ghost",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        font-semibold outline-none
        transition-all duration-200 active:scale-[0.97] cursor-pointer
        flex items-center justify-center gap-1.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        disabled:shadow-none disabled:hover:shadow-none
        ${SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
