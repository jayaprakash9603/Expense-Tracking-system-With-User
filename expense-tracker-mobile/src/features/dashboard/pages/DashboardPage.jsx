import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Receipt, CreditCard, PiggyBank } from "lucide-react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ContentSection } from "@/shared/components/layout/ContentSection";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { SectionCustomizationModal } from "@/shared/components/customization/SectionCustomizationModal";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { DashboardProvider, useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useDashboardLayout } from "@/features/dashboard/hooks/useDashboardLayout";
import { useDashboardCharts } from "@/features/dashboard/hooks/useDashboardCharts";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { QuickAccess } from "@/features/dashboard/components/QuickAccess";
import { ApplicationOverview } from "@/features/dashboard/components/ApplicationOverview";
import { DailySpendingSection } from "@/features/dashboard/components/DailySpendingSection";
import { CategoryBreakdownSection } from "@/features/dashboard/components/CategoryBreakdownSection";
import { PaymentMethodSection } from "@/features/dashboard/components/PaymentMethodSection";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";
import { BudgetOverviewSection } from "@/features/dashboard/components/BudgetOverviewSection";
import { MonthlyComparisonChart } from "@/features/dashboard/components/MonthlyComparisonChart";

const SECTION_COMPONENTS = {
  "metrics": MetricsSection,
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
      <MonthlyComparisonChart data={monthlyComparison.data} config={monthlyComparison.config} />
    </div>
  );
}

function buildLayoutGroups(visibleSections) {
  const groups = [];
  let currentRow = null;

  visibleSections.forEach((section) => {
    if (section.type === "full") {
      if (currentRow) { groups.push(currentRow); currentRow = null; }
      groups.push({ type: "full", sections: [section] });
    } else {
      if (!currentRow) currentRow = { type: "row", sections: [] };
      currentRow.sections.push(section);
      if (currentRow.sections.length >= 2) {
        groups.push(currentRow);
        currentRow = null;
      }
    }
  });

  if (currentRow) groups.push(currentRow);
  return groups;
}

function getRowCols(sections) {
  if (sections.length === 1) return "grid-cols-1";
  const ids = sections.map((s) => s.id);
  if (ids.includes("recent-transactions") && ids.includes("budget-overview")) {
    return "grid-cols-1 lg:grid-cols-3";
  }
  return "grid-cols-1 lg:grid-cols-2";
}

function getColSpan(section, sections) {
  if (sections.length < 2) return "";
  const ids = sections.map((s) => s.id);
  if (ids.includes("recent-transactions") && ids.includes("budget-overview")) {
    return section.id === "recent-transactions" ? "lg:col-span-2" : "lg:col-span-1";
  }
  return "";
}

function DashboardContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { forceRefresh } = useDashboardContext();
  const layoutConfig = useDashboardLayout();
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const layoutGroups = useMemo(
    () => buildLayoutGroups(layoutConfig.visibleSections),
    [layoutConfig.visibleSections]
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

        return (
          <ContentSection key={`row-${idx}`}>
            <div className={`grid gap-4 md:gap-6 ${getRowCols(group.sections)}`}>
              {group.sections.map((section) => {
                const Component = SECTION_COMPONENTS[section.id];
                if (!Component) return null;
                return (
                  <div key={section.id} className={getColSpan(section, group.sections)}>
                    <Component />
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

export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
