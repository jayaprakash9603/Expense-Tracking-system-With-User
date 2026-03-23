import { useState, useEffect, useCallback, useMemo } from "react";
import { budgetApi } from "@/infrastructure/api";
import { transformDetailedBudgetResponse } from "@/domain/budgets/budgetReportTransforms";
import { buildDetailedBudgetRequestParams } from "@/features/reports/utils/buildDetailedBudgetParams";

export function useSingleBudgetDetailedReport(budgetId, timeFrame, flowType, customRange, targetId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [rawData, setRawData] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!budgetId) {
      setBudgetData(null);
      setRawData(null);
      return;
    }
    setLoading(true);
    setError(null);
    const params = buildDetailedBudgetRequestParams(timeFrame, flowType, customRange, targetId);
    const { data, error: err } = await budgetApi.getDetailedReport(budgetId, params);
    if (err) {
      setError(err.message || "Failed to load budget report");
      setBudgetData(null);
      setRawData(null);
    } else {
      setRawData(data);
      setBudgetData(transformDetailedBudgetResponse(data));
    }
    setLoading(false);
  }, [budgetId, timeFrame, flowType, customRange, targetId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const value = useMemo(
    () => ({
      loading,
      error,
      budgetData,
      rawData,
      refetch: fetchReport,
    }),
    [loading, error, budgetData, rawData, fetchReport],
  );

  return value;
}
