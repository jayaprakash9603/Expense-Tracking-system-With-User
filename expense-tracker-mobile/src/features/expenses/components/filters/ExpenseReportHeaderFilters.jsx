import React from "react";
import { AppSelect } from "@/shared/components/form/AppSelect";
import { CUSTOM_TIMEFRAME_PLACEHOLDER } from "@/shared/constants/reportFilters";
import { cn } from "@/lib/utils";

const FILTER_SELECT_TRIGGER =
  "h-10 w-full min-w-0 border-border bg-background text-sm shadow-sm sm:h-9 sm:min-w-[9.25rem] sm:max-w-[min(100%,11rem)]";

const FILTER_SELECT_TRIGGER_INLINE =
  "h-9 min-w-0 flex-1 border-border bg-background text-xs shadow-sm sm:text-sm sm:min-w-[8rem] sm:max-w-[min(100%,11rem)]";

export function ExpenseReportHeaderFilters({
  flowOpts,
  timeframeOpts,
  flowType,
  onFlowTypeChange,
  timeframeSelectValue,
  onTimeframeChange,
  shouldShowTimeframePlaceholder,
  flowPlaceholder,
  timeframePlaceholder,
  selectOptionLabel,
  variant = "stacked",
  className,
}) {
  const handleTimeframeChange = (v) => {
    if (v === CUSTOM_TIMEFRAME_PLACEHOLDER) return;
    onTimeframeChange(v);
  };

  const isInline = variant === "inline";
  const triggerClass = isInline ? FILTER_SELECT_TRIGGER_INLINE : FILTER_SELECT_TRIGGER;

  return (
    <div
      className={cn(
        isInline
          ? "flex w-full min-w-0 flex-row flex-wrap items-stretch gap-2"
          : "flex w-full flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch md:items-center md:justify-end lg:w-auto",
        className,
      )}
    >
      <AppSelect
        value={flowType}
        onChange={onFlowTypeChange}
        options={flowOpts}
        placeholder={flowPlaceholder}
        className={cn(isInline && "min-w-0 flex-1 basis-[min(100%,10rem)]")}
        triggerClassName={triggerClass}
      />
      <AppSelect
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
        className={cn(isInline && "min-w-0 flex-1 basis-[min(100%,10rem)]")}
        triggerClassName={triggerClass}
      />
    </div>
  );
}
