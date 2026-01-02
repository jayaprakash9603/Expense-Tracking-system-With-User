import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import PieChartTooltip from "../../components/charts/PieChartTooltip";
import ChartTypeToggle from "../../components/charts/ChartTypeToggle";
import EmptyStateCard from "../../components/EmptyStateCard";

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
}) => {
  const { colors: themeColors, mode: themeMode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = valuePrefix || settings.getCurrency().symbol;
  const [activeIndex, setActiveIndex] = useState(null);
  const [legendTooltip, setLegendTooltip] = useState(null);
  const chartRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLegendHovered, setIsLegendHovered] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

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

  // Calculate percentage for each segment
  const pieDataWithPercentage = pieData.map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
  }));
  const showEmpty =
    !loading && (!pieDataWithPercentage.length || totalAmount === 0);

  // Responsive radii fallback
  const isMobile = window.matchMedia("(max-width:600px)").matches;
  const isTablet = window.matchMedia("(max-width:1024px)").matches;
  const defaultInner = donut ? (isMobile ? 60 : isTablet ? 80 : 100) : 0;
  const defaultOuter = isMobile ? 110 : isTablet ? 150 : 180;
  const iRadius = innerRadius ?? defaultInner;
  const oRadius = outerRadius ?? defaultOuter;

  // Handle mouse enter on pie segment
  const onPieEnter = (_, index) => {
    // Clear any pending timeout immediately
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    // Clear legend tooltip immediately when entering pie
    setLegendTooltip(null);

    // Only activate if legend is not being hovered
    if (!isLegendHovered) {
      setActiveIndex(index);
    }
  };

  // Handle mouse leave
  const onPieLeave = () => {
    // Only clear if legend is not being hovered
    if (!isLegendHovered) {
      setActiveIndex(null);
    }

    // Always clear tooltip when leaving pie segment
    setLegendTooltip(null);
  };

  // Handle legend hover - highlight the corresponding pie segment
  const handleLegendMouseEnter = (e) => {
    // Clear any pending timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    setIsLegendHovered(true);

    const index = pieDataWithPercentage.findIndex(
      (item) => item.name === e.value
    );
    if (index !== -1) {
      setActiveIndex(index);

      // Calculate tooltip position relative to the viewport
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.4; // 40% from top

        setTooltipPosition({ x: centerX, y: centerY });
      }

      // Create tooltip data for legend hover
      setLegendTooltip({
        active: true,
        payload: [
          {
            name: pieDataWithPercentage[index].name,
            value: pieDataWithPercentage[index].value,
            payload: {
              fill: colors[index % colors.length],
              name: pieDataWithPercentage[index].name,
              value: pieDataWithPercentage[index].value,
            },
          },
        ],
      });
    }
  };

  const handleLegendMouseLeave = () => {
    setIsLegendHovered(false);

    // Add a very small delay before clearing to allow smooth transitions
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
      setLegendTooltip(null);
    }, 1);
  };

  // Custom label renderer for segments (shows percentage on hover or for larger segments)
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    // Don't show label if tooltip is visible (legend is being hovered)
    if (legendTooltip) return null;

    // Only show label if segment is large enough (>5%) or is being hovered
    if (percent < 0.05 && activeIndex !== index) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Force the correct color based on theme
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
            themeMode === "dark" ? "0 1px 2px rgba(0,0,0,0.5)" : "none", // Remove shadow entirely for light theme
        }}
      >
        {`${(percent * 100).toFixed(2)}%`}
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
          {/* Body-only skeleton (header already rendered above) */}
          {skeleton}
        </div>
      ) : (
        <div
          ref={chartRef}
          style={{ position: "relative", width: "100%", height }}
        >
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
                <Pie
                  data={pieDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  innerRadius={iRadius}
                  outerRadius={oRadius}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  label={renderCustomLabel}
                  labelLine={{
                    stroke: themeColors.border_color,
                    strokeWidth: 1,
                  }}
                  activeIndex={activeIndex}
                  activeShape={{
                    outerRadius: oRadius + 10,
                    stroke: themeColors.primary_accent,
                    strokeWidth: 2,
                  }}
                >
                  {pieDataWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      opacity={
                        activeIndex === null || activeIndex === index ? 1 : 0.6
                      }
                      style={{
                        filter:
                          activeIndex === index ? "brightness(1.2)" : "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Pie>
                {!isLegendHovered && (
                  <Tooltip
                    content={(props) => (
                      <PieChartTooltip {...props} data={rawData || data} />
                    )}
                    cursor={{ fill: "transparent" }}
                    isAnimationActive={false}
                    trigger="hover"
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                )}
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
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      {/* Render footer total only after data has loaded to avoid showing misleading 0 during skeleton */}
      {renderFooterTotal && !loading && !showEmpty && (
        <div
          className="total-amount total-amount-bottom"
          style={{ color: themeColors.primary_text }}
        >
          {footerPrefix} {currencySymbol}
          {formatNumber0(totalAmount)}
        </div>
      )}

      {/* Portal tooltip for legend hover - renders at body level to avoid z-index issues */}
      {legendTooltip &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: `${tooltipPosition.y}px`,
              left: `${tooltipPosition.x}px`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 10000,
            }}
          >
            <PieChartTooltip
              active={legendTooltip.active}
              payload={legendTooltip.payload}
              data={rawData || data}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default ReusablePieChart;
