import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMediaQuery, Box, Typography, Paper, Stack } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import ChartTypeToggle from "../../components/charts/ChartTypeToggle";
import EmptyStateCard from "../../components/EmptyStateCard";
import { getEntityIcon } from "../../utils/iconMapping";

// Generic reusable Pie/Donut chart component with MUI tooltips
// Props:
//  title: string - header title
//  data: array | object - raw data; normalization performed via normalize function if provided
//  timeframe, onTimeframeChange: controls for timeframe selector
//  flowType, onFlowTypeChange: controls for loss/gain toggle
//  height: chart height
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
//  valuePrefix: currency symbol default (uses user settings)
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

const formatNumber2 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

// Custom MUI-styled tooltip component
const MuiPieTooltip = ({
  active,
  payload,
  currencySymbol,
  total,
  themeColors,
  entityType = "category",
}) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const percentage = total > 0 ? (item.value / total) * 100 : 0;
  const iconKey = item.payload?.icon || item.name || "";
  const iconColor = item.payload?.fill || item.color || "#14b8a6";

  return (
    <Paper
      elevation={8}
      sx={{
        p: 1.5,
        backgroundColor: themeColors.secondary_bg,
        border: `1px solid ${themeColors.border_color}`,
        borderRadius: 2,
        minWidth: 180,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      <Stack spacing={0.5}>
        {/* Category name with color indicator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: item.payload?.fill || item.color,
              boxShadow: `0 0 8px ${item.payload?.fill || item.color}80`,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: themeColors.primary_text,
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "1.1rem",
              }}
            >
              {getEntityIcon(entityType, iconKey, {
                sx: { color: iconColor, fontSize: "1.1rem" },
              })}
            </span>
            {item.name}
          </Typography>
        </Box>

        {/* Amount */}
        <Typography
          variant="h6"
          sx={{
            color: themeColors.primary_text,
            fontWeight: 700,
            pl: 3,
            fontSize: "1.1rem",
          }}
        >
          {currencySymbol}
          {formatNumber2(item.value)}
        </Typography>

        {/* Percentage bar */}
        <Box sx={{ pl: 3, pr: 1 }}>
          <Box
            sx={{
              width: "100%",
              height: 6,
              backgroundColor: themeColors.border_color,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: item.payload?.fill || item.color,
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Percentage text */}
        <Typography
          variant="body2"
          sx={{
            color: themeColors.secondary_text,
            pl: 3,
            fontSize: "0.85rem",
          }}
        >
          {percentage.toFixed(1)}% of total
        </Typography>
      </Stack>
    </Paper>
  );
};

// Custom active shape for 3D-like hover effect
const renderActiveShape = (props, themeColors) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      {/* Shadow layer */}
      <Sector
        cx={cx}
        cy={cy + 4}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="rgba(0,0,0,0.2)"
      />
      {/* Main highlighted segment */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={themeColors.primary_accent}
        strokeWidth={2}
        style={{
          filter: "brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
        }}
      />
    </g>
  );
};

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
  valuePrefix,
  skeleton = null,
  entityType = "category",
}) => {
  const { colors: themeColors, mode: themeMode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = valuePrefix || settings.getCurrency().symbol;

  // Track active segment for highlighting
  const [activeIndex, setActiveIndex] = useState(null);

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
        items: data.map((d) => ({
          name: d.name,
          value: Number(d.value) || 0,
          icon: d.icon || "",
          color: d.color || "",
        })),
        total,
      };
    } else if (data && typeof data === "object") {
      // API returns each category/payment method as a key with its details
      // and a "summary" key with aggregated totals
      const entityKeys = Object.keys(data).filter(
        (k) => k !== "summary" && k !== "metadata",
      );
      const items = entityKeys.map((k) => {
        const entityData = data[k] || {};
        return {
          name: k,
          value: Number(entityData.totalAmount || 0),
          icon: entityData.icon || "",
          color: entityData.color || "",
        };
      });
      const total = Number(
        data.summary?.totalAmount || items.reduce((s, it) => s + it.value, 0),
      );
      normalized = { items, total };
    }
  }

  const pieData = normalized.items;
  const totalAmount = normalized.total;

  // Calculate percentage for each segment
  const pieDataWithPercentage = pieData.map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  const showEmpty =
    !loading && (!pieDataWithPercentage.length || totalAmount === 0);

  // Responsive radii - use MUI useMediaQuery for reactive updates
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const defaultInner = donut ? (isMobile ? 45 : isTablet ? 60 : 80) : 0;
  const defaultOuter = isMobile ? 85 : isTablet ? 110 : 150;
  const iRadius = innerRadius ?? defaultInner;
  const oRadius = outerRadius ?? defaultOuter;

  // Handle mouse events
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  const handleLegendMouseEnter = (e) => {
    const index = pieDataWithPercentage.findIndex(
      (item) => item.name === e.value,
    );
    if (index !== -1) setActiveIndex(index);
  };

  const handleLegendMouseLeave = () => setActiveIndex(null);

  // Custom label renderer
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }) => {
    if (percent < 0.05 && activeIndex !== index) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textColor = themeMode === "light" ? "#1a1a1a" : "#ffffff";

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: activeIndex === index ? 700 : 600,
          textShadow:
            themeMode === "dark" ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: themeColors.secondary_bg,
        border: `1px solid ${themeColors.border_color}`,
      }}
    >
      <div className="chart-header">
        <h3 style={{ color: themeColors.primary_text }}>{title}</h3>
        {controls && (
          <div className="chart-controls">
            {onTimeframeChange && (
              <select
                className="time-selector"
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                style={{
                  backgroundColor: themeColors.tertiary_bg,
                  color: themeColors.primary_text,
                  border: `1px solid ${themeColors.border_color}`,
                }}
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="all_time">All Time</option>
              </select>
            )}
            {onFlowTypeChange && (
              <ChartTypeToggle
                selectedType={flowType}
                onToggle={onFlowTypeChange}
                options={[
                  { value: "loss", label: "Loss", color: "#ef4444" },
                  { value: "gain", label: "Gain", color: "#10b981" },
                ]}
              />
            )}
          </div>
        )}
      </div>
      {loading && skeleton ? (
        <div style={{ height }} className="chart-loading-wrapper">
          {skeleton}
        </div>
      ) : (
        <Box sx={{ position: "relative", width: "100%", height }}>
          {showEmpty ? (
            <EmptyStateCard
              icon="📊"
              title="No distribution data"
              message="We couldn't find any data for this timeframe yet."
              height={height}
              bordered={false}
            />
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <defs>
                  {/* Drop shadow filter for 3D effect */}
                  <filter
                    id="pieShadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="4"
                      floodColor="#000000"
                      floodOpacity="0.15"
                    />
                  </filter>
                  {/* Gradient definitions for each segment */}
                  {pieDataWithPercentage.map((_, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`pieGradient-${index}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop
                        offset="100%"
                        stopColor="#000000"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={pieDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  innerRadius={iRadius}
                  outerRadius={oRadius}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  label={renderCustomLabel}
                  labelLine={{
                    stroke: themeColors.border_color,
                    strokeWidth: 1,
                  }}
                  activeIndex={activeIndex}
                  activeShape={(props) => renderActiveShape(props, themeColors)}
                  style={{ filter: "url(#pieShadow)" }}
                >
                  {pieDataWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      stroke={themeColors.secondary_bg}
                      strokeWidth={2}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        opacity:
                          activeIndex === null || activeIndex === index
                            ? 1
                            : 0.6,
                      }}
                    />
                  ))}
                </Pie>
                {/* MUI-styled Tooltip */}
                <Tooltip
                  content={(props) => (
                    <MuiPieTooltip
                      {...props}
                      currencySymbol={currencySymbol}
                      total={totalAmount}
                      themeColors={themeColors}
                      entityType={entityType}
                    />
                  )}
                  cursor={{ fill: "transparent" }}
                  isAnimationActive={false}
                  wrapperStyle={{ zIndex: 1000, outline: "none" }}
                />
                {legend && (
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      color: themeColors.primary_text,
                      fontSize: isMobile ? "10px" : "12px",
                    }}
                    onMouseEnter={handleLegendMouseEnter}
                    onMouseLeave={handleLegendMouseLeave}
                    iconSize={0}
                    formatter={(value, entry) => {
                      const iconKey = entry.payload?.icon || value || "";
                      const iconColor =
                        entry.payload?.fill || entry.color || "#14b8a6";
                      return (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "1em",
                            }}
                          >
                            {getEntityIcon(entityType, iconKey, {
                              sx: { color: iconColor, fontSize: "1em" },
                            })}
                          </span>
                          <span>{value}</span>
                        </span>
                      );
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      )}
      {/* Footer total */}
      {renderFooterTotal && !loading && !showEmpty && (
        <div
          className="total-amount total-amount-bottom"
          style={{ color: themeColors.primary_text }}
        >
          {footerPrefix} {currencySymbol}
          {formatNumber0(totalAmount)}
        </div>
      )}
    </div>
  );
};

export default ReusablePieChart;
