import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const preferBottom = rect.top < 150; // If less than 150px space above, put it below

      setPosition(preferBottom ? "bottom" : "top");
      setCoords({
        x: rect.left + rect.width / 2,
        y: preferBottom ? rect.bottom + 12 : rect.top - 12,
      });
    }
  };

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsMounted(true);
    // flush sync to ensure it's mounted before starting animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const hideTooltip = () => {
    setIsVisible(false);
    timeoutRef.current = setTimeout(() => {
      setIsMounted(false);
    }, 150); // wait for 150ms outward animation
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block cursor-default"
      >
        {children}
      </div>

      {isMounted &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className={`fixed z-100 px-3 py-2.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-xl shadow-black/20 pointer-events-none w-max max-w-xs text-left whitespace-pre-line transition-all duration-150 ease-out 
              ${position === "top" ? "origin-bottom" : "origin-top"}
              ${isVisible
                ? `opacity-100 scale-100 translate-y-0`
                : `opacity-0 scale-95 ${position === "top" ? "translate-y-1" : "-translate-y-1"}`
              }
            `}
            style={{
              left: coords.x,
              top: coords.y,
              transform: `translate(-50%, ${position === "top" ? "-100%" : "0"})`,
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute left-1/2 w-2 h-2 -ml-1 bg-zinc-900 dark:bg-zinc-800 rotate-45 
                ${position === "top" ? "bottom-0 -mb-1" : "top-0 -mt-1"}`}
            />
          </div>,
          document.body
        )}
    </>
  );
}
