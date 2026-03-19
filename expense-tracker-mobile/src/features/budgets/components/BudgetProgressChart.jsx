import React from "react";
import { AppRadialChart } from "@/shared/components/chart/AppRadialChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function BudgetProgressChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("budgets.progress")} description={t("budgets.overallUtilization")}>
      <AppRadialChart data={data} config={config} dataKey="percentage" />
    </ChartCard>
  );
}
