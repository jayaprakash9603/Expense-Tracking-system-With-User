export const DEFAULT_TIMEFRAME_OPTIONS = [
  { id: "this_week", labelKey: "chart.thisWeek" },
  { id: "this_month", labelKey: "chart.thisMonth" },
  { id: "last_month", labelKey: "chart.lastMonth" },
  { id: "last_3_months", labelKey: "chart.lastThreeMonths" },
  { id: "last_6_months", labelKey: "chart.lastSixMonths" },
  { id: "quarter", labelKey: "chart.quarter" },
  { id: "this_year", labelKey: "chart.thisYear" },
  { id: "last_year", labelKey: "chart.lastYear" },
  { id: "all_time", labelKey: "chart.allTime" },
];

export const SPENDING_FLOW_OPTIONS = [
  { id: "loss", labelKey: "dashboard.loss", color: "#ef4444" },
  { id: "gain", labelKey: "dashboard.gain", color: "#10b981" },
];

export const TOOLTIP_CONFIG = {
  contentStyle: {
    borderRadius: "8px",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "8px 12px",
    fontSize: "13px",
  },
  cursor: { fill: "hsl(var(--muted))", fillOpacity: 0.3 },
};

export const CHART_THEME = {
  gridColor: "hsl(var(--border))",
  axisColor: "hsl(var(--muted-foreground))",
  labelColor: "hsl(var(--muted-foreground))",
};

export const CHART_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
};

export const CHART_HEIGHTS = {
  compact: 200,
  default: 300,
  expanded: 400,
};

export const FLOW_PAGE_CHART_HEIGHT = 280;

const FLOW_INLINE_DRILLDOWN_VIEWPORT_CLASS =
  "min-h-[calc(100dvh-14rem-1.875rem)] max-h-[calc(100dvh-14rem-1.875rem)] sm:min-h-[calc(100dvh-16rem-1.875rem)] sm:max-h-[calc(100dvh-16rem-1.875rem)] md:min-h-[calc(100dvh-21rem-1.875rem)] md:max-h-[calc(100dvh-21rem-1.875rem)] lg:min-h-[calc(100dvh-23rem-8.125rem)] lg:max-h-[calc(100dvh-23rem-8.125rem)] xl:min-h-[calc(100dvh-23rem-8.125rem)] xl:max-h-[calc(100dvh-23rem-8.125rem)]";

export const FLOW_INLINE_DRILLDOWN_MAX_HEIGHT_CLASS = FLOW_INLINE_DRILLDOWN_VIEWPORT_CLASS;

export function getResponsiveChartHeight(breakpoint = "sm") {
  if (breakpoint === "sm") return CHART_HEIGHTS.compact;
  if (breakpoint === "md") return CHART_HEIGHTS.default;
  return CHART_HEIGHTS.expanded;
}

export const CHART_ANIMATION = {
  duration: 800,
  easing: "ease-in-out",
};

export const AXIS_CONFIG = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
};
