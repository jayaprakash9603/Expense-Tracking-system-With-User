import React from "react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { AppLineChart } from "@/shared/components/chart/AppLineChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function TrendAnalysisCharts({ daily, monthly }) {
  const { t } = useLanguage();
  const lineData = monthly.data.map((d) => ({ date: d.label, total: d.total }));
  const lineConfig = { total: { label: "Total", color: "hsl(var(--chart-1))" } };

  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard title={t("reports.dailyTrend")}>
        <AppAreaChart data={daily.data} config={daily.config} dataKeys={["expense", "income"]} xAxisKey="date" showLegend />
      </ChartCard>
      <ChartCard title={t("reports.monthlyTrend")}>
        <AppLineChart data={lineData} config={lineConfig} dataKeys={["total"]} xAxisKey="date" showDots />
      </ChartCard>
    </ResponsiveGrid>
  );
}
