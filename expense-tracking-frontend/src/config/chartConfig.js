/**
 * Chart Configuration
 * Centralized configuration for all chart components
 */

import { SEMANTIC_COLORS, COLOR_PALETTES } from "./colorPalettes";

const CHART_LOSS_COLOR = SEMANTIC_COLORS.error.main;
const CHART_GAIN_COLOR = COLOR_PALETTES.teal.primary;

export const DEFAULT_TIMEFRAME_OPTIONS = [
  {
    value: "this_month",
    labelKey: "dashboard.charts.timeframeOptions.thisMonth",
  },
  {
    value: "last_month",
    labelKey: "dashboard.charts.timeframeOptions.lastMonth",
  },
  {
    value: "last_3_months",
    labelKey: "dashboard.charts.timeframeOptions.last3Months",
  },
  {
    value: "this_year",
    labelKey: "dashboard.charts.timeframeOptions.thisYear",
  },
  {
    value: "last_year",
    labelKey: "dashboard.charts.timeframeOptions.lastYear",
  },
  {
    value: "all_time",
    labelKey: "dashboard.charts.timeframeOptions.allTime",
  },
  // Add more options here as needed:
  // { value: "this_week", label: "This Week" },
];

export const DEFAULT_TYPE_OPTIONS = [
  {
    value: "loss",
    labelKey: "dashboard.charts.typeOptions.loss",
    color: CHART_LOSS_COLOR,
  },
  {
    value: "gain",
    labelKey: "dashboard.charts.typeOptions.gain",
    color: CHART_GAIN_COLOR,
  },
];

// Tooltip configuration
export const TOOLTIP_CONFIG = {
  maxExpensesToShow: 5, // Max expenses to display before showing "X+ more"
  minWidth: 200,
  maxWidth: 300,
  // Visual styling options
  borderRadius: 12,
  borderWidth: 2,
  headerPadding: "10px 12px 8px 12px",
  bodyPadding: "10px 12px 12px 12px",
  // Typography
  dateFontSize: 9,
  labelFontSize: 8,
  amountFontSize: 16,
  transactionNameFontSize: 11,
  transactionAmountFontSize: 12,
  categoryFontSize: 10,
  // Spacing
  itemGap: 6,
  iconSize: { small: 11, medium: 12, large: 16 },
  // Animation
  enableAnimation: true,
  animationDuration: 200,
};

// Tooltip style presets - easily switch between different designs
export const TOOLTIP_STYLE_PRESETS = {
  compact: {
    borderRadius: 12,
    headerPadding: "10px 12px 8px 12px",
    bodyPadding: "10px 12px 12px 12px",
    dateFontSize: 9,
    amountFontSize: 16,
  },
  comfortable: {
    borderRadius: 16,
    headerPadding: "14px 16px 12px 16px",
    bodyPadding: "14px 16px 16px 16px",
    dateFontSize: 11,
    amountFontSize: 20,
  },
  spacious: {
    borderRadius: 20,
    headerPadding: "18px 20px 16px 20px",
    bodyPadding: "16px 20px 20px 20px",
    dateFontSize: 12,
    amountFontSize: 24,
  },
};

export const CHART_THEME = {
  loss: {
    color: CHART_LOSS_COLOR,
    border: CHART_LOSS_COLOR,
    divider: `${CHART_LOSS_COLOR}33`,
  },
  gain: {
    color: CHART_GAIN_COLOR,
    border: CHART_GAIN_COLOR,
    divider: `${CHART_GAIN_COLOR}33`,
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
