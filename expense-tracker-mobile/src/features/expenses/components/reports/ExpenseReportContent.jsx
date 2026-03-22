import React from "react";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";
import { useStandardExpenseColumns } from "@/features/expenses/hooks/list/useStandardExpenseColumns";
import { useExpenseReportContentModels } from "@/features/expenses/hooks/reports/useExpenseReportContentModels";
import { ExpenseReportContentLoading } from "./ExpenseReportContentLoading";
import { ExpenseReportSummaryAndCharts } from "./ExpenseReportSummaryAndCharts";
import { ExpenseReportGroupedPanel } from "./ExpenseReportGroupedPanel";
import { ExpenseReportSubtitle } from "./ExpenseReportSubtitle";

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
  const {
    c,
    areaKeys,
    displayCategory,
    displayPayment,
    displayDaily,
    tooltipSelectedType,
    groupedReportViewMode,
    setGroupedReportViewMode,
    selectedGlobalIds,
    setSelectedGlobalIds,
    accordionGroups,
    accordionSectionTitleKey,
  } = useExpenseReportContentModels({
    reportCards,
    dailySpending,
    category,
    payment,
    groupedCashflowRaw,
    categoryRaw,
    paymentRaw,
    viewFilters,
    dailyFlowType,
  });

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
        tagline={<ExpenseReportSubtitle />}
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
