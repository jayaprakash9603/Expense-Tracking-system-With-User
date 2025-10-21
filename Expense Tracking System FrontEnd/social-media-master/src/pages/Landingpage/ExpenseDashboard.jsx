import React, { useState } from "react";
import { useMediaQuery } from "@mui/material";
import "./ExpenseDashboard.css";
// Removed unused icon imports
import {
  CategoryBreakdownChart,
  PaymentMethodChart,
  RecentTransactions,
  BudgetOverview,
  BudgetOverviewSkeleton,
  RecentTransactionsSkeleton,
  MetricsGrid,
} from "../Dashboard";
import DailySpendingContainer from "../../components/DailySpendingContainer";
import SummaryOverview from "../../components/SummaryOverview";
import DashboardHeader from "../../components/DashboardHeader";
import ChartSkeleton from "../Dashboard/ChartSkeleton";
import QuickAccess from "./QuickAccess";
import MonthlyTrendContainer from "../../components/MonthlyTrendContainer";
import useAnalyticsSummary from "../../hooks/useAnalyticsSummary";
import useCategoryDistributionData from "../../hooks/useCategoryDistributionData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import { api } from "../../config/api";

// Main Dashboard Component
const ExpenseDashboard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const [refreshKey, setRefreshKey] = useState(0);
  const [paymentMethodsTimeframe, setPaymentMethodsTimeframe] =
    useState("this_month");
  const [paymentMethodsFlowType, setPaymentMethodsFlowType] = useState("loss");
  const [timeframe, setTimeframe] = useState("this_month"); // daily spending timeframe
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month"); // category breakdown timeframe
  const [categoryFlowType, setCategoryFlowType] = useState("loss"); // category breakdown gain/loss
  // Separate type state for daily spending to avoid triggering other API calls
  const [dailyType, setDailyType] = useState("loss");
  // daily spending managed internally by DailySpendingContainer hook

  const currentYear = new Date().getFullYear();
  // Hook-managed data
  const { distribution: categoryDistribution, loading: hookCategoryLoading } =
    useCategoryDistributionData({
      timeframe: categoryTimeframe,
      flowType: categoryFlowType,
      refreshTrigger: refreshKey,
    });

  const { summary: analyticsSummary, loading: hookAnalyticsLoading } =
    useAnalyticsSummary({ timeframe, refreshTrigger: refreshKey });

  const { data: paymentMethodsData, loading: hookPaymentLoading } =
    usePaymentMethodsData({
      timeframe: paymentMethodsTimeframe,
      flowType: paymentMethodsFlowType,
      refreshTrigger: refreshKey,
    });

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleExport = async () => {
    const response = await api.get("/api/expenses/generate-excel-report");
    const response1 = await api.get("/api/bills/export/excel");
    window.alert("Excel report generated");
  };

  const handleFilter = () => {
    console.log("Opening filter options...");
  };

  // Monthly trend handled by MonthlyTrendContainer; per-section hooks manage loading.

  return (
    <div className="expense-dashboard">
      {/* Monthly Trend */}

      <DashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onFilter={handleFilter}
      />

      {/* Key Metrics */}
      <MetricsGrid
        analyticsSummary={analyticsSummary}
        loading={hookAnalyticsLoading}
      />

      {/* Main Charts Grid */}
      <div className="charts-grid">
        <div className="chart-row">
          <DailySpendingContainer
            timeframe={timeframe}
            type={dailyType}
            onTimeframeChange={(val) => setTimeframe(val)}
            onTypeChange={(type) => setDailyType(type)}
            height={isMobile ? 200 : isTablet ? 240 : 100}
            refreshTrigger={refreshKey}
          />

          {/* Quick Access */}
          <div style={{ gridColumn: "1 / -1" }}>
            <QuickAccess />
          </div>

          {/* Overview + Category grid */}
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
              onTimeframeChange={(val) => setCategoryTimeframe(val)}
              flowType={categoryFlowType}
              onFlowTypeChange={(t) => setCategoryFlowType(t)}
              loading={hookCategoryLoading}
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
            refreshTrigger={refreshKey}
            height={isMobile ? 260 : isTablet ? 380 : 600}
            maxYear={currentYear}
          />
          <PaymentMethodChart
            data={paymentMethodsData}
            timeframe={paymentMethodsTimeframe}
            onTimeframeChange={(val) => setPaymentMethodsTimeframe(val)}
            flowType={paymentMethodsFlowType}
            onFlowTypeChange={(t) => setPaymentMethodsFlowType(t)}
            loading={hookPaymentLoading}
            skeleton={<ChartSkeleton height={480} variant="pie" noHeader />}
          />
        </div>
      </div>

      <div className="bottom-section">
        {hookAnalyticsLoading ? (
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
};

export default ExpenseDashboard;
