import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { api } from "../config/api"; // adjust if path differs
import { computeDateRange } from "../utils/reportParams";
import {
  FETCH_CASHFLOW_EXPENSES_REQUEST,
  FETCH_CASHFLOW_EXPENSES_FAILURE,
} from "../Redux/Expenses/expense.actionType";

/**
 * useGroupedCashflow
 * Encapsulates logic for computing date ranges, fetching grouped cashflow (expenses) data,
 * and transforming it into overview-friendly structures.
 *
 * Params:
 * - friendId: optional target user id for multi-user context
 * - initialTimeframe: 'week' | 'month' | 'year'
 * - initialFlowType: 'all' | 'outflow' | 'inflow'
 *
 * Returns:
 * { timeframe, setTimeframe, flowType, setFlowType, loading, error, rawData, summary,
 *   methodsData, refetch, computedDates }
 */
export function useGroupedCashflow({
  friendId,
  initialTimeframe = "month",
  initialFlowType = "all",
} = {}) {
  const dispatch = useDispatch();

  const [timeframe, setTimeframeState] = useState(initialTimeframe);
  const [flowType, setFlowTypeState] = useState(initialFlowType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [customRange, setCustomRange] = useState(null);

  // Compute date boundaries based on timeframe or custom range
  const computedDates = useMemo(() => {
    if (customRange?.fromDate && customRange?.toDate) {
      return { start: customRange.fromDate, end: customRange.toDate };
    }
    const normalizedTimeframe = timeframe === "all" ? "all_time" : timeframe;
    const range = computeDateRange(normalizedTimeframe);
    return { start: range.fromDate, end: range.toDate };
  }, [customRange, timeframe]);

  const dateRange = useMemo(
    () => ({ fromDate: computedDates.start, toDate: computedDates.end }),
    [computedDates]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    dispatch({ type: FETCH_CASHFLOW_EXPENSES_REQUEST });
    try {
      const params = new URLSearchParams();
      params.append("groupBy", "true");
      params.append("startDate", computedDates.start);
      params.append("endDate", computedDates.end);
      if (flowType === "outflow") params.append("type", "loss");
      else if (flowType === "inflow") params.append("type", "gain");
      params.append("offset", "0");
      if (friendId) params.append("targetId", friendId);

      const { data } = await api.get(
        `/api/expenses/cashflow?${params.toString()}`
      );
      setRawData(data);
    } catch (err) {
      console.error("Error fetching grouped cashflow", err);
      setError(err?.response?.data?.message || err.message);
      dispatch({ type: FETCH_CASHFLOW_EXPENSES_FAILURE, payload: err });
    } finally {
      setLoading(false);
    }
  }, [computedDates.start, computedDates.end, flowType, friendId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = rawData?.summary;

  // Transform groups -> overview data (with percentage)
  const methodsData = useMemo(() => {
    if (!rawData) return [];
    const total = Number(summary?.totalAmount || 0);
    return Object.entries(rawData)
      .filter(([key]) => key !== "summary")
      .map(([methodName, block]) => {
        const totalAmount = Number(block.totalAmount || 0);
        const transactions = Number(
          block.expenseCount ||
            (Array.isArray(block.expenses) ? block.expenses.length : 0)
        );
        const percentage =
          total > 0 ? Number(((totalAmount / total) * 100).toFixed(2)) : 0;
        return {
          method: methodName,
          totalAmount,
          transactions,
          expenses: block.expenses || [],
          percentage,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [rawData, summary]);

  const handleSetTimeframe = useCallback((tf) => {
    setCustomRange(null);
    setTimeframeState(tf);
  }, []);

  const handleSetFlowType = useCallback((ft) => {
    setFlowTypeState(ft);
  }, []);

  const setCustomDateRange = useCallback((range) => {
    if (!range?.fromDate || !range?.toDate) {
      return;
    }
    setCustomRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
  }, []);

  const resetDateRange = useCallback(() => {
    setCustomRange(null);
  }, []);

  return {
    timeframe,
    setTimeframe: handleSetTimeframe,
    flowType,
    setFlowType: handleSetFlowType,
    loading,
    error,
    rawData,
    summary,
    methodsData,
    refetch: fetchData,
    computedDates,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange: Boolean(customRange),
  };
}

export default useGroupedCashflow;
