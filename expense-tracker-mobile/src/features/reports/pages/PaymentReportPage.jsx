import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AnalyticsReportHeader } from "@/features/reports/components/AnalyticsReportHeader";
import { PaymentReportCharts } from "@/features/reports/components/charts/PaymentReportCharts";
import { ReportSpendingAreaChart } from "@/features/reports/components/charts/ReportSpendingAreaChart";
import { ExpenseReportSummaryCards } from "@/features/expenses/components/reports/ExpenseReportSummaryCards";
import { ExpenseReportErrorBanner } from "@/features/expenses/components/reports/ExpenseReportErrorBanner";
import { ExpenseReportContentLoading } from "@/features/expenses/components/reports/ExpenseReportContentLoading";
import { useExpenseStyleReportPage } from "@/features/reports/hooks/useExpenseStyleReportPage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { CreditCard } from "lucide-react";

export function PaymentReportPage() {
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
    displayPayment,
    dailyRefreshing,
    paymentRefreshing,
  } = useExpenseStyleReportPage();

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <AnalyticsReportHeader
        title={t("reports.paymentReportTitle")}
        subtitle={t("reports.paymentReportSubtitle")}
        titleIcon={CreditCard}
        iconShellClassName="bg-cyan-500/12 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300"
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
              dailyBreakdownMode="payment"
            />
            <PaymentReportCharts displayPayment={displayPayment} paymentRefreshing={paymentRefreshing} />
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default PaymentReportPage;
