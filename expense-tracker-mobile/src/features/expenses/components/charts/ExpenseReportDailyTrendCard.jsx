import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { DASHBOARD_AREA_CHART_HEIGHT } from "@/shared/constants/dashboardChartHeights";
import { SpendingChartTooltip } from "@/shared/components/charts/dashboard/SpendingChartTooltip";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { CONTROL_TF_CLASS, REPORT_AREA_MARGIN, reportFlowToLossGain } from "../reports/expenseReportContentConstants";

export function ExpenseReportDailyTrendCard({
  displayDaily,
  areaKeys,
  tooltipSelectedType,
  tagline,
  dailyRefreshing,
  dailyFlowType,
  onDailyFlowTypeChange,
  dailyTimeframe,
  onDailyTimeframeChange,
}) {
  const { t } = useLanguage();

  return (
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
  );
}
