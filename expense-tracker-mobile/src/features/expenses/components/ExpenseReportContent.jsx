import React, { useMemo, useState } from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { refineAreaChartModel, refinePieChartModel } from "@/features/expenses/utils/expenseReportViewFilters";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";
import {
  GROUPED_REPORT_VIEW_MODE,
  resolveGroupedReportGroups,
} from "@/shared/components/report/grouped-report-accordion";
import { useStandardExpenseColumns } from "@/features/expenses/hooks/useStandardExpenseColumns";
import { EMPTY_CARDS } from "./expenseReportContentConstants";
import { ExpenseReportContentLoading } from "./ExpenseReportContentLoading";
import { ExpenseReportSummaryAndCharts } from "./ExpenseReportSummaryAndCharts";
import { ExpenseReportGroupedPanel } from "./ExpenseReportGroupedPanel";

export function ExpenseReportContent({
  initialLoading,
  dailyRefreshing,
  categoryRefreshing,
  paymentRefreshing,
  reportCards,
  dailySpending,
  category,
  payment,
  groupedCashflowRaw,
  categoryRaw,
  paymentRaw,
  viewFilters = DEFAULT_EXPENSE_REPORT_VIEW_FILTERS,
  dailyTimeframe,
  onDailyTimeframeChange,
  dailyFlowType,
  onDailyFlowTypeChange,
  categoryTimeframe,
  onCategoryTimeframeChange,
  categoryFlowType,
  onCategoryFlowTypeChange,
  paymentTimeframe,
  onPaymentTimeframeChange,
  paymentFlowType,
  onPaymentFlowTypeChange,
}) {
  const { t } = useLanguage();
  const [groupedReportViewMode, setGroupedReportViewMode] = useState(GROUPED_REPORT_VIEW_MODE.expenseName);
  const [selectedGlobalIds, setSelectedGlobalIds] = useState([]);
  const c = reportCards || EMPTY_CARDS;
  const areaKeys = dailySpending?.dataKeys?.length ? dailySpending.dataKeys : ["expense"];

  const displayCategory = useMemo(
    () =>
      refinePieChartModel(category, {
        topMode: viewFilters?.categoryTop ?? "all",
        groupBelowPercent: Number(viewFilters?.categoryGroupBelow) || 0,
        otherLabel: t("reports.otherSlice"),
      }),
    [category, viewFilters?.categoryTop, viewFilters?.categoryGroupBelow, t],
  );

  const displayPayment = useMemo(
    () =>
      refinePieChartModel(payment, {
        topMode: viewFilters?.paymentTop ?? "all",
        groupBelowPercent: Number(viewFilters?.paymentGroupBelow) || 0,
        otherLabel: t("reports.otherSlice"),
      }),
    [payment, viewFilters?.paymentTop, viewFilters?.paymentGroupBelow, t],
  );

  const displayDaily = useMemo(
    () =>
      refineAreaChartModel(dailySpending, {
        minDailyAmount: Number(viewFilters?.trendMinAmount) || 0,
      }),
    [dailySpending, viewFilters?.trendMinAmount],
  );

  const tooltipSelectedType = dailyFlowType === "inflow" ? "gain" : "loss";

  const tagline = (
    <span className="text-[11px] leading-snug text-muted-foreground md:text-xs">{t("reports.expenseReportsSubtitle")}</span>
  );

  const accordionGroups = useMemo(
    () =>
      resolveGroupedReportGroups(groupedReportViewMode, {
        groupedCashflowRaw,
        categoryRaw,
        paymentRaw,
      }),
    [groupedReportViewMode, groupedCashflowRaw, categoryRaw, paymentRaw],
  );

  const accordionSectionTitleKey = useMemo(() => {
    if (groupedReportViewMode === GROUPED_REPORT_VIEW_MODE.category) return "reports.categoryAmounts";
    if (groupedReportViewMode === GROUPED_REPORT_VIEW_MODE.paymentMethod) return "reports.paymentAmounts";
    return "reports.expenseAmounts";
  }, [groupedReportViewMode]);

  const columns = useStandardExpenseColumns({ includeNet: false, includeCredit: true });

  if (initialLoading) {
    return <ExpenseReportContentLoading />;
  }

  return (
    <div className="w-full max-w-full space-y-6">
      <ExpenseReportSummaryAndCharts
        reportCards={c}
        displayDaily={displayDaily}
        displayCategory={displayCategory}
        displayPayment={displayPayment}
        areaKeys={areaKeys}
        tooltipSelectedType={tooltipSelectedType}
        tagline={tagline}
        dailyRefreshing={dailyRefreshing}
        categoryRefreshing={categoryRefreshing}
        paymentRefreshing={paymentRefreshing}
        dailyFlowType={dailyFlowType}
        onDailyFlowTypeChange={onDailyFlowTypeChange}
        dailyTimeframe={dailyTimeframe}
        onDailyTimeframeChange={onDailyTimeframeChange}
        categoryFlowType={categoryFlowType}
        onCategoryFlowTypeChange={onCategoryFlowTypeChange}
        categoryTimeframe={categoryTimeframe}
        onCategoryTimeframeChange={onCategoryTimeframeChange}
        paymentFlowType={paymentFlowType}
        onPaymentFlowTypeChange={onPaymentFlowTypeChange}
        paymentTimeframe={paymentTimeframe}
        onPaymentTimeframeChange={onPaymentTimeframeChange}
      />
      <ExpenseReportGroupedPanel
        groupedReportViewMode={groupedReportViewMode}
        onGroupedReportViewModeChange={setGroupedReportViewMode}
        accordionSectionTitleKey={accordionSectionTitleKey}
        accordionGroups={accordionGroups}
        columns={columns}
        selectedGlobalIds={selectedGlobalIds}
        onSelectedGlobalIdsChange={setSelectedGlobalIds}
      />
    </div>
  );
}

export default ExpenseReportContent;
