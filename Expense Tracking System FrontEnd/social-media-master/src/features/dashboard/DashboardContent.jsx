import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardCustomizationModal from "../../components/DashboardCustomizationModal";
import DailySpendingContainer from "../../components/DailySpendingContainer";
import SummaryOverview from "../../components/SummaryOverview";
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

// Section component mapping
const SECTION_COMPONENTS = {
  'metrics': ({ analyticsSummary, analyticsLoading, currencySymbol }) => (
    <MetricsGrid
      analyticsSummary={analyticsSummary}
      loading={analyticsLoading}
      currencySymbol={currencySymbol}
    />
  ),
  'daily-spending': ({ isMobile, isTablet, analyticsLoading }) => (
    <DailySpendingContainer
      height={isMobile ? 200 : isTablet ? 240 : 100}
      refreshTrigger={Math.random()}
      showSkeleton={analyticsLoading}
    />
  ),
  'quick-access': () => <QuickAccess />,
  'summary-overview': () => (
    <SummaryOverview
      summary={{
        groupsCreated: 3,
        groupsMember: 5,
        pendingInvitations: 2,
        friendsCount: 12,
        pendingFriendRequests: 1,
      }}
    />
  ),
  'category-breakdown': ({ 
    categoryDistribution, 
    categoryTimeframe, 
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    categoryLoading,
    analyticsLoading,
    isMobile 
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
          <ChartSkeleton
            height={isMobile ? 380 : 560}
            variant="pie"
            noHeader
          />
        ) : null
      }
    />
  ),
  'monthly-trend': ({ currentYear, analyticsLoading, isMobile, isTablet }) => (
    <MonthlyTrendContainer
      initialYear={currentYear}
      refreshTrigger={Math.random()}
      height={isMobile ? 260 : isTablet ? 380 : 600}
      maxYear={currentYear}
      showSkeleton={analyticsLoading}
    />
  ),
  'payment-methods': ({ 
    paymentMethodsData,
    paymentMethodsRawData,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    paymentMethodsLoading,
    analyticsLoading 
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
  'recent-transactions': ({ analyticsSummary, viewAllTransactions }) => (
    <RecentTransactions
      transactions={analyticsSummary?.lastTenExpenses ?? []}
      onViewAll={viewAllTransactions}
    />
  ),
  'budget-overview': ({ analyticsSummary }) => (
    <BudgetOverview
      remainingBudget={analyticsSummary?.remainingBudget ?? 0}
      totalLosses={analyticsSummary?.totalLosses ?? 0}
    />
  ),
};

// Central presentation component - minimal logic; relies on context for data/state.
export default function DashboardContent() {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
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

  const isMobile = window.matchMedia("(max-width:600px)").matches;
  const isTablet = window.matchMedia("(max-width:1024px)").matches;

  // Prepare props for section components
  const sectionProps = {
    analyticsSummary,
    analyticsLoading,
    currencySymbol,
    isMobile,
    isTablet,
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
  const renderSection = (section) => {
    const Component = SECTION_COMPONENTS[section.id];
    if (!Component) return null;

    return (
      <div
        key={section.id}
        className={`dashboard-section dashboard-section-${section.id}`}
        data-section-id={section.id}
      >
        {Component(sectionProps)}
      </div>
    );
  };

  // Group sections by type for rendering
  const fullWidthSections = layoutConfig.visibleSections.filter(s => s.type === 'full');
  const halfWidthSections = layoutConfig.visibleSections.filter(s => s.type === 'half');
  const bottomSections = layoutConfig.visibleSections.filter(s => s.type === 'bottom');

  // Group half-width sections into pairs
  const halfWidthPairs = [];
  for (let i = 0; i < halfWidthSections.length; i += 2) {
    halfWidthPairs.push(halfWidthSections.slice(i, i + 2));
  }

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

      {/* Full-width sections */}
      {fullWidthSections.map(renderSection)}

      {/* Charts grid with half-width sections */}
      {halfWidthPairs.length > 0 && (
        <div
          className="charts-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 16 : 24,
          }}
        >
          {halfWidthPairs.map((pair, pairIndex) => (
            <div
              key={`pair-${pairIndex}`}
              className="chart-row"
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? 16 : 24,
                width: "100%",
              }}
            >
              {pair.map(renderSection)}
            </div>
          ))}
        </div>
      )}

      {/* Bottom section */}
      {bottomSections.length > 0 && (
        <div className="bottom-section">
          {analyticsLoading ? (
            <>
              {bottomSections.some(s => s.id === 'recent-transactions') && (
                <RecentTransactionsSkeleton count={10} />
              )}
              {bottomSections.some(s => s.id === 'budget-overview') && (
                <BudgetOverviewSkeleton count={4} />
              )}
            </>
          ) : (
            bottomSections.map(renderSection)
          )}
        </div>
      )}
    </div>
  );
}
