import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { FlowRangeGranularityTabs, FlowPeriodNavigation } from "./FlowRangeNavigator";
import { FlowToggle } from "./FlowToggle";
import { FlowChartSkeleton } from "./skeletons";
import { ChartEmptyState } from "@/shared/components/chart/ChartEmptyState";
import { cn } from "@/lib/utils";

export function FlowPageLayout({
  activeRange,
  setActiveRange,
  rangeLabel,
  flowTab,
  setFlowTab,
  onPrev,
  onNext,
  onReset,
  rangeOptions,
  loading,
  chartSection,
  cardsSection,
  headerActions,
  floatingActions,
  className,
}) {
  return (
    <PageContainer className={cn("relative pt-2 md:pt-3 lg:pt-3 xl:pt-4 pb-2 md:pb-2", className)}>
      {floatingActions}

      <ContentSection>
        <div className="flex w-full flex-col gap-3">
          <div className="relative flex min-h-[44px] w-full flex-col gap-3 sm:min-h-[40px] md:block md:min-h-[44px]">
            <div className="flex w-full items-center justify-between gap-2 md:pointer-events-none md:absolute md:left-0 md:right-0 md:top-1/2 md:z-[1] md:-translate-y-1/2">
              <div className="md:pointer-events-auto">
                <FlowRangeGranularityTabs
                  activeRange={activeRange}
                  setActiveRange={setActiveRange}
                  rangeOptions={rangeOptions}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2 md:pointer-events-auto">
                {headerActions}
                <FlowToggle value={flowTab} onChange={setFlowTab} className="w-auto" />
              </div>
            </div>
            <div className="flex w-full justify-center md:pointer-events-none md:absolute md:left-1/2 md:top-1/2 md:z-[2] md:-translate-x-1/2 md:-translate-y-1/2">
              <div className="md:pointer-events-auto">
                <FlowPeriodNavigation
                  rangeLabel={rangeLabel}
                  onPrev={onPrev}
                  onNext={onNext}
                  onReset={onReset}
                />
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      <ContentSection>
        {loading ? (
          <FlowChartSkeleton />
        ) : chartSection ? (
          chartSection
        ) : (
          <ChartEmptyState />
        )}
      </ContentSection>

      {cardsSection ? <ContentSection className="mb-0 md:mb-0">{cardsSection}</ContentSection> : null}
    </PageContainer>
  );
}
