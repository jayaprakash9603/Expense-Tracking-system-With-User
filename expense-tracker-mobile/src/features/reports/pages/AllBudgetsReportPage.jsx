import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AnalyticsReportHeader } from "@/features/reports/components/AnalyticsReportHeader";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { AppCard } from "@/shared/components/display/AppCard";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { useFilteredBudgetsReport } from "@/features/reports/hooks/useFilteredBudgetsReport";
import { AllBudgetsReportCharts } from "@/features/reports/components/budget/AllBudgetsReportCharts";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Wallet, PieChart, TrendingDown, BarChart3 } from "lucide-react";

export function AllBudgetsReportPage() {
  const { friendId } = useParams();
  const { t } = useLanguage();
  const report = useFilteredBudgetsReport({ targetId: friendId || "" });

  const summaryCards = useMemo(() => {
    const s = report.summary || {};
    const budgets = report.budgetsData || [];
    const n = budgets.length;
    const totalSpent = Number(s.totalLoss ?? s.totalSpent ?? 0);
    const avgPerBudget = n > 0 ? totalSpent / n : 0;
    const catCount = report.categoryBreakdown?.length ?? 0;
    return [
          {
        title: t("reports.budgetsCount"),
        value: String(n),
        icon: Wallet,
        variant: "blue",
      },
      {
        title: t("reports.totalSpent"),
        rawAmount: totalSpent,
        icon: TrendingDown,
        variant: "purple",
      },
      {
        title: t("reports.categoriesTracked"),
        value: String(catCount),
        icon: PieChart,
        variant: "amber",
      },
      {
        title: t("reports.avgSpentPerBudget"),
        rawAmount: avgPerBudget,
        icon: BarChart3,
        variant: "rose",
      },
    ];
  }, [report.summary, report.budgetsData, report.categoryBreakdown, t]);

  if (report.loading) {
    return (
      <PageContainer maxWidth="full" className="pb-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <AnalyticsReportHeader
        title={t("reports.allBudgetsTitle")}
        subtitle={t("reports.allBudgetsSubtitle")}
        titleIcon={Wallet}
        iconShellClassName="bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
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

      <div className="mb-6 space-y-6">
        <SummaryCardGrid>
          {summaryCards.map((c) => (
            <SummaryCard
              key={c.title}
              title={c.title}
              rawAmount={c.rawAmount !== undefined ? c.rawAmount : undefined}
              value={c.value !== undefined ? c.value : c.display}
              icon={c.icon}
              variant={c.variant}
            />
          ))}
        </SummaryCardGrid>

        <AllBudgetsReportCharts
          categoryBreakdown={report.categoryBreakdown}
          paymentMethodBreakdown={report.paymentMethodBreakdown}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{t("reports.budgetBreakdown")}</h3>
          <div className="space-y-2">
            {(report.budgetsData || []).map((b) => (
              <AppCard key={b.budgetId ?? b.name}>
                <AppCard.Content className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{b.budgetName || b.name}</span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {t("reports.spent")}: {b.totalLoss ?? b.amount ?? 0}
                  </span>
                </AppCard.Content>
              </AppCard>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default AllBudgetsReportPage;
