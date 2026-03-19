import React from "react";
import { useSelector } from "react-redux";
import { PageContainer } from "@/shared/components/PageContainer";
import { AppCard } from "@/shared/components/AppCard";
import { ResponsiveGrid } from "@/shared/components/ResponsiveGrid";
import { ContentSection } from "@/shared/components/ContentSection";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { SpendingTrendChart } from "@/features/dashboard/components/SpendingTrendChart";
import { CategoryBreakdownChart } from "@/features/dashboard/components/CategoryBreakdownChart";
import { MonthlyComparisonChart } from "@/features/dashboard/components/MonthlyComparisonChart";
import { CashFlowChart } from "@/features/dashboard/components/CashFlowChart";

function StatCard({ value, label }) {
  return (
    <div className="rounded-lg bg-muted p-4 md:p-5 text-center">
      <p className="text-2xl md:text-3xl font-bold text-primary">{value}</p>
      <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const displayName = user?.firstName || user?.fullName;
  const { spendingTrend, categoryBreakdown, monthlyComparison, cashFlow } = useDashboardCharts();

  return (
    <PageContainer>
      <ContentSection>
        <AppCard>
          <AppCard.Header>
            <AppCard.Title>
              {displayName ? t("dashboard.welcome", { name: displayName }) : t("dashboard.welcomeDefault")}
            </AppCard.Title>
            <AppCard.Description>{t("dashboard.title")}</AppCard.Description>
          </AppCard.Header>
          <AppCard.Content>
            <ResponsiveGrid preset="stats" gap="md">
              <StatCard value="0" label={t("navigation.expenses")} />
              <StatCard value="0" label={t("navigation.budget")} />
              <StatCard value="0" label={t("navigation.home")} />
              <StatCard value="0" label={t("navigation.settings")} />
            </ResponsiveGrid>
          </AppCard.Content>
        </AppCard>
      </ContentSection>

      <ContentSection className="mt-6">
        <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
          <SpendingTrendChart data={spendingTrend.data} config={spendingTrend.config} />
          <CategoryBreakdownChart data={categoryBreakdown.data} config={categoryBreakdown.config} />
          <MonthlyComparisonChart data={monthlyComparison.data} config={monthlyComparison.config} />
          <CashFlowChart data={cashFlow.data} config={cashFlow.config} />
        </ResponsiveGrid>
      </ContentSection>
    </PageContainer>
  );
}

export default DashboardPage;
