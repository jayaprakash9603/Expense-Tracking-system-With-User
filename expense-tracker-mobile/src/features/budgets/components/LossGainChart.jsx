import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function LossGainChart({ data, config }) {
  const { t } = useLanguage();
  return (
    <ChartCard title={t("budgets.lossGain")} description={t("budgets.overUnderBudget")}>
      <AppBarChart data={data} config={config} dataKeys={["savings", "overBudget"]} xAxisKey="label" showLegend />
    </ChartCard>
  );
}
