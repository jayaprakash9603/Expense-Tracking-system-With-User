import { useState, useEffect, useCallback } from "react";
import { fetchPaymentMethods } from "../utils/Api";
import { buildReportParams } from "../utils/reportParams";
import {
  normalizePaymentMethodData,
  applyFriendlyLabels,
} from "../utils/dataTransformers";

/**
 * usePaymentMethodsData
 *
 * Fetches and normalizes payment method distribution with timeframe + flow type filters.
 * Uses shared normalizers for consistent data handling.
 *
 * @param {Object} config
 * @param {string} [config.timeframe="month"] - Timeframe (week|month|quarter|year|this_month|last_month|last_3_months)
 * @param {string} [config.flowType="outflow"] - Flow type (all|inflow|outflow|loss|gain)
 * @param {*} [config.refreshTrigger] - Dependency to trigger refetch
 * @param {boolean} [config.useFriendlyLabels=true] - Whether to apply friendly labels
 * @returns {{ data, loading, error }}
 */
export default function usePaymentMethodsData({
  timeframe = "month",
  flowType = "outflow",
  refreshTrigger,
  useFriendlyLabels = true,
  skip = false,
} = {}) {
  const [data, setData] = useState(null); // normalized { labels, datasets: [{ data }] }
  const [rawData, setRawData] = useState(null); // original API response with full details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Build API params with support for multiple timeframe formats
   * Handles UI tokens (this_month, last_month) and report tokens (month, week, year)
   */
  const buildParams = useCallback(() => {
    const params = {};
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const now = new Date();

    // Normalize flowType: accept 'loss'/'gain' (chart UI) or 'outflow'/'inflow' (reports)
    let reportFlow = flowType;
    if (flowType === "loss") reportFlow = "outflow";
    else if (flowType === "gain") reportFlow = "inflow";
    else if (!flowType) reportFlow = "all";

    // Handle explicit 'last' ranges requiring custom date calculations
    if (timeframe === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    } else if (timeframe === "last_3_months" || timeframe === "last_3") {
      const end = now;
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
    } else if (timeframe === "this_month" || timeframe === "month") {
      Object.assign(
        params,
        buildReportParams({ timeframe: "month", flowType: reportFlow })
      );
    } else if (timeframe === "this_week" || timeframe === "week") {
      Object.assign(
        params,
        buildReportParams({ timeframe: "week", flowType: reportFlow })
      );
    } else if (timeframe === "this_year" || timeframe === "year") {
      Object.assign(
        params,
        buildReportParams({ timeframe: "year", flowType: reportFlow })
      );
    } else if (timeframe === "last_year") {
      Object.assign(
        params,
        buildReportParams({ timeframe: "last_year", flowType: reportFlow })
      );
    } else if (timeframe === "all_time") {
      Object.assign(
        params,
        buildReportParams({ timeframe: "all_time", flowType: reportFlow })
      );
    } else {
      // Fallback: try buildReportParams with given timeframe
      try {
        Object.assign(
          params,
          buildReportParams({ timeframe, flowType: reportFlow })
        );
      } catch (err) {
        // Silently proceed with params built so far
      }
    }

    // Add backend-expected params for all cases (buildReportParams adds these for its cases)
    if (reportFlow === "inflow") params.type = "gain";
    if (reportFlow === "outflow") params.type = "loss";
    if (reportFlow && reportFlow !== "all") params.flowType = reportFlow;

    return params;
  }, [timeframe, flowType]);

  useEffect(() => {
    // Skip API call if skip flag is true
    if (skip) {
      setData(null);
      setRawData(null);
      setLoading(false);
      return;
    }

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

        // Store raw response for tooltip access
        setRawData(res);

        // Use shared normalizer to handle multiple API shapes
        let normalized = normalizePaymentMethodData(res);

        // Optionally apply friendly labels
        if (normalized && useFriendlyLabels) {
          normalized = applyFriendlyLabels(normalized);
        }

        setData(normalized);
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error("Payment methods fetch failed", e);
          setError(e);
          setData(null);
          setRawData(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [buildParams, refreshTrigger, useFriendlyLabels, skip]);

  return { data, rawData, loading, error };
}
