import { useState, useEffect, useCallback } from "react";
import { fetchExpenseSummary } from "../utils/Api";

/**
 * useAnalyticsSummary
 * Fetches the analytics summary object for the dashboard based on timeframe.
 */
export default function useAnalyticsSummary({
  timeframe = "this_month",
  refreshTrigger,
  skip = false,
} = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildParams = useCallback(() => {
    const now = new Date();
    const params = {};
    if (timeframe === "this_month" || timeframe === "month") {
      params.month = now.getMonth() + 1;
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
    return params;
  }, [timeframe]);

  useEffect(() => {
    // Skip API call if skip flag is true
    if (skip) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams();
        const res = await fetchExpenseSummary(params, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setSummary(res && typeof res === "object" ? res : null);
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error("Analytics summary fetch failed", e);
          setError(e);
          setSummary(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [buildParams, refreshTrigger, skip]);

  return { summary, loading, error };
}
