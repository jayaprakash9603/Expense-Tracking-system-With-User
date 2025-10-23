import { useMemo } from "react";
import { fetchCategoriesSummary } from "../utils/Api";
import { assembleCategoryReport } from "../utils/categoryReportData";
import useReportData from "./useReportData";

/**
 * useCategoryReportData
 *
 * Fetches and transforms category report data.
 * Built on top of useReportData base hook for consistency.
 *
 * @param {Object} config
 * @param {string} [config.friendId] - Optional friend/target ID
 * @param {string} [config.initialTimeframe="month"] - Initial timeframe
 * @param {string} [config.initialFlowType="all"] - Initial flow type
 * @returns {Object} Category report data and controls
 */
export default function useCategoryReportData({
  friendId,
  initialTimeframe = "month",
  initialFlowType = "all",
}) {
  // Use shared base hook with category-specific fetch and transform
  const {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    loading,
    error,
    data,
    refresh,
  } = useReportData({
    fetchFn: fetchCategoriesSummary,
    transformFn: assembleCategoryReport,
    friendId,
    initialTimeframe,
    initialFlowType,
  });

  // Extract structured data from transformed response
  const categories = useMemo(() => data?.categories || [], [data]);
  const dailySpending = useMemo(() => data?.dailySpending || [], [data]);
  const monthlyTrends = useMemo(() => data?.monthlyTrends || [], [data]);

  return {
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    loading,
    error,
    categories,
    dailySpending,
    monthlyTrends,
    refresh,
  };
}
