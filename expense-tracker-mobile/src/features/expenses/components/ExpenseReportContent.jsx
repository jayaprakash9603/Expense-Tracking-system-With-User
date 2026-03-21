import React, { useMemo, useState } from "react";
import { Wallet, Trophy, BarChart3, Hash } from "lucide-react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { SummaryCard, SummaryCardGrid, SummaryCardSkeleton } from "@/shared/components/display/SummaryCard";
import {
  DASHBOARD_AREA_CHART_HEIGHT,
  DASHBOARD_PIE_HEIGHT,
  DASHBOARD_PIE_INNER_RADIUS,
  DASHBOARD_PIE_OUTER_RADIUS,
} from "@/features/dashboard/constants/dashboardChartHeights";
import { SpendingChartTooltip } from "@/features/dashboard/components/charts/SpendingChartTooltip";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";
import { refineAreaChartModel, refinePieChartModel } from "@/features/expenses/utils/expenseReportViewFilters";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";
import {
  GroupedReportAccordion,
  GroupedReportAccordionSkeleton,
  GroupedReportAccordionViewToolbar,
  GROUPED_REPORT_VIEW_MODE,
  resolveGroupedReportGroups,
} from "@/features/reports/components/GroupedReportAccordion";
import { useStandardExpenseColumns } from "@/features/expenses/hooks/useStandardExpenseColumns";

const SKELETON_VARIANTS = ["blue", "purple", "amber", "rose"];

const EMPTY_CARDS = {
  totalSpending: {
    rawAmount: 0,
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  topExpense: {
    value: "—",
    percentage: "0.00%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  avgTransaction: {
    rawAmount: 0,
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  totalTransactions: {
    value: "0",
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
};

const CONTROL_TF_CLASS = "h-8 w-[min(100%,9.5rem)] min-w-0 text-xs sm:w-[110px]";
const REPORT_AREA_MARGIN = { top: 28, right: 8, left: 0, bottom: 28 };

function reportFlowToLossGain(flow) {
  if (flow === "outflow") return "loss";
  if (flow === "inflow") return "gain";
  return null;
}

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
  const { format: formatMoney } = useMoneyFormatter();
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
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
          {SKELETON_VARIANTS.map((v) => (
            <SummaryCardSkeleton key={v} variant={v} />
          ))}
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted sm:h-[360px]" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-[420px] w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-[420px] w-full animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-5 w-56 max-w-full animate-pulse rounded bg-muted" />
          <GroupedReportAccordionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6">
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

      <div className="mt-2 w-full space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{t(accordionSectionTitleKey)}</h3>
          <GroupedReportAccordionViewToolbar
            value={groupedReportViewMode}
            onValueChange={setGroupedReportViewMode}
          />
          <GroupedReportAccordion 
            groups={accordionGroups} 
            columns={columns} 
            enableSelection={true}
            selectedGlobalIds={selectedGlobalIds}
            onSelectionChange={setSelectedGlobalIds}
          />
        </div>
      </div>
    </div>
  );
}

export default ExpenseReportContent;
