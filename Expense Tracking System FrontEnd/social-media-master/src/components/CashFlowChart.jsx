import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
  Customized,
} from "recharts";
import dayjs from "dayjs"; // kept for potential future date ops not covered by hooks
import useAverageLine from "./cashflow/useAverageLine";
import useTooltipFormatter from "./cashflow/useTooltipFormatter";
import useSelectionHelpers from "./cashflow/useSelectionHelpers";
import { useTheme } from "../hooks/useTheme";

// Separate chart component extracted from CashFlow.jsx
// Props are intentionally verbose to keep this presentational and stateless.
const CashFlowChart = ({
  chartData = [],
  xKey = "day",
  barChartStyles,
  isMobile,
  selectedBars = [],
  hoverBarIndex,
  setHoverBarIndex,
  handleBarClick,
  flowTab,
  activeRange,
  offset,
  formatCompactNumber,
  formatCurrencyCompact,
  formatNumberFull,
  yearMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}) => {
  const { colors, mode } = useTheme();
  const { avg } = useAverageLine(chartData, activeRange, offset);
  const tooltipFormatter = useTooltipFormatter(
    activeRange,
    offset,
    yearMonths,
    weekDays
  );
  const { getFlowBaseRGBA, getSelectedFill } = useSelectionHelpers(flowTab);
  const selectedColor = getSelectedFill();
  // Precompute hover map for quick lookup
  const selectedIndexSet = useMemo(
    () => new Set(selectedBars.map((b) => b.idx)),
    [selectedBars]
  );

  // Theme-aware colors
  const gridColor = mode === "dark" ? "#33384e" : "#e0e0e0";
  const axisTextColor = mode === "dark" ? "#b0b6c3" : "#4a5568";
  const axisLineColor = mode === "dark" ? "#33384e" : "#d0d0d0";
  const tooltipBg = mode === "dark" ? "#23243a" : "#ffffff";
  const tooltipBorder = mode === "dark" ? "#00dac6" : "#14b8a6";
  const tooltipTextColor = mode === "dark" ? "#fff" : "#1a1a1a";
  const tooltipLabelColor = mode === "dark" ? "#00dac6" : "#14b8a6";
  const tooltipItemColor = mode === "dark" ? "#b0b6c3" : "#666666";
  const labelTextColor = "#ffffff"; // Keep white for visibility on colored bars in both themes

  return (
    <ResponsiveContainer width="100%" height={isMobile ? "100%" : "100%"}>
      <BarChart
        data={chartData}
        barWidth={barChartStyles?.barWidth}
        hideNumbers={barChartStyles?.hideNumbers}
        margin={{ right: isMobile ? 0 : 40 }}
        onMouseMove={(state) => {
          if (state && typeof state.activeTooltipIndex === "number") {
            setHoverBarIndex(state.activeTooltipIndex);
          } else {
            setHoverBarIndex(null);
          }
        }}
        onMouseLeave={() => setHoverBarIndex(null)}
        onClick={(e) => {
          if (hoverBarIndex !== null && chartData[hoverBarIndex]) {
            const multi = e && (e.ctrlKey || e.metaKey);
            const rangeSel = e && e.shiftKey;
            handleBarClick(
              chartData[hoverBarIndex],
              hoverBarIndex,
              multi,
              rangeSel
            );
          }
        }}
        style={{ cursor: hoverBarIndex !== null ? "pointer" : "default" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey={xKey}
          stroke={axisTextColor}
          tickLine={false}
          axisLine={{ stroke: axisLineColor }}
          height={50}
          tick={(props) => {
            const { x, y, payload, index } = props;
            const isSelected = selectedIndexSet.has(index);
            const band = (barChartStyles?.barWidth || 30) + (isMobile ? 8 : 12);
            return (
              <g
                transform={`translate(${x},${y})`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const multi = e && (e.ctrlKey || e.metaKey);
                  const rangeSel = e && e.shiftKey;
                  if (chartData[index]) {
                    handleBarClick(chartData[index], index, multi, rangeSel);
                  }
                  e.stopPropagation();
                }}
              >
                <rect
                  x={-band / 2}
                  y={-(isMobile ? 26 : 30)}
                  width={band}
                  height={isMobile ? 34 : 40}
                  fill="transparent"
                />
                <text
                  dy={10}
                  fill={isSelected ? selectedColor : axisTextColor}
                  fontSize={13}
                  fontWeight={isSelected ? 800 : 600}
                  textAnchor="middle"
                >
                  {payload?.value}
                </text>
              </g>
            );
          }}
          label={
            barChartStyles?.hideAxisLabels
              ? null
              : {
                  value:
                    activeRange === "month"
                      ? "Day"
                      : activeRange === "week"
                      ? "Weekday"
                      : "Month",
                  position: "insideBottomRight",
                  offset: -5,
                  fill: axisTextColor,
                  fontWeight: 700,
                  fontSize: 14,
                  dy: -20,
                  dx: 30,
                }
          }
        />
        <YAxis
          stroke={axisTextColor}
          tick={{ fill: axisTextColor, fontWeight: 600, fontSize: 13 }}
          axisLine={{ stroke: axisLineColor }}
          tickLine={false}
          label={
            barChartStyles?.hideAxisLabels
              ? null
              : {
                  value: "Amount",
                  angle: -90,
                  position: "insideLeft",
                  fill: axisTextColor,
                  fontWeight: 700,
                  fontSize: 14,
                  dy: 40,
                }
          }
          tickFormatter={(value) => formatCompactNumber(value)}
          width={80}
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            color: tooltipTextColor,
            borderRadius: 8,
            fontWeight: 500,
            boxShadow:
              mode === "dark"
                ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                : "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
          labelStyle={{ color: tooltipLabelColor, fontWeight: 700 }}
          itemStyle={{ color: tooltipItemColor }}
          formatter={(value) => [formatCurrencyCompact(value), "Amount"]}
          wrapperStyle={{ zIndex: 1000 }}
          labelFormatter={tooltipFormatter}
        />
        {Array.isArray(chartData) && chartData.length > 0 && (
          <ReferenceLine
            y={avg}
            stroke="#FFD54A"
            strokeDasharray="4 4"
            label={({ viewBox, x, y }) => {
              const tx =
                ((viewBox && viewBox.x + viewBox.width - 8) || x || 0) + 35;
              const baseY =
                typeof y === "number"
                  ? y
                  : (viewBox && viewBox.y + viewBox.height / 2) || 0;
              const labelYTop = baseY - 8;
              const labelYBottom = baseY + 10;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <text
                    x={tx}
                    y={labelYTop}
                    fill="#FFD54A"
                    fontWeight={700}
                    fontSize={12}
                    textAnchor="end"
                  >
                    Avg
                  </text>
                  <text
                    x={tx}
                    y={labelYBottom}
                    fill="#FFD54A"
                    fontWeight={700}
                    fontSize={12}
                    textAnchor="end"
                  >
                    {formatNumberFull(
                      Number.isFinite(avg) ? Math.trunc(avg) : 0
                    )}
                  </text>
                </g>
              );
            }}
          />
        )}
        <Bar
          dataKey="amount"
          fill="#5b7fff"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        >
          {chartData.map((entry, idx) => {
            const isSelected = selectedIndexSet.has(idx);
            const isHover = hoverBarIndex === idx && !isSelected;
            return (
              <Cell
                key={idx}
                fill={
                  isSelected
                    ? getSelectedFill()
                    : isHover
                    ? "#7895ff"
                    : "#5b7fff"
                }
                cursor={chartData.length > 0 ? "pointer" : "default"}
                onClick={(e) => {
                  if (!chartData.length) return;
                  const multi = e && (e.ctrlKey || e.metaKey);
                  const rangeSel = e && e.shiftKey;
                  handleBarClick(entry, idx, multi, rangeSel);
                  e.stopPropagation();
                }}
              />
            );
          })}
          {!barChartStyles?.hideNumbers && (
            <LabelList
              dataKey="amount"
              position="top"
              content={({ x, y, width, value }) => {
                if (!value) return null;
                const labelY = y < 18 ? y + 14 : y - 6;
                return (
                  <text
                    x={x + width / 2}
                    y={labelY}
                    fill={labelTextColor}
                    fontSize={11}
                    textAnchor="middle"
                  >
                    {formatNumberFull(value)}
                  </text>
                );
              }}
            />
          )}
        </Bar>
        <Customized
          component={(props) => {
            const { xAxisMap, offset: off } = props || {};
            if (!xAxisMap || !chartData?.length) return null;
            const axisKey = Object.keys(xAxisMap)[0];
            const xAxisCfg = xAxisMap[axisKey];
            const scale = xAxisCfg && xAxisCfg.scale;
            if (!scale || typeof scale.bandwidth !== "function") return null;
            const bandW = scale.bandwidth();
            return (
              <g>
                {chartData.map((entry, idx) => {
                  const xPos = scale(entry[xKey]);
                  if (typeof xPos !== "number" || isNaN(xPos)) return null;
                  const isSelected = selectedIndexSet.has(idx);
                  const isHover = hoverBarIndex === idx && !isSelected;
                  return (
                    <g key={`col-hit-${idx}`}>
                      <rect
                        x={xPos}
                        y={off.top}
                        width={bandW}
                        height={off.height}
                        fill={(function () {
                          const base = getFlowBaseRGBA();
                          if (isSelected) return `rgba(${base},0.18)`;
                          if (isHover) return `rgba(${base},0.12)`;
                          return "transparent";
                        })()}
                        style={{
                          cursor: "pointer",
                          transition: "fill 100ms linear",
                        }}
                        onMouseEnter={() => setHoverBarIndex(idx)}
                        onMouseLeave={() => setHoverBarIndex(null)}
                        onClick={(e) => {
                          const multi = e && (e.ctrlKey || e.metaKey);
                          const rangeSel = e && e.shiftKey;
                          handleBarClick(entry, idx, multi, rangeSel);
                          e.stopPropagation();
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
