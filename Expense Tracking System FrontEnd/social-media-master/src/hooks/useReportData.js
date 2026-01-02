import { useState, useEffect, useCallback } from "react";
import { buildReportParams, computeDateRange } from "../utils/reportParams";

/**
 * useReportData - Shared base hook for report data fetching
 *
 * Implements common pattern for report hooks:
 * - Manages timeframe and flowType state
 * - Handles loading and error states
 * - Builds API params using buildReportParams
 * - Provides refresh mechanism
 *
 * @param {Object} config
 * @param {Function} config.fetchFn - API fetch function
 * @param {Function} config.transformFn - Function to transform raw API response
 * @param {string} [config.friendId] - Optional friend/target ID
 * @param {string} [config.initialTimeframe="month"] - Initial timeframe
 * @param {string} [config.initialFlowType="all"] - Initial flow type
 * @returns {Object} Report data and controls
 */
export default function useReportData({
  fetchFn,
  transformFn,
  friendId,
  initialTimeframe = "month",
  initialFlowType = "all",
}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [flowType, setFlowType] = useState(initialFlowType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState(() =>
    computeDateRange(initialTimeframe)
  );
  const [isCustomRange, setIsCustomRange] = useState(false);

  const fetchData = useCallback(
    async (tf = timeframe, fl = flowType, range = dateRange) => {
      try {
        setLoading(true);
        setError("");

        // Build API params using shared utility
        const params = buildReportParams({
          timeframe: tf,
          flowType: fl,
          friendId,
          rangeOverride: range,
        });

        // Fetch raw data
        const rawData = await fetchFn(params);

        // Transform/normalize data
        const transformedData = transformFn(rawData, fl);

        setData(transformedData);
      } catch (err) {
        console.error("Failed to load report data:", err);
        setError(
          err?.response?.data?.message || err.message || "Failed to load data"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [friendId, timeframe, flowType, fetchFn, transformFn, dateRange]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetTimeframe = (tf) => {
    setTimeframe(tf);
    setDateRange(computeDateRange(tf));
    setIsCustomRange(false);
  };

  const handleSetFlowType = (fl) => {
    setFlowType(fl);
  };

  const setCustomDateRange = (range) => {
    if (!range?.fromDate || !range?.toDate) {
      return;
    }
    setDateRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
    setIsCustomRange(true);
  };

  const resetDateRange = () => {
    setDateRange(computeDateRange(timeframe));
    setIsCustomRange(false);
  };

  return {
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe: handleSetTimeframe,
    setFlowType: handleSetFlowType,
    setCustomDateRange,
    resetDateRange,
    loading,
    error,
    data,
    refresh: () => fetchData(timeframe, flowType, dateRange),
  };
}
