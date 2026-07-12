import { useState, useEffect, useCallback, useMemo } from "react";
import { budgetApi } from "@/infrastructure/api";
import { transformFilteredBudgetsReport, normalizeFlowTypeForBudgetApi } from "@/domain/budgets/budgetReportTransforms";
import { getDateRangeForReportTimeframe } from "@/features/reports/utils/reportTimeframeRange";

function buildFilteredQuery({ timeframe, flowType, dateRange, targetId }) {
  const params = {
    targetId: targetId || "",
    offset: 0,
    type: normalizeFlowTypeForBudgetApi(flowType),
  };
  if (dateRange?.fromDate && dateRange?.toDate) {
    params.fromDate = dateRange.fromDate;
    params.toDate = dateRange.toDate;
  } else {
    params.rangeType = timeframe === "all_time" ? "all_time" : timeframe;
  }
  return params;
}

export function useFilteredBudgetsReport({ targetId = "" } = {}) {
  const [timeframe, setTimeframeState] = useState("this_month");
  const [flowType, setFlowType] = useState("all");
  const [dateRange, setDateRange] = useState(() => getDateRangeForReportTimeframe("this_month"));
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = buildFilteredQuery({
      timeframe,
      flowType,
      dateRange,
      targetId,
    });
    const { data, error: err } = await budgetApi.getFilteredReport(params);
    if (err) {
      setError(err.message || "Failed to load report");
      setRaw(null);
    } else {
      const normalized = data?.budgets != null ? data : data?.data ?? data;
      setRaw(normalized ?? null);
    }
    setLoading(false);
  }, [timeframe, flowType, dateRange, targetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setTimeframe = useCallback((next) => {
    setTimeframeState(next);
    setDateRange(getDateRangeForReportTimeframe(next));
    setIsCustomRange(false);
  }, []);

  const setCustomDateRange = useCallback((range) => {
    if (!range?.fromDate || !range?.toDate) return;
    setDateRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
    setIsCustomRange(true);
  }, []);

  const resetDateRange = useCallback(() => {
    setDateRange(getDateRangeForReportTimeframe(timeframe));
    setIsCustomRange(false);
  }, [timeframe]);

  const transformed = useMemo(() => transformFilteredBudgetsReport(raw || {}), [raw]);

  return {
    timeframe,
    setTimeframe,
    flowType,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    loading,
    error,
    refresh: fetchData,
    ...transformed,
  };
}
