import React, { useState } from "react";
import { FileText, Filter } from "lucide-react";
import { ReportHeroTitleBlock } from "@/shared/components/report/ReportHeroTitleBlock";
import { ReportHeroHeader } from "@/shared/components/report/ReportHeroHeader";
import { ReportHeroDateRangeSlot, REPORT_HERO_DATE_BADGE_CLASS } from "@/shared/components/report/ReportHeroDateRangeSlot";
import { ExpenseReportHeaderToolbar } from "@/features/expenses/components/reports/ExpenseReportHeaderToolbar";
import { ExpenseReportHeaderFilters } from "@/features/expenses/components/filters/ExpenseReportHeaderFilters";
import { ExpenseReportFilterSheet } from "@/features/expenses/components/filters/ExpenseReportFilterSheet";
import { ExpenseReportExportMenu } from "@/features/expenses/components/export/ExpenseReportExportMenu";
import { ExpenseReportAdvancedFilters } from "@/features/expenses/components/filters/ExpenseReportAdvancedFilters";
import { useExpenseReportHeaderFilters } from "@/features/expenses/hooks/reports/useExpenseReportHeaderFilters";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";

function isViewFilterActive(vf) {
  if (!vf) return false;
  return (
    vf.categoryTop !== "all" ||
    vf.categoryGroupBelow !== "0" ||
    vf.paymentTop !== "all" ||
    vf.paymentGroupBelow !== "0" ||
    vf.trendMinAmount !== "0"
  );
}

export function ExpenseReportHeader({
  dateRangeProps,
  isCustomRangeActive = false,
  flowType,
  onFlowTypeChange,
  timeframe,
  onTimeframeChange,
  onExport,
  viewFilters = DEFAULT_EXPENSE_REPORT_VIEW_FILTERS,
  onViewFiltersChange = () => {},
  className,
}) {
  const { t } = useLanguage();
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    flowOpts,
    timeframeOpts,
    timeframeSelectValue,
    shouldShowTimeframePlaceholder,
    isFilterActive: baseFilterActive,
  } = useExpenseReportHeaderFilters(t, timeframe, isCustomRangeActive);

  const isFilterActive = baseFilterActive || isViewFilterActive(viewFilters);

  const filterFieldProps = {
    flowOpts,
    timeframeOpts,
    flowType,
    onFlowTypeChange,
    timeframeSelectValue,
    onTimeframeChange,
    shouldShowTimeframePlaceholder,
    flowPlaceholder: t("report.flowType"),
    timeframePlaceholder: t("report.timeframe"),
    selectOptionLabel: t("reports.selectTimeframe"),
  };

  const filterControls = <ExpenseReportHeaderFilters {...filterFieldProps} />;

  const titleSlot = (
    <ReportHeroTitleBlock
      title={t("reports.expenseReportsTitle")}
      subtitle={t("reports.expenseReportsSubtitle")}
      icon={FileText}
    />
  );

  const centerSlot = (
    <ReportHeroDateRangeSlot
      dateRangeProps={dateRangeProps}
      isCustomRangeActive={isCustomRangeActive}
      badgeClassName={REPORT_HERO_DATE_BADGE_CLASS}
      showCalendarIcon={false}
    />
  );

  const filterIconButton = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-9 w-9 shrink-0",
        isFilterActive && "border-primary/50 ring-2 ring-primary/20",
      )}
      onClick={() => setFilterOpen(true)}
      aria-label={t("report.filterData")}
    >
      <Filter className="h-4 w-4" />
    </Button>
  );

  const mobileFooterSlot = (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="min-w-0 flex-1">
        <ExpenseReportHeaderFilters {...filterFieldProps} variant="inline" />
      </div>
      {filterIconButton}
    </div>
  );

  const desktopEndSlot = (
    <ExpenseReportHeaderToolbar filterControls={filterControls} onExport={onExport} />
  );

  const mobileTopEndSlot = (
    <ExpenseReportExportMenu
      onExport={onExport}
      exportLabel={t("report.exportCsv")}
      moreLabel={t("report.moreActions")}
    />
  );

  return (
    <>
      <ReportHeroHeader
        className={className}
        titleSlot={titleSlot}
        centerSlot={centerSlot}
        desktopEndSlot={desktopEndSlot}
        mobileTopEndSlot={mobileTopEndSlot}
        mobileFooterSlot={mobileFooterSlot}
      />

      <ExpenseReportFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title={t("report.filterData")}
        description={t("reports.expenseReportsFilterSheetDescription")}
        doneLabel={t("common.done")}
      >
        <div className="flex flex-col gap-4">
          {filterControls}
          <Separator />
          <ExpenseReportAdvancedFilters value={viewFilters} onChange={onViewFiltersChange} />
        </div>
      </ExpenseReportFilterSheet>
    </>
  );
}

export default ExpenseReportHeader;
