import { useState, useEffect, useCallback } from "react";
import { fetchPaymentMethods } from "../utils/Api";

/**
 * usePaymentMethodsData
 * Fetches and normalizes payment method distribution with timeframe + flow type filters.
 */
export default function usePaymentMethodsData({
  timeframe = "this_month",
  flowType = "loss",
  refreshTrigger,
} = {}) {
  const [data, setData] = useState(null); // normalized { labels, datasets: [{ data }] }
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
    }
    if (flowType === "gain") {
      params.flowType = "inflow";
      params.type = "gain";
    } else {
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
        const res = await fetchPaymentMethods(params, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const labels = [];
          const values = [];
          res.forEach((item) => {
            const label = (
              item.label ??
              item.name ??
              item.method ??
              ""
            ).toString();
            const value = Number(
              item.amount ?? item.total ?? item.value ?? item.count ?? 0
            );
            if (label) {
              labels.push(label);
              values.push(Number.isFinite(value) ? value : 0);
            }
          });
          if (labels.length)
            normalized = { labels, datasets: [{ data: values }] };
        } else if (res && typeof res === "object") {
          const labels = Object.keys(res);
          const values = labels.map((k) => Number(res[k] ?? 0));
          if (labels.length)
            normalized = { labels, datasets: [{ data: values }] };
        }
        setData(normalized);
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error("Payment methods fetch failed", e);
          setError(e);
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [buildParams, refreshTrigger]);

  return { data, loading, error };
}
