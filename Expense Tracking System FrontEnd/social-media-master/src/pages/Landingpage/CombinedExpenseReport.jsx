import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGroupedCashflow from "../../hooks/useGroupedCashflow";
import useCategoryFlowData from "../../hooks/useCategoryFlowData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import ReportHeader from "../../components/ReportHeader";
import GroupedExpensesAccordion from "../../components/GroupedExpensesAccordion";
import DailySpendingContainer from "../../components/DailySpendingContainer";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import CategoryBreakdownChart from "../Dashboard/CategoryBreakdownChart";
import PaymentMethodChart from "../Dashboard/PaymentMethodChart";
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

  // Fetch category data
  const { categoryExpenses, loading: categoryLoading } = useCategoryFlowData({
    friendId,
    isFriendView: !!friendId,
    search: "",
  });

  // Map flowType to payment methods timeframe format
  const paymentMethodsTimeframe = (() => {
    if (timeframe === "month") return "this_month";
    if (timeframe === "year") return "this_month";
    if (timeframe === "week") return "this_month";
    return "this_month";
  })();

  // Map flowType to payment methods flow type
  const paymentMethodsFlowType =
    flowType === "outflow" ? "loss" : flowType === "inflow" ? "gain" : "loss";

  // Map flowType to category flow type (loss/gain)
  const categoryFlowType =
    flowType === "outflow" ? "loss" : flowType === "inflow" ? "gain" : "loss";

  // Fetch payment methods data using the same API as dashboard
  const { data: paymentMethodsData, loading: paymentMethodsLoading } =
    usePaymentMethodsData({
      timeframe: paymentMethodsTimeframe,
      flowType: paymentMethodsFlowType,
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
        <div className="chart-row">
          <DailySpendingContainer
            height={260}
            refreshTrigger={
              rawData /* trigger refetch when grouped data changes */
            }
          />
        </div>

        {/* Category Breakdown and Payment Method Charts in same row */}
        <div className="chart-row">
          <CategoryBreakdownChart
            data={categoryExpenses}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            flowType={categoryFlowType}
            onFlowTypeChange={(newFlowType) => {
              // Map back to grouped cashflow flowType
              const mappedFlowType =
                newFlowType === "loss"
                  ? "outflow"
                  : newFlowType === "gain"
                  ? "inflow"
                  : "all";
              setFlowType(mappedFlowType);
            }}
            loading={categoryLoading}
          />
          <PaymentMethodChart
            data={paymentMethodsData}
            timeframe={paymentMethodsTimeframe}
            onTimeframeChange={(newTimeframe) => {
              // Map back to grouped cashflow timeframe if needed
              setTimeframe("month");
            }}
            flowType={paymentMethodsFlowType}
            onFlowTypeChange={(newFlowType) => {
              // Map back to grouped cashflow flowType
              const mappedFlowType =
                newFlowType === "loss"
                  ? "outflow"
                  : newFlowType === "gain"
                  ? "inflow"
                  : "all";
              setFlowType(mappedFlowType);
            }}
            loading={paymentMethodsLoading}
          />
        </div>

        <div className="chart-row full-width">
          {/* Pass rawData directly; component will normalize payment method blocks internally */}
          <GroupedExpensesAccordion rawData={rawData} summary={summary} />
        </div>
      </div>
    </div>
  );
}
