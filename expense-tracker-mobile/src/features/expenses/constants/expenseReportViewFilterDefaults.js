export const DEFAULT_EXPENSE_REPORT_VIEW_FILTERS = {
  categoryTop: "all",
  categoryGroupBelow: "0",
  paymentTop: "all",
  paymentGroupBelow: "0",
  trendMinAmount: "0",
};

export const EXPENSE_REPORT_TOP_OPTIONS = [
  { value: "all", labelKey: "reports.viewFilters.allSlices" },
  { value: "5", labelKey: "reports.viewFilters.top5" },
  { value: "10", labelKey: "reports.viewFilters.top10" },
  { value: "15", labelKey: "reports.viewFilters.top15" },
];

export const EXPENSE_REPORT_COMBINE_BELOW_OPTIONS = [
  { value: "0", labelKey: "reports.viewFilters.combineNone" },
  { value: "1", labelKey: "reports.viewFilters.combine1" },
  { value: "2", labelKey: "reports.viewFilters.combine2" },
  { value: "5", labelKey: "reports.viewFilters.combine5" },
];

export const EXPENSE_REPORT_TREND_MIN_OPTIONS = [
  { value: "0", labelKey: "reports.viewFilters.trendNone" },
  { value: "100", labelKey: "reports.viewFilters.trend100" },
  { value: "500", labelKey: "reports.viewFilters.trend500" },
  { value: "1000", labelKey: "reports.viewFilters.trend1000" },
  { value: "5000", labelKey: "reports.viewFilters.trend5000" },
];
