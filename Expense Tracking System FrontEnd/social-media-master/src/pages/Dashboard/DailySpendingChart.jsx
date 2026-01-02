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
  ReferenceLine,
} from "recharts";
import { useMediaQuery } from "@mui/material";

// Import separate components
import ChartTimeframeSelector from "../../components/charts/ChartTimeframeSelector";
import ChartTypeToggle from "../../components/charts/ChartTypeToggle";
import SpendingChartTooltip from "../../components/charts/SpendingChartTooltip";
import EmptyStateCard from "../../components/EmptyStateCard";

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
  const { mode, colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;
  const locale = settings.language || "en";

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  const isYearView = timeframe === "this_year" || timeframe === "last_year";
  const isAllTimeView = timeframe === "all_time";

  // Chart configuration
  const chartHeight = height || (isMobile ? 220 : isTablet ? 260 : 300);
  const hideXAxis =
    !isYearView &&
    !isAllTimeView &&
    (timeframe === "last_3_months" || isMobile);
  const safeData = Array.isArray(data) ? data : [];
  const activeType = selectedType || "loss";
  const filteredData = filterDataByType(safeData, activeType);
  const normalizedData = transformChartData(filteredData, {
    timeframe,
    locale,
  });

  const trimLeadingZeroSpending = (points) => {
    let seenValue = false;
    return points.filter((p) => {
      const hasValue = (p.spending ?? 0) > 0 || (p.expenses?.length ?? 0) > 0;
      if (hasValue) {
        seenValue = true;
      }
      return seenValue;
    });
  };

  const fillMissingDaysToToday = (points) => {
    if (timeframe !== "this_month" && timeframe !== "this_year") {
      return points;
    }

    const formatIso = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const today = new Date();
    const startDate =
      timeframe === "this_month"
        ? new Date(today.getFullYear(), today.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);

    const map = new Map();
    points.forEach((p) => {
      if (!p.date) return;
      map.set(p.date, p);
    });

    const filled = [];
    for (
      let cursor = new Date(startDate);
      cursor <= today;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const iso = formatIso(cursor);
      if (map.has(iso)) {
        filled.push(map.get(iso));
      } else {
        filled.push({
          xLabel: cursor.getDate(),
          spending: 0,
          date: iso,
          dateObj: new Date(cursor),
          type: activeType,
          expenses: [],
        });
      }
    }

    return filled;
  };

  const trimmedData =
    timeframe === "all_time"
      ? trimLeadingZeroSpending(normalizedData)
      : normalizedData;

  const normalizedWithFill = fillMissingDaysToToday(trimmedData);

  const buildMonthlyBuckets = (points, labelWithYear = false) => {
    const monthFormatter = new Intl.DateTimeFormat(locale || undefined, {
      month: "short",
    });
    const map = {};

    points.forEach((point) => {
      if (!point.dateObj) return;
      const monthIndex = point.dateObj.getMonth();
      const year = point.dateObj.getFullYear();
      const key = `${year}-${monthIndex}`;

      if (!map[key]) {
        map[key] = {
          xLabel: labelWithYear
            ? `${monthFormatter.format(point.dateObj)} ${year}`
            : monthFormatter.format(point.dateObj),
          monthIndex,
          year,
          spending: 0,
          expenses: [],
          type: point.type,
        };
      }

      map[key].spending += point.spending ?? 0;
      if (Array.isArray(point.expenses)) {
        map[key].expenses.push(...point.expenses);
      }
    });

    return Object.values(map).sort((a, b) =>
      a.year === b.year ? a.monthIndex - b.monthIndex : a.year - b.year
    );
  };

  const chartData = (() => {
    if (isYearView) {
      return buildMonthlyBuckets(normalizedWithFill, false);
    }
    if (isAllTimeView) {
      return buildMonthlyBuckets(trimmedData, true);
    }

    return normalizedWithFill.map((point) => ({
      xLabel: point.xLabel,
      spending: point.spending,
      date: point.date,
      type: point.type,
      expenses: point.expenses,
    }));
  })();

  const totalPoints = chartData.length || 0;
  const totalSpending = chartData.reduce(
    (sum, item) => sum + (item.spending || 0),
    0
  );
  const averageSpending = totalPoints > 0 ? totalSpending / totalPoints : 0;
  const averageLineColor = mode === "dark" ? "#facc15" : "#eab308";
  const averageLabelText =
    averageSpending > 0
      ? `${t("cashflow.chart.averageLabel")} ${currencySymbol}${Math.round(
          averageSpending
        ).toLocaleString()}`
      : "";

  const xTickFormatter = (value, index) => {
    if (!value || totalPoints === 0) return "";

    if (isAllTimeView) {
      const maxTicks = isMobile ? 4 : 8;
      const step = Math.max(1, Math.ceil(totalPoints / maxTicks));
      return index % step === 0 ? value : "";
    }

    if (timeframe === "last_3_months") {
      const maxTicks = isMobile ? 6 : 10;
      const step = Math.max(1, Math.ceil(totalPoints / maxTicks));
      return index % step === 0 ? value : "";
    }

    return value;
  };

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
  const showEmpty = !loading && (chartData.length === 0 || totalSpending === 0);

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
      {showEmpty ? (
        <EmptyStateCard
          icon="📉"
          title="No spending data"
          message="No transactions available for this timeframe yet."
          height={chartHeight + 40}
          bordered={false}
        />
      ) : (
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
              dataKey="xLabel"
              stroke={colors.primary_text}
              fontSize={12}
              tickLine={false}
              tickFormatter={xTickFormatter}
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
                  timeframe={timeframe}
                  config={tooltipConfig || TOOLTIP_CONFIG}
                  theme={theme}
                />
              )}
            />

            {averageSpending > 0 && averageLabelText && (
              <ReferenceLine
                y={averageSpending}
                stroke={averageLineColor}
                strokeDasharray="4 4"
                strokeWidth={3}
                ifOverflow="extendDomain"
                label={{
                  value: averageLabelText,
                  position: "top",
                  fill: averageLineColor,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

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
      )}
    </div>
  );
};

export default DailySpendingChart;
