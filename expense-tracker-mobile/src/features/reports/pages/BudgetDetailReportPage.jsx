import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { AnalyticsReportHeader } from "@/features/reports/components/AnalyticsReportHeader";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { useSingleBudgetDetailedReport } from "@/features/reports/hooks/useSingleBudgetDetailedReport";
import { BudgetDetailReportBody } from "@/features/reports/components/budget/BudgetDetailReportBody";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { BUDGET_DETAIL_TIMEFRAMES } from "@/shared/constants/reportFilters";
import { PiggyBank } from "lucide-react";

export function BudgetDetailReportPage() {
  const { budgetId, id, friendId } = useParams();
  const resolvedId = budgetId || id;
  const { t } = useLanguage();
  const [timeFrame, setTimeFrame] = useState("month");
  const [flowType, setFlowType] = useState("all");
  const [customRange, setCustomRange] = useState(null);

  const report = useSingleBudgetDetailedReport(
    resolvedId,
    timeFrame,
    flowType,
    customRange,
    friendId || "",
  );

  const dateRangeProps = useMemo(() => {
    if (!customRange?.fromDate || !customRange?.toDate) return undefined;
    return {
      fromDate: customRange.fromDate,
      toDate: customRange.toDate,
      onApply: (range) => {
        if (range?.fromDate && range?.toDate) {
          setCustomRange({
            fromDate: range.fromDate.slice(0, 10),
            toDate: range.toDate.slice(0, 10),
          });
        }
      },
      onReset: () => setCustomRange(null),
    };
  }, [customRange]);

  if (!resolvedId) {
    return (
      <PageContainer maxWidth="full" className="pb-8">
        <p className="text-sm text-muted-foreground">{t("reports.budgetDetail.missingId")}</p>
      </PageContainer>
    );
  }

  if (report.loading && !report.budgetData) {
    return (
      <PageContainer maxWidth="full" className="pb-8">
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" className="pb-8">
      <AnalyticsReportHeader
        title={t("reports.budgetDetail.title")}
        subtitle={t("reports.budgetDetail.subtitle")}
        titleIcon={PiggyBank}
        iconShellClassName="bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        timeframe={timeFrame}
        flowType={flowType}
        onTimeframeChange={(v) => {
          setTimeFrame(v);
          setCustomRange(null);
        }}
        onFlowTypeChange={setFlowType}
        timeframeOptions={BUDGET_DETAIL_TIMEFRAMES}
        dateRangeProps={dateRangeProps}
        enableDateRangeBadge
        isCustomRangeActive={Boolean(customRange)}
        onRefresh={report.refetch}
      />
      {report.error ? <p className="text-sm text-destructive">{report.error}</p> : null}
      {report.budgetData ? (
        <BudgetDetailReportBody
          rawData={report.rawData}
          categoryBreakdown={report.budgetData.categoryBreakdown}
          paymentBreakdown={report.budgetData.paymentMethodBreakdown}
        />
      ) : null}
    </PageContainer>
  );
}

export default BudgetDetailReportPage;
