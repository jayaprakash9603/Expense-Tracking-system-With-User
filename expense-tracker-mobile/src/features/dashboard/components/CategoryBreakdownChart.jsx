import React from "react";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function CategoryBreakdownChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("dashboard.categoryBreakdown")} description={t("dashboard.expensesByCategory")}>
      <AppPieChart data={data} config={config} donut innerRadius={50} outerRadius={90} />
    </ChartCard>
  );
}
