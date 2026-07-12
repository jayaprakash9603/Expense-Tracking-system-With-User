import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { AppCard } from "@/shared/components/display/AppCard";
import { FlowRangeGranularityTabs, FlowPeriodNavigation } from "./FlowRangeNavigator";
import { FlowToggle } from "./FlowToggle";
import { FlowChartSkeleton } from "./skeletons";
import { ChartEmptyState } from "@/shared/components/chart/ChartEmptyState";
import { CHART_HEIGHTS } from "@/config/chart/chartConfig";
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
  beforeChartSection,
  stackedMobileHeader = false,
  mobileChartTitle,
  mobileChartDescription,
  className,
}) {
  return (
    <PageContainer className={cn("relative overflow-y-hidden pt-2 md:pt-3 lg:pt-3 xl:pt-4 pb-2 md:pb-2 flex flex-col h-full min-h-0", className)}>
      {floatingActions}

      <ContentSection className="sticky top-0 z-20 shrink-0 -mx-4 mb-3 px-4 pb-2 pt-2 lg:static lg:mx-0 lg:mb-5 lg:p-0 lg:backdrop-blur-none bg-background/95 backdrop-blur lg:bg-transparent">
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-3 lg:hidden">
            {stackedMobileHeader && (mobileChartTitle || mobileChartDescription) ? (
              <div>
                {mobileChartTitle ? (
                  <AppCard.Title className="text-base">{mobileChartTitle}</AppCard.Title>
                ) : null}
                {mobileChartDescription ? (
                  <AppCard.Description>{mobileChartDescription}</AppCard.Description>
                ) : null}
              </div>
            ) : null}
            <div className="flex w-full gap-2">
              <div className="min-w-0 flex-1 basis-0">
                <FlowRangeGranularityTabs
                  compact
                  activeRange={activeRange}
                  setActiveRange={setActiveRange}
                  rangeOptions={rangeOptions}
                />
              </div>
              <div className="min-w-0 flex-1 basis-0">
                <FlowToggle compact value={flowTab} onChange={setFlowTab} />
              </div>
            </div>
            <div className="flex w-full min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1" />
              <FlowPeriodNavigation
                rangeLabel={rangeLabel}
                onPrev={onPrev}
                onNext={onNext}
                onReset={onReset}
                className="min-w-0 max-w-full shrink"
              />
              {headerActions ? (
                <div className="flex min-w-0 flex-1 justify-end">{headerActions}</div>
              ) : (
                <div className="min-w-0 flex-1" />
              )}
            </div>
          </div>
          <div className="relative hidden min-h-[2.75rem] w-full flex-col gap-3 sm:min-h-[2.5rem] lg:block lg:min-h-[2.75rem]">
            <div className="flex w-full items-center justify-between gap-2 lg:pointer-events-none lg:absolute lg:left-0 lg:right-0 lg:top-1/2 lg:z-[1] lg:-translate-y-1/2">
              <div className="lg:pointer-events-auto">
                <FlowRangeGranularityTabs
                  activeRange={activeRange}
                  setActiveRange={setActiveRange}
                  rangeOptions={rangeOptions}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2 lg:pointer-events-auto">
                <div className="hidden lg:contents">{headerActions}</div>
                <FlowToggle value={flowTab} onChange={setFlowTab} className="w-auto" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:z-[2] lg:-translate-x-1/2 lg:-translate-y-1/2">
              <div className="flex items-center justify-center gap-2 lg:pointer-events-auto">
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

      {beforeChartSection ? (
        <ContentSection className="shrink-0">{beforeChartSection}</ContentSection>
      ) : null}

      <ContentSection className="shrink-0">
        {loading ? (
          <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="px-1 pb-2 pt-0 sm:px-2">
              <FlowChartSkeleton />
            </div>
          </div>
        ) : chartSection ? (
          chartSection
        ) : (
          <ChartEmptyState height={CHART_HEIGHTS.default} />
        )}
      </ContentSection>

      {cardsSection ? <ContentSection className="mb-0 md:mb-0 flex-1 min-h-0 flex flex-col">{cardsSection}</ContentSection> : null}
    </PageContainer>
  );
}
