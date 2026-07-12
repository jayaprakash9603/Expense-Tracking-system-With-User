import React from "react";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/charts/useDashboardCharts";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import {
  DASHBOARD_PIE_HEIGHT,
  DASHBOARD_PIE_INNER_RADIUS,
  DASHBOARD_PIE_OUTER_RADIUS,
} from "@/features/dashboard/constants/dashboardChartHeights";

export function CategoryBreakdownSection() {
  const { t } = useLanguage();
  const { categoryTimeframe, setCategoryTimeframe, categoryFlowType, setCategoryFlowType } = useDashboardContext();
  const { categoryBreakdown } = useDashboardCharts();

  return (
    <ChartCard
      fillHeight
      stackActionsBelowTitleOnSmall
      title={t("dashboard.categoryBreakdown")}
      description={t("dashboard.expensesByCategory")}
      actions={
        <>
          <ChartTypeToggle
            options={SPENDING_FLOW_OPTIONS}
            value={categoryFlowType}
            onChange={setCategoryFlowType}
          />
          <TimeframeSelector
            value={categoryTimeframe}
            onChange={setCategoryTimeframe}
          />
        </>
      }
    >
      <AppPieChart
        data={categoryBreakdown.data}
        config={categoryBreakdown.config}
        donut
        innerRadius={DASHBOARD_PIE_INNER_RADIUS}
        outerRadius={DASHBOARD_PIE_OUTER_RADIUS}
        height={DASHBOARD_PIE_HEIGHT}
      />
    </ChartCard>
  );
}

export default CategoryBreakdownSection;
