import { useState, useEffect, useCallback } from "react";
import fetchDailySpending from "../utils/Api";

/**
 * useDailySpendingData
 * Encapsulates the daily spending fetch logic previously inline in `ExpenseDashboard`.
 * Handles timeframe and flow type (loss/gain) filtering, loading state, error fallback,
 * and request cancellation to avoid race conditions on rapid changes.
 *
 * Inputs:
 *  - timeframe: string ("this_month" | "last_month" | "last_3_months" | custom)
 *  - type: string ("loss" | "gain" | optional)
 *
 * Returns:
 *  {
 *    data: Array<{ day: string, spending: number }> (normalized array or empty array),
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
  refreshTrigger, // external key to force refetch (e.g. refreshKey)
} = {}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [type, setType] = useState(initialType);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildParams = useCallback(() => {
    const params = {};
    const now = new Date();
    if (timeframe === "this_month" || timeframe === "month") {
      params.month = now.getMonth() + 1; // 1-based
      params.year = now.getFullYear();
    } else if (timeframe === "last_month") {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      params.month = d.getMonth() + 1;
      params.year = d.getFullYear();
    } else if (timeframe === "last_3_months" || timeframe === "last_3") {
      const end = now;
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      params.fromDate = start.toISOString().split("T")[0];
      params.toDate = end.toISOString().split("T")[0];
    }
    if (type) params.type = type;
    return params;
  }, [timeframe, type]);

  const performFetch = useCallback(
    async (abortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams();
        const res = await fetchDailySpending(params, { signal: abortSignal });
        if (abortSignal?.aborted) return; // exit silently if aborted mid-flight
        if (Array.isArray(res)) {
          setData(res);
        } else {
          // Support object map shape { '2025-10-20': 123, ... }
          if (res && typeof res === "object") {
            const normalized = Object.keys(res).map((day) => ({
              day,
              spending: Number(res[day] ?? 0),
            }));
            setData(normalized);
          } else {
            setData([]);
          }
        }
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
    [buildParams]
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
