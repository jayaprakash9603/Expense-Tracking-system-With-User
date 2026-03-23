import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ReportSpendingAreaChart } from "@/features/reports/components/charts/ReportSpendingAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { buildPieChartConfig } from "@/shared/utils/chart/chartColors";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function BillReportCharts({ categoryData, paymentData, displayDaily, flowType }) {
  const { t } = useLanguage();
  const barData = categoryData.map((d) => ({ label: d.name, amount: d.amount ?? d.value ?? 0 }));
  const barConfig = { amount: { label: t("reports.chartMetric.amount"), color: "hsl(var(--chart-1))" } };
  const pieConfig = buildPieChartConfig(
    paymentData.length ? paymentData : [{ name: "-", value: 0 }],
    "name",
  );

  const tooltipSelectedType = flowType === "inflow" ? "gain" : "loss";

  return (
    <div className="space-y-6">
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
            data={paymentData}
            config={pieConfig}
            donut
            innerRadius={50}
            outerRadius={90}
          />
        </ChartCard>
      </ResponsiveGrid>
      <ReportSpendingAreaChart
        displayDaily={displayDaily}
        areaKeys={displayDaily?.dataKeys || ["expense"]}
        tooltipSelectedType={tooltipSelectedType}
        dailyBreakdownMode="category"
      />
    </div>
  );
}
