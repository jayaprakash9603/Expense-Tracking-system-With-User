import React from "react";
import { ReportHeaderCenter } from "@/shared/components/report/ReportHeaderCenter";
import { cn } from "@/lib/utils";

export const REPORT_HERO_DATE_BADGE_CLASS =
  "max-w-[min(100%,15rem)] border-primary/45 bg-primary/[0.07] shadow-sm hover:bg-primary/10 sm:max-w-[min(100%,20rem)] justify-center";

export function ReportHeroDateRangeSlot({
  dateRangeProps,
  isCustomRangeActive = false,
  enableDateRangeBadge = true,
  badgeClassName = REPORT_HERO_DATE_BADGE_CLASS,
  showCalendarIcon = false,
  buttonLabels,
  showFromToLabels = false,
  wrapperClassName,
}) {
  return (
    <div className={cn("min-w-0 w-full lg:w-auto lg:shrink-0", wrapperClassName)}>
      <ReportHeaderCenter
        enableDateRangeBadge={enableDateRangeBadge}
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={isCustomRangeActive}
        badgeClassName={badgeClassName}
        showCalendarIcon={showCalendarIcon}
        buttonLabels={buttonLabels}
        showFromToLabels={showFromToLabels}
      />
    </div>
  );
}
