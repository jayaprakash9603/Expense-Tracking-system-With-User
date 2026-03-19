import React from "react";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { CHART_HEIGHTS } from "@/config/chartConfig";

export function ExpenseCategoryChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("expenses.byCategory")} description={t("expenses.categoryDistribution")}>
      <AppPieChart data={data} config={config} donut innerRadius={45} outerRadius={80} height={CHART_HEIGHTS.compact} />
    </ChartCard>
  );
}
