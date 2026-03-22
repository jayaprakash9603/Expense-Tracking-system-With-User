import React from "react";
import { Target, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/shared/components/app-shadcn";
import { Progress } from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { AppRadialChart } from "@/shared/components/chart/AppRadialChart";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { cn } from "@/lib/utils";

const RADIAL_HEIGHT = 180;

export function BudgetOverviewSection() {
  const { t } = useLanguage();
  const { format } = usePresentation();
  const { budgetUsedPercent, remainingBudget, totalSpent, totalBudgetAmount } = useDashboardData();

  const chartData = [{ percentage: budgetUsedPercent, fill: "hsl(var(--primary))" }];
  const chartConfig = {
    percentage: {
      label: t("dashboard.budgetUsed"),
      color: "hsl(var(--primary))",
    },
  };

  const isOverBudget = budgetUsedPercent > 100;
  const clampedPercent = Math.min(budgetUsedPercent, 100);

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
        <SectionHeader icon={Target} title={t("dashboard.budgetOverview")} />

        {/* Radial chart */}
        <div className="flex items-center justify-center">
          <AppRadialChart
            data={chartData}
            config={chartConfig}
            dataKey="percentage"
            innerRadius={60}
            outerRadius={82}
            height={RADIAL_HEIGHT}
            showLabel
          />
        </div>

        {/* Progress bar with label */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("dashboard.budgetUsed")}</span>
            <span
              className={cn("font-semibold", isOverBudget ? "text-destructive" : "text-primary")}
            >
              {budgetUsedPercent}%
            </span>
          </div>
          <Progress
            value={clampedPercent}
            className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
          />
        </div>

        <Separator />

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <BudgetStatCard
            icon={Wallet}
            label={t("dashboard.remainingBudget")}
            value={format(remainingBudget)}
            accent="primary"
          />
          <BudgetStatCard
            icon={TrendingDown}
            label={t("dashboard.totalSpent")}
            value={format(totalSpent)}
            accent="destructive"
          />
        </div>

        {/* Total budget footer */}
        {totalBudgetAmount > 0 && (
          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">{t("dashboard.totalBudget")}</span>
            <span className="text-sm font-bold">{format(totalBudgetAmount)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetStatCard({ icon: Icon, label, value, accent = "primary" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-3",
        accent === "destructive"
          ? "border-destructive/20 bg-destructive/5"
          : "border-primary/20 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            accent === "destructive" ? "text-destructive" : "text-primary",
          )}
        />
        <span className="text-[0.6875rem] leading-tight text-muted-foreground">{label}</span>
      </div>
      <span
        className={cn(
          "text-base font-bold tracking-tight",
          accent === "destructive" ? "text-destructive" : "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default BudgetOverviewSection;
