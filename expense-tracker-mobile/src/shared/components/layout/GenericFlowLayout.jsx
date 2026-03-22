import React from "react";
import { RangePeriodNavigator } from "@/shared/components/navigation/RangePeriodNavigator";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function GenericFlowLayout({
  rangeTypes = [],
  activeRange,
  setActiveRange,
  offset = 0,
  onPrev,
  onNext,
  rangeLabel,
  showBackButton = false,
  onBackNavigate,
  loading = false,
  chartSlot,
  toolbarSlot,
  contentSlot,
  actionSlot,
  emptyMessage,
  emptySubMessage,
  className,
}) {
  const { isMobile, isTablet } = useLayout();
  const { t } = useLanguage();

  return (
    <PageContainer className={cn("space-y-4", className)}>
      {actionSlot && (
        <div className="flex justify-end gap-2">
          {actionSlot}
        </div>
      )}

      <RangePeriodNavigator
        showBackButton={showBackButton}
        onBackNavigate={onBackNavigate}
        rangeTypes={rangeTypes}
        activeRange={activeRange}
        setActiveRange={setActiveRange}
        offset={offset}
        handleBack={onPrev}
        handleNext={onNext}
        rangeLabel={rangeLabel}
      />

      {chartSlot && (
        <div
          className={cn(
            "w-full rounded-lg bg-card p-4",
            isMobile ? "h-[8.75rem]" : isTablet ? "h-[11.25rem]" : "h-[15rem]"
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            chartSlot
          )}
        </div>
      )}

      {toolbarSlot}

      {!loading && !contentSlot && (
        <NoDataPlaceholder
          message={emptyMessage || t("common.noData") || "No data available"}
          subMessage={emptySubMessage}
          size={isMobile ? "md" : "lg"}
          fullWidth
        />
      )}

      {contentSlot}
    </PageContainer>
  );
}

export default GenericFlowLayout;
