import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function CashFlowChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("dashboard.cashFlow")} description={t("dashboard.incomeVsExpense")}>
      <AppBarChart data={data} config={config} dataKeys={["income", "expense"]} xAxisKey="label" showLegend />
    </ChartCard>
  );
}
