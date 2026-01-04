import { useMemo, useState, useEffect, useCallback } from "react";
import { getReportFilterDefaults } from "../../constants/reportFilters";

const EMPTY_DATE_RANGE = { fromDate: "", toDate: "" };

const buildDateRangeValue = (dateRange, isCustomRange) => {
  if (!isCustomRange) {
    return EMPTY_DATE_RANGE;
  }
  return {
    fromDate: dateRange?.fromDate || "",
    toDate: dateRange?.toDate || "",
  };
};

/**
 * Shared state manager for analytics report filters. Handles drawer visibility,
 * default values, timeframe/flow/date synchronization, and exposes helpers for
 * apply/reset flows so individual report hooks stay lean.
 */
const useReportFilterState = ({
  reportType,
  timeframe,
  flowType,
  dateRange,
  isCustomRange,
  setTimeframe,
  setFlowType,
  setCustomDateRange,
  resetDateRange,
}) => {
  const defaults = useMemo(
    () => getReportFilterDefaults(reportType),
    [reportType]
  );

  const [filterValues, setFilterValues] = useState(() => ({
    ...defaults,
    timeframe,
    flowType,
    dateRange: buildDateRangeValue(dateRange, isCustomRange),
  }));
  const [isFilterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      timeframe,
      flowType,
    }));
  }, [timeframe, flowType]);

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      dateRange: buildDateRangeValue(dateRange, isCustomRange),
    }));
  }, [dateRange, isCustomRange]);

  const openFilters = useCallback(() => setFilterOpen(true), []);
  const closeFilters = useCallback(() => setFilterOpen(false), []);

  const applyCommonFilters = useCallback(
    (nextValues) => {
      setFilterValues(nextValues);
      if (nextValues.timeframe && nextValues.timeframe !== timeframe) {
        setTimeframe?.(nextValues.timeframe);
      }
      if (nextValues.flowType && nextValues.flowType !== flowType) {
        setFlowType?.(nextValues.flowType);
      }
      const range = nextValues.dateRange;
      if (range?.fromDate && range?.toDate) {
        setCustomDateRange?.(range);
      } else if (isCustomRange) {
        resetDateRange?.();
      }
      closeFilters();
    },
    [
      timeframe,
      flowType,
      setTimeframe,
      setFlowType,
      setCustomDateRange,
      resetDateRange,
      isCustomRange,
      closeFilters,
    ]
  );

  const resetCommonFilters = useCallback(() => {
    const resetPayload = {
      ...defaults,
      timeframe: defaults.timeframe ?? timeframe,
      flowType: defaults.flowType ?? flowType,
      dateRange: EMPTY_DATE_RANGE,
    };
    setFilterValues(resetPayload);
    if (setTimeframe && resetPayload.timeframe !== timeframe) {
      setTimeframe(resetPayload.timeframe);
    }
    if (setFlowType && resetPayload.flowType !== flowType) {
      setFlowType(resetPayload.flowType);
    }
    if (isCustomRange) {
      resetDateRange?.();
    }
    return resetPayload;
  }, [
    defaults,
    timeframe,
    flowType,
    setTimeframe,
    setFlowType,
    resetDateRange,
    isCustomRange,
  ]);

  const baseFiltersActive = useMemo(() => {
    if (
      filterValues.timeframe &&
      filterValues.timeframe !== defaults.timeframe
    ) {
      return true;
    }
    if (filterValues.flowType && filterValues.flowType !== defaults.flowType) {
      return true;
    }
    if (filterValues.dateRange?.fromDate && filterValues.dateRange?.toDate) {
      return true;
    }
    return false;
  }, [
    filterValues.timeframe,
    filterValues.flowType,
    filterValues.dateRange,
    defaults.timeframe,
    defaults.flowType,
  ]);

  return {
    defaults,
    filterValues,
    isFilterOpen,
    openFilters,
    closeFilters,
    applyCommonFilters,
    resetCommonFilters,
    baseFiltersActive,
  };
};

export default useReportFilterState;
