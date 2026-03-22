import React from "react";
import { AppSelect } from "@/shared/components/form/AppSelect";
import { CUSTOM_TIMEFRAME_PLACEHOLDER } from "@/shared/constants/reportFilters";
import { cn } from "@/lib/utils";

const COMPACT_TRIGGER =
  "h-9 w-[min(100%,7.5rem)] min-w-[6.5rem] shrink-0 border-border bg-background text-xs shadow-sm sm:min-w-[7.25rem]";

export function ExpenseReportTimeframeSelect({
  timeframeOpts,
  timeframeSelectValue,
  onTimeframeChange,
  shouldShowTimeframePlaceholder,
  timeframePlaceholder,
  selectOptionLabel,
  triggerClassName,
  className,
}) {
  const handleTimeframeChange = (v) => {
    if (v === CUSTOM_TIMEFRAME_PLACEHOLDER) return;
    onTimeframeChange(v);
  };

  return (
    <AppSelect
      className={cn("space-y-0", className)}
      value={timeframeSelectValue}
      onChange={handleTimeframeChange}
      options={timeframeOpts}
      placeholder={timeframePlaceholder}
      placeholderOption={
        shouldShowTimeframePlaceholder
          ? {
              value: CUSTOM_TIMEFRAME_PLACEHOLDER,
              label: selectOptionLabel,
              disabled: true,
            }
          : undefined
      }
      triggerClassName={cn(COMPACT_TRIGGER, triggerClassName)}
    />
  );
}
