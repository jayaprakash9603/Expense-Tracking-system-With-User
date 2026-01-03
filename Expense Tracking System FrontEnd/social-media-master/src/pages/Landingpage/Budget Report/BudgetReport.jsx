import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import useUserSettings from "../../../hooks/useUserSettings";
import useSingleBudgetReport from "../../../hooks/useSingleBudgetReport";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import GroupedExpensesAccordion from "../../../components/GroupedExpensesAccordion";
import { BudgetReportLoadingSkeleton } from "../../../components/skeletons/CommonSkeletons";
import ReportHeader from "../../../components/ReportHeader";
import { getChartColors } from "../../../utils/chartColors";
import { computeDateRange } from "../../../utils/reportParams";

const BudgetReport = () => {
  const { budgetId } = useParams();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const settings = useUserSettings();
  const [timeFrame, setTimeFrame] = useState("budget");
  const [flowType, setFlowType] = useState("all");
  const [customRange, setCustomRange] = useState(null);

  // Custom timeframe options for budget report
  const timeframeOptions = [
    { value: "budget", label: "Budget Period" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  const { loading, error, budgetData } = useSingleBudgetReport(
    budgetId,
    timeFrame,
    flowType,
    null,
    customRange
  );
  const summaryRange = useMemo(() => {
    const summary = budgetData?.summary;
    if (!summary?.startDate || !summary?.endDate) {
      return null;
    }
    return {
      fromDate: summary.startDate.slice(0, 10),
      toDate: summary.endDate.slice(0, 10),
    };
  }, [budgetData?.summary]);

  const defaultRange = useMemo(() => {
    if (timeFrame === "budget") {
      return summaryRange || computeDateRange("month");
    }
    if (timeFrame === "all") {
      return computeDateRange("all_time");
    }
    const supported = new Set(["week", "month", "quarter", "year"]);
    const normalized = supported.has(timeFrame) ? timeFrame : "month";
    return computeDateRange(normalized);
  }, [timeFrame, summaryRange]);

  const activeRange = customRange || defaultRange;

  const handleCustomRangeApply = (range) => {
    if (!range?.fromDate || !range?.toDate) {
      return;
    }
    setCustomRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
  };

  const handleResetRange = () => {
    setCustomRange(null);
  };

  const handleTimeframeChange = (nextTimeframe) => {
    setTimeFrame(nextTimeframe);
    setCustomRange(null);
  };

  const dateRangeProps = activeRange
    ? {
        fromDate: activeRange.fromDate,
        toDate: activeRange.toDate,
        onApply: handleCustomRangeApply,
        onReset: handleResetRange,
      }
    : undefined;

  const COLORS = getChartColors();

  // Calculate overview card data
  const overviewData = useMemo(() => {
    if (!budgetData?.summary) return null;

    const { summary } = budgetData;
    return [
      {
        title: "Total Amount",
        value: summary.totalAmount || 0,
        isCurrency: true,
      },
      {
        title: "Total Expenses",
        value: summary.totalExpenses || 0,
        isCurrency: false,
      },
      {
        title: "Expense Categories",
        value: summary.totalExpenseNames || 0,
        isCurrency: false,
      },
      {
        title: "Payment Methods",
        value: summary.paymentMethodTotals?.length || 0,
        isCurrency: false,
      },
    ];
  }, [budgetData]);

  const textColor = mode === "dark" ? "#e5e7eb" : "#1f2937";
  const bgColor = mode === "dark" ? "#1f2937" : "#ffffff";

  if (loading) {
    return <BudgetReportLoadingSkeleton />;
  }

  if (error) {
    return (
      <div
        style={{ padding: "24px", background: bgColor, borderRadius: "8px" }}
      >
        <p style={{ color: "#ef4444" }}>Error loading budget report: {error}</p>
      </div>
    );
  }

  return (
    <div
      className="payment-methods-report"
      style={{ background: colors.secondary_bg }}
    >
      <ReportHeader
        title={`💰 Budget Analytics`}
        subtitle={budgetData?.summary?.budgetName || "Single budget analytics"}
        timeframe={timeFrame}
        flowType={flowType}
        timeframeOptions={timeframeOptions}
        onBack={() => navigate("/budget")}
        onFilter={() => {}}
        onExport={() => {}}
        onTimeframeChange={handleTimeframeChange}
        onFlowTypeChange={(f) => setFlowType(f)}
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={Boolean(customRange)}
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

      {/* Summary Cards - use SharedOverviewCards in expenses mode with expenseGroups */}
      {budgetData?.expenseGroups && (
        <SharedOverviewCards
          data={budgetData.expenseGroups}
          mode="expenses"
          currencySymbol={settings.getCurrency().symbol}
        />
      )}

      <div className="charts-grid" style={{ padding: "16px" }}>
        {/* Row 1: Category Distribution */}
        {budgetData?.categoryBreakdown &&
          budgetData.categoryBreakdown.length > 0 && (
            <div
              className="chart-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
                width: "100%",
              }}
            >
              <SharedDistributionChart
                data={budgetData.categoryBreakdown}
                mode="category"
                colorsFallback={COLORS}
                currencySymbol={settings.getCurrency().symbol}
              />
            </div>
          )}

        {/* Row 2: Payment Method Distribution */}
        {budgetData?.paymentMethodBreakdown &&
          budgetData.paymentMethodBreakdown.length > 0 && (
            <div
              className="chart-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
                width: "100%",
              }}
            >
              <SharedDistributionChart
                data={budgetData.paymentMethodBreakdown}
                mode="payment"
                colorsFallback={COLORS}
                currencySymbol={settings.getCurrency().symbol}
              />
            </div>
          )}

        {/* Row 3: Expense Details Accordion */}
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
              <h3 style={{ color: colors.primary_text }}>Expense Details</h3>
            </div>
            {budgetData?.rawData ? (
              <GroupedExpensesAccordion
                rawData={budgetData.rawData}
                summary={budgetData.summary}
                currencySymbol={settings.getCurrency().symbol}
              />
            ) : budgetData?.expenseGroups &&
              budgetData.expenseGroups.length > 0 ? (
              <GroupedExpensesAccordion
                expenseGroups={budgetData.expenseGroups}
                currencySymbol={settings.getCurrency().symbol}
                groupBy="expenseName"
              />
            ) : (
              <div style={{ padding: 24, color: colors.secondary_text }}>
                No expenses found for this budget in the selected time frame.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetReport;
