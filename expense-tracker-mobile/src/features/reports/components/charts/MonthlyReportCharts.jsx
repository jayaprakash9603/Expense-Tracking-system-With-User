import React from "react";
import { AppComposedChart } from "@/shared/components/chart/AppComposedChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function MonthlyReportCharts({ monthly, category }) {
  const { t } = useLanguage();
  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard title={t("reports.monthlyTrend")}>
        <AppComposedChart data={monthly.data} config={monthly.config} bars={["total"]} lines={["average"]} xAxisKey="label" showLegend />
      </ChartCard>
      <ChartCard title={t("reports.categoryDistribution")}>
        <AppPieChart data={category.data} config={category.config} donut innerRadius={50} outerRadius={90} />
      </ChartCard>
    </ResponsiveGrid>
  );
}
