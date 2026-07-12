import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_HIDE_AFTER_MS = 4500;

export function AutoFillBadge({
  visible = false,
  label = "Auto-filled",
  className,
  hideAfterMs = DEFAULT_HIDE_AFTER_MS,
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      return undefined;
    }
    setShown(true);
    const id = window.setTimeout(() => setShown(false), hideAfterMs);
    return () => window.clearTimeout(id);
  }, [visible, hideAfterMs]);

  if (!shown) return null;

  return (
    <span
      className={cn(
        "pointer-events-none absolute right-[-0.5rem] top-0 z-10 translate-x-full rounded px-1.5 py-0.5 text-[0.625rem] font-semibold text-primary-foreground shadow-sm",
        "bg-gradient-to-r from-primary to-primary/80",
        className,
      )}
    >
      {label}
    </span>
  );
}

export default AutoFillBadge;
