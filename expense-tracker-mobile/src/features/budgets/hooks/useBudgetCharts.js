import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toProgressRadialData, toDistributionPieData, toLossGainBarData } from "@/domain/budgets/budget.transformers";
import { buildChartConfig, buildPieChartConfig, assignChartColorVars } from "@/shared/utils/chart/chartColors";

export function useBudgetCharts() {
  const budgets = useSelector((state) => state.budgets?.list || []);
  const loading = useSelector((state) => state.budgets?.loading || false);

  const progressData = useMemo(() => toProgressRadialData(budgets), [budgets]);
  const progressConfig = useMemo(() => buildChartConfig(["budget"], ["Budget"]), []);

  const distributionData = useMemo(() => assignChartColorVars(toDistributionPieData(budgets)), [budgets]);
  const distributionConfig = useMemo(() => buildPieChartConfig(toDistributionPieData(budgets)), [budgets]);

  const lossGainData = useMemo(() => toLossGainBarData(budgets), [budgets]);
  const lossGainConfig = useMemo(() => buildChartConfig(["savings", "overBudget"], ["Savings", "Over Budget"]), []);

  return {
    loading,
    progress: { data: progressData, config: progressConfig },
    distribution: { data: distributionData, config: distributionConfig },
    lossGain: { data: lossGainData, config: lossGainConfig },
  };
}
