import React from "react";
import ReusablePieChart from "./ReusablePieChart";

// Wrapper specialized for Category Breakdown using normalization logic
const CategoryBreakdownChart = ({
  data,
  timeframe,
  onTimeframeChange,
  flowType,
  onFlowTypeChange,
  loading = false,
  skeleton = null,
}) => {
  const normalize = (raw) => {
    if (Array.isArray(raw)) {
      const total = raw.reduce((s, it) => s + (Number(it.value) || 0), 0);
      return {
        items: raw.map((d) => ({ name: d.name, value: Number(d.value) || 0 })),
        total,
      };
    }
    if (raw && typeof raw === "object") {
      const totals = raw.summary?.categoryTotals || {};
      const items = Object.keys(totals).map((k) => ({
        name: k,
        value: Number(totals[k]) || 0,
      }));
      const total = Number(raw.summary?.totalAmount || 0);
      return { items, total };
    }
    return { items: [], total: 0 };
  };

  return (
    <ReusablePieChart
      title="🏷️ Category Breakdown"
      data={data}
      timeframe={timeframe}
      onTimeframeChange={onTimeframeChange}
      flowType={flowType}
      onFlowTypeChange={onFlowTypeChange}
      donut={true}
      normalize={normalize}
      loading={loading}
      skeleton={skeleton}
      height={480}
      renderFooterTotal={true}
      footerPrefix="Total:"
    />
  );
};

export default CategoryBreakdownChart;
