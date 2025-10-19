import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Tooltip renderer extracted & simplified from CategoryFlow.
const CategoryStackTooltip = ({
  active,
  payload,
  label,
  isMobile,
  isTablet,
  formatCompactNumber,
}) => {
  if (!active || !payload || !payload.length) return null;
  const nameMax = isMobile ? 110 : isTablet ? 150 : 180;
  const items = payload
    .filter((p) => Number(p?.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value));
  if (!items.length) return null;
  return (
    <div
      style={{
        background: "#0b0b0b",
        border: "1px solid #333",
        color: "#e5e7eb",
        borderRadius: 8,
        padding: 12,
        maxWidth: isMobile ? 220 : 320,
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      }}
    >
      {label && (
        <div
          style={{
            color: "#00DAC6",
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 12,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: item?.color || "#5b7fff",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                width: "100%",
              }}
            >
              <div
                title={item?.name}
                style={{
                  maxWidth: nameMax,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#b0b6c3",
                  fontSize: 12,
                }}
              >
                {item?.name}
              </div>
              <div style={{ fontWeight: 800, fontSize: 12, color: "#ffffff" }}>
                ₹{formatCompactNumber(item?.value || 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CategoryFlowChart
 * Reusable stacked bar chart component for CategoryFlow page.
 * Props: stackedChartData, barSegments, xAxisKey, isMobile, isTablet, formatCompactNumber, onSegmentClick
 */
const CategoryFlowChart = ({
  stackedChartData,
  barSegments,
  xAxisKey,
  isMobile,
  isTablet,
  formatCompactNumber,
  onSegmentClick,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stackedChartData}
        margin={{ top: 4, right: isMobile ? 8 : 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#33384e" />
        <XAxis
          dataKey={xAxisKey}
          stroke="#b0b6c3"
          tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
          tickLine={false}
          axisLine={{ stroke: "#33384e" }}
        />
        <YAxis
          stroke="#b0b6c3"
          tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
          axisLine={{ stroke: "#33384e" }}
          tickLine={false}
          width={80}
          tickFormatter={(v) => formatCompactNumber(v)}
        />
        <Tooltip
          cursor={{ fill: "#23243a22" }}
          content={
            <CategoryStackTooltip
              isMobile={isMobile}
              isTablet={isTablet}
              formatCompactNumber={formatCompactNumber}
            />
          }
          wrapperStyle={{ zIndex: 9999 }}
          allowEscapeViewBox={{ x: true, y: true }}
        />
        {barSegments.map((seg, i) => {
          const isTopOfStack = i === barSegments.length - 1;
          return (
            <Bar
              key={seg.key}
              dataKey={seg.key}
              name={seg.label}
              stackId="total"
              fill={seg.color}
              radius={isTopOfStack ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={48}
            >
              {stackedChartData.map((entry, idx) => (
                <Cell
                  key={`${seg.key}-${idx}`}
                  cursor="pointer"
                  onClick={() => onSegmentClick(seg, idx)}
                />
              ))}
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryFlowChart;
