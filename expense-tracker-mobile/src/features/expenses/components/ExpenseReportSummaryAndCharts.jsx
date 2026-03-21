import React from "react";
import { Wallet, Trophy, BarChart3, Hash } from "lucide-react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import {
  DASHBOARD_AREA_CHART_HEIGHT,
  DASHBOARD_PIE_HEIGHT,
  DASHBOARD_PIE_INNER_RADIUS,
  DASHBOARD_PIE_OUTER_RADIUS,
} from "@/shared/constants/dashboardChartHeights";
import { SpendingChartTooltip } from "@/shared/components/charts/dashboard/SpendingChartTooltip";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { CONTROL_TF_CLASS, REPORT_AREA_MARGIN, reportFlowToLossGain } from "./expenseReportContentConstants";

export function ExpenseReportSummaryAndCharts({
  reportCards,
  displayDaily,
  displayCategory,
  displayPayment,
  areaKeys,
  tooltipSelectedType,
  tagline,
  dailyRefreshing,
  categoryRefreshing,
  paymentRefreshing,
  dailyFlowType,
  onDailyFlowTypeChange,
  dailyTimeframe,
  onDailyTimeframeChange,
  categoryFlowType,
  onCategoryFlowTypeChange,
  categoryTimeframe,
  onCategoryTimeframeChange,
  paymentFlowType,
  onPaymentFlowTypeChange,
  paymentTimeframe,
  onPaymentTimeframeChange,
}) {
  const { t } = useLanguage();
  const c = reportCards;

  return (
    <>
      <SummaryCardGrid>
        <SummaryCard
          title={t("reports.expenseReportCards.totalSpending")}
          rawAmount={c.totalSpending.rawAmount}
          percentage={c.totalSpending.percentage}
          trendDirection={c.totalSpending.trendDirection}
          sparklineData={c.totalSpending.sparklineData}
          icon={Wallet}
          variant="blue"
        />
        <SummaryCard
          title={t("reports.expenseReportCards.topExpenseName")}
          value={c.topExpense.value}
          percentage={c.topExpense.percentage}
          trendDirection={c.topExpense.trendDirection}
          sparklineData={c.topExpense.sparklineData}
          icon={Trophy}
          variant="purple"
        />
        <SummaryCard
          title={t("reports.expenseReportCards.avgTransaction")}
          rawAmount={c.avgTransaction.rawAmount}
          percentage={c.avgTransaction.percentage}
          trendDirection={c.avgTransaction.trendDirection}
          sparklineData={c.avgTransaction.sparklineData}
          icon={BarChart3}
          variant="amber"
        />
        <SummaryCard
          title={t("reports.expenseReportCards.totalTransactions")}
          value={c.totalTransactions.value}
          percentage={c.totalTransactions.percentage}
          trendDirection={c.totalTransactions.trendDirection}
          sparklineData={c.totalTransactions.sparklineData}
          icon={Hash}
          variant="rose"
        />
      </SummaryCardGrid>

      <ChartCard
        fillHeight
        stackActionsBelowTitleOnSmall
        title={t("dashboard.spendingTrend")}
        description={tagline}
        className={cn("w-full min-w-0 transition-opacity", dailyRefreshing && "opacity-60")}
        actions={
          <>
            <ChartTypeToggle
              options={SPENDING_FLOW_OPTIONS}
              value={reportFlowToLossGain(dailyFlowType)}
              onChange={(id) => onDailyFlowTypeChange(id === "loss" ? "outflow" : "inflow")}
            />
            <TimeframeSelector
              value={dailyTimeframe}
              onChange={onDailyTimeframeChange}
              className={CONTROL_TF_CLASS}
            />
          </>
        }
      >
        <div className="pt-2 pb-4 pl-0 pr-1 sm:px-0.5">
          <AppAreaChart
            data={displayDaily.data}
            config={displayDaily.config}
            dataKeys={areaKeys}
            xAxisKey="date"
            height={DASHBOARD_AREA_CHART_HEIGHT}
            showLegend={false}
            margin={REPORT_AREA_MARGIN}
            customTooltip={<SpendingChartTooltip selectedType={tooltipSelectedType} />}
          />
        </div>
      </ChartCard>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 [&>*]:min-w-0">
        <ChartCard
          fillHeight
          stackActionsBelowTitleOnSmall
          title={t("dashboard.categoryBreakdown")}
          description={tagline}
          className={cn("w-full min-w-0 transition-opacity", categoryRefreshing && "opacity-60")}
          actions={
            <>
              <ChartTypeToggle
                options={SPENDING_FLOW_OPTIONS}
                value={reportFlowToLossGain(categoryFlowType)}
                onChange={(id) => onCategoryFlowTypeChange(id === "loss" ? "outflow" : "inflow")}
              />
              <TimeframeSelector
                value={categoryTimeframe}
                onChange={onCategoryTimeframeChange}
                className={CONTROL_TF_CLASS}
              />
            </>
          }
        >
          <AppPieChart
            data={displayCategory.data}
            config={displayCategory.config}
            donut
            innerRadius={DASHBOARD_PIE_INNER_RADIUS}
            outerRadius={DASHBOARD_PIE_OUTER_RADIUS}
            height={DASHBOARD_PIE_HEIGHT}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          fillHeight
          stackActionsBelowTitleOnSmall
          title={t("dashboard.paymentMethods")}
          description={tagline}
          className={cn("w-full min-w-0 transition-opacity", paymentRefreshing && "opacity-60")}
          actions={
            <>
              <ChartTypeToggle
                options={SPENDING_FLOW_OPTIONS}
                value={reportFlowToLossGain(paymentFlowType)}
                onChange={(id) => onPaymentFlowTypeChange(id === "loss" ? "outflow" : "inflow")}
              />
              <TimeframeSelector
                value={paymentTimeframe}
                onChange={onPaymentTimeframeChange}
                className={CONTROL_TF_CLASS}
              />
            </>
          }
        >
          <AppPieChart
            data={displayPayment.data}
            config={displayPayment.config}
            donut
            innerRadius={DASHBOARD_PIE_INNER_RADIUS}
            outerRadius={DASHBOARD_PIE_OUTER_RADIUS}
            height={DASHBOARD_PIE_HEIGHT}
            className="w-full"
          />
        </ChartCard>
      </div>
    </>
  );
}
