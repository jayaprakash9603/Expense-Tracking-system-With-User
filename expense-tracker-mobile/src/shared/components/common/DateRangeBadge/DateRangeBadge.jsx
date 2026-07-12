import React from "react";
import { DateRangePicker } from "@/shared/components/navigation/DateRangePicker";
import { cn } from "@/lib/utils";

export function DateRangeBadge({
  fromDate,
  toDate,
  onApply,
  onReset,
  dateFormat = "DD MMM YYYY",
  buttonLabels,
  buttonProps = {},
  className,
  showCalendarIcon = true,
  showFromToLabels = false,
}) {
  const mergedClass = cn(buttonProps.className, className);
  return (
    <DateRangePicker
      fromDate={fromDate}
      toDate={toDate}
      onApply={onApply}
      onReset={onReset}
      dateFormat={dateFormat}
      showInlineLabels
      showFromToLabels={showFromToLabels}
      buttonLabels={buttonLabels}
      className={mergedClass}
      showCalendarIcon={showCalendarIcon}
    />
  );
}

export default DateRangeBadge;
