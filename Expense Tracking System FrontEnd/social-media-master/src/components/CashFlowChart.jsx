import React, { useMemo, useCallback } from "react";
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
import CashFlowCompactTooltip from "./cashflow/CashFlowCompactTooltip";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";
import { useTranslation } from "../hooks/useTranslation";

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
  yearMonths,
  weekDays,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;

  // Generate localized month and weekday arrays
  const localizedYearMonths = useMemo(() => {
    if (yearMonths) return yearMonths;
    return [
      t("cashflow.monthsShort.jan"),
      t("cashflow.monthsShort.feb"),
      t("cashflow.monthsShort.mar"),
      t("cashflow.monthsShort.apr"),
      t("cashflow.monthsShort.may"),
      t("cashflow.monthsShort.jun"),
      t("cashflow.monthsShort.jul"),
      t("cashflow.monthsShort.aug"),
      t("cashflow.monthsShort.sep"),
      t("cashflow.monthsShort.oct"),
      t("cashflow.monthsShort.nov"),
      t("cashflow.monthsShort.dec"),
    ];
  }, [yearMonths, t]);

  const localizedWeekDays = useMemo(() => {
    if (weekDays) return weekDays;
    return [
      t("cashflow.weekDays.mon"),
      t("cashflow.weekDays.tue"),
      t("cashflow.weekDays.wed"),
      t("cashflow.weekDays.thu"),
      t("cashflow.weekDays.fri"),
      t("cashflow.weekDays.sat"),
      t("cashflow.weekDays.sun"),
    ];
  }, [weekDays, t]);

  const { avg } = useAverageLine(chartData, activeRange, offset);
  const tooltipFormatter = useTooltipFormatter(
    activeRange,
    offset,
    localizedYearMonths,
    localizedWeekDays
  );
  const { getFlowBaseRGBA, getSelectedFill } = useSelectionHelpers(flowTab);
  const flowBaseRGB = getFlowBaseRGBA();
  const selectedColor = getSelectedFill();
  // Precompute hover map for quick lookup
  const selectedIndexSet = useMemo(
    () => new Set(selectedBars.map((b) => b.idx)),
    [selectedBars]
  );
  const tooltipContent = useMemo(
    () =>
      function renderTooltip(tooltipProps) {
        const computedLabel =
          typeof tooltipFormatter === "function"
            ? tooltipFormatter(tooltipProps.label, tooltipProps.payload)
            : tooltipProps.label;
        return (
          <CashFlowCompactTooltip
            {...tooltipProps}
            label={computedLabel}
            colors={colors}
            currencySymbol={currencySymbol}
            formatCurrencyCompact={formatCurrencyCompact}
            formatNumberFull={formatNumberFull}
            t={t}
            isHovering={hoverBarIndex !== null}
          />
        );
      },
    [
      colors,
      currencySymbol,
      formatCurrencyCompact,
      formatNumberFull,
      tooltipFormatter,
      t,
      hoverBarIndex,
    ]
  );

  // Theme-aware colors
  const gridColor = colors.border_color;
  const axisTextColor = colors.secondary_text;
  const axisLineColor = colors.border_color;
  const labelTextColor = "#ffffff"; // Keep white for visibility on colored bars in both themes

  const handleChartMouseLeave = useCallback(() => {
    setHoverBarIndex(null);
  }, [setHoverBarIndex]);

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onMouseLeave={handleChartMouseLeave}
    >
      <ResponsiveContainer width="100%" height={isMobile ? "100%" : "100%"}>
        <BarChart
          data={chartData}
          barWidth={barChartStyles?.barWidth}
          hideNumbers={barChartStyles?.hideNumbers}
          margin={{ right: isMobile ? 0 : 40 }}
          onMouseMove={(state) => {
            if (!state || state.isTooltipActive === false) {
              setHoverBarIndex(null);
              return;
            }
            if (typeof state.activeTooltipIndex === "number") {
              setHoverBarIndex(state.activeTooltipIndex);
              return;
            }
            setHoverBarIndex(null);
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
              const band =
                (barChartStyles?.barWidth || 30) + (isMobile ? 8 : 12);
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
                        ? t("cashflow.chart.xAxisDay")
                        : activeRange === "week"
                        ? t("cashflow.chart.xAxisWeekday")
                        : t("cashflow.chart.xAxisMonth"),
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
                    value: t("cashflow.chart.yAxisAmount"),
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
            content={tooltipContent}
            wrapperStyle={{
              zIndex: 1200,
              outline: "none",
              overflow: "visible",
              pointerEvents: "none",
            }}
            allowEscapeViewBox={{ x: false, y: true }}
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
                      {t("cashflow.chart.averageLabel")}
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
    </div>
  );
};

export default CashFlowChart;
