/**
 * ============================================================================
 * DailySpendingChart Component
 * ============================================================================
 *
 * A highly modular and configurable chart component for visualizing daily spending patterns.
 *
 * USAGE EXAMPLES:
 * ---------------
 *
 * 1. Basic usage (with default options):
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 2. Hide type toggle (Loss/Gain buttons):
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      typeOptions={[]}  // Pass empty array to hide type toggle
 *    />
 *
 * 3. Custom timeframe options:
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_week"
 *      onTimeframeChange={setTimeframe}
 *      timeframeOptions={[
 *        { value: "this_week", label: "This Week" },
 *        { value: "this_month", label: "This Month" },
 *        { value: "this_year", label: "This Year" },
 *      ]}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 4. Custom title and height:
 *    <DailySpendingChart
 *      data={spendingData}
 *      title="💰 My Custom Title"
 *      height={400}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 5. Custom tooltip configuration:
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      tooltipConfig={{
 *        maxExpensesToShow: 10,
 *        minWidth: 250,
 *        maxWidth: 350,
 *        borderRadius: 16,
 *        amountFontSize: 20
 *      }}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * 6. Using tooltip style presets:
 *    import { TOOLTIP_STYLE_PRESETS } from "../../config/chartConfig";
 *
 *    <DailySpendingChart
 *      data={spendingData}
 *      timeframe="this_month"
 *      onTimeframeChange={setTimeframe}
 *      tooltipConfig={{ ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.comfortable }}
 *      selectedType="loss"
 *      onTypeToggle={setType}
 *    />
 *
 * EXTENDING THE COMPONENT:
 * ------------------------
 *
 * A. Add new timeframe options:
 *    - Update DEFAULT_TIMEFRAME_OPTIONS constant (line ~20)
 *    - Update the hook's buildDateRange function to handle new timeframes
 *
 * B. Add new type options (e.g., "all", "pending"):
 *    - Update DEFAULT_TYPE_OPTIONS constant (line ~28)
 *    - Add corresponding colors in CHART_THEME constant (line ~37)
 *
 * C. Customize tooltip behavior:
 *    - Modify TOOLTIP_CONFIG constant (line ~32)
 *    - Update TooltipContent component (line ~87)
 *
 * D. Change chart styling:
 *    - Update CHART_THEME constant for colors
 *    - Modify chart height breakpoints in component (line ~187)
 *
 * E. Disable type filtering in API:
 *    - In the hook, set includeTypeInRequest: false
 *    - This will fetch all types but still filter in the UI
 */

import React from "react";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMediaQuery } from "@mui/material";

// Import separate components
import ChartTimeframeSelector from "../../components/charts/ChartTimeframeSelector";
import ChartTypeToggle from "../../components/charts/ChartTypeToggle";
import SpendingChartTooltip from "../../components/charts/SpendingChartTooltip";

// Import configuration and utilities
import {
  DEFAULT_TIMEFRAME_OPTIONS,
  DEFAULT_TYPE_OPTIONS,
  TOOLTIP_CONFIG,
  CHART_THEME,
  CHART_HEIGHTS,
  CHART_BREAKPOINTS,
} from "../../config/chartConfig";

import {
  getThemeColors,
  filterDataByType,
  transformChartData,
} from "../../utils/chartHelpers";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DailySpendingChart - Modular and configurable daily spending visualization
 *
 * @param {Array} data - Chart data array
 * @param {string} timeframe - Selected timeframe value
 * @param {function} onTimeframeChange - Callback for timeframe changes
 * @param {Array} timeframeOptions - Custom timeframe options (optional)
 * @param {string} selectedType - Selected type (loss/gain)
 * @param {function} onTypeToggle - Callback for type changes
 * @param {Array} typeOptions - Custom type options (optional, pass [] to hide)
 * @param {string} title - Chart title (optional)
 * @param {string} icon - Chart icon (optional)
 * @param {number} height - Chart height (optional)
 * @param {object} tooltipConfig - Tooltip configuration (optional)
 * @param {boolean} loading - Loading state (optional, shows loading message when skeleton is disabled)
 */
const DailySpendingChart = ({
  data,
  timeframe,
  onTimeframeChange,
  timeframeOptions,
  selectedType,
  onTypeToggle,
  typeOptions,
  title = "📊 Daily Spending Pattern",
  icon,
  height,
  tooltipConfig,
  loading = false,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  // Chart configuration
  const chartHeight = height || (isMobile ? 220 : isTablet ? 260 : 300);
  const hideXAxis = timeframe === "last_3_months" || isMobile;
  const safeData = Array.isArray(data) ? data : [];
  const activeType = selectedType || "loss";

  // Filter and transform data
  const filteredData = activeType
    ? safeData.filter((item) => item.type === activeType || !item.type)
    : safeData;

  const chartData = filteredData.map((item) => ({
    day: item.day ? new Date(item.day).getDate() : "",
    spending: item.spending ?? 0,
    date: item.day,
    type: item.type,
    expenses: item.expenses || [],
  }));

  // Theme and styling
  const theme = getThemeColors(activeType, CHART_THEME);
  const gradientId = `spendingGradient-${activeType}`;
  const animationKey = `${timeframe}-${activeType}-${chartData.length}`;
  const chartTitle = title || t("dashboard.charts.titles.dailySpending");
  const timeframeSelectorOptions =
    timeframeOptions && timeframeOptions.length > 0
      ? timeframeOptions
      : DEFAULT_TIMEFRAME_OPTIONS;
  const typeSelectorOptions =
    typeOptions && typeOptions.length > 0 ? typeOptions : DEFAULT_TYPE_OPTIONS;

  return (
    <div
      className="chart-container daily-spending-chart fade-in"
      style={{
        overflow: "visible",
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Chart header */}
      <div className="chart-header">
        <h3 style={{ color: colors.primary_text }}>
          {icon || ""}
          {chartTitle}
        </h3>
        <div className="chart-controls">
          <ChartTimeframeSelector
            value={timeframe}
            onChange={onTimeframeChange}
            options={timeframeSelectorOptions}
          />
          <ChartTypeToggle
            selectedType={activeType}
            onToggle={onTypeToggle}
            options={typeSelectorOptions}
          />
        </div>
      </div>

      {/* Chart visualization */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={chartData} key={animationKey}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.color} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={colors.border_color} />

          <XAxis
            dataKey="day"
            stroke={colors.primary_text}
            fontSize={12}
            tickLine={false}
            hide={hideXAxis}
          />

          <YAxis
            stroke={colors.primary_text}
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) =>
              `${currencySymbol}${Math.round(value / 1000)}K`
            }
          />

          <Tooltip
            wrapperStyle={{
              zIndex: 9999,
              outline: "none",
            }}
            cursor={{
              stroke: theme.color,
              strokeWidth: 2,
              strokeDasharray: "5 5",
              opacity: 0.5,
            }}
            position={{ y: 0 }}
            allowEscapeViewBox={{ x: false, y: true }}
            animationDuration={150}
            animationEasing="ease-out"
            content={(props) => (
              <SpendingChartTooltip
                {...props}
                selectedType={activeType}
                config={tooltipConfig || TOOLTIP_CONFIG}
                theme={theme}
              />
            )}
          />

          <Area
            type="monotone"
            dataKey="spending"
            stroke={theme.color}
            fillOpacity={0.3}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySpendingChart;
