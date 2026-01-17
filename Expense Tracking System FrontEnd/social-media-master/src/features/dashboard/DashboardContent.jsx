import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardCustomizationModal from "../../components/DashboardCustomizationModal";
import DailySpendingContainer from "../../components/DailySpendingContainer";
import SummaryOverview from "../../components/SummaryOverview";
import SummaryOverviewSkeleton from "../../components/SummaryOverviewSkeleton";
import useApplicationOverview from "../../hooks/useApplicationOverview";
import MonthlyTrendContainer from "../../components/MonthlyTrendContainer";
import {
  CategoryBreakdownChart,
  PaymentMethodChart,
  RecentTransactions,
  BudgetOverview,
  RecentTransactionsSkeleton,
  BudgetOverviewSkeleton,
  MetricsGrid,
  ChartSkeleton,
} from "../../pages/Dashboard";
import QuickAccess from "../../pages/Landingpage/QuickAccess";
import { useDashboardContext } from "./DashboardProvider";
import { createDashboardActions } from "./dashboardActions";
import EmptyStateCard from "../../components/EmptyStateCard";

// Section component mapping
const SECTION_COMPONENTS = {
  metrics: ({ analyticsSummary, analyticsLoading, currencySymbol }) => (
    <MetricsGrid
      analyticsSummary={analyticsSummary}
      loading={analyticsLoading}
      currencySymbol={currencySymbol}
    />
  ),
  "daily-spending": ({ isMobile, isTablet, analyticsLoading }) => (
    <DailySpendingContainer
      height={isMobile ? 200 : isTablet ? 240 : 280}
      refreshTrigger={Math.random()}
      showSkeleton={analyticsLoading}
      fillMissingDays={false}
    />
  ),
  "quick-access": () => <QuickAccess />,
  "summary-overview": ({ appOverviewData, appOverviewLoading }) =>
    appOverviewLoading ? (
      <SummaryOverviewSkeleton />
    ) : (
      <SummaryOverview
        summary={{
          totalExpenses: appOverviewData?.totalExpenses,
          creditDue: -(appOverviewData?.totalCreditDue || 0),
          budgetsActive:
            appOverviewData?.activeBudgets ?? appOverviewData?.totalBudgets,
          friendsCount: appOverviewData?.friendsCount,
          groupsCount: appOverviewData?.totalGroups,
          averageDaily: appOverviewData?.avgDailySpendLast30Days,
          savingsRate: appOverviewData?.savingsRateLast30Days,
          upcomingBills: appOverviewData?.upcomingBillsAmount,
          topExpenses: appOverviewData?.topExpenses,
        }}
      />
    ),
  "category-breakdown": ({
    categoryDistribution,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    categoryLoading,
    analyticsLoading,
    isMobile,
  }) => (
    <CategoryBreakdownChart
      data={categoryDistribution}
      timeframe={categoryTimeframe}
      onTimeframeChange={setCategoryTimeframe}
      flowType={categoryFlowType}
      onFlowTypeChange={setCategoryFlowType}
      loading={categoryLoading}
      skeleton={
        analyticsLoading ? (
          <ChartSkeleton height={isMobile ? 380 : 560} variant="pie" noHeader />
        ) : null
      }
    />
  ),
  "monthly-trend": ({ currentYear, analyticsLoading, isMobile, isTablet }) => (
    <MonthlyTrendContainer
      initialYear={currentYear}
      refreshTrigger={Math.random()}
      height={isMobile ? 260 : isTablet ? 380 : 600}
      maxYear={currentYear}
      showSkeleton={analyticsLoading}
    />
  ),
  "payment-methods": ({
    paymentMethodsData,
    paymentMethodsRawData,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    paymentMethodsLoading,
    analyticsLoading,
  }) => (
    <PaymentMethodChart
      data={paymentMethodsData}
      rawData={paymentMethodsRawData}
      timeframe={paymentMethodsTimeframe}
      onTimeframeChange={setPaymentMethodsTimeframe}
      flowType={paymentMethodsFlowType}
      onFlowTypeChange={setPaymentMethodsFlowType}
      loading={paymentMethodsLoading}
      skeleton={
        analyticsLoading ? (
          <ChartSkeleton height={450} variant="pie" noHeader />
        ) : null
      }
    />
  ),
  "recent-transactions": ({
    analyticsSummary,
    viewAllTransactions,
    sectionType,
    isCompact,
  }) => (
    <RecentTransactions
      transactions={analyticsSummary?.lastTenExpenses ?? []}
      onViewAll={viewAllTransactions}
      sectionType={sectionType}
      isCompact={isCompact}
    />
  ),
  "budget-overview": ({ analyticsSummary, sectionType, isCompact }) => (
    <BudgetOverview
      remainingBudget={analyticsSummary?.remainingBudget ?? 0}
      totalLosses={analyticsSummary?.totalLosses ?? 0}
      sectionType={sectionType}
      isCompact={isCompact}
    />
  ),
};

