import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { buildPieChartConfig } from "@/shared/utils/chart/chartColors";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function AllBudgetsReportCharts({ categoryBreakdown, paymentMethodBreakdown }) {
  const { t } = useLanguage();
  const barData = categoryBreakdown.map((d) => ({
    label: d.name,
    amount: d.amount ?? d.value ?? 0,
  }));
  const barConfig = { amount: { label: t("reports.chartMetric.amount"), color: "hsl(var(--chart-1))" } };
  const pieConfig = buildPieChartConfig(
    paymentMethodBreakdown.length ? paymentMethodBreakdown : [{ name: "-", value: 0 }],
    "name",
  );

  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard title={t("reports.categoryAmounts")}>
        <AppBarChart
          data={barData}
          config={barConfig}
          dataKeys={["amount"]}
          xAxisKey="label"
          horizontal
        />
      </ChartCard>
      <ChartCard title={t("reports.paymentDistribution")}>
        <AppPieChart
          data={paymentMethodBreakdown}
          config={pieConfig}
          donut
          innerRadius={50}
          outerRadius={90}
        />
      </ChartCard>
    </ResponsiveGrid>
  );
}
