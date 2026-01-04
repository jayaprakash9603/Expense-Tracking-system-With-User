import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGroupedCashflow from "../../hooks/useGroupedCashflow";
import useCategoryDistributionData from "../../hooks/useCategoryDistributionData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import ReportHeader from "../../components/ReportHeader";
import GroupedExpensesAccordion from "../../components/GroupedExpensesAccordion";
import DailySpendingContainer from "../../components/DailySpendingContainer";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import CategoryBreakdownChart from "../Dashboard/CategoryBreakdownChart";
import PaymentMethodChart from "../Dashboard/PaymentMethodChart";
import {
  ExpensesLoadingSkeleton,
  ChartSkeleton,
  ReportHeaderSkeleton,
} from "../../components/skeletons/CommonSkeletons";
import { getChartColors } from "../../utils/chartColors";
import { useTheme } from "../../hooks/useTheme";
import ReportFilterDrawer from "../../components/reportFilters/ReportFilterDrawer";
import useExpenseReportFilters from "../../hooks/reportFilters/useExpenseReportFilters";
import "../Landingpage/Payment Report/PaymentReport.css"; // Reuse existing payment report styles

// Combined Expenses Report: Overview, payment method distribution, usage, category distribution, expenses accordion.
const COLORS = getChartColors(12);

export default function CombinedExpenseReport() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();

  // Independent state for each chart
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("loss");
  const [paymentMethodTimeframe, setPaymentMethodTimeframe] =
    useState("this_month");
  const [paymentMethodFlowType, setPaymentMethodFlowType] = useState("loss");
  const {
    timeframe,
    setTimeframe,
    flowType,
    setFlowType,
    loading,
    error,
    rawData,
    summary,
    methodsData,
    refetch,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
  } = useGroupedCashflow({ friendId });

  const {
    filterDefaults: baseExpenseFilterDefaults,
    filterValues,
    sections: expenseFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredMethodsData,
    filteredExpenseSummary,
  } = useExpenseReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    methodsData,
    summary,
  });

  // Fetch category data with independent state
  const { distribution: categoryDistribution, loading: categoryLoading } =
    useCategoryDistributionData({
      timeframe: categoryTimeframe,
      flowType: categoryFlowType,
      refreshTrigger: rawData,
    });

  // Fetch payment methods data using independent state
  const {
    data: paymentMethodsData,
    rawData: paymentMethodsRawData,
    loading: paymentMethodsLoading,
  } = usePaymentMethodsData({
    timeframe: paymentMethodTimeframe,
    flowType: paymentMethodFlowType,
    refreshTrigger: rawData,
  });

  // Removed category and fallback category spending logic

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
  };

  const handleExport = () => {
    // Perform export using latest data (placeholder for real export logic/hook)
    console.log(
      "Export triggered for timeframe",
      timeframe,
      "flowType",
      flowType
    );
    // Could integrate download logic here or via new hook (future enhancement)
  };

  if (loading) return <ExpensesLoadingSkeleton />;

  // Map timeframe used by grouped cashflow (week|month|year) to daily spending timeframe tokens
  const dailyTimeframe = (() => {
    if (timeframe === "month") return "this_month";
    if (timeframe === "year") return "this_month"; // no year aggregation yet; fallback to current month
    if (timeframe === "week") return "this_month"; // week not supported; could enhance hook later
    return "this_month";
  })();

  // Map flowType (all|outflow|inflow) to daily spending type (loss|gain|undefined)
  const dailyType =
    flowType === "outflow"
      ? "loss"
      : flowType === "inflow"
      ? "gain"
      : undefined;

  return (
    <div
      className="payment-methods-report"
      style={{
        background: colors.secondary_bg,
        minHeight: "100vh-100px",
        padding: "0",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: colors.secondary_bg,
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <ReportHeader
          className="payment-methods-header"
          title="🧾 Expenses Report"
          subtitle="Expenses grouped together"
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onFilter={openFilters}
          onExport={handleExport}
          onBack={handleBack}
          flowType={flowType}
          onFlowTypeChange={setFlowType}
          dateRangeProps={{
            fromDate: dateRange?.fromDate,
            toDate: dateRange?.toDate,
            onApply: setCustomDateRange,
            onReset: resetDateRange,
          }}
          isCustomRangeActive={isCustomRange}
          showFilterButton={expenseFilterSections.length > 0}
          filterButtonLabel="Filter"
          isFilterActive={filtersActive}
        />
      </div>

      <div style={{ padding: "0 24px 24px 24px" }}>
        {error && (
          <div
            style={{
              color: "#ff6b6b",
              marginBottom: 16,
              padding: "12px 16px",
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
            }}
          >
            <div>Expenses Error: {error}</div>
          </div>
        )}

        {/* Overview cards: expenses mode with grouped payment method data */}
        <SharedOverviewCards data={filteredMethodsData} mode="expenses" />

        <div
          className="charts-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            className="chart-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
            }}
          >
            <DailySpendingContainer
              height={260}
              refreshTrigger={rawData}
              showSkeleton={false}
            />
          </div>

          {/* Category Breakdown and Payment Method Charts in same row */}
          <div
            className="chart-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <CategoryBreakdownChart
              data={categoryDistribution}
              timeframe={categoryTimeframe}
              onTimeframeChange={setCategoryTimeframe}
              flowType={categoryFlowType}
              onFlowTypeChange={setCategoryFlowType}
              loading={categoryLoading}
              skeleton={
                loading ? (
                  <ChartSkeleton height={480} variant="pie" noHeader />
                ) : null
              }
            />
            <PaymentMethodChart
              data={paymentMethodsData}
              rawData={paymentMethodsRawData}
              timeframe={paymentMethodTimeframe}
              onTimeframeChange={setPaymentMethodTimeframe}
              flowType={paymentMethodFlowType}
              onFlowTypeChange={setPaymentMethodFlowType}
              loading={paymentMethodsLoading}
              skeleton={
                loading ? (
                  <ChartSkeleton height={480} variant="pie" noHeader />
                ) : null
              }
            />
          </div>

          <div
            className="chart-row full-width"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
            }}
          >
            <GroupedExpensesAccordion
              methods={filteredMethodsData}
              summary={filteredExpenseSummary}
            />
          </div>
        </div>
      </div>
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={expenseFilterSections}
        values={filterValues}
        initialValues={baseExpenseFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}
