import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AnalyticsReportHeader } from "@/features/reports/components/AnalyticsReportHeader";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";
import { useBillReportData } from "@/features/reports/hooks/useBillReportData";
import { BillReportCharts } from "@/features/reports/components/bills/BillReportCharts";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useGroupedExpenseTableColumns } from "@/shared/hooks/data/useGroupedExpenseTableColumns";
import { Receipt, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

export function BillReportPage() {
  const { friendId } = useParams();
  const { t } = useLanguage();
  const report = useBillReportData({ targetId: friendId || "" });
  const columnDefs = useMemo(
    () => [
      {
        key: "date",
        label: t("expenses.columns.date"),
        value: (row) => row.date,
        sortable: true,
      },
      {
        key: "name",
        label: t("expenses.columns.name"),
        value: (row) => row.name,
        sortable: true,
      },
      {
        key: "amount",
        label: t("reports.chartMetric.amount"),
        value: (row) => row.amount,
        sortable: true,
      },
      {
        key: "type",
        label: t("reports.flow.all"),
        value: (row) => row.type,
      },
    ],
    [t],
  );
  const columns = useGroupedExpenseTableColumns(columnDefs);

  const net = report.totalGain - report.totalLoss;

  const summaryCards = useMemo(
    () => [
      {
        title: t("reports.billsInRange"),
        value: String(report.billCount),
        icon: Receipt,
        variant: "blue",
      },
      {
        title: t("reports.totalExpenseBills"),
        rawAmount: report.totalLoss,
        icon: TrendingDown,
        variant: "purple",
      },
      {
        title: t("reports.totalIncomeBills"),
        rawAmount: report.totalGain,
        icon: TrendingUp,
        variant: "emerald",
      },
      {
        title: t("reports.billReportNet"),
        rawAmount: net,
        icon: BarChart3,
        variant: "rose",
      },
    ],
    [report.billCount, report.totalLoss, report.totalGain, net, t],
  );

  if (report.loading && !report.rawFiltered?.length) {
    return (
      <PageContainer maxWidth="full" className="pb-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <AnalyticsReportHeader
        title={t("reports.billReportTitle")}
        subtitle={t("reports.billReportSubtitle")}
        titleIcon={Receipt}
        iconShellClassName="bg-amber-500/12 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
        timeframe={report.timeframe}
        flowType={report.flowType}
        onTimeframeChange={report.setTimeframe}
        onFlowTypeChange={report.setFlowType}
        dateRangeProps={{
          fromDate: report.dateRange?.fromDate,
          toDate: report.dateRange?.toDate,
          onApply: report.setCustomDateRange,
          onReset: report.resetDateRange,
        }}
        enableDateRangeBadge
        isCustomRangeActive={report.isCustomRange}
        onRefresh={report.refresh}
      />
      {report.error ? <p className="text-sm text-destructive">{report.error}</p> : null}
      <p className="text-xs text-muted-foreground mb-4">{report.rangeLabel}</p>
      <div className="mb-6 space-y-6">
        <SummaryCardGrid>
          {summaryCards.map((c) => (
            <SummaryCard
              key={c.title}
              title={c.title}
              rawAmount={c.rawAmount}
              value={c.value}
              icon={c.icon}
              variant={c.variant}
            />
          ))}
        </SummaryCardGrid>
        <BillReportCharts
          categoryData={report.categoryData}
          paymentData={report.paymentData}
          displayDaily={report.displayDaily}
          flowType={report.flowType}
        />
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("reports.billDetailsTable")}</h3>
          <EnhancedDataTable columns={columns} data={report.filteredBills} defaultPageSize={5} searchable />
        </div>
      </div>
    </PageContainer>
  );
}

export default BillReportPage;
