import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { fetchPaymentMethodDistributionAction } from "@/redux/expenses/expenses.actions";
import {
  normalizeEntityFlowData,
  extractEntityMap,
} from "@/shared/utils/chart/entityFlowNormalizer";
import { toFriendlyLabel } from "@/shared/utils/chart/dataTransformers";

export function usePaymentMethodFlowData() {
  const flow = useFlowData({
    storagePrefix: "paymentMethodFlow",
    fetchAction: fetchPaymentMethodDistributionAction,
  });

  const apiData = useSelector((s) => s.expenses?.paymentMethodDistribution);

  const labelResolver = useCallback((key) => toFriendlyLabel(key), []);

  const { chartData, cardData, totals, chartConfig } = useMemo(
    () => normalizeEntityFlowData(apiData, flow.activeRange, flow.offset, labelResolver),
    [apiData, flow.activeRange, flow.offset, labelResolver],
  );

  const expensesMap = useMemo(() => extractEntityMap(apiData), [apiData]);

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
    expensesMap,
  };
}
