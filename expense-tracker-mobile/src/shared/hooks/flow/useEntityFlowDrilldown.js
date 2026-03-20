import { useState, useEffect, useCallback } from "react";
import {
  getEntityExpenses,
  filterExpensesForRangeBucket,
} from "@/shared/utils/flow/flowEntityUtils";

export function useEntityFlowDrilldown({
  activeRange,
  offset,
  flowTab,
  chartData,
  chartConfig,
  cardData,
  expensesMap,
  openDrilldownInSheet = true,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  useEffect(() => {
    setSheetOpen(false);
    setSelectedEntity(null);
    setSelectedExpenses([]);
  }, [activeRange, offset, flowTab]);

  const clearDrilldown = useCallback(() => {
    setSheetOpen(false);
    setSelectedEntity(null);
    setSelectedExpenses([]);
  }, []);

  const handleCardClick = useCallback(
    (entity) => {
      setSelectedEntity(entity);
      setSelectedExpenses(getEntityExpenses(entity, expensesMap));
      if (openDrilldownInSheet) setSheetOpen(true);
    },
    [expensesMap, openDrilldownInSheet],
  );

  const handleBarSeriesClick = useCallback(
    ({ dataKey, xIndex }) => {
      if (xIndex == null || !chartData[xIndex]) return;
      const segmentLabel = chartConfig[dataKey]?.label;
      const entity = cardData.find((c) => c.name === segmentLabel);
      if (!entity) return;
      const all = getEntityExpenses(entity, expensesMap);
      const filtered = filterExpensesForRangeBucket({
        expensesAll: all,
        activeRange,
        offset,
        bucketIdx: xIndex,
      });
      setSelectedEntity(entity);
      setSelectedExpenses(filtered);
      if (openDrilldownInSheet) setSheetOpen(true);
    },
    [activeRange, offset, cardData, chartConfig, chartData, expensesMap, openDrilldownInSheet],
  );

  return {
    sheetOpen,
    setSheetOpen,
    selectedEntity,
    selectedExpenses,
    handleCardClick,
    handleBarSeriesClick,
    clearDrilldown,
  };
}
