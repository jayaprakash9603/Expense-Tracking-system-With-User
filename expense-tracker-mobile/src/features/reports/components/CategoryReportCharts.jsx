import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function CategoryReportCharts({ category }) {
  const { t } = useLanguage();
  const barData = category.data.map((d) => ({ label: d.name, amount: d.value }));
  const barConfig = { amount: { label: "Amount", color: "hsl(var(--chart-1))" } };

  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard title={t("reports.categoryAmounts")}>
        <AppBarChart data={barData} config={barConfig} dataKeys={["amount"]} xAxisKey="label" horizontal />
      </ChartCard>
      <ChartCard title={t("reports.categoryDistribution")}>
        <AppPieChart data={category.data} config={category.config} donut innerRadius={50} outerRadius={90} />
      </ChartCard>
    </ResponsiveGrid>
  );
}
