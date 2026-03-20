import React from "react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function SpendingTrendChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("dashboard.spendingTrend")} description={t("dashboard.dailySpendingOverTime")}>
      <AppAreaChart data={data} config={config} dataKeys={["expense", "income"]} xAxisKey="date" showLegend />
    </ChartCard>
  );
}
