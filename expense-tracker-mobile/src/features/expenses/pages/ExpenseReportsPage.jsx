import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ExpenseReportHeader } from "@/features/expenses/components/reports/ExpenseReportHeader";
import { ExpenseReportContent } from "@/features/expenses/components/reports/ExpenseReportContent";
import { ExpenseReportErrorBanner } from "@/features/expenses/components/reports/ExpenseReportErrorBanner";
import { useExpenseReportsPageController } from "@/features/expenses/hooks/useExpenseReportsPageController";

export function ExpenseReportsPage() {
  const {
    dates,
    viewFilters,
    setViewFilters,
    dailyTimeframe,
    setDailyTimeframe,
    dailyFlowType,
    setDailyFlowType,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    paymentTimeframe,
    setPaymentTimeframe,
    paymentFlowType,
    setPaymentFlowType,
    api,
    handleHeaderTimeframeChange,
    handleHeaderFlowChange,
    handleExport,
  } = useExpenseReportsPageController();

  const {
    initialLoading,
    dailyRefreshing,
    categoryRefreshing,
    paymentRefreshing,
    error,
    reportCards,
    dailySpending,
    category,
    payment,
    groupedCashflowRaw,
    categoryRaw,
    paymentRaw,
  } = api;

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <ExpenseReportHeader
        dateRangeProps={dates.dateRangeProps}
        isCustomRangeActive={dates.isCustomRange}
        flowType={dailyFlowType}
        onFlowTypeChange={handleHeaderFlowChange}
        timeframe={dailyTimeframe}
        onTimeframeChange={handleHeaderTimeframeChange}
        onExport={handleExport}
        viewFilters={viewFilters}
        onViewFiltersChange={setViewFilters}
      />
      <ExpenseReportErrorBanner error={error} />
      <ExpenseReportContent
        initialLoading={initialLoading}
        dailyRefreshing={dailyRefreshing}
        categoryRefreshing={categoryRefreshing}
        paymentRefreshing={paymentRefreshing}
        reportCards={reportCards}
        dailySpending={dailySpending}
        category={category}
        payment={payment}
        groupedCashflowRaw={groupedCashflowRaw}
        categoryRaw={categoryRaw}
        paymentRaw={paymentRaw}
        viewFilters={viewFilters}
        dailyTimeframe={dailyTimeframe}
        onDailyTimeframeChange={setDailyTimeframe}
        dailyFlowType={dailyFlowType}
        onDailyFlowTypeChange={setDailyFlowType}
        categoryTimeframe={categoryTimeframe}
        onCategoryTimeframeChange={setCategoryTimeframe}
        categoryFlowType={categoryFlowType}
        onCategoryFlowTypeChange={setCategoryFlowType}
        paymentTimeframe={paymentTimeframe}
        onPaymentTimeframeChange={setPaymentTimeframe}
        paymentFlowType={paymentFlowType}
        onPaymentFlowTypeChange={setPaymentFlowType}
      />
    </PageContainer>
  );
}

export default ExpenseReportsPage;
