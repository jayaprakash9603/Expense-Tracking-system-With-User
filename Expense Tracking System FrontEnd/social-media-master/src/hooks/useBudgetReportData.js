import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFilteredBudgetsReport,
  clearFilteredBudgetsReport,
} from "../Redux/Budget/budget.action";
import { getChartColors } from "../utils/chartColors";
import { computeDateRange } from "../utils/reportParams";

const COLORS = getChartColors();

/**
 * Custom hook to fetch and transform budget report data with filters
 * Similar to usePaymentReportData but for budgets
 */
const useBudgetReportData = ({ friendId }) => {
  const dispatch = useDispatch();
  const [timeframe, setTimeframe] = useState("all_time");
  const [flowType, setFlowType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() =>
    computeDateRange("all_time")
  );
  const [isCustomRange, setIsCustomRange] = useState(false);

  const { filteredBudgetsReport } = useSelector((state) => state.budgets);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        rangeType: timeframe,
        offset: 0,
        flowType: flowType === "all" ? null : flowType,
        targetId: friendId || null,
      };

      if (dateRange?.fromDate && dateRange?.toDate) {
        payload.fromDate = dateRange.fromDate;
        payload.toDate = dateRange.toDate;
      }

      await dispatch(getFilteredBudgetsReport(payload));
    } catch (err) {
      console.error("Error fetching budget report:", err);
      setError(err.message || "Failed to fetch budget report");
    } finally {
      setLoading(false);
    }
  }, [dispatch, timeframe, flowType, friendId, dateRange, isCustomRange]);

  useEffect(() => {
    fetchData();
    // Cleanup on unmount/navigation to prevent stale duplication
    return () => {
      dispatch(clearFilteredBudgetsReport());
    };
  }, [fetchData, dispatch]);

  // Transform budget data for charts
  const transformBudgetData = useCallback(() => {
    if (!filteredBudgetsReport?.budgets) {
      return {
        budgetsData: [],
        categoryBreakdown: [],
        paymentMethodBreakdown: [],
        summary: {},
      };
    }

    const { budgets, summary } = filteredBudgetsReport;

    // Defensive deduplication: navigation between pages was producing duplicated budget entries
    // Ensure uniqueness by budgetId (fallback to name if id missing)
    const seen = new Map();
    const uniqueBudgets = [];
    for (const b of budgets) {
      const key = b.budgetId ?? b.budgetName;
      if (!seen.has(key)) {
        seen.set(key, true);
        uniqueBudgets.push(b);
      }
    }

    // Transform budgets for overview cards and accordion
    const budgetsData = uniqueBudgets.map((budget, index) => ({
      budgetId: budget.budgetId,
      budgetName: budget.budgetName,
      name: budget.budgetName, // For BudgetOverviewGrid compatibility
      method: budget.budgetName, // For compatibility with shared components
      allocatedAmount: budget.allocatedAmount || 0,
      totalLoss: budget.totalLoss || 0,
      totalSpent: budget.totalLoss || 0, // Alias for BudgetOverviewGrid
      totalGain: budget.totalGain || 0,
      remainingAmount: budget.remainingAmount || 0,
      amount: budget.totalLoss || 0,
      percentage: budget.percentageUsed || 0,
      percentageUsed: budget.percentageUsed || 0,
      transactions: budget.transactions || 0,
      totalTransactions: budget.transactions || 0, // Alias for BudgetOverviewGrid
      cashLoss: budget.cashLoss || 0,
      creditNeedToPaidLoss: budget.creditNeedToPaidLoss || 0,
      creditPaidLoss: budget.creditPaidLoss || 0,
      color: COLORS[index % COLORS.length],
      startDate: budget.startDate,
      endDate: budget.endDate,
      valid: budget.valid,
      isExpired: budget.valid === false, // For BudgetOverviewGrid
      expenses: budget.expenses || [],
      paymentMethodBreakdown: budget.paymentMethodBreakdown || {},
      categoryBreakdown: budget.categoryBreakdown || {},
    }));

    // Use overall category breakdown from backend response
    const categoryBreakdown = summary.overallCategoryBreakdown
      ? Object.entries(summary.overallCategoryBreakdown)
          .map(([catName, catData], index) => ({
            name: catName, // Use 'name' property for SharedDistributionChart
            category: catName, // Keep for backward compatibility
            amount: catData.amount || 0,
            transactions: catData.transactions || 0,
            percentage: catData.percentage || 0,
            color: COLORS[index % COLORS.length],
          }))
          .sort((a, b) => b.amount - a.amount)
      : [];

    // Use overall payment method breakdown from backend response
    const paymentMethodBreakdown = summary.overallPaymentMethodBreakdown
      ? Object.entries(summary.overallPaymentMethodBreakdown)
          .map(([method, methodData], index) => {
            // Assign colors based on payment method type
            let color;
            if (method === "Cash") {
              color = "#4ECDC4"; // Cyan
            } else if (method === "Credit Need To Paid") {
              color = "#FF6B6B"; // Red
            } else if (method === "Credit Paid") {
              color = "#FFA94D"; // Orange
            } else if (method.toLowerCase().includes("upi")) {
              color = "#9B59B6"; // Purple
            } else if (method.toLowerCase().includes("card")) {
              color = "#3498DB"; // Blue
            } else if (method.toLowerCase().includes("bank")) {
              color = "#1ABC9C"; // Teal
            } else {
              // Use chart colors for unknown payment methods
              color = COLORS[index % COLORS.length];
            }

            return {
              method,
              amount: methodData.amount || 0,
              totalAmount: methodData.amount || 0,
              transactions: methodData.transactions || 0,
              percentage: methodData.percentage || 0,
              color,
            };
          })
          .sort((a, b) => b.amount - a.amount)
      : [];

    return {
      budgetsData,
      categoryBreakdown,
      paymentMethodBreakdown,
      summary: summary || {},
    };
  }, [filteredBudgetsReport]);

  const { budgetsData, categoryBreakdown, paymentMethodBreakdown, summary } =
    transformBudgetData();

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleSetTimeframe = (nextTimeframe) => {
    setTimeframe(nextTimeframe);
    const normalized = nextTimeframe === "all" ? "all_time" : nextTimeframe;
    setDateRange(computeDateRange(normalized));
    setIsCustomRange(false);
  };

  const handleSetFlowType = (nextFlowType) => {
    setFlowType(nextFlowType);
  };

  const handleSetCustomRange = (range) => {
    if (!range?.fromDate || !range?.toDate) {
      return;
    }
    setDateRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
    setIsCustomRange(true);
  };

  const handleResetRange = () => {
    const normalized = timeframe === "all" ? "all_time" : timeframe;
    setDateRange(computeDateRange(normalized));
    setIsCustomRange(false);
  };

  return {
    timeframe,
    flowType,
    setTimeframe: handleSetTimeframe,
    setFlowType: handleSetFlowType,
    dateRange,
    setCustomDateRange: handleSetCustomRange,
    resetDateRange: handleResetRange,
    isCustomRange,
    loading,
    error,
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
    summary,
    refresh,
  };
};

export default useBudgetReportData;
