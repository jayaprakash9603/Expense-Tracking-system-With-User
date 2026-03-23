import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AnalyticsReportHeader } from "@/features/reports/components/AnalyticsReportHeader";
import { CategoryReportCharts } from "@/features/reports/components/charts/CategoryReportCharts";
import { ReportSpendingAreaChart } from "@/features/reports/components/charts/ReportSpendingAreaChart";
import { ExpenseReportSummaryCards } from "@/features/expenses/components/reports/ExpenseReportSummaryCards";
import { ExpenseReportErrorBanner } from "@/features/expenses/components/reports/ExpenseReportErrorBanner";
import { ExpenseReportContentLoading } from "@/features/expenses/components/reports/ExpenseReportContentLoading";
import { useExpenseStyleReportPage } from "@/features/reports/hooks/useExpenseStyleReportPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Layers } from "lucide-react";

export function CategoryReportPage() {
  const { t } = useLanguage();
  const {
    dates,
    timeframe,
    flowType,
    handleHeaderTimeframeChange,
    handleHeaderFlowChange,
    handleExport,
    onRefresh,
    api,
    c,
    displayDaily,
    tooltipSelectedType,
    areaKeys,
    displayCategory,
    dailyRefreshing,
    categoryRefreshing,
  } = useExpenseStyleReportPage();

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <AnalyticsReportHeader
        title={t("reports.categoryReportTitle")}
        subtitle={t("reports.categoryReportSubtitle")}
        titleIcon={Layers}
        iconShellClassName="bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
        timeframe={timeframe}
        flowType={flowType}
        onTimeframeChange={handleHeaderTimeframeChange}
        onFlowTypeChange={handleHeaderFlowChange}
        dateRangeProps={dates.dateRangeProps}
        enableDateRangeBadge
        isCustomRangeActive={dates.isCustomRange}
        onRefresh={onRefresh}
        showExportButton
        onExport={handleExport}
      />
      {api.initialLoading ? (
        <ExpenseReportContentLoading />
      ) : (
        <>
          <ExpenseReportErrorBanner error={api.error} />
          <div className="mb-6 space-y-6">
            <ExpenseReportSummaryCards reportCards={c} />
            <ReportSpendingAreaChart
              displayDaily={displayDaily}
              areaKeys={areaKeys}
              tooltipSelectedType={tooltipSelectedType}
              dailyRefreshing={dailyRefreshing}
              dailyBreakdownMode="category"
            />
            <CategoryReportCharts category={displayCategory} categoryRefreshing={categoryRefreshing} />
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default CategoryReportPage;
