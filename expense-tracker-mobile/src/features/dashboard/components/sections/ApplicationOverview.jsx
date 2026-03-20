import React from "react";
import { Receipt, CreditCard, Wallet, Users, UsersRound, CalendarClock, TrendingDown, PiggyBank, LayoutGrid, Star } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { MiniStatCard } from "@/shared/components/display/MiniStatCard";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export function ApplicationOverview() {
  const { t } = useLanguage();
  const { format } = usePresentation();
  const {
    totalExpenses,
    creditDue,
    activeBudgets,
    friendsCount,
    groupsCount,
    avgDailySpend,
    savingsRate,
    upcomingBillsAmount,
    topExpenses,
  } = useDashboardData();

  const primaryStats = [
    { key: "expenses", icon: Receipt, iconColor: "primary", title: t("analytics.totalBalance"), rawAmount: totalExpenses },
    { key: "credit", icon: CreditCard, iconColor: "warning", title: t("analytics.creditDue"), rawAmount: creditDue },
    { key: "budgets", icon: Wallet, iconColor: "success", title: t("dashboard.activeBudgets"), value: String(activeBudgets) },
    { key: "friends", icon: Users, iconColor: "info", title: t("dashboard.friends"), value: String(friendsCount) },
    { key: "groups", icon: UsersRound, iconColor: "primary", title: t("navigation.groups"), value: String(groupsCount) },
  ];

  const secondaryStats = [
    { key: "avgDaily", icon: TrendingDown, iconColor: "warning", title: t("dashboard.avgDailySpend") || "Avg Daily Spend", rawAmount: avgDailySpend, subtitle: t("dashboard.last30Days") || "Last 30 days" },
    { key: "savings", icon: PiggyBank, iconColor: "success", title: t("dashboard.savingsRate") || "Savings Rate", value: `${savingsRate}%`, subtitle: t("dashboard.ofIncome") || "of income" },
    { key: "upcoming", icon: CalendarClock, iconColor: "error", title: t("dashboard.upcomingBills") || "Upcoming Bills", rawAmount: upcomingBillsAmount, subtitle: t("dashboard.duePeriod") || "due this period" },
  ];

  return (
    <AppCard className="flex h-full min-h-0 flex-col">
      <AppCard.Header className="shrink-0">
        <SectionHeader icon={LayoutGrid} title={t("dashboard.applicationOverview")} />
      </AppCard.Header>
      <AppCard.Content className="flex min-h-0 flex-1 flex-col gap-4 pt-0">
        <div className="shrink-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {primaryStats.map((stat) => (
              <MiniStatCard key={stat.key} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {secondaryStats.map((stat) => (
              <MiniStatCard key={stat.key} {...stat} />
            ))}
          </div>
        </div>

        {topExpenses?.length > 0 ? (
          <div className="shrink-0">
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">{t("dashboard.topExpenses") || "Top Expenses"}</h4>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topExpenses.slice(0, 4).map((expense, idx) => (
                <div key={expense.id || idx} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{expense.name || expense.itemName}</p>
                    <p className="text-xs text-muted-foreground">{expense.date || expense.expenseDate}</p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold">
                    {format(Number(expense.amount || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 basis-0" aria-hidden />
      </AppCard.Content>
    </AppCard>
  );
}

export default ApplicationOverview;
