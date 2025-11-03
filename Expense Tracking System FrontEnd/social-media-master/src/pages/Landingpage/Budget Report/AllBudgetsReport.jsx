import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import useBudgetReportData from "../../../hooks/useBudgetReportData";
import ReportHeader from "../../../components/ReportHeader";
import BudgetAccordionGroup from "../../../components/BudgetAccordion";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import BudgetOverviewGrid from "../../../components/budget/BudgetOverviewGrid";
import { PaymentLoadingSkeleton } from "../../../components/skeletons/CommonSkeletons";
import { getChartColors } from "../../../utils/chartColors";
import "../Payment Report/PaymentReport.css";

const COLORS = getChartColors();

/**
 * All Budgets Report Component
 * Displays comprehensive budget analytics with overview, category breakdown, payment method breakdown, and individual budgets
 */
const AllBudgetsReport = () => {
  const { colors, mode } = useTheme();
  const { friendId } = useParams();
  const navigate = useNavigate();

  const {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    loading,
    error,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
    summary,
    refresh,
  } = useBudgetReportData({ friendId });

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const handleFilter = () => {
    console.log("Opening budget filters...");
  };

  const handleExport = () => {
    console.log("Exporting budget report...");
  };

  const handleTimeframeChange = (newTimeframe) => setTimeframe(newTimeframe);
  const handleFlowTypeChange = (newFlow) => setFlowType(newFlow);

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/budgets");
    }
  };

  if (loading) {
    return <PaymentLoadingSkeleton />;
  }

  return (
    <div
      className="payment-methods-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeader
        className="payment-methods-header"
        title="💰 Budget Analytics"
        subtitle="Comprehensive analysis of budget allocation, spending, and performance"
        onFilter={handleFilter}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
      />

      {error ? (
        <div
          style={{
            padding: 16,
            color: "#ff6b6b",
            background:
              mode === "dark"
                ? "rgba(255, 107, 107, 0.1)"
                : "rgba(255, 107, 107, 0.05)",
            borderRadius: "8px",
            margin: "16px",
          }}
        >
          Error: {error}
        </div>
      ) : null}

      {/* Summary Cards */}
      <SharedOverviewCards
        data={[
          {
            totalBudgets: summary.totalBudgets || 0,
            activeBudgets:
              budgetsData.filter((b) => !b.isExpired).length || 0,
            totalSpent: summary.grandTotalSpent || 0,
            totalRemaining:
              budgetsData.reduce(
                (sum, b) => sum + (b.allocatedAmount - b.totalSpent),
                0
              ) || 0,
          },
        ]}
        mode="budget"
      />

      <div className="charts-grid">
        {/* Row 1: Category Distribution */}
        {categoryBreakdown.length > 0 && (
          <div
            className="chart-row"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr",
              gap: isMobile ? 16 : 24,
              width: "100%",
            }}
          >
            <SharedDistributionChart
              data={categoryBreakdown}
              mode="category"
              title="Category Distribution"
              subtitle="Spending breakdown across categories in all budgets"
              colorsFallback={COLORS}
            />
          </div>
        )}

        {/* Row 2: Payment Method Distribution */}
        {paymentMethodBreakdown.length > 0 && (
          <div
            className="chart-row"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr",
              gap: isMobile ? 16 : 24,
              width: "100%",
            }}
          >
            <SharedDistributionChart
              data={paymentMethodBreakdown}
              mode="payment"
              title="Payment Method Distribution"
              subtitle="How expenses are paid across all budgets"
              colorsFallback={COLORS}
            />
          </div>
        )}

        {/* Row 3: Budget Overview Grid */}
        {budgetsData.length > 0 && (
          <div className="chart-row full-width">
            <div
              className="chart-container"
              style={{
                background: colors.primary_bg,
                border: `1px solid ${colors.border_color}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <div className="chart-header" style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    color: colors.primary_text,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: "0 0 4px 0",
                  }}
                >
                  🎯 Budget Overview
                </h3>
                <div
                  className="chart-subtitle"
                  style={{
                    color: mode === "dark" ? "#888" : "#666",
                    fontSize: "14px",
                  }}
                >
                  Visual overview of all budget allocations and utilization
                </div>
              </div>
              <BudgetOverviewGrid budgets={budgetsData} />
            </div>
          </div>
        )}

        {/* Row 4: Detailed Budget Accordion */}
        <div className="chart-row full-width">
          <div
            className="chart-container"
            style={{
              background: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              padding: "20px",
              minHeight: "auto",
              height: "auto",
            }}
          >
            <div className="chart-header">
              <h3 style={{ color: colors.primary_text }}>
                📊 Individual Budget Details
              </h3>
              <div
                className="chart-subtitle"
                style={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}
              >
                Expand a budget to view expenses and detailed breakdown
              </div>
            </div>
            <BudgetAccordionGroup budgets={budgetsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBudgetsReport;
