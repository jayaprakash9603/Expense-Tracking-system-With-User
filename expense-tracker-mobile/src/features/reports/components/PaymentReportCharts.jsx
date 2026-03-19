import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function PaymentReportCharts({ cashFlow }) {
  const { t } = useLanguage();
  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard title={t("reports.cashFlow")}>
        <AppBarChart data={cashFlow.data} config={cashFlow.config} dataKeys={["income", "expense"]} xAxisKey="label" showLegend />
      </ChartCard>
    </ResponsiveGrid>
  );
}
