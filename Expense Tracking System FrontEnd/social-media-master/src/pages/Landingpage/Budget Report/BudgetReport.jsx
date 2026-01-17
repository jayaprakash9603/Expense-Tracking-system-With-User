import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import useUserSettings from "../../../hooks/useUserSettings";
import useSingleBudgetReport from "../../../hooks/useSingleBudgetReport";
import useSingleBudgetReportFilters from "../../../hooks/reportFilters/useSingleBudgetReportFilters";
import SharedOverviewCards from "../../../components/charts/SharedOverviewCards";
import SharedDistributionChart from "../../../components/charts/SharedDistributionChart";
import GroupedExpensesAccordion from "../../../components/GroupedExpensesAccordion";
import { BudgetReportLoadingSkeleton } from "../../../components/skeletons/CommonSkeletons";
import ReportHeader from "../../../components/ReportHeader";
import ReportFilterDrawer from "../../../components/reportFilters/ReportFilterDrawer";
import { getChartColors } from "../../../utils/chartColors";
import { computeDateRange } from "../../../utils/reportParams";
import { api } from "../../../config/api";

const BudgetReport = () => {
  // Support both route patterns: /budget/report/:id and /budget-report/:budgetId
  const { budgetId: budgetIdParam, id, friendId } = useParams();
  const budgetId = budgetIdParam || id; // Use budgetId if available, otherwise use id
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, mode } = useTheme();
  const settings = useUserSettings();
  const [timeFrame, setTimeFrame] = useState("budget");
  const [flowType, setFlowType] = useState("all");
  const [customRange, setCustomRange] = useState(null);
  const [budgetPeriodRange, setBudgetPeriodRange] = useState(null);

  // Custom timeframe options for budget report
  const timeframeOptions = useMemo(
    () => [
      { value: "budget", label: "Budget Period" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "quarter", label: "This Quarter" },
      { value: "year", label: "This Year" },
    ],
    []
  );

  const { loading, error, budgetData } = useSingleBudgetReport(
    budgetId,
    timeFrame,
    flowType,
    null,
    customRange
  );

  useEffect(() => {
    let cancelled = false;

    const fetchBudgetPeriod = async () => {
      if (!budgetId) {
        setBudgetPeriodRange(null);
        return;
      }

      try {
        const { data } = await api.get(`/api/budgets/${budgetId}`, {
          params: {
            targetId: "",
          },
        });

        if (cancelled) {
          return;
        }

        const start = data?.startDate
          ? String(data.startDate).slice(0, 10)
          : "";
        const end = data?.endDate ? String(data.endDate).slice(0, 10) : "";

        if (start && end) {
          setBudgetPeriodRange({ fromDate: start, toDate: end });
        } else {
          setBudgetPeriodRange(null);
        }
      } catch (err) {
        if (!cancelled) {
          setBudgetPeriodRange(null);
        }
      }
    };

    fetchBudgetPeriod();
    return () => {
      cancelled = true;
    };
  }, [budgetId]);
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

  const effectiveBudgetPeriodRange = useMemo(
    () => budgetPeriodRange || summaryRange,
    [budgetPeriodRange, summaryRange]
  );

  const defaultRange = useMemo(() => {
    if (timeFrame === "budget") {
      return effectiveBudgetPeriodRange || null;
    }
    if (timeFrame === "all") {
      return computeDateRange("all_time");
    }
    const supported = new Set(["week", "month", "quarter", "year"]);
    const normalized = supported.has(timeFrame) ? timeFrame : "month";
    return computeDateRange(normalized);
  }, [timeFrame, effectiveBudgetPeriodRange]);

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

  const isCustomRangeActive = Boolean(customRange);
  const dateRangeProps =
    activeRange?.fromDate && activeRange?.toDate
      ? {
          fromDate: activeRange.fromDate,
          toDate: activeRange.toDate,
          onApply: handleCustomRangeApply,
          onReset: handleResetRange,
          minDate:
            timeFrame === "budget"
              ? effectiveBudgetPeriodRange?.fromDate
              : undefined,
          maxDate:
            timeFrame === "budget"
              ? effectiveBudgetPeriodRange?.toDate
              : undefined,
          helperText:
            timeFrame === "budget" && effectiveBudgetPeriodRange
              ? "Custom range is limited to the budget period."
              : undefined,
        }
      : undefined;

  const expenseGroups = budgetData?.expenseGroups || [];
  const categoryBreakdown = budgetData?.categoryBreakdown || [];
  const paymentBreakdown = budgetData?.paymentMethodBreakdown || [];

  const {
    filterDefaults,
    filterValues,
    sections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredCategoryBreakdown,
    filteredPaymentBreakdown,
    filteredExpenseGroups,
  } = useSingleBudgetReportFilters({
    timeframe: timeFrame,
    flowType,
    setTimeframe: setTimeFrame,
    setFlowType,
    dateRange: customRange || { fromDate: "", toDate: "" },
    setCustomDateRange: handleCustomRangeApply,
    resetDateRange: handleResetRange,
    isCustomRange: isCustomRangeActive,
    categoryBreakdown,
    paymentMethodBreakdown: paymentBreakdown,
    expenseGroups,
    timeframeOptions,
    budgetPeriodRange: effectiveBudgetPeriodRange,
  });

  const COLORS = getChartColors();

  const bgColor = mode === "dark" ? "#1f2937" : "#ffffff";

  const isBudgetReportPath = useMemo(() => {
    const pathname = location?.pathname || "";
    return (
      pathname.startsWith("/budget-report") ||
      pathname.startsWith("/budget/report")
    );
  }, [location?.pathname]);

  if (!isBudgetReportPath) {
    return null;
  }

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
        onBack={() => {
          if (
            location?.state?.fromSidebar === true ||
            location?.state?.fromFlow
          ) {
            navigate(-1);
          } else {
            const targetPath = friendId ? `/budget/${friendId}` : "/budget";
            navigate(targetPath, { replace: false });
          }
        }}
        onFilter={openFilters}
        onExport={() => {}}
        showFilterButton={sections.length > 0}
        isFilterActive={filtersActive}
        onTimeframeChange={handleTimeframeChange}
        onFlowTypeChange={(f) => setFlowType(f)}
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={isCustomRangeActive}
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
      {expenseGroups.length > 0 && (
        <SharedOverviewCards
          data={filteredExpenseGroups}
          mode="expenses"
          currencySymbol={settings.getCurrency().symbol}
        />
      )}

      <div className="charts-grid" style={{ padding: "16px" }}>
        {/* Row 1: Category Distribution */}
        {filteredCategoryBreakdown.length > 0 && (
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
              data={filteredCategoryBreakdown}
              mode="category"
              colorsFallback={COLORS}
              currencySymbol={settings.getCurrency().symbol}
            />
          </div>
        )}

        {/* Row 2: Payment Method Distribution */}
        {filteredPaymentBreakdown.length > 0 && (
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
              data={filteredPaymentBreakdown}
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
            {filteredExpenseGroups.length > 0 ? (
              <GroupedExpensesAccordion
                methods={filteredExpenseGroups}
                summary={budgetData?.summary}
                currencySymbol={settings.getCurrency().symbol}
              />
            ) : (
              <div style={{ padding: 24, color: colors.secondary_text }}>
                {filtersActive
                  ? "No expenses match the selected filters."
                  : "No expenses found for this budget in the selected time frame."}
              </div>
            )}
          </div>
        </div>
      </div>
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={sections}
        values={filterValues}
        initialValues={filterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default BudgetReport;
