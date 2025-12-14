import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { api } from "../config/api"; // adjust if path differs
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

  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [flowType, setFlowType] = useState(initialFlowType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [startDate] = useState(null); // reserved for future custom range integration
  const [endDate] = useState(null);

  // Compute date boundaries based on timeframe (week/month/year)
  const computedDates = useMemo(() => {
    if (startDate && endDate) return { start: startDate, end: endDate };
    const now = new Date();
    if (timeframe === "week") {
      const d = new Date(now);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday as start
      const monday = new Date(d.setDate(d.getDate() + diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      };
    }
    if (timeframe === "year") {
      const start = `${now.getFullYear()}-01-01`;
      const end = `${now.getFullYear()}-12-31`;
      return { start, end };
    }
    if (timeframe === "last_year") {
      const lastYear = now.getFullYear() - 1;
      const start = `${lastYear}-01-01`;
      const end = `${lastYear}-12-31`;
      return { start, end };
    }
    if (timeframe === "all_time") {
      // Global all-time range starts from 2002-01-15
      const start = "2002-01-15";
      const end = now.toISOString().slice(0, 10);
      return { start, end };
    }
    // default month
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
    const endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endStr = endDateObj.toISOString().slice(0, 10);
    return { start, end: endStr };
  }, [timeframe, startDate, endDate]);

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

  return {
    timeframe,
    setTimeframe,
    flowType,
    setFlowType,
    loading,
    error,
    rawData,
    summary,
    methodsData,
    refetch: fetchData,
    computedDates,
  };
}

export default useGroupedCashflow;
