import { useState, useEffect, useCallback } from "react";
import { fetchCategoriesSummary, fetchExpenseSummary } from "../utils/Api";

/**
 * useCategoryDistributionData
 * Fetches category distribution supporting timeframe + flow type; falls back to expense summary if needed.
 */
export default function useCategoryDistributionData({
  timeframe = "this_month",
  flowType = "loss",
  refreshTrigger,
} = {}) {
  const [distribution, setDistribution] = useState(null); // raw response (object with summary or array)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildParams = useCallback(() => {
    const now = new Date();
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const params = {};
    if (timeframe === "this_month" || timeframe === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = now;
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    } else if (timeframe === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    } else if (timeframe === "last_3_months" || timeframe === "last_3") {
      const end = now;
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    } else {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = now;
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    }
    if (flowType === "gain") {
      params.flowType = "inflow";
      params.type = "gain";
    } else if (flowType === "loss") {
      params.flowType = "outflow";
      params.type = "loss";
    }
    return params;
  }, [timeframe, flowType]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams();
        let res = await fetchCategoriesSummary(params, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!res || !res.summary || !res.summary.categoryTotals) {
          res = await fetchExpenseSummary(params, {
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
        }
        setDistribution(res);
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error("Category distribution fetch failed", e);
          setError(e);
          setDistribution([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [buildParams, refreshTrigger]);

  return { distribution, loading, error };
}
