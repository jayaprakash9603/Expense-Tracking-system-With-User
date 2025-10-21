import React from "react";
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

// Central presentation component - minimal logic; relies on context for data/state.
export default function DashboardContent() {
  const {
    forceRefresh,
    timeframe,
    setTimeframe,
    dailyType,
    setDailyType,
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
    paymentMethodsLoading,
    dailySpendingData, // not directly needed (container fetches internally, kept for potential stats)
    monthlyTrendLoading,
    monthlyTrendData,
  } = useDashboardContext();

  const handleExport = () => {
    // placeholder; original logic lives in ExpenseDashboard (API call & alert)
    // could be moved to provider if global
    console.log("Export triggered");
  };

  const handleFilter = () => console.log("Filter opened");

  const isMobile = window.matchMedia("(max-width:600px)").matches;
  const isTablet = window.matchMedia("(max-width:1024px)").matches;

  return (
    <div className="expense-dashboard">
      <DashboardHeader
        onRefresh={forceRefresh}
        onExport={handleExport}
        onFilter={handleFilter}
      />
      <MetricsGrid
        analyticsSummary={analyticsSummary}
        loading={analyticsLoading}
      />

      <div className="charts-grid">
        <div className="chart-row">
          <DailySpendingContainer
            timeframe={timeframe}
            type={dailyType}
            onTimeframeChange={setTimeframe}
            onTypeChange={setDailyType}
            height={isMobile ? 200 : isTablet ? 240 : 100}
            refreshTrigger={Math.random()} /* can use refreshKey from context later */
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
                <ChartSkeleton
                  height={isMobile ? 380 : 560}
                  variant="pie"
                  noHeader
                />
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
          />
          <PaymentMethodChart
            data={paymentMethodsData}
            timeframe={paymentMethodsTimeframe}
            onTimeframeChange={setPaymentMethodsTimeframe}
            flowType={paymentMethodsFlowType}
            onFlowTypeChange={setPaymentMethodsFlowType}
            loading={paymentMethodsLoading}
            skeleton={<ChartSkeleton height={480} variant="pie" noHeader />}
          />
        </div>
      </div>
      <div className="bottom-section">
        {analyticsLoading ? (
          <>
            <RecentTransactionsSkeleton count={8} />
            <BudgetOverviewSkeleton count={4} />
          </>
        ) : (
          <>
            <RecentTransactions
              transactions={analyticsSummary?.lastTenExpenses ?? []}
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
