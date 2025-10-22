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
  return data.filter((item) => item.type === type || !item.type);
};

/**
 * Transform data for chart rendering
 * @param {Array} data - Raw data array
 * @returns {Array} Transformed data
 */
export const transformChartData = (data) => {
  return data.map((item) => ({
    day: item.day ? new Date(item.day).getDate() : "",
    spending: item.spending ?? 0,
    date: item.day,
    type: item.type,
    expenses: item.expenses || [],
  }));
};
