import React from "react";
import { Skeleton } from "@/shared/components/app-shadcn";
import { AccordionGroupRowSkeleton } from "@/shared/components/data/AccordionGroupRowSkeleton";

const DEFAULT_SKELETON_ROWS = 8;

export function GroupedReportAccordionSkeleton({ rowCount = DEFAULT_SKELETON_ROWS }) {
  const rows = Math.max(1, Math.min(rowCount, 12));
  return (
    <div className="space-y-3">
      <div className="-space-x-px mb-2 flex w-full overflow-hidden rounded-md border border-border bg-background shadow-xs sm:mb-3 rtl:space-x-reverse">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 min-w-[30%] shrink-0 rounded-none border-r border-border last:border-r-0"
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 sm:gap-3 sm:py-2">
        <Skeleton className="h-8 min-w-[200px] flex-1 max-w-md sm:h-9" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <AccordionGroupRowSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="mt-3 h-12 w-full rounded-lg border border-border/60 bg-card/50 sm:mt-4 sm:h-[3.25rem]" />
    </div>
  );
}