// Central presentation component - minimal logic; relies on context for data/state.
export default function DashboardContent() {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const { data: appOverviewData, loading: appOverviewLoading } =
    useApplicationOverview();
  const {
    forceRefresh,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    currentYear,
    analyticsSummary,
    analyticsLoading,
    categoryDistribution,
    categoryLoading,
    paymentMethodsData,
    paymentMethodsRawData,
    paymentMethodsLoading,
    dailySpendingData, // not directly needed (container fetches internally, kept for potential stats)
    monthlyTrendLoading,
    monthlyTrendData,
    layoutConfig,
  } = useDashboardContext();

  const navigate = useNavigate();
  const [customizationOpen, setCustomizationOpen] = useState(false);

  // Inject dependencies into centralized action creators.
  const { exportReports, viewAllTransactions, openFilter } = useMemo(
    () => createDashboardActions({ navigate }),
    [navigate]
  );

  // Use MUI's useMediaQuery for responsive detection (reacts to window resize)
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const isSmallDesktop = useMediaQuery("(max-width:1200px)");

  const hasTransactions =
    Array.isArray(analyticsSummary?.lastTenExpenses) &&
    analyticsSummary.lastTenExpenses.length > 0;
  const hasBudgetData = Array.isArray(analyticsSummary?.budgets)
    ? analyticsSummary.budgets.length > 0
    : analyticsSummary?.remainingBudget != null ||
      analyticsSummary?.totalLosses != null;
  const hasCategoryData =
    Array.isArray(categoryDistribution) && categoryDistribution.length > 0;
  const hasPaymentData =
    Array.isArray(paymentMethodsData) && paymentMethodsData.length > 0;
  const hasDailySpending =
    (Array.isArray(dailySpendingData) && dailySpendingData.length > 0) ||
    (Array.isArray(dailySpendingData?.data) &&
      dailySpendingData.data.length > 0) ||
    (Array.isArray(dailySpendingData?.datasets?.[0]?.data) &&
      dailySpendingData.datasets[0].data.some((v) => Number.isFinite(v)));
  const hasAnySectionData =
    hasDailySpending ||
    hasCategoryData ||
    hasPaymentData ||
    hasTransactions ||
    hasBudgetData;

  // Prepare props for section components
  const sectionProps = {
    analyticsSummary,
    analyticsLoading,
    appOverviewData,
    appOverviewLoading,
    currencySymbol,
    isMobile,
    isTablet,
    isSmallDesktop,
    categoryDistribution,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    categoryLoading,
    paymentMethodsData,
    paymentMethodsRawData,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    paymentMethodsLoading,
    currentYear,
    viewAllTransactions,
  };

  // Render a section based on its configuration
  const renderSection = (section, layoutType = null) => {
    const Component = SECTION_COMPONENTS[section.id];
    if (!Component) return null;

    // Pass layout info to components that need it
    const extendedProps = {
      ...sectionProps,
      sectionType: layoutType || section.type,
      isCompact: layoutType === "half" || section.type === "half",
    };

    return (
      <div
        key={section.id}
        className={`dashboard-section dashboard-section-${
          section.id
        } section-type-${layoutType || section.type}`}
        data-section-id={section.id}
        data-section-type={layoutType || section.type}
      >
        {Component(extendedProps)}
      </div>
    );
  };

  // Build layout groups from visible sections in their actual order
  // Groups consecutive non-full sections together for side-by-side rendering
  const buildLayoutGroups = () => {
    const groups = [];
    let currentGroup = null;

    layoutConfig.visibleSections.forEach((section) => {
      if (section.type === "full") {
        // Full sections always get their own row
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        groups.push({ type: "full", sections: [section] });
      } else {
        // Half or bottom sections can be grouped together
        if (!currentGroup) {
          currentGroup = { type: "row", sections: [] };
        }
        currentGroup.sections.push(section);

        // If we have 2 sections in a row, close the group
        if (currentGroup.sections.length >= 2) {
          groups.push(currentGroup);
          currentGroup = null;
        }
      }
    });

    // Don't forget any remaining sections
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const layoutGroups = buildLayoutGroups();

  // Determine grid columns based on section IDs and types in a row
  const getRowGridColumns = (sections) => {
    // Mobile and tablet: always stack vertically
    if (isMobile || isTablet) return "1fr";
    if (sections.length === 1) return "1fr";

    const sectionIds = sections.map((s) => s.id);

    // Special case: Recent Transactions + Budget Overview = 2:1 ratio
    // Recent Transactions should be wider
    if (
      sectionIds.includes("recent-transactions") &&
      sectionIds.includes("budget-overview")
    ) {
      const recentIndex = sectionIds.indexOf("recent-transactions");
      return recentIndex === 0 ? "2fr 1fr" : "1fr 2fr";
    }

    // All other combinations get equal width
    return "1fr 1fr";
  };

  // Render a row of sections (half/bottom types)
  const renderRowGroup = (group, groupIndex) => {
    // Only mark as compact if it's a half-width section and not on mobile/tablet
    const hasOnlyHalfSections = group.sections.every((s) => s.type === "half");
    const isCompact =
      group.sections.length > 1 &&
      hasOnlyHalfSections &&
      !isMobile &&
      !isTablet;

    return (
      <div
        key={`row-${groupIndex}`}
        className={`section-row ${isMobile ? "mobile" : ""} ${
          isTablet ? "tablet" : ""
        }`}
        style={{
          display: "grid",
          gridTemplateColumns: getRowGridColumns(group.sections),
          gap: isMobile ? 12 : isTablet ? 16 : 24,
          width: "100%",
        }}
      >
        {analyticsLoading
          ? group.sections.map((section) => {
              if (section.id === "recent-transactions") {
                return (
                  <RecentTransactionsSkeleton
                    key={section.id}
                    count={10}
                    isCompact={isCompact}
                  />
                );
              }
              if (section.id === "budget-overview") {
                return (
                  <BudgetOverviewSkeleton
                    key={section.id}
                    count={4}
                    isCompact={isCompact}
                  />
                );
              }
              if (section.id === "summary-overview") {
                return <SummaryOverviewSkeleton key={section.id} />;
              }
              // For chart sections during loading, render the section with loading state
              return renderSection(section, section.type);
            })
          : group.sections.map((section) => {
              const extendedProps = {
                ...sectionProps,
                sectionType: section.type,
                isCompact: isCompact,
              };
              return (
                <div
                  key={section.id}
                  className={`dashboard-section dashboard-section-${section.id} section-type-${section.type}`}
                  data-section-id={section.id}
                  data-section-type={section.type}
                >
                  {SECTION_COMPONENTS[section.id]?.(extendedProps)}
                </div>
              );
            })}
      </div>
    );
  };

  return (
    <div
      className="expense-dashboard"
      style={{
        backgroundColor: colors.secondary_bg,
        color: colors.primary_text,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <DashboardHeader
        onRefresh={forceRefresh}
        onExport={exportReports}
        onFilter={openFilter}
        onCustomize={() => setCustomizationOpen(true)}
      />

      <DashboardCustomizationModal
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        sections={layoutConfig.sections}
        onToggleSection={layoutConfig.toggleSection}
        onReorderSections={layoutConfig.reorderSections}
        onResetLayout={layoutConfig.resetLayout}
        onSaveLayout={layoutConfig.saveLayout}
      />

      {/* Render sections in their actual order, grouping non-full sections */}
      {layoutGroups.map((group, index) => {
        if (group.type === "full") {
          return renderSection(group.sections[0]);
        }
        return renderRowGroup(group, index);
      })}

      {!analyticsLoading && !hasAnySectionData && (
        <div style={{ marginTop: isMobile ? 16 : 24 }}>
          <EmptyStateCard
            icon="📊"
            title="No dashboard data yet"
            message="Add expenses, budgets, or categories to see your personalized analytics."
            height={220}
          />
        </div>
      )}
    </div>
  );
}
