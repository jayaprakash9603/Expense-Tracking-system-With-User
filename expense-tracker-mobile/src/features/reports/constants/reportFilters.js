export const CUSTOM_TIMEFRAME_PLACEHOLDER = "__custom_timeframe__";

export const DEFAULT_REPORT_TIMEFRAMES = [
  { value: "this_month", labelKey: "reports.timeframe.thisMonth" },
  { value: "last_month", labelKey: "reports.timeframe.lastMonth" },
  { value: "last_3_months", labelKey: "reports.timeframe.last3Months" },
  { value: "last_6_months", labelKey: "reports.timeframe.last6Months" },
  { value: "this_year", labelKey: "reports.timeframe.thisYear" },
  { value: "last_year", labelKey: "reports.timeframe.lastYear" },
];

export const DEFAULT_REPORT_FLOW_TYPES = [
  { value: "all", labelKey: "reports.flow.all" },
  { value: "outflow", labelKey: "reports.flow.expenses" },
  { value: "inflow", labelKey: "reports.flow.income" },
];
