import React from "react";
import { AppComposedChart } from "@/shared/components/chart/AppComposedChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function MonthlyComparisonChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("dashboard.monthlyComparison")} description={t("dashboard.monthlyTotalsVsAverage")}>
      <AppComposedChart data={data} config={config} bars={["total"]} lines={["average"]} xAxisKey="label" showLegend />
    </ChartCard>
  );
}
