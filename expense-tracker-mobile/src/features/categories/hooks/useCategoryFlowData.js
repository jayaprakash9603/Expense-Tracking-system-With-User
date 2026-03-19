import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { fetchCategoryDistributionAction } from "@/redux/expenses/expenses.actions";
import { normalizeEntityFlowData } from "@/shared/utils/chart/entityFlowNormalizer";

export function useCategoryFlowData() {
  const flow = useFlowData({
    storagePrefix: "categoryFlow",
    fetchAction: fetchCategoryDistributionAction,
  });

  const apiData = useSelector((s) => s.expenses?.categoryDistribution);

  const { chartData, cardData, totals, chartConfig } = useMemo(
    () => normalizeEntityFlowData(apiData, flow.activeRange, flow.offset),
    [apiData, flow.activeRange, flow.offset],
  );

  const dataKeys = useMemo(
    () => Object.keys(chartConfig),
    [chartConfig],
  );

  return {
    ...flow,
    chartData,
    cardData,
    totals,
    chartConfig,
    dataKeys,
  };
}
