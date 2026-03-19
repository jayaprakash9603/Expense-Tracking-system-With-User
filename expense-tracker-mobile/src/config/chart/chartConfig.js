export const DEFAULT_TIMEFRAME_OPTIONS = [
  { id: "week", labelKey: "chart.week" },
  { id: "month", labelKey: "chart.month" },
  { id: "quarter", labelKey: "chart.quarter" },
  { id: "year", labelKey: "chart.year" },
  { id: "all", labelKey: "chart.all" },
];

export const DEFAULT_TYPE_OPTIONS = [
  { id: "bar", labelKey: "chart.bar" },
  { id: "line", labelKey: "chart.line" },
  { id: "pie", labelKey: "chart.pie" },
  { id: "area", labelKey: "chart.area" },
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
