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
import { useTheme } from "../../hooks/useTheme";

// Generic tooltip for stacked flow charts (categories, payment methods, etc.)
const FlowStackTooltip = ({
  active,
  payload,
  label,
  isMobile,
  isTablet,
  formatCompactNumber,
  accentColor = "#14b8a6",
  colors,
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
        background: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        color: colors.primary_text,
        borderRadius: 8,
        padding: 12,
        maxWidth: isMobile ? 220 : 320,
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      }}
    >
      {label && (
        <div
          style={{
            color: accentColor,
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
                  color: colors.secondary_text,
                  fontSize: 12,
                }}
              >
                {item?.name}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 12,
                  color: colors.primary_text,
                }}
              >
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
 * FlowStackedChart
 * Generic stacked bar chart component.
 * Props: stackedChartData, barSegments, xAxisKey, isMobile, isTablet, formatCompactNumber, onSegmentClick, accentColor
 */
const FlowStackedChart = ({
  stackedChartData,
  barSegments,
  xAxisKey,
  isMobile,
  isTablet,
  formatCompactNumber,
  onSegmentClick,
  accentColor,
}) => {
  const { colors } = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stackedChartData}
        margin={{ top: 4, right: isMobile ? 8 : 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />
        <XAxis
          dataKey={xAxisKey}
          stroke={colors.primary_text}
          tick={{ fill: colors.primary_text, fontWeight: 600, fontSize: 13 }}
          tickLine={false}
          axisLine={{ stroke: colors.border_color }}
        />
        <YAxis
          stroke={colors.primary_text}
          tick={{ fill: colors.primary_text, fontWeight: 600, fontSize: 13 }}
          axisLine={{ stroke: colors.border_color }}
          tickLine={false}
          width={80}
          tickFormatter={(v) => formatCompactNumber(v)}
        />
        <Tooltip
          cursor={{
            fill: colors.mode === "dark" ? "#23243a22" : "rgba(0,0,0,0.05)",
          }}
          content={
            <FlowStackTooltip
              isMobile={isMobile}
              isTablet={isTablet}
              formatCompactNumber={formatCompactNumber}
              accentColor={accentColor}
              colors={colors}
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
                  onClick={() => onSegmentClick?.(seg, idx)}
                />
              ))}
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FlowStackedChart;
