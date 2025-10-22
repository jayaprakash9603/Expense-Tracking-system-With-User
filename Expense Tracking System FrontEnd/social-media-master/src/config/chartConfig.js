/**
 * Chart Configuration
 * Centralized configuration for all chart components
 */

// Default timeframe options - easily extendable
export const DEFAULT_TIMEFRAME_OPTIONS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  // Add more options here as needed:
  // { value: "this_week", label: "This Week" },
  // { value: "this_year", label: "This Year" },
];

// Default type options - easily extendable or can be disabled
export const DEFAULT_TYPE_OPTIONS = [
  { value: "loss", label: "Loss", color: "#ff5252" },
  { value: "gain", label: "Gain", color: "#14b8a6" },
  // Add more types as needed:
  // { value: "all", label: "All", color: "#888" },
];

// Tooltip configuration
export const TOOLTIP_CONFIG = {
  maxExpensesToShow: 5, // Max expenses to display before showing "X+ more"
  minWidth: 200,
  maxWidth: 300,
};

// Chart theme colors
export const CHART_THEME = {
  loss: {
    color: "#ff5252",
    border: "#ff5252",
    divider: "#ff525233",
  },
  gain: {
    color: "#14b8a6",
    border: "#14b8a6",
    divider: "#14b8a633",
  },
};

// Chart responsive breakpoints
export const CHART_BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
};

// Chart heights for different screen sizes
export const CHART_HEIGHTS = {
  mobile: 220,
  tablet: 260,
  desktop: 300,
};
