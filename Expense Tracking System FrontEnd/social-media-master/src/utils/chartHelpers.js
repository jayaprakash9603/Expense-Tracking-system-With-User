/**
 * Chart Helper Functions
 * Utility functions for chart components
 */

/**
 * Format number with specified decimal places
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 0) =>
  Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

/**
 * Format date for tooltip display
 * @param {string} rawDate - ISO date string
 * @param {number} dayNumber - Day number fallback
 * @returns {string} Formatted date
 */
export const formatTooltipDate = (rawDate, dayNumber) => {
  if (!rawDate) return dayNumber ? `Day ${dayNumber}` : "";
  const date = new Date(rawDate);
  return !isNaN(date)
    ? date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
    : `Day ${dayNumber}`;
};

/**
 * Get theme colors based on selected type
 * @param {string} type - Chart type (loss/gain)
 * @param {object} themeConfig - Theme configuration object (optional, will import default if not provided)
 * @returns {object} Theme colors
 */
export const getThemeColors = (type, themeConfig) => {
  // Import CHART_THEME locally if themeConfig is not provided
  if (!themeConfig) {
    const { CHART_THEME } = require("../config/chartConfig");
    themeConfig = CHART_THEME;
  }
  return themeConfig[type] || themeConfig.loss;
};

/**
 * Filter chart data based on type
 * @param {Array} data - Chart data array
 * @param {string} type - Type to filter by
 * @returns {Array} Filtered data
 */
export const filterDataByType = (data, type) => {
  if (!type) return data;
  return data.filter((item) => {
    if (!item || !type) return true;
    const itemType = item.type;
    if (!itemType) return true; // show untyped buckets
    if (itemType === "mixed") return true; // mixed buckets belong in both views
    return itemType === type;
  });
};

/**
 * Transform data for chart rendering
 * @param {Array} data - Raw data array
 * @returns {Array} Transformed data
 */
export const transformChartData = (data, { timeframe, locale } = {}) => {
  const isIsoDate = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value);

  return (Array.isArray(data) ? data : []).map((item, index) => {
    const dateString =
      item?.isoDate ||
      item?.date ||
      (isIsoDate(item?.day) ? item.day : null) ||
      null;

    const dateObj = dateString ? new Date(dateString) : null;
    const spendingValue = item?.spending ?? item?.amount ?? item?.total ?? 0;
    const safeSpending = Number.isFinite(spendingValue)
      ? spendingValue
      : Number(spendingValue) || 0;

    const explicitLabel =
      item?.label ||
      item?.bucketLabel ||
      item?.dayLabel ||
      item?.monthLabel ||
      item?.weekLabel ||
      null;

    let xLabel = explicitLabel || item?.day || `#${index + 1}`;

    if (!explicitLabel && dateObj && !Number.isNaN(dateObj.getTime())) {
      if (timeframe === "this_year" || timeframe === "last_year") {
        xLabel = new Intl.DateTimeFormat(locale || undefined, {
          month: "short",
        }).format(dateObj);
      } else if (timeframe === "all_time") {
        xLabel = new Intl.DateTimeFormat(locale || undefined, {
          month: "short",
          year: "numeric",
        }).format(dateObj);
      } else {
        xLabel = dateObj.getDate();
      }
    }

    return {
      xLabel,
      spending: Math.abs(safeSpending),
      date: dateString,
      dateObj: dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj : null,
      type: item?.type || null,
      expenses: Array.isArray(item?.expenses) ? item.expenses : [],
    };
  });
};
