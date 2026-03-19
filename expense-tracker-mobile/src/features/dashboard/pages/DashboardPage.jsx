import React from "react";
import { useSelector } from "react-redux";
import { Wallet, Receipt, CreditCard, PiggyBank } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { SpendingTrendChart } from "@/features/dashboard/components/SpendingTrendChart";
import { CategoryBreakdownChart } from "@/features/dashboard/components/CategoryBreakdownChart";
import { MonthlyComparisonChart } from "@/features/dashboard/components/MonthlyComparisonChart";
import { CashFlowChart } from "@/features/dashboard/components/CashFlowChart";

export function DashboardPage() {
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const displayName = user?.firstName || user?.fullName;
  const { spendingTrend, categoryBreakdown, monthlyComparison, cashFlow } = useDashboardCharts();

  return (
    <PageContainer>
      <ContentSection>
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl font-bold">
            {displayName
              ? t("dashboard.welcome", { name: displayName })
              : t("dashboard.welcomeDefault")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.title")}</p>
        </div>

        <SummaryCardGrid>
          <SummaryCard
            title={t("navigation.expenses")}
            rawAmount={0}
            icon={Receipt}
            variant="blue"
            sparklineData={[3, 4, 3, 5, 8, 6, 7]}
          />
          <SummaryCard
            title={t("navigation.budget")}
            rawAmount={0}
            icon={Wallet}
            variant="emerald"
            sparklineData={[5, 6, 4, 7, 8, 5, 9]}
          />
          <SummaryCard
            title={t("analytics.creditDue")}
            rawAmount={0}
            icon={CreditCard}
            variant="amber"
            sparklineData={[2, 3, 2, 4, 3, 5, 6]}
          />
          <SummaryCard
            title={t("analytics.billsPaid")}
            rawAmount={0}
            icon={PiggyBank}
            variant="rose"
            sparklineData={[4, 3, 5, 7, 6, 8, 9]}
          />
        </SummaryCardGrid>
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
