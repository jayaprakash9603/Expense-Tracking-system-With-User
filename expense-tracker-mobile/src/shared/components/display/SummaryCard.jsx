import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./AppIcon";
import { Sparkline } from "./Sparkline";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";

const VARIANT_STYLES = {
  blue: {
    light: "from-blue-100 to-blue-200",
    dark: "dark:from-blue-950 dark:to-blue-900",
    iconShell:
      "bg-blue-900/[0.12] text-blue-900 dark:bg-blue-950/70 dark:text-blue-800",
    title: "text-blue-900 dark:text-blue-300",
    value: "text-blue-800 dark:text-blue-100",
    trend: "text-blue-800 dark:text-blue-300",
    sparkline: "#3b82f6",
    dot: "rgba(59,130,246,0.08)",
    dotDark: "rgba(147,197,253,0.1)",
  },
  purple: {
    light: "from-purple-100 to-purple-200",
    dark: "dark:from-purple-950 dark:to-purple-900",
    iconShell:
      "bg-purple-900/[0.12] text-purple-900 dark:bg-purple-950/70 dark:text-purple-800",
    title: "text-purple-900 dark:text-purple-300",
    value: "text-purple-800 dark:text-purple-100",
    trend: "text-purple-800 dark:text-purple-300",
    sparkline: "#8b5cf6",
    dot: "rgba(139,92,246,0.08)",
    dotDark: "rgba(196,181,253,0.1)",
  },
  amber: {
    light: "from-amber-100 to-amber-200",
    dark: "dark:from-amber-950 dark:to-amber-900",
    iconShell:
      "bg-amber-900/[0.12] text-amber-900 dark:bg-amber-950/70 dark:text-amber-800",
    title: "text-amber-900 dark:text-amber-300",
    value: "text-amber-800 dark:text-amber-100",
    trend: "text-amber-800 dark:text-amber-300",
    sparkline: "#f59e0b",
    dot: "rgba(245,158,11,0.08)",
    dotDark: "rgba(252,211,77,0.1)",
  },
  rose: {
    light: "from-rose-100 to-rose-200",
    dark: "dark:from-rose-950 dark:to-rose-900",
    iconShell:
      "bg-rose-900/[0.12] text-rose-900 dark:bg-rose-950/70 dark:text-rose-800",
    title: "text-rose-900 dark:text-rose-300",
    value: "text-rose-800 dark:text-rose-100",
    trend: "text-rose-800 dark:text-rose-300",
    sparkline: "#f43f5e",
    dot: "rgba(244,63,94,0.08)",
    dotDark: "rgba(253,164,175,0.1)",
  },
  emerald: {
    light: "from-emerald-100 to-emerald-200",
    dark: "dark:from-emerald-950 dark:to-emerald-900",
    iconShell:
      "bg-emerald-900/[0.12] text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-800",
    title: "text-emerald-900 dark:text-emerald-300",
    value: "text-emerald-800 dark:text-emerald-100",
    trend: "text-emerald-800 dark:text-emerald-300",
    sparkline: "#10b981",
    dot: "rgba(16,185,129,0.08)",
    dotDark: "rgba(110,231,183,0.1)",
  },
  cyan: {
    light: "from-cyan-100 to-cyan-200",
    dark: "dark:from-cyan-950 dark:to-cyan-900",
    iconShell:
      "bg-cyan-900/[0.12] text-cyan-900 dark:bg-cyan-950/70 dark:text-cyan-800",
    title: "text-cyan-900 dark:text-cyan-300",
    value: "text-cyan-800 dark:text-cyan-100",
    trend: "text-cyan-800 dark:text-cyan-300",
    sparkline: "#06b6d4",
    dot: "rgba(6,182,212,0.08)",
    dotDark: "rgba(103,232,249,0.1)",
  },
};

export function SummaryCard({
  title,
  value,
  rawAmount,
  icon,
  variant = "blue",
  percentage,
  trendDirection,
  trendLabel,
  sparklineData,
  onClick,
  className,
}) {
  const { format, animation, hoverClass } = usePresentation();
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;

  const displayValue = rawAmount !== undefined ? format(rawAmount) : value;
  const isUp = trendDirection === "up";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-3 sm:p-4 md:p-5",
        "min-h-[6.5rem] sm:min-h-[7.375rem] md:min-h-[8.125rem] flex flex-col justify-between cursor-pointer",
        "shadow-sm",
        styles.light,
        styles.dark,
        animation.enabled && "transition-all duration-200",
        animation.enabled && hoverClass("hover:-translate-y-0.5 hover:shadow-lg"),
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <DotPattern />

      <div className="flex items-start justify-between relative z-[1]">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-sm",
            styles.iconShell,
          )}
        >
          <AppIcon icon={icon} size="sm" color="inherit" />
        </div>

        {percentage && (
          <div className={cn("flex items-center gap-0.5 text-[0.8125rem] font-semibold", styles.trend)}>
            {isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{percentage}</span>
            {trendLabel && (
              <span className="text-[0.6875rem] font-normal opacity-80 ml-0.5 hidden sm:inline">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between relative z-[1] mt-2 sm:mt-3 md:mt-4">
        <div className="min-w-0 flex-1 pr-1">
          <p className={cn("text-[0.6875rem] sm:text-[0.8125rem] font-medium mb-0.5 sm:mb-1 truncate", styles.title)}>
            {title}
          </p>
          <p className={cn("text-base sm:text-lg md:text-2xl font-bold leading-none truncate", styles.value)}>
            {displayValue}
          </p>
        </div>

        {sparklineData?.length > 1 && (
          <div className="shrink-0 pb-0.5 ml-1 sm:ml-2 scale-[0.82] origin-bottom-right sm:scale-100">
            <Sparkline
              data={sparklineData}
              color={styles.sparkline}
              width={50}
              height={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DotPattern() {
  return (
    <div
      className="absolute inset-0 w-1/2 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "8px 8px",
        opacity: 0.04,
        maskImage: "linear-gradient(to right, black, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black, transparent)",
      }}
    />
  );
}

export function SummaryCardGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3 md:gap-4",
        "grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SummaryCardSkeleton({ variant = "blue", className }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-3 sm:p-4 md:p-5",
        "min-h-[6.5rem] sm:min-h-[7.375rem] md:min-h-[8.125rem] flex flex-col justify-between animate-pulse",
        styles.light,
        styles.dark,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/5 dark:bg-white/10" />
        <div className="w-16 sm:w-24 h-3 sm:h-4 rounded bg-black/5 dark:bg-white/10" />
      </div>
      <div className="mt-2 sm:mt-3 md:mt-4">
        <div className="w-16 sm:w-20 h-2.5 sm:h-3 rounded bg-black/5 dark:bg-white/10 mb-1.5 sm:mb-2" />
        <div className="w-20 sm:w-28 h-5 sm:h-6 rounded bg-black/5 dark:bg-white/10" />
      </div>
    </div>
  );
}

export default SummaryCard;
