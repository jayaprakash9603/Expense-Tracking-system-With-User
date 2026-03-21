import { useMemo } from "react";
import { DEFAULT_TIMEFRAME_OPTIONS } from "@/config/chart/chartConfig";
import { DEFAULT_REPORT_FLOW_TYPES, CUSTOM_TIMEFRAME_PLACEHOLDER } from "@/features/reports/constants/reportFilters";

export function useExpenseReportHeaderFilters(t, timeframe, isCustomRangeActive) {
  const flowOpts = useMemo(
    () =>
      DEFAULT_REPORT_FLOW_TYPES.map((o) => ({
        value: o.value,
        label: t(o.labelKey),
      })),
    [t],
  );

  const timeframeOpts = useMemo(
    () =>
      DEFAULT_TIMEFRAME_OPTIONS.map((o) => ({
        value: o.id,
        label: t(o.labelKey),
      })),
    [t],
  );

  const hasMatchingTimeframe = useMemo(
    () => timeframeOpts.some((o) => o.value === timeframe),
    [timeframeOpts, timeframe],
  );
  const hasExplicitTimeframe = timeframe !== undefined && timeframe !== null && timeframe !== "";
  const shouldShowTimeframePlaceholder =
    (isCustomRangeActive || !hasMatchingTimeframe) && (hasExplicitTimeframe || isCustomRangeActive);
  const timeframeSelectValue = shouldShowTimeframePlaceholder
    ? CUSTOM_TIMEFRAME_PLACEHOLDER
    : hasExplicitTimeframe
      ? timeframe
      : "";

  const isFilterActive = isCustomRangeActive || shouldShowTimeframePlaceholder;

  return {
    flowOpts,
    timeframeOpts,
    timeframeSelectValue,
    shouldShowTimeframePlaceholder,
    isFilterActive,
  };
}
