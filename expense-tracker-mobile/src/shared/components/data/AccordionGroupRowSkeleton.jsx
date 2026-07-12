import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ACCORDION_GROUP_ROW_MIN_CLASS,
  ACCORDION_GROUP_TRIGGER_PADDING_CLASS,
} from "./accordionGroupLayout";

export function AccordionGroupRowSkeleton({ className }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card",
        ACCORDION_GROUP_TRIGGER_PADDING_CLASS,
        ACCORDION_GROUP_ROW_MIN_CLASS,
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-32 max-w-[55%] sm:h-4" />
          <Skeleton className="h-4 w-16 rounded-full sm:w-20" />
          <Skeleton className="hidden h-4 w-20 rounded-full sm:block" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-2.5 w-20 sm:h-3 sm:w-24" />
          <Skeleton className="h-3.5 w-28 sm:h-4 sm:w-32" />
          <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-sm opacity-60 sm:h-4 sm:w-4" />
        </div>
      </div>
    </div>
  );
}
