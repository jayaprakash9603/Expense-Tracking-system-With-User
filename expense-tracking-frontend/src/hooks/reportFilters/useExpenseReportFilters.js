import { useMemo } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import useReportFilterState from "./useReportFilterState";

const fallbackMethods = (methodsData) =>
  (Array.isArray(methodsData) ? methodsData : []).map((item) => item.method);

const useExpenseReportFilters = ({
  timeframe,
  flowType,
  setTimeframe,
  setFlowType,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  methodsData,
  summary,
}) => {
  const {
    defaults,
    filterValues,
    isFilterOpen,
    openFilters,
    closeFilters,
    applyCommonFilters,
    resetCommonFilters,
    baseFiltersActive,
  } = useReportFilterState({
    reportType: "expenses",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const expenseAmountBounds = useMemo(() => {
    if (!Array.isArray(methodsData) || !methodsData.length) {
      return { min: 0, max: 50000 };
    }
    const totals = methodsData.map((item) =>
      Math.abs(Number(item.totalAmount || 0))
    );
    const max = Math.max(...totals, 0);
    return {
      min: 0,
      max: Math.max(max, 1000),
    };
  }, [methodsData]);

  const sections = useMemo(
    () =>
      buildReportFilterSections("expenses", {
        availableMethods: fallbackMethods(methodsData).filter(Boolean),
        amountBounds: expenseAmountBounds,
      }),
    [methodsData, expenseAmountBounds]
  );

  const normalizedRange = useMemo(() => {
    const fallback = expenseAmountBounds;
    const current = filterValues.amountRange;
    const min = Number.isFinite(current?.min) ? current.min : fallback.min;
    const max = Number.isFinite(current?.max) ? current.max : fallback.max;
    return {
      min: min ?? fallback.min ?? 0,
      max: max ?? fallback.max ?? 0,
    };
  }, [filterValues.amountRange, expenseAmountBounds]);

  const filteredMethodsData = useMemo(() => {
    if (!Array.isArray(methodsData)) {
      return [];
    }
    return methodsData.filter((method) => {
      if (
        Array.isArray(filterValues.paymentMethods) &&
        filterValues.paymentMethods.length &&
        !filterValues.paymentMethods.includes(method.method)
      ) {
        return false;
      }
      const total = Number(method.totalAmount || 0);
      return total >= normalizedRange.min && total <= normalizedRange.max;
    });
  }, [
    methodsData,
    filterValues.paymentMethods,
    normalizedRange.min,
    normalizedRange.max,
  ]);

  const filteredExpenseSummary = useMemo(() => {
    const totalAmount = filteredMethodsData.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );
    return {
      ...(summary || {}),
      totalAmount,
    };
  }, [filteredMethodsData, summary]);

  const filtersActive = useMemo(() => {
    if (baseFiltersActive) {
      return true;
    }
    if (filterValues.paymentMethods?.length) {
      return true;
    }
    if (filterValues.amountRange) {
      const { min, max } = filterValues.amountRange;
      if (
        (Number.isFinite(min) && min > expenseAmountBounds.min) ||
        (Number.isFinite(max) && max < expenseAmountBounds.max)
      ) {
        return true;
      }
    }
    return false;
  }, [
    baseFiltersActive,
    filterValues.paymentMethods,
    filterValues.amountRange,
    expenseAmountBounds.min,
    expenseAmountBounds.max,
  ]);

  return {
    filterDefaults: defaults,
    filterValues,
    sections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters: applyCommonFilters,
    handleResetFilters: resetCommonFilters,
    filtersActive,
    filteredMethodsData,
    filteredExpenseSummary,
  };
};

export default useExpenseReportFilters;
