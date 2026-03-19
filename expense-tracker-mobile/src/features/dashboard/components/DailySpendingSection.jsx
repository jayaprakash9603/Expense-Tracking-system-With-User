import React from "react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import { SpendingChartTooltip } from "./SpendingChartTooltip";

export function DailySpendingSection() {
  const { t } = useLanguage();
  const { spendingTimeframe, setSpendingTimeframe, spendingType, setSpendingType } = useDashboardContext();
  const { spendingTrend } = useDashboardCharts();

  return (
    <ChartCard
      title={t("dashboard.spendingTrend")}
      description={t("dashboard.dailySpendingOverTime")}
      actions={
        <div className="flex items-center gap-2">
          <ChartTypeToggle
            options={SPENDING_FLOW_OPTIONS}
            value={spendingType}
            onChange={setSpendingType}
          />
          <TimeframeSelector
            value={spendingTimeframe}
            onChange={setSpendingTimeframe}
          />
        </div>
      }
    >
      <AppAreaChart
        data={spendingTrend.data}
        config={spendingTrend.config}
        dataKeys={["expense"]}
        xAxisKey="date"
        showLegend={false}
        height={280}
        customTooltip={<SpendingChartTooltip selectedType={spendingType} />}
      />
    </ChartCard>
  );
}

export default DailySpendingSection;
