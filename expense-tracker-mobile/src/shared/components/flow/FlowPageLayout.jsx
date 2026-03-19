import React from "react";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { FlowRangeNavigator } from "./FlowRangeNavigator";
import { FlowToggle } from "./FlowToggle";
import { FlowSummaryHeader } from "./FlowSummaryHeader";
import { ChartEmptyState } from "@/shared/components/chart/ChartEmptyState";
import { cn } from "@/lib/utils";

export function FlowPageLayout({
  title,
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
  totals,
  chartSection,
  cardsSection,
  className,
}) {
  return (
    <PageContainer className={cn(className)}>
      <ContentSection>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <FlowToggle value={flowTab} onChange={setFlowTab} />
          </div>

          <FlowRangeNavigator
            activeRange={activeRange}
            setActiveRange={setActiveRange}
            rangeLabel={rangeLabel}
            onPrev={onPrev}
            onNext={onNext}
            onReset={onReset}
            rangeOptions={rangeOptions}
          />
        </div>
      </ContentSection>

      {totals && (
        <ContentSection>
          <FlowSummaryHeader totals={totals} />
        </ContentSection>
      )}

      <ContentSection>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartSection ? (
          chartSection
        ) : (
          <ChartEmptyState />
        )}
      </ContentSection>

      {cardsSection && (
        <ContentSection>
          {cardsSection}
        </ContentSection>
      )}
    </PageContainer>
  );
}
