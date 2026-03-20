import React from "react";
import { Target } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppRadialChart } from "@/shared/components/chart/AppRadialChart";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { DASHBOARD_BUDGET_RADIAL_HEIGHT } from "@/features/dashboard/constants/dashboardChartHeights";

export function BudgetOverviewSection() {
  const { t } = useLanguage();
  const { format } = usePresentation();
  const { budgetUsedPercent, remainingBudget, totalSpent } = useDashboardData();

  const chartData = [{ percentage: budgetUsedPercent, fill: "hsl(var(--primary))" }];
  const chartConfig = { percentage: { label: t("dashboard.budgetUsed"), color: "hsl(var(--primary))" } };

  return (
    <AppCard className="flex h-full min-h-0 flex-col">
      <AppCard.Header className="shrink-0">
        <SectionHeader icon={Target} title={t("dashboard.budgetOverview")} />
      </AppCard.Header>
      <AppCard.Content className="flex min-h-0 flex-1 flex-col pt-0">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <AppRadialChart
            data={chartData}
            config={chartConfig}
            dataKey="percentage"
            innerRadius={72}
            outerRadius={98}
            height={DASHBOARD_BUDGET_RADIAL_HEIGHT}
            showLabel
          />
        </div>
        <div className="mt-4 grid shrink-0 grid-cols-1 gap-2">
          <BudgetStatRow
            label={t("dashboard.remainingBudget")}
            value={format(remainingBudget)}
          />
          <BudgetStatRow
            label={t("dashboard.totalSpent")}
            value={format(totalSpent)}
          />
        </div>
      </AppCard.Content>
    </AppCard>
  );
}

function BudgetStatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

export default BudgetOverviewSection;
