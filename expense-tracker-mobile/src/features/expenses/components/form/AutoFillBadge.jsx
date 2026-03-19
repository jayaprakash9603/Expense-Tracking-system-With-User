import React from "react";
import { cn } from "@/lib/utils";

export function AutoFillBadge({
  visible = false,
  label = "Auto-filled",
  className,
}) {
  if (!visible) return null;

  return (
    <span
      className={cn(
        "pointer-events-none absolute right-[-8px] top-0 z-10 translate-x-full rounded px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm",
        "bg-gradient-to-r from-primary to-primary/80",
        className,
      )}
    >
      {label}
    </span>
  );
}

export default AutoFillBadge;
