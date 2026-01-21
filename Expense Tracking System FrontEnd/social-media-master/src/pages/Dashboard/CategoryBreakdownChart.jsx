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
        items: raw.map((d) => ({
          name: d.name,
          value: Number(d.value) || 0,
          icon: d.icon || "",
          color: d.color || "",
        })),
        total,
      };
    }
    if (raw && typeof raw === "object") {
      // The API returns each category as a key with its details (id, name, icon, color, totalAmount, etc.)
      // and a "summary" key with aggregated totals
      const categoryKeys = Object.keys(raw).filter(
        (k) => k !== "summary" && k !== "metadata",
      );
      const items = categoryKeys.map((k) => {
        const categoryData = raw[k] || {};
        return {
          name: k,
          value: Number(categoryData.totalAmount || 0),
          icon: categoryData.icon || "",
          color: categoryData.color || "",
        };
      });
      const total = Number(
        raw.summary?.totalAmount || items.reduce((s, it) => s + it.value, 0),
      );
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
      entityType="category"
    />
  );
};

export default CategoryBreakdownChart;
