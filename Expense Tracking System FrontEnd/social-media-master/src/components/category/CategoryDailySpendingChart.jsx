import React, { useMemo } from "react";
import DailySpendingChart from "../../pages/Dashboard/DailySpendingChart";
import {
  buildDailySpendingByBucket,
  normalizeFlowTypeForChart,
} from "../../utils/dailySpendingAggregation";

const CategoryDailySpendingChart = ({ categories, timeframe, flowType }) => {
  const chartSelectedType = normalizeFlowTypeForChart(flowType);

  const dailySpendingData = useMemo(() => {
    return buildDailySpendingByBucket(
      (Array.isArray(categories) ? categories : []).map((c) => ({
        name: c?.name ?? c?.category,
        expenses: c?.expenses,
      }))
    );
  }, [categories]);

  if (!dailySpendingData.length) {
    return null;
  }

  return (
    <div className="chart-row full-width" style={{ marginBottom: 24 }}>
      <DailySpendingChart
        data={dailySpendingData}
        timeframe={timeframe}
        selectedType={chartSelectedType}
        hideControls
        showBothTypesWhenAll
        showBudgetTotalsInTooltip
        showBudgetsInTooltip
        breakdownLabel="Categories"
        breakdownTotalsLabel="Category totals"
        breakdownItemLabel="category"
        breakdownEmptyMessage="No category breakdown available."
        title="📊 Daily Spending Pattern (Categories)"
      />
    </div>
  );
};

export default CategoryDailySpendingChart;
