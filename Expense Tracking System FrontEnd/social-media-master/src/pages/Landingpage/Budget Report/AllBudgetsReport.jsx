import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import useBudgetReportData from "../../../hooks/useBudgetReportData";
import useBudgetReportFilters from "../../../hooks/reportFilters/useBudgetReportFilters";
import ReportHeader from "../../../components/ReportHeader";
import BudgetAccordionGroup from "../../../components/BudgetAccordion";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import BudgetOverviewGrid from "../../../components/budget/BudgetOverviewGrid";
import {
  AllBudgetsLoadingSkeleton,
  PaymentLoadingSkeleton,
} from "../../../components/skeletons/CommonSkeletons";
import { getChartColors } from "../../../utils/chartColors";
import TopRecurringExpensesCard from "../../../components/budget/TopRecurringExpensesCard";
import LossGainBreakdownCard from "../../../components/budget/LossGainBreakdownCard";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
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
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    loading,
    error,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
    topRecurringExpenses,
  } = useBudgetReportData({ friendId });

  const {
    filterDefaults: baseBudgetFilterDefaults,
    filterValues,
    sections: budgetFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredBudgets,
    filteredBudgetSummary,
    effectiveCategoryBreakdown,
    effectivePaymentBreakdown,
  } = useBudgetReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
  });

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

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
    return <AllBudgetsLoadingSkeleton />;
  }

  return (
    <div
      className="payment-methods-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeader
        className="payment-methods-header"
        title="💰 Budget Analytics"
        subtitle="Comprehensive analysis of budget allocations and spending trends"
        onFilter={openFilters}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
        dateRangeProps={{
          fromDate: dateRange?.fromDate,
          toDate: dateRange?.toDate,
          onApply: setCustomDateRange,
          onReset: resetDateRange,
        }}
        isCustomRangeActive={isCustomRange}
        showFilterButton={budgetFilterSections.length > 0}
        isFilterActive={filtersActive}
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
      <SharedOverviewCards data={[filteredBudgetSummary]} mode="budget" />

      <div className="charts-grid">
        {(filteredBudgets.length > 0 || topRecurringExpenses.length > 0) && (
          <div className="chart-row">
            <TopRecurringExpensesCard
              budgets={filteredBudgets}
              items={topRecurringExpenses}
              layout="gridItem"
            />
            <LossGainBreakdownCard
              budgets={filteredBudgets}
              layout="gridItem"
            />
          </div>
        )}

        {/* Row 1: Category Distribution */}
        {effectiveCategoryBreakdown.length > 0 && (
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
              data={effectiveCategoryBreakdown}
              mode="category"
              title="Category Distribution"
              subtitle="Spending breakdown across categories in all budgets"
              colorsFallback={COLORS}
            />
          </div>
        )}

        {/* Row 2: Payment Method Distribution */}
        {effectivePaymentBreakdown.length > 0 && (
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
              data={effectivePaymentBreakdown}
              mode="payment"
              title="Payment Method Distribution"
              subtitle="How expenses are paid across all budgets"
              colorsFallback={COLORS}
            />
          </div>
        )}

        {/* Row 3: Budget Overview Grid */}
        {filteredBudgets.length > 0 && (
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
              <BudgetOverviewGrid budgets={filteredBudgets} />
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
            <BudgetAccordionGroup budgets={filteredBudgets} />
          </div>
        </div>
      </div>
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={budgetFilterSections}
        values={filterValues}
        initialValues={baseBudgetFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default AllBudgetsReport;
