import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANT_MAP = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  inProgress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "in-progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  partial: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  error: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  overdue: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  exceeded: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  new: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  draft: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  default: "bg-muted text-muted-foreground border-border",
  inactive: "bg-muted text-muted-foreground border-border",
};

const SIZE_MAP = {
  small: "text-[0.625rem] px-1.5 py-0",
  medium: "text-xs px-2 py-0.5",
  large: "text-sm px-3 py-1",
};

export function StatusChip({
  status = "default",
  label,
  size = "small",
  variant = "filled",
  className,
}) {
  const colorClasses = STATUS_VARIANT_MAP[status] || STATUS_VARIANT_MAP.default;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.small;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border rounded-full",
        colorClasses,
        sizeClasses,
        variant === "outlined" && "bg-transparent",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export default StatusChip;
