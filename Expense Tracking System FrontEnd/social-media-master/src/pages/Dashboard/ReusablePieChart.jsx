import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import PieChartTooltip from "../../components/charts/PieChartTooltip";

// Generic reusable Pie/Donut chart component
// Props:
//  title: string - header title
//  data: array | object - raw data; normalization performed via normalize function if provided
//  timeframe, onTimeframeChange: controls for timeframe selector
//  flowType, onFlowTypeChange: controls for loss/gain toggle
//  height: chart height (responsive container)
//  donut: boolean - whether to render innerRadius (donut) else standard pie
//  colors: optional array of fill colors
//  normalize: function(rawData) => { items: [{ name, value }], total }
//  loading: boolean - show skeleton externally (caller decides)
//  controls: boolean - show timeframe + loss/gain controls
//  className: wrapper classes (chart-container etc.)
//  legend: boolean - show legend
//  innerRadius, outerRadius: override radii
//  renderFooterTotal: bool - show Total footer
//  footerPrefix: string - prefix for total (e.g. 'Total:')
//  valuePrefix: currency symbol default '₹'
//  skeleton: optional React node (caller passes while loading)

const DEFAULT_COLORS = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#073b4c",
  "#ffd166",
  "#f77f00",
  "#fcbf49",
  "#f95738",
];

const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

const ReusablePieChart = ({
  title = "Pie Chart",
  data,
  rawData,
  timeframe,
  onTimeframeChange,
  flowType,
  onFlowTypeChange,
  height = 400,
  donut = false,
  colors = DEFAULT_COLORS,
  normalize,
  loading = false,
  controls = true,
  className = "chart-container reusable-pie-chart",
  legend = true,
  innerRadius,
  outerRadius,
  renderFooterTotal = true,
  footerPrefix = "Total:",
  valuePrefix = "₹",
  skeleton = null,
}) => {
  // Normalize data
  let normalized = { items: [], total: 0 };
  if (normalize && typeof normalize === "function") {
    try {
      normalized = normalize(data) || { items: [], total: 0 };
    } catch (e) {
      console.error("Normalization error", e);
    }
  } else {
    if (Array.isArray(data)) {
      const total = data.reduce((s, it) => s + (Number(it.value) || 0), 0);
      normalized = {
        items: data.map((d) => ({ name: d.name, value: Number(d.value) || 0 })),
        total,
      };
    } else if (data && typeof data === "object") {
      // assume object shape with summary.categoryTotals
      const totals = data.summary?.categoryTotals || {};
      const items = Object.keys(totals).map((k) => ({
        name: k,
        value: Number(totals[k]) || 0,
      }));
      const total = Number(data.summary?.totalAmount || 0);
      normalized = { items, total };
    }
  }

  const pieData = normalized.items;
  const totalAmount = normalized.total;

  // Responsive radii fallback
  const isMobile = window.matchMedia("(max-width:600px)").matches;
  const isTablet = window.matchMedia("(max-width:1024px)").matches;
  const defaultInner = donut ? (isMobile ? 60 : isTablet ? 80 : 100) : 0;
  const defaultOuter = isMobile ? 110 : isTablet ? 150 : 180;
  const iRadius = innerRadius ?? defaultInner;
  const oRadius = outerRadius ?? defaultOuter;

  return (
    <div className={className}>
      <div className="chart-header">
        <h3>{title}</h3>
        {controls && (
          <div className="chart-controls">
            {onTimeframeChange && (
              <select
                className="time-selector"
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
              </select>
            )}
            {onFlowTypeChange && (
              <div className="type-toggle">
                <button
                  type="button"
                  className={`toggle-btn loss ${
                    flowType === "loss" ? "active" : ""
                  }`}
                  onClick={() => onFlowTypeChange("loss")}
                  aria-pressed={flowType === "loss"}
                >
                  Loss
                </button>
                <button
                  type="button"
                  className={`toggle-btn gain ${
                    flowType === "gain" ? "active" : ""
                  }`}
                  onClick={() => onFlowTypeChange("gain")}
                  aria-pressed={flowType === "gain"}
                >
                  Gain
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {loading && skeleton ? (
        <div style={{ height }} className="chart-loading-wrapper">
          {/* Body-only skeleton (header already rendered above) */}
          {skeleton}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={iRadius}
              outerRadius={oRadius}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <PieChartTooltip {...props} data={rawData || data} />
              )}
            />
            {legend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  color: "#fff",
                  fontSize: isMobile ? "10px" : "12px",
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
      {/* Render footer total only after data has loaded to avoid showing misleading 0 during skeleton */}
      {renderFooterTotal && !loading && (
        <div className="total-amount total-amount-bottom">
          {footerPrefix} {valuePrefix}
          {formatNumber0(totalAmount)}
        </div>
      )}
    </div>
  );
};

export default ReusablePieChart;
