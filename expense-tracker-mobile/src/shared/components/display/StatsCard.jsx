import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { cn } from "@/lib/utils";

const SIZE_CONFIG = {
  small: { padding: "p-3", valueClass: "text-lg", labelClass: "text-xs", iconSize: "sm" },
  medium: { padding: "p-4", valueClass: "text-2xl", labelClass: "text-sm", iconSize: "md" },
  large: { padding: "p-6", valueClass: "text-3xl", labelClass: "text-base", iconSize: "lg" },
};

export function StatsCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  size = "medium",
  onClick,
  className,
}) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.medium;

  return (
    <AppCard
      className={cn(
        config.padding,
        "text-center transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary",
        className
      )}
      onClick={onClick}
    >
      {icon && (
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-2.5">
            <AppIcon icon={icon} size={config.iconSize} color="primary" />
          </div>
        </div>
      )}

      <div className={cn(config.valueClass, "font-bold text-primary leading-tight")}>
        {value}
      </div>

      <div className={cn(config.labelClass, "text-muted-foreground mt-1")}>
        {label}
      </div>

      {trend !== undefined && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend >= 0 ? "+" : ""}{trend}% {trendLabel || ""}
          </span>
        </div>
      )}
    </AppCard>
  );
}

export function StatsRow({ stats, columns = 4, size = "medium", className }) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns] || gridCols[4], className)}>
      {stats.map((stat, index) => (
        <StatsCard key={stat.key || index} size={size} {...stat} />
      ))}
    </div>
  );
}

export default StatsCard;
