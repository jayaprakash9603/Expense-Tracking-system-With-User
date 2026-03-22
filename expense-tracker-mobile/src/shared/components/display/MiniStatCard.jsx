import React from "react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./AppIcon";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";

export function MiniStatCard({
  icon,
  iconColor = "primary",
  title,
  value,
  rawAmount,
  subtitle,
  className,
  onClick,
}) {
  const { format, animation, hoverClass } = usePresentation();
  const displayValue = rawAmount !== undefined ? format(rawAmount) : value;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3 md:p-4",
        animation.enabled && "transition-all duration-200",
        onClick && animation.enabled && hoverClass("hover:-translate-y-0.5 hover:shadow-md"),
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
        `bg-${iconColor === "primary" ? "primary" : iconColor}/10`
      )}>
        <AppIcon icon={icon} color={iconColor} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{title}</p>
        <p className="text-base md:text-lg font-bold leading-tight truncate">{displayValue}</p>
        {subtitle && <p className="text-[0.6875rem] text-muted-foreground truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

export default MiniStatCard;
