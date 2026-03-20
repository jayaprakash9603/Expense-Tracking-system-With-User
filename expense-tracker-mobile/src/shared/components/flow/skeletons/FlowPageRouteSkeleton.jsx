import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { cn } from "@/lib/utils";
import { FlowChartSkeleton } from "./FlowChartSkeleton";
import { FlowExpenseCardsSkeleton } from "./FlowExpenseCardsSkeleton";
import { FlowEntityCardsSkeleton } from "./FlowEntityCardsSkeleton";

function FlowToolbarSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative flex min-h-[44px] w-full flex-col gap-3 sm:min-h-[40px] md:block md:min-h-[44px]">
        <div className="flex w-full items-center justify-between gap-2 md:pointer-events-none md:absolute md:left-0 md:right-0 md:top-1/2 md:z-[1] md:-translate-y-1/2">
          <div className="flex gap-1.5 md:pointer-events-auto">
            <div className="h-8 w-14 animate-pulse rounded-md bg-muted sm:w-16" />
            <div className="h-8 w-12 animate-pulse rounded-md bg-muted sm:w-14" />
            <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex shrink-0 items-center gap-2 md:pointer-events-auto">
            <div className="h-8 w-16 animate-pulse rounded-md bg-muted sm:w-20" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-muted sm:w-28" />
          </div>
        </div>
        <div className="flex w-full justify-center md:pointer-events-none md:absolute md:left-1/2 md:top-1/2 md:z-[2] md:-translate-x-1/2 md:-translate-y-1/2">
          <div className="flex items-center gap-2 md:pointer-events-auto">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-muted sm:w-32" />
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlowPageRouteSkeleton({ variant = "expense", className }) {
  const cards =
    variant === "entity" ? (
      <FlowEntityCardsSkeleton count={10} layout="grid" />
    ) : (
      <FlowExpenseCardsSkeleton count={6} />
    );

  return (
    <PageContainer className={cn("relative pt-2 md:pt-3 lg:pt-3 xl:pt-4 pb-2 md:pb-2", className)}>
      <ContentSection>
        <FlowToolbarSkeleton />
      </ContentSection>

      <ContentSection>
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="px-1 pb-2 pt-0 sm:px-2">
            <FlowChartSkeleton />
          </div>
        </div>
      </ContentSection>

      <ContentSection className="mb-0 md:mb-0">{cards}</ContentSection>
    </PageContainer>
  );
}
