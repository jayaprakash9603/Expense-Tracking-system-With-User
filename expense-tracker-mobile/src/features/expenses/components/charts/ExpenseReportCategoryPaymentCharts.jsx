import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import {
  DASHBOARD_PIE_HEIGHT,
  DASHBOARD_PIE_INNER_RADIUS,
  DASHBOARD_PIE_OUTER_RADIUS,
} from "@/shared/constants/dashboardChartHeights";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { CONTROL_TF_CLASS, reportFlowToLossGain } from "../reports/expenseReportContentConstants";

export function ExpenseReportCategoryPaymentCharts({
  displayCategory,
  displayPayment,
  tagline,
  categoryRefreshing,
  paymentRefreshing,
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

  return (
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
  );
}
