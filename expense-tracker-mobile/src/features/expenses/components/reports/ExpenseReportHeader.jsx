import React, { useState } from "react";
import { FileText, Filter } from "lucide-react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { ReportHeaderCenter } from "@/shared/components/report/ReportHeaderCenter";
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

const BADGE_CLASS =
  "max-w-[min(100%,15rem)] border-primary/45 bg-primary/[0.07] shadow-sm hover:bg-primary/10 sm:max-w-[min(100%,20rem)] justify-center";

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

  const titleBlock = (
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:max-w-[min(100%,24rem)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300 sm:h-10 sm:w-10">
        <AppIcon icon={FileText} size="md" color="inherit" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-base font-bold leading-tight text-primary md:text-lg">
          {t("reports.expenseReportsTitle")}
        </h1>
        <span className="text-xs leading-snug text-muted-foreground text-balance">
          {t("reports.expenseReportsSubtitle")}
        </span>
      </div>
    </div>
  );

  const dateRangeBlock = (
    <div className="min-w-0 w-full lg:w-auto lg:shrink-0">
      <ReportHeaderCenter
        enableDateRangeBadge
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={isCustomRangeActive}
        badgeClassName={BADGE_CLASS}
        showCalendarIcon={false}
      />
    </div>
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

  return (
    <div
      className={cn(
        "sticky top-0 z-20 mb-6 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5 backdrop-blur-sm md:px-4 md:py-3",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex min-w-0 items-start justify-between gap-2">
          {titleBlock}
          <ExpenseReportExportMenu
            onExport={onExport}
            exportLabel={t("report.exportCsv")}
            moreLabel={t("report.moreActions")}
          />
        </div>
        {dateRangeBlock}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <ExpenseReportHeaderFilters {...filterFieldProps} variant="inline" />
          </div>
          {filterIconButton}
        </div>
      </div>

      <div className="hidden min-w-0 flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-4 lg:gap-y-2">
        {titleBlock}
        <div className="flex w-full min-w-0 flex-1 flex-wrap items-center justify-center gap-2 lg:justify-center">
          {dateRangeBlock}
        </div>
        <ExpenseReportHeaderToolbar filterControls={filterControls} onExport={onExport} />
      </div>

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
    </div>
  );
}

export default ExpenseReportHeader;
