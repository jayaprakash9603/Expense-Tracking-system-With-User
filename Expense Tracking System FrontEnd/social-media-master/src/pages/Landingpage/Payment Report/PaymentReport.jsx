import React from "react";
import { useNavigate, useParams } from "react-router-dom";
// (Removed individual Recharts imports; charts are encapsulated in child components)

// (Removed direct icon imports; header component encapsulates icons internally)
import "./PaymentReport.css";
import usePaymentReportData from "../../../hooks/usePaymentReportData";
import ReportHeader from "../../../components/ReportHeader";
import PaymentMethodAccordionGroup from "../../../components/PaymentMethodAccordion";
import { PaymentLoadingSkeleton } from "../../../components/skeletons/CommonSkeletons"; // Only loading skeleton needed locally
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import PaymentUsageChart from "../../../components/charts/PaymentUsageChart";
import TransactionSizeChart from "../../../components/charts/TransactionSizeChart";
import CategoryPaymentBreakdown from "../../../components/charts/CategoryPaymentBreakdown";
import { getChartColors } from "../../../utils/chartColors";
import { useTheme } from "../../../hooks/useTheme";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import usePaymentReportFilters from "../../../hooks/reportFilters/usePaymentReportFilters";

const COLORS = getChartColors();

// Main Payment Methods Report Component
const PaymentMethodsReport = () => {
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
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
    refresh,
  } = usePaymentReportData({ friendId });

  const {
    filterDefaults: basePaymentFilterDefaults,
    filterValues,
    sections: paymentFilterSections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredMethodsData,
    filteredCategoryBreakdown,
    filteredTxSizeData,
  } = usePaymentReportFilters({
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
  });

  // Responsive detection
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const handleExport = () => {
    console.log("Exporting payment methods report...");
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
    return <PaymentLoadingSkeleton />;
  }

  return (
    <div
      className={`payment-methods-report ${mode}`}
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeader
        className="payment-methods-header"
        title="💳 Payment Methods Analytics"
        subtitle="Comprehensive analysis of payment method usage and trends"
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
        showFilterButton={paymentFilterSections.length > 0}
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

      <SharedOverviewCards data={filteredMethodsData} mode="payment" />

      <div className="charts-grid">
        {/* Row 1: Distribution (full width) */}
        <div
          className="chart-row "
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr",
            gap: isMobile ? 16 : 24,
            width: "100%",
          }}
        >
          <SharedDistributionChart
            data={filteredMethodsData}
            mode="payment"
            colorsFallback={COLORS}
          />
        </div>

        {/* Row 2: Usage Analysis (full width) */}
        <div
          className="chart-row"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr",
            gap: isMobile ? 16 : 24,
            width: "100%",
          }}
        >
          <PaymentUsageChart data={filteredMethodsData} />
        </div>

        {/* Row 3: Transaction Sizes (computed) */}
        {filteredTxSizeData.length > 0 ? (
          <div className="chart-row">
            <TransactionSizeChart
              data={filteredTxSizeData}
              methodsColors={filteredMethodsData.map(({ method, color }) => ({
                method,
                color,
              }))}
            />
            {filteredCategoryBreakdown.length > 0 ? (
              <CategoryPaymentBreakdown
                data={filteredCategoryBreakdown}
                methodsColors={filteredMethodsData.map(({ method, color }) => ({
                  method,
                  color,
                }))}
              />
            ) : null}
          </div>
        ) : null}

        {/* Row 4: Payment Method Detailed Expenses (Accordion) */}
        <div className="chart-row full-width">
          <div
            className="chart-container"
            style={{
              background: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div className="chart-header">
              <h3 style={{ color: colors.primary_text }}>
                📂 Payment Method Expenses
              </h3>
              <div
                className="chart-subtitle"
                style={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}
              >
                Expand a method to view individual expenses (Loss / Gain tabs)
              </div>
            </div>
            <PaymentMethodAccordionGroup methods={filteredMethodsData} />
          </div>
        </div>
      </div>
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={paymentFilterSections}
        values={filterValues}
        initialValues={basePaymentFilterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default PaymentMethodsReport;
