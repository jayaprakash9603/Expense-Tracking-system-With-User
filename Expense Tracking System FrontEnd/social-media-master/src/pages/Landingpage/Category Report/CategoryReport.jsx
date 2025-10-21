import React from "react";
import { useNavigate, useParams } from "react-router-dom";
// Removed unused MUI components, Recharts wrapper, extra skeletons, and icon imports (header encapsulates its own UI)
import { CategoryLoadingSkeleton } from "../../../components/skeletons/CommonSkeletons";
import "./CategoryReport.css";
import useCategoryReportData from "../../../hooks/useCategoryReportData";
import CategoryExpensesAccordion from "../../../components/CategoryExpensesAccordion";
import ReportHeader from "../../../components/ReportHeader";
import PaymentUsageChart from "../../../components/charts/PaymentUsageChart";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import { getChartColors } from "../../../utils/chartColors";

const COLORS = getChartColors(10); // limit to first 10 for category distribution

// COLORS used for fallback pie slice coloring

// Main Category Report Component
const CategoryReport = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    loading,
    error,
    categories: categorySpending,
    monthlyTrends,
    dailySpending,
    refresh,
  } = useCategoryReportData({ friendId });

  const handleFilter = () => {
    console.log("Opening category filters...");
  };

  const handleExport = () => {
    console.log("Exporting category report...");
  };

  const handleTimeframeChange = (newTimeframe) => setTimeframe(newTimeframe);
  const handleFlowTypeChange = (newFlow) => setFlowType(newFlow);

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
  };

  if (loading) {
    return <CategoryLoadingSkeleton />;
  }

  return (
    <div className="category-report">
      <ReportHeader
        className="category-report-header"
        title="📊 Category Analytics"
        subtitle="Comprehensive spending analysis by categories"
        onFilter={handleFilter}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
      />

      {error ? (
        <div style={{ padding: 16, color: "#ff6b6b" }}>Error: {error}</div>
      ) : null}

      <SharedOverviewCards data={categorySpending} mode="category" />

      <div className="charts-grid">
        {/* Row 2: Usage Analysis (reused payment usage chart for categories) */}
        <div className="chart-row full-width">
          <PaymentUsageChart
            data={(Array.isArray(categorySpending) ? categorySpending : []).map(
              (c) => ({
                method: c.name, // reuse field expected by PaymentUsageChart
                totalAmount: c.amount,
                transactions: c.transactions,
              })
            )}
          />
        </div>
        {/* Row 1: Distribution and Spending Analysis */}
        <div className="chart-row full-width">
          <SharedDistributionChart
            data={categorySpending}
            mode="category"
            colorsFallback={COLORS}
          />
        </div>

        {/* Row 4: Full Width Category Expenses Accordion (replaces performance table) */}
        <div className="chart-row full-width">
          <CategoryExpensesAccordion categories={categorySpending} />
        </div>
      </div>
    </div>
  );
};

export default CategoryReport;
