import React from "react";
import { useSelector } from "react-redux";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { AppCard } from "@/shared/components/display/AppCard";
import { SummaryCard, SummaryCardGrid, SummaryCardSkeleton } from "@/shared/components/display/SummaryCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useOverviewData } from "@/features/analytics/hooks/useOverviewData";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { SpendingTrendChart } from "@/features/dashboard/components/SpendingTrendChart";
import { CategoryBreakdownChart } from "@/features/dashboard/components/CategoryBreakdownChart";
import { MonthlyComparisonChart } from "@/features/dashboard/components/MonthlyComparisonChart";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";

const SKELETON_VARIANTS = ["blue", "emerald", "amber", "rose"];

function OverviewContent() {
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const displayName = user?.firstName || user?.fullName;
  const { cards, loading } = useOverviewData();
  const { spendingTrend, categoryBreakdown, monthlyComparison } = useDashboardCharts();

  return (
    <PageContainer>
      <ContentSection>
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl font-bold">
            {displayName
              ? t("dashboard.welcome", { name: displayName })
              : t("dashboard.welcomeDefault")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("analytics.overview")}
          </p>
        </div>

        {loading ? (
          <SummaryCardGrid>
            {SKELETON_VARIANTS.map((v) => (
              <SummaryCardSkeleton key={v} variant={v} />
            ))}
          </SummaryCardGrid>
        ) : (
          <SummaryCardGrid>
            {cards.map((card) => (
              <SummaryCard
                key={card.key}
                title={t(card.titleKey)}
                rawAmount={card.rawAmount}
                icon={card.icon}
                variant={card.variant}
                percentage={card.percentage}
                trendDirection={card.trendDirection}
                trendLabel={t(card.trendLabelKey)}
                sparklineData={card.sparklineData}
              />
            ))}
          </SummaryCardGrid>
        )}
      </ContentSection>

      <ContentSection className="mt-6">
        <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
          <SpendingTrendChart data={spendingTrend.data} config={spendingTrend.config} />
          <CategoryBreakdownChart data={categoryBreakdown.data} config={categoryBreakdown.config} />
          <MonthlyComparisonChart data={monthlyComparison.data} config={monthlyComparison.config} />
        </ResponsiveGrid>
      </ContentSection>
    </PageContainer>
  );
}

export function OverviewPage() {
  return (
    <DashboardProvider>
      <OverviewContent />
    </DashboardProvider>
  );
}

export default OverviewPage;
