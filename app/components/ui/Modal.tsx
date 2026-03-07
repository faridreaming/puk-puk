import { useEffect, useRef, useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, maxWidth = "max-w-sm" }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Mount / Unmount
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      // Animate out → unmount
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open, mounted]);

  // Animate in after mount
  useEffect(() => {
    if (mounted && open) {
      // Wait a tick for the DOM to paint the initial state before animating
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [mounted, open]);

  // Escape key
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-200 flex items-center justify-center backdrop-blur-sm p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
        } bg-black/40 dark:bg-black/60`}
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 w-full ${maxWidth} transition-all duration-200 ${visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-2"
          }`}
      >
        {children}
      </div>
    </div>
  );
}
