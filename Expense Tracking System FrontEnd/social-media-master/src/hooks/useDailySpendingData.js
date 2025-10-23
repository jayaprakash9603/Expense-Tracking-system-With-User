import { useState, useEffect, useCallback } from "react";
import { api } from "../config/api";

/**
 * useDailySpendingData
 * Encapsulates the daily spending fetch logic using the cashflow API.
 * Handles timeframe and flow type (loss/gain) filtering, loading state, error fallback,
 * and request cancellation to avoid race conditions on rapid changes.
 *
 * Inputs:
 *  - timeframe: string ("this_month" | "last_month" | "last_3_months" | custom)
 *  - type: string ("loss" | "gain" | null/undefined to fetch all types)
 *  - targetId: optional target ID for filtering
 *  - includeTypeInRequest: boolean (default true) - whether to send type in API request
 *
 * Returns:
 *  {
 *    data: Array<{ day: string, spending: number, expenses: array }>,
 *    loading: boolean,
 *    error: Error | null,
 *    refetch: () => Promise<void>,
 *    setTimeframe: (string) => void,
 *    setType: (string) => void,
 *    timeframe: string,
 *    type: string
 *  }
 */
export default function useDailySpendingData({
  initialTimeframe = "this_month",
  initialType = "loss",
  targetId = null,
  includeTypeInRequest = true, // New option to control whether type is sent in API
  refreshTrigger, // external key to force refetch (e.g. refreshKey)
} = {}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [type, setType] = useState(initialType);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildDateRange = useCallback(() => {
    const now = new Date();
    let startDate, endDate;

    if (timeframe === "this_month" || timeframe === "month") {
      // First day of current month to today
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    } else if (timeframe === "last_month") {
      // First day to last day of previous month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = lastMonth;
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
    } else if (timeframe === "last_3_months" || timeframe === "last_3") {
      // 90 days back from today
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else {
      // Default to current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    }

    // Format as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  }, [timeframe]);

  const performFetch = useCallback(
    async (abortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = buildDateRange();

        // Build params for cashflow API
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);

        // Only include type parameter if enabled and type is provided
        if (includeTypeInRequest && type) {
          params.append("type", type); // loss or gain
        }

        if (targetId) params.append("targetId", targetId);

        const res = await api.get(
          `/api/expenses/cashflow?${params.toString()}`,
          {
            signal: abortSignal,
          }
        );

        if (abortSignal?.aborted) return; // exit silently if aborted mid-flight

        const expenses = res.data || [];

        // Group expenses by date, sum amounts, and collect expense details
        const dailyMap = {};

        expenses.forEach((expense) => {
          const date = expense.date; // Expected format: "YYYY-MM-DD"
          const amount = Math.abs(expense.expense?.amount || 0); // Use absolute value for spending
          const expenseName = expense.expense?.expenseName || "Unknown";
          const categoryName = expense.categoryName || "";

          if (date) {
            if (!dailyMap[date]) {
              dailyMap[date] = {
                total: 0,
                expenses: [],
              };
            }
            dailyMap[date].total += amount;
            dailyMap[date].expenses.push({
              name: expenseName,
              amount: amount,
              category: categoryName,
              paymentMethod: expense.expense?.paymentMethod || "",
            });
          }
        });

        // Convert to array format expected by chart with expense details
        const normalized = Object.keys(dailyMap)
          .sort() // Sort by date ascending
          .map((day) => ({
            day,
            spending: dailyMap[day].total,
            expenses: dailyMap[day].expenses,
            type: type, // Include type for filtering
          }));

        setData(normalized);
      } catch (e) {
        if (!abortSignal?.aborted) {
          console.error("Daily spending fetch failed", e);
          setError(e);
          setData([]);
        }
      } finally {
        if (!abortSignal?.aborted) setLoading(false);
      }
    },
    [buildDateRange, type, targetId, includeTypeInRequest]
  );

  const refetch = useCallback(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
    return controller; // allow caller to abort if needed
  }, [performFetch]);

  // Auto-fetch on timeframe / type change OR external refresh trigger
  useEffect(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
    return () => controller.abort();
  }, [performFetch, refreshTrigger]);

  return {
    data,
    loading,
    error,
    refetch,
    setTimeframe,
    setType,
    timeframe,
    type,
  };
}
