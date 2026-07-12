import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { DASHBOARD_AREA_CHART_HEIGHT } from "@/shared/constants/dashboardChartHeights";
import { SpendingChartTooltip } from "@/shared/components/charts/dashboard/SpendingChartTooltip";
import { ReportDailyBreakdownTooltip } from "@/features/reports/components/charts/ReportDailyBreakdownTooltip";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { REPORT_AREA_MARGIN } from "@/features/expenses/components/reports/expenseReportContentConstants";

export function ReportSpendingAreaChart({
  displayDaily,
  areaKeys,
  tooltipSelectedType,
  dailyRefreshing,
  dailyBreakdownMode,
}) {
  const { t } = useLanguage();
  const customTooltip = dailyBreakdownMode ? (
    <ReportDailyBreakdownTooltip
      breakdownMode={dailyBreakdownMode}
      tooltipSelectedType={tooltipSelectedType}
    />
  ) : (
    <SpendingChartTooltip selectedType={tooltipSelectedType} />
  );

  return (
    <ChartCard
      fillHeight
      title={t("dashboard.spendingTrend")}
      className={cn("w-full min-w-0 transition-opacity", dailyRefreshing && "opacity-60")}
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
          customTooltip={customTooltip}
        />
      </div>
    </ChartCard>
  );
}
