import { useMemo } from "react";
import { CUSTOM_TIMEFRAME_PLACEHOLDER } from "@/shared/constants/reportFilters";

export function useReportHeroTimeframeSelect(timeframe, timeframeOptions, isCustomRangeActive) {
  const hasMatchingTimeframe = useMemo(
    () => timeframeOptions.some((o) => o.value === timeframe),
    [timeframe, timeframeOptions],
  );
  const hasExplicitTimeframe = timeframe !== undefined && timeframe !== null && timeframe !== "";
  const shouldShowTimeframePlaceholder =
    (isCustomRangeActive || !hasMatchingTimeframe) && (hasExplicitTimeframe || isCustomRangeActive);
  const timeframeSelectValue = shouldShowTimeframePlaceholder
    ? CUSTOM_TIMEFRAME_PLACEHOLDER
    : hasExplicitTimeframe
      ? timeframe
      : "";

  return { timeframeSelectValue, shouldShowTimeframePlaceholder };
}
