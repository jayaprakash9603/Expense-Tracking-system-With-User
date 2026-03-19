import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { FlowRangeNavigator } from "./FlowRangeNavigator";
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
  className,
}) {
  return (
    <PageContainer className={cn("pt-2 md:pt-3 lg:pt-3 xl:pt-4 pb-2 md:pb-2", className)}>
      <ContentSection>
        <div className="w-full grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <FlowRangeNavigator
            activeRange={activeRange}
            setActiveRange={setActiveRange}
            rangeLabel={rangeLabel}
            onPrev={onPrev}
            onNext={onNext}
            onReset={onReset}
            rangeOptions={rangeOptions}
            className="w-full"
          />
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:justify-self-end">
            {headerActions}
            <FlowToggle value={flowTab} onChange={setFlowTab} className="w-full sm:w-auto" />
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

      {cardsSection && (
        <ContentSection className="mb-0 md:mb-0">
          {cardsSection}
        </ContentSection>
      )}
    </PageContainer>
  );
}
