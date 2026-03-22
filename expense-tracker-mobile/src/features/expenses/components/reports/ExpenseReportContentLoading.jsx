import React from "react";
import { SummaryCardSkeleton } from "@/shared/components/display/SummaryCard";
import { GroupedReportAccordionSkeleton } from "@/shared/components/report/grouped-report-accordion";
import { SKELETON_VARIANTS } from "./expenseReportContentConstants";

export function ExpenseReportContentLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
        {SKELETON_VARIANTS.map((v) => (
          <SummaryCardSkeleton key={v} variant={v} />
        ))}
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-[20rem] w-full animate-pulse rounded-lg bg-muted sm:h-[22.5rem]" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[26.25rem] w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-[26.25rem] w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-3 pt-2">
        <div className="h-5 w-56 max-w-full animate-pulse rounded bg-muted" />
        <GroupedReportAccordionSkeleton />
      </div>
    </div>
  );
}
