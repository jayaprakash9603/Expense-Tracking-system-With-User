import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { AppCard } from "@/shared/components/display/AppCard";
import { FlowRangeGranularityTabs, FlowPeriodNavigation } from "./FlowRangeNavigator";
import { FlowToggle } from "./FlowToggle";
import { FlowChartSkeleton } from "./skeletons";
import { ChartEmptyState } from "@/shared/components/chart/ChartEmptyState";
import { CHART_HEIGHTS } from "@/config/chartConfig";
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
  stackedMobileHeader = false,
  mobileChartTitle,
  mobileChartDescription,
  className,
}) {
  return (
    <PageContainer className={cn("relative pt-2 md:pt-3 lg:pt-3 xl:pt-4 pb-2 md:pb-2", className)}>
      {floatingActions}

      <ContentSection>
        <div className="flex w-full flex-col gap-3">
          {stackedMobileHeader ? (
            <div className="flex w-full flex-col gap-3 sm:hidden">
              {(mobileChartTitle || mobileChartDescription) && (
                <div>
                  {mobileChartTitle ? (
                    <AppCard.Title className="text-base">{mobileChartTitle}</AppCard.Title>
                  ) : null}
                  {mobileChartDescription ? (
                    <AppCard.Description>{mobileChartDescription}</AppCard.Description>
                  ) : null}
                </div>
              )}
              <div className="flex w-full items-center justify-between gap-2">
                <FlowToggle value={flowTab} onChange={setFlowTab} className="w-auto shrink-0" />
                <div className="flex min-w-0 shrink justify-end">
                  <FlowRangeGranularityTabs
                    activeRange={activeRange}
                    setActiveRange={setActiveRange}
                    rangeOptions={rangeOptions}
                  />
                </div>
              </div>
              <div className="flex w-full items-center justify-center gap-2">
                <FlowPeriodNavigation
                  rangeLabel={rangeLabel}
                  onPrev={onPrev}
                  onNext={onNext}
                  onReset={onReset}
                />
                {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
              </div>
            </div>
          ) : null}
          <div
            className={cn(
              "relative flex min-h-[44px] w-full flex-col gap-3 sm:min-h-[40px] md:block md:min-h-[44px]",
              stackedMobileHeader && "hidden sm:block",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2 md:pointer-events-none md:absolute md:left-0 md:right-0 md:top-1/2 md:z-[1] md:-translate-y-1/2">
              <div className="md:pointer-events-auto">
                <FlowRangeGranularityTabs
                  activeRange={activeRange}
                  setActiveRange={setActiveRange}
                  rangeOptions={rangeOptions}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2 md:pointer-events-auto">
                <div className="hidden md:contents">{headerActions}</div>
                <FlowToggle value={flowTab} onChange={setFlowTab} className="w-auto" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center md:pointer-events-none md:absolute md:left-1/2 md:top-1/2 md:z-[2] md:-translate-x-1/2 md:-translate-y-1/2">
              <div className="flex items-center justify-center gap-2 md:pointer-events-auto">
                <FlowPeriodNavigation
                  rangeLabel={rangeLabel}
                  onPrev={onPrev}
                  onNext={onNext}
                  onReset={onReset}
                />
                {headerActions ? <div className="shrink-0 md:hidden">{headerActions}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      <ContentSection>
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

      {cardsSection ? <ContentSection className="mb-0 md:mb-0">{cardsSection}</ContentSection> : null}
    </PageContainer>
  );
}
