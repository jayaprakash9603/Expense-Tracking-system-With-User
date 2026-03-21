import React from "react";
import { DateRangeBadge } from "@/shared/components/common/DateRangeBadge/DateRangeBadge";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function ReportHeaderCenter({
  enableDateRangeBadge,
  dateRangeProps,
  isCustomRangeActive,
  badgeClassName,
  buttonLabels: buttonLabelsOverride,
  showCalendarIcon = true,
  showFromToLabels = false,
}) {
  const { t } = useLanguage();
  if (!enableDateRangeBadge || !dateRangeProps) return null;
  const hasApply =
    typeof dateRangeProps.onApply === "function" &&
    dateRangeProps.fromDate &&
    dateRangeProps.toDate;
  if (!hasApply) return null;
  const canReset = isCustomRangeActive && typeof dateRangeProps.onReset === "function";

  const buttonLabels =
    buttonLabelsOverride ?? {
      from: t("dateRange.from"),
      to: t("dateRange.to"),
    };

  return (
    <div className="inline-flex w-full sm:w-auto flex-wrap items-center justify-center gap-2">
      <DateRangeBadge
        {...dateRangeProps}
        className={badgeClassName}
        buttonLabels={buttonLabels}
        showCalendarIcon={showCalendarIcon}
        showFromToLabels={showFromToLabels}
      />
      <button
        type="button"
        aria-label={t("dateRange.clearCustom") || "Clear custom range"}
        title={t("dateRange.clearCustom") || "Clear custom range"}
        onClick={dateRangeProps.onReset}
        disabled={!canReset}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border",
          "bg-muted text-muted-foreground text-sm font-bold leading-none transition-colors",
          canReset ? "hover:bg-accent hover:text-foreground cursor-pointer" : "opacity-0 pointer-events-none",
        )}
      >
        ×
      </button>
    </div>
  );
}
