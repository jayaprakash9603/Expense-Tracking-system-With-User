import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import DashboardHeader from "../../components/DashboardHeader";
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
  } = useDashboardContext();

  const navigate = useNavigate();

  // Inject dependencies into centralized action creators.
  const { exportReports, viewAllTransactions, openFilter } = useMemo(
    () => createDashboardActions({ navigate }),
    [navigate]
  );

  const isMobile = window.matchMedia("(max-width:600px)").matches;
  const isTablet = window.matchMedia("(max-width:1024px)").matches;

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
      />
      <MetricsGrid
        analyticsSummary={analyticsSummary}
        loading={analyticsLoading}
        currencySymbol={currencySymbol}
      />

      <div className="charts-grid">
        <div className="chart-row">
          <DailySpendingContainer
            height={isMobile ? 200 : isTablet ? 240 : 100}
            refreshTrigger={Math.random()} /* can use refreshKey from context later */
            showSkeleton={analyticsLoading}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <QuickAccess />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: !isMobile ? "1fr 1fr" : "1fr",
              gap: !isMobile ? 24 : 16,
              gridColumn: "1 / -1",
            }}
          >
            <SummaryOverview
              summary={{
                groupsCreated: 3,
                groupsMember: 5,
                pendingInvitations: 2,
                friendsCount: 12,
                pendingFriendRequests: 1,
              }}
            />
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
          </div>
        </div>
        <div className="chart-row">
          <MonthlyTrendContainer
            initialYear={currentYear}
            refreshTrigger={Math.random()} /* context already manages; placeholder for integration */
            height={isMobile ? 260 : isTablet ? 380 : 600}
            maxYear={currentYear}
            showSkeleton={analyticsLoading}
          />
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
        </div>
      </div>
      <div className="bottom-section">
        {analyticsLoading ? (
          <>
            <RecentTransactionsSkeleton count={10} />
            <BudgetOverviewSkeleton count={4} />
          </>
        ) : (
          <>
            <RecentTransactions
              transactions={analyticsSummary?.lastTenExpenses ?? []}
              onViewAll={viewAllTransactions}
            />
            <BudgetOverview
              remainingBudget={analyticsSummary?.remainingBudget ?? 0}
              totalLosses={analyticsSummary?.totalLosses ?? 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
