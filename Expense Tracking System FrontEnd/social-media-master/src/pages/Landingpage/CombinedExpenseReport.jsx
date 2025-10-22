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
} from "../../components/skeletons/CommonSkeletons";
import { getChartColors } from "../../utils/chartColors";
import "../Landingpage/Payment Report/PaymentReport.css"; // Reuse existing payment report styles

// Combined Expenses Report: Overview, payment method distribution, usage, category distribution, expenses accordion.
const COLORS = getChartColors(12);

export default function CombinedExpenseReport() {
  const { friendId } = useParams();
  const navigate = useNavigate();

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
  } = useGroupedCashflow({ friendId });

  // Fetch category data with independent state
  const { distribution: categoryDistribution, loading: categoryLoading } =
    useCategoryDistributionData({
      timeframe: categoryTimeframe,
      flowType: categoryFlowType,
      refreshTrigger: rawData,
    });

  // Fetch payment methods data using independent state
  const { data: paymentMethodsData, loading: paymentMethodsLoading } =
    usePaymentMethodsData({
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
            refreshTrigger={rawData}
            showSkeleton={false}
          />
        </div>

        {/* Category Breakdown and Payment Method Charts in same row */}
        <div className="chart-row">
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

        <div className="chart-row full-width">
          <GroupedExpensesAccordion rawData={rawData} summary={summary} />
        </div>
      </div>
    </div>
  );
}
