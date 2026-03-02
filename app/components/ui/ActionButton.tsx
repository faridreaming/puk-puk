interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "success" | "danger" | "ghost" | "primary";
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  success:
    "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/30",
  danger:
    "bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/20 border border-red-400/30",
  ghost:
    "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50",
  primary:
    "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 border-0",
};

export function ActionButton({
  variant = "ghost",
  children,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        min-h-[44px] py-2.5 px-4 rounded-xl font-semibold text-sm
        transition-all duration-200 active:scale-[0.97] cursor-pointer
        flex items-center justify-center gap-1.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
