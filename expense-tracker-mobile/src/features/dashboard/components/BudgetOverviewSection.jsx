import React from "react";
import { Target } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppRadialChart } from "@/shared/components/chart/AppRadialChart";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export function BudgetOverviewSection() {
  const { t } = useLanguage();
  const { format } = usePresentation();
  const { budgetUsedPercent, remainingBudget, totalSpent } = useDashboardData();

  const chartData = [{ percentage: budgetUsedPercent, fill: "hsl(var(--primary))" }];
  const chartConfig = { percentage: { label: t("dashboard.budgetUsed"), color: "hsl(var(--primary))" } };

  return (
    <AppCard className="h-full">
      <AppCard.Header>
        <SectionHeader icon={Target} title={t("dashboard.budgetOverview")} />
      </AppCard.Header>
      <AppCard.Content>
        <div className="flex flex-col items-center">
          <AppRadialChart
            data={chartData}
            config={chartConfig}
            dataKey="percentage"
            innerRadius={70}
            outerRadius={95}
            height={200}
            showLabel
          />
        </div>
        <div className="grid grid-cols-1 gap-2 mt-4">
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
