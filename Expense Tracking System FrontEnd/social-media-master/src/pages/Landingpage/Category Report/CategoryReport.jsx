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
import { useTheme } from "../../../hooks/useTheme";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import useCategoryReportFilters from "../../../hooks/reportFilters/useCategoryReportFilters";
import CategoryDailySpendingChart from "../../../components/category/CategoryDailySpendingChart";

const COLORS = getChartColors(10); // limit to first 10 for category distribution

// COLORS used for fallback pie slice coloring

// Main Category Report Component
const CategoryReport = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
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
    categories: categorySpending,
    refresh,
  } = useCategoryReportData({ friendId });

  const {
    filterDefaults: baseCategoryFilterDefaults,
    filterValues,
    sections: categoryFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredCategories,
  } = useCategoryReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    categorySpending,
  });

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
    <div
      className={`category-report ${mode}`}
      style={{
        background: colors.secondary_bg,
        color: colors.primary_text,
      }}
    >
      <ReportHeader
        className="category-report-header"
        title="📊 Category Analytics"
        subtitle="Comprehensive spending analysis by categories"
        onFilter={openFilters}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
        dateRangeProps={
          dateRange
            ? {
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                onApply: setCustomDateRange,
                onReset: resetDateRange,
              }
            : undefined
        }
        isCustomRangeActive={isCustomRange}
        showFilterButton={categoryFilterSections.length > 0}
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
                : "rgba(255, 107, 107, 0.15)",
            borderRadius: "8px",
            border: `1px solid ${
              mode === "dark"
                ? "rgba(255, 107, 107, 0.3)"
                : "rgba(255, 107, 107, 0.4)"
            }`,
            marginBottom: "16px",
          }}
        >
          Error: {error}
        </div>
      ) : null}

      <SharedOverviewCards data={filteredCategories} mode="category" />

      <CategoryDailySpendingChart
        categories={filteredCategories}
        timeframe={timeframe}
        flowType={flowType}
      />

      <div
        className="charts-grid"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Row 2: Usage Analysis (reused payment usage chart for categories) */}
        <div
          className="chart-row full-width"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
          }}
        >
          <PaymentUsageChart
            data={filteredCategories.map((c) => ({
              method: c.name,
              totalAmount: c.amount,
              transactions: c.transactions,
            }))}
          />
        </div>
        {/* Row 1: Distribution and Spending Analysis */}
        <div
          className="chart-row full-width"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
          }}
        >
          <SharedDistributionChart
            data={filteredCategories}
            mode="category"
            colorsFallback={COLORS}
          />
        </div>

        {/* Row 4: Full Width Category Expenses Accordion (replaces performance table) */}
        <div
          className="chart-row full-width"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
          }}
        >
          <CategoryExpensesAccordion categories={filteredCategories} />
        </div>
      </div>
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={categoryFilterSections}
        values={filterValues}
        initialValues={baseCategoryFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default CategoryReport;
