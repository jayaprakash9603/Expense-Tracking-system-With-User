import { useState, useEffect, useCallback } from "react";
import { fetchCategoriesSummary } from "../utils/Api";
import { buildReportParams } from "../utils/reportParams";
import { assembleCategoryReport } from "../utils/categoryReportData";

export default function useCategoryReportData({
  friendId,
  initialTimeframe = "month",
  initialFlowType = "all",
}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [flowType, setFlowType] = useState(initialFlowType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]); // spending rollup
  const [dailySpending, setDailySpending] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  const fetchData = useCallback(
    async (tf = timeframe, fl = flowType) => {
      try {
        setLoading(true);
        setError("");
        const params = buildReportParams({
          timeframe: tf,
          flowType: fl,
          friendId,
        });
        const raw = await fetchCategoriesSummary(params);
        const {
          categories: catRollup,
          dailySpending: daily,
          monthlyTrends: monthly,
        } = assembleCategoryReport(raw, fl);
        setCategories(catRollup);
        setDailySpending(daily);
        setMonthlyTrends(monthly);
      } catch (err) {
        console.error("Failed to load category report:", err);
        setError(
          err?.response?.data?.message || err.message || "Failed to load data"
        );
        setCategories([]);
        setDailySpending([]);
        setMonthlyTrends([]);
      } finally {
        setLoading(false);
      }
    },
    [friendId, timeframe, flowType]
  );

  useEffect(() => {
    fetchData();
  }, [friendId, fetchData]);

  return {
    timeframe,
    flowType,
    setTimeframe: (tf) => {
      setTimeframe(tf);
      fetchData(tf, flowType);
    },
    setFlowType: (fl) => {
      setFlowType(fl);
      fetchData(timeframe, fl);
    },
    loading,
    error,
    categories,
    dailySpending,
    monthlyTrends,
    refresh: () => fetchData(),
  };
}
