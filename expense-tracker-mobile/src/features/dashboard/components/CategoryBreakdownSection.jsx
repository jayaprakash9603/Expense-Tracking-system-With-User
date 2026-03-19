import React from "react";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { TimeframeSelector, ChartTypeToggle } from "@/shared/components/chart/ChartControls";
import { SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";

export function CategoryBreakdownSection() {
  const { t } = useLanguage();
  const { categoryTimeframe, setCategoryTimeframe, categoryFlowType, setCategoryFlowType } = useDashboardContext();
  const { categoryBreakdown } = useDashboardCharts();

  return (
    <ChartCard
      title={t("dashboard.categoryBreakdown")}
      description={t("dashboard.expensesByCategory")}
      actions={
        <div className="flex items-center gap-2">
          <ChartTypeToggle
            options={SPENDING_FLOW_OPTIONS}
            value={categoryFlowType}
            onChange={setCategoryFlowType}
          />
          <TimeframeSelector
            value={categoryTimeframe}
            onChange={setCategoryTimeframe}
          />
        </div>
      }
    >
      <AppPieChart
        data={categoryBreakdown.data}
        config={categoryBreakdown.config}
        donut
        innerRadius={50}
        outerRadius={90}
        height={300}
      />
    </ChartCard>
  );
}

export default CategoryBreakdownSection;
