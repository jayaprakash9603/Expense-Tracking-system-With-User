import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Receipt, CreditCard, PiggyBank } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useDashboardLayout } from "@/features/dashboard/hooks/useDashboardLayout";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { DashboardHeader } from "@/features/dashboard/components/header/DashboardHeader";
import { QuickAccess } from "@/features/dashboard/components/quick-access/QuickAccess";
import { ApplicationOverview } from "@/features/dashboard/components/sections/ApplicationOverview";
import { DailySpendingSection } from "@/features/dashboard/components/sections/DailySpendingSection";
import { CategoryBreakdownSection } from "@/features/dashboard/components/sections/CategoryBreakdownSection";
import { PaymentMethodSection } from "@/features/dashboard/components/sections/PaymentMethodSection";
import { RecentTransactions } from "@/features/dashboard/components/sections/RecentTransactions";
import { BudgetOverviewSection } from "@/features/dashboard/components/sections/BudgetOverviewSection";
import { MonthlyComparisonChart } from "@/features/dashboard/components/charts/MonthlyComparisonChart";
import { cn } from "@/lib/utils";
import {
  buildDashboardLayoutGroups,
  getDashboardColSpan,
  getDashboardRowCols,
} from "@/features/dashboard/utils/dashboardLayoutGroups";

const SECTION_COMPONENTS = {
  metrics: MetricsSection,
  "daily-spending": () => <DailySpendingSection />,
  "quick-access": () => <QuickAccess />,
  "summary-overview": () => <ApplicationOverview />,
  "category-breakdown": () => <CategoryBreakdownSection />,
  "monthly-trend": MonthlyTrendSection,
  "payment-methods": () => <PaymentMethodSection />,
  "recent-transactions": () => <RecentTransactions />,
  "budget-overview": () => <BudgetOverviewSection />,
};

function MetricsSection() {
  const { t } = useLanguage();
  const { totalExpenses, creditDue, totalSpent, upcomingBillsAmount } = useDashboardData();

  return (
    <SummaryCardGrid>
      <SummaryCard
        title={t("analytics.totalBalance")}
        rawAmount={totalExpenses}
        icon={Receipt}
        variant="blue"
        sparklineData={[3, 4, 3, 5, 8, 6, 7]}
      />
      <SummaryCard
        title={t("analytics.monthlySpending")}
        rawAmount={totalSpent}
        icon={Wallet}
        variant="emerald"
        sparklineData={[5, 6, 4, 7, 8, 5, 9]}
      />
      <SummaryCard
        title={t("analytics.creditDue")}
        rawAmount={creditDue}
        icon={CreditCard}
        variant="amber"
        sparklineData={[2, 3, 2, 4, 3, 5, 6]}
      />
      <SummaryCard
        title={t("analytics.billsPaid")}
        rawAmount={upcomingBillsAmount}
        icon={PiggyBank}
        variant="rose"
        sparklineData={[4, 3, 5, 7, 6, 8, 9]}
      />
    </SummaryCardGrid>
  );
}

function MonthlyTrendSection() {
  const { monthlyComparison } = useDashboardCharts();
  return (
    <div className="w-full">
      <MonthlyComparisonChart data={monthlyComparison.data} />
    </div>
  );
}

export function DashboardPageContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { forceRefresh } = useDashboardContext();
  const layoutConfig = useDashboardLayout();
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const layoutGroups = useMemo(
    () => buildDashboardLayoutGroups(layoutConfig.visibleSections),
    [layoutConfig.visibleSections],
  );

  return (
    <PageContainer>
      <ContentSection>
        <DashboardHeader
          onRefresh={forceRefresh}
          onExport={() => navigate("/reports")}
          onCustomize={() => setCustomizationOpen(true)}
        />
      </ContentSection>

      {layoutGroups.map((group, idx) => {
        if (group.type === "full") {
          const section = group.sections[0];
          const Component = SECTION_COMPONENTS[section.id];
          if (!Component) return null;
          return (
            <ContentSection key={section.id}>
              <Component />
            </ContentSection>
          );
        }

        const stretchRow = group.sections.length > 1;

        return (
          <ContentSection key={`row-${idx}`}>
            <div className={cn("grid items-stretch gap-4 md:gap-6", getDashboardRowCols(group.sections))}>
              {group.sections.map((section) => {
                const Component = SECTION_COMPONENTS[section.id];
                if (!Component) return null;
                return (
                  <div
                    key={section.id}
                    className={cn(
                      stretchRow && "h-full min-h-0",
                      getDashboardColSpan(section, group.sections),
                    )}
                  >
                    <div className={cn(stretchRow && "h-full min-h-0 [&>*]:h-full")}>
                      <Component />
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentSection>
        );
      })}

      {layoutConfig.visibleSections.length === 0 && (
        <ContentSection>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-semibold mb-2">{t("dashboard.allSectionsHidden")}</p>
            <p className="text-sm text-muted-foreground mb-4">{t("dashboard.restoreSections")}</p>
            <button
              type="button"
              onClick={() => setCustomizationOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              {t("dashboard.customize")}
            </button>
          </div>
        </ContentSection>
      )}

      <SectionCustomizationModal
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        sections={layoutConfig.sections}
        onSaveLayout={layoutConfig.saveLayout}
        onResetLayout={layoutConfig.resetLayout}
      />
    </PageContainer>
  );
}
