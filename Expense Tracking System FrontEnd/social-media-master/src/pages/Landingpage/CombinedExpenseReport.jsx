import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGroupedCashflow from "../../hooks/useGroupedCashflow";
import ReportHeader from "../../components/ReportHeader";
import GroupedExpensesAccordion from "../../components/GroupedExpensesAccordion";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import { ExpensesLoadingSkeleton } from "../../components/skeletons/CommonSkeletons";
import { getChartColors } from "../../utils/chartColors";
import "../Landingpage/Payment Report/PaymentReport.css"; // Reuse existing payment report styles

// Combined Expenses Report: Overview, payment method distribution, usage, category distribution, expenses accordion.
const COLORS = getChartColors(12);

export default function CombinedExpenseReport() {
  const { friendId } = useParams();
  const navigate = useNavigate();
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
  } = useGroupedCashflow({ friendId });

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

  const handleFilter = () => {
    console.log("Filter controls placeholder (not implemented)");
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

  return (
    <div className="payment-methods-report">
      <ReportHeader
        className="payment-methods-header"
        title="🧾 Expenses Report"
        subtitle="Expenses grouped togethere"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onFilter={handleFilter}
        onExport={handleExport}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={setFlowType}
      />

      {error && (
        <div style={{ color: "#ff6b6b", marginBottom: 16 }}>
          <div>Expenses Error: {error}</div>
        </div>
      )}

      {/* Overview cards: expenses mode with grouped payment method data */}
      <SharedOverviewCards data={methodsData} mode="expenses" />

      <div className="charts-grid">
        <div className="chart-row full-width">
          {/* Pass rawData directly; component will normalize payment method blocks internally */}

          <GroupedExpensesAccordion rawData={rawData} summary={summary} />
        </div>
      </div>
    </div>
  );
}
