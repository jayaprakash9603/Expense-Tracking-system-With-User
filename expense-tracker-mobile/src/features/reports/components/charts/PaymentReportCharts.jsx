import React from "react";
import { AppBarChart } from "@/shared/components/chart/AppBarChart";
import { AppPieChart } from "@/shared/components/chart/AppPieChart";
import { ChartCard } from "@/shared/components/chart/ChartCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function PaymentReportCharts({ displayPayment, paymentRefreshing = false }) {
  const { t } = useLanguage();
  const barData = (displayPayment.data || []).map((d) => ({ label: d.name, amount: d.value }));
  const barConfig = { amount: { label: "Amount", color: "hsl(var(--chart-1))" } };

  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
      <ChartCard
        title={t("reports.paymentAmounts")}
        className={cn("transition-opacity", paymentRefreshing && "opacity-60")}
      >
        <AppBarChart data={barData} config={barConfig} dataKeys={["amount"]} xAxisKey="label" horizontal />
      </ChartCard>
      <ChartCard
        title={t("dashboard.paymentMethods")}
        className={cn("transition-opacity", paymentRefreshing && "opacity-60")}
      >
        <AppPieChart data={displayPayment.data} config={displayPayment.config} donut innerRadius={50} outerRadius={90} />
      </ChartCard>
    </ResponsiveGrid>
  );
}
