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

const COLORS = getChartColors();

// Main Payment Methods Report Component
const PaymentMethodsReport = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    loading,
    error,
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
    refresh,
  } = usePaymentReportData({ friendId });

  const handleFilter = () => {
    console.log("Opening payment methods filters...");
  };

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
    <div className="payment-methods-report">
      <ReportHeader
        className="payment-methods-header"
        title="💳 Payment Methods Analytics"
        subtitle="Comprehensive analysis of payment method usage and trends"
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

      <SharedOverviewCards data={methodsData} mode="payment" />

      <div className="charts-grid">
        {/* Row 1: Distribution (full width) */}
        <div className="chart-row full-width">
          <SharedDistributionChart
            data={methodsData}
            mode="payment"
            colorsFallback={COLORS}
          />
        </div>

        {/* Row 2: Usage Analysis (full width) */}
        <div className="chart-row full-width">
          <PaymentUsageChart data={methodsData} />
        </div>

        {/* Row 3: Transaction Sizes (computed) */}
        {txSizeData.length > 0 ? (
          <div className="chart-row">
            <TransactionSizeChart
              data={txSizeData}
              methodsColors={methodsData.map(({ method, color }) => ({
                method,
                color,
              }))}
            />
            {categoryBreakdown.length > 0 ? (
              <CategoryPaymentBreakdown
                data={categoryBreakdown}
                methodsColors={methodsData.map(({ method, color }) => ({
                  method,
                  color,
                }))}
              />
            ) : null}
          </div>
        ) : null}

        {/* Row 4: Payment Method Detailed Expenses (Accordion) */}
        <div className="chart-row full-width">
          <div className="chart-container">
            <div className="chart-header">
              <h3>📂 Payment Method Expenses</h3>
              <div className="chart-subtitle">
                Expand a method to view individual expenses (Loss / Gain tabs)
              </div>
            </div>
            <PaymentMethodAccordionGroup methods={methodsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsReport;
