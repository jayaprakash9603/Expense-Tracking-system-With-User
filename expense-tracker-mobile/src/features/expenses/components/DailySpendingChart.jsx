import React from "react";
import { AppAreaChart } from "@/shared/components/chart/AppAreaChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { CHART_HEIGHTS } from "@/config/chartConfig";

export function DailySpendingChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("expenses.dailySpending")} description={t("expenses.spendingOverTime")}>
      <AppAreaChart data={data} config={config} dataKeys={["expense"]} xAxisKey="date" height={CHART_HEIGHTS.compact} />
    </ChartCard>
  );
}
