import React from "react";
import ReusablePieChart from "./ReusablePieChart";

// Wrapper specialized for Payment Methods (non-donut pie)
const PaymentMethodChart = ({
  data,
  rawData,
  timeframe,
  onTimeframeChange,
  flowType,
  onFlowTypeChange,
  loading = false,
  skeleton = null,
}) => {
  {
    console.log("data", data);
  }
  {
    console.log("rawData", rawData);
  }
  const normalize = (raw) => {
    if (
      raw &&
      typeof raw === "object" &&
      Array.isArray(raw.labels) &&
      raw.datasets?.[0]?.data
    ) {
      const labels = raw.labels;
      const values = raw.datasets[0].data;
      const items = labels.map((label, idx) => ({
        name: label,
        value: Number(values[idx]) || 0,
      }));
      const total = items.reduce((s, it) => s + it.value, 0);
      return { items, total };
    }
    if (Array.isArray(raw)) {
      const items = raw.map((r, i) => ({
        name: (r.label || r.name || r.method || `Item ${i + 1}`).toString(),
        value: Number(r.amount || r.total || r.value || r.count || 0) || 0,
      }));
      const total = items.reduce((s, it) => s + it.value, 0);
      return { items, total };
    }
    if (raw && typeof raw === "object") {
      const items = Object.keys(raw).map((k) => ({
        name: k,
        value: Number(raw[k]) || 0,
      }));
      const total = items.reduce((s, it) => s + it.value, 0);
      return { items, total };
    }
    return { items: [], total: 0 };
  };

  return (
    <ReusablePieChart
      title="💳 Payment Methods"
      data={data}
      rawData={rawData}
      timeframe={timeframe}
      onTimeframeChange={onTimeframeChange}
      flowType={flowType}
      onFlowTypeChange={onFlowTypeChange}
      donut={false}
      normalize={normalize}
      loading={loading}
      skeleton={skeleton}
      height={480}
      renderFooterTotal={true}
      footerPrefix="Total:"
      valuePrefix="₹"
    />
  );
};

export default PaymentMethodChart;
