import React, { useMemo, useState, useCallback } from "react";
import DailySpendingChart from "../../pages/Dashboard/DailySpendingChart";
import {
  buildDailySpendingByBucket,
  normalizeFlowTypeForChart,
} from "../../utils/dailySpendingAggregation";
import DailySpendingDrilldownDrawer from "../charts/DailySpendingDrilldownDrawer";

const PaymentDailySpendingChart = ({ methods, timeframe, flowType }) => {
  const chartSelectedType = normalizeFlowTypeForChart(flowType);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const handlePointClick = useCallback((point) => {
    setSelectedPoint(point);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const dailySpendingData = useMemo(() => {
    return buildDailySpendingByBucket(
      (Array.isArray(methods) ? methods : []).map((m) => ({
        name: m?.method ?? m?.name ?? m?.paymentMethod,
        expenses: m?.expenses,
      }))
    );
  }, [methods]);

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
        breakdownLabel="Payment methods"
        breakdownTotalsLabel="Payment method totals"
        breakdownItemLabel="payment method"
        breakdownEmptyMessage="No payment method breakdown available."
        title="📊 Daily Spending Pattern (Payment Methods)"
        onPointClick={handlePointClick}
      />

      <DailySpendingDrilldownDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        point={selectedPoint}
        breakdownLabel="Payment methods"
        breakdownItemLabel="payment method"
        breakdownEmptyMessage="No payment method breakdown available."
      />
    </div>
  );
};

export default PaymentDailySpendingChart;
