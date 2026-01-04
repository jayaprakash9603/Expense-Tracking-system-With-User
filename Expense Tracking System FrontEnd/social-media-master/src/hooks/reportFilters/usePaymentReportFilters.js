import { useMemo } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import useReportFilterState from "./useReportFilterState";

const normalizeList = (items, mapper) =>
  (Array.isArray(items) ? items : []).map(mapper).filter(Boolean);

const usePaymentReportFilters = ({
  timeframe,
  flowType,
  setTimeframe,
  setFlowType,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  methodsData,
  txSizeData,
  categoryBreakdown,
  categories,
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
    reportType: "payments",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const paymentAmountBounds = useMemo(() => {
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
      buildReportFilterSections("payments", {
        availableMethods: normalizeList(methodsData, (item) => item.method),
        availableCategories: normalizeList(
          categories,
          (item) => item.category || item.name
        ),
        amountBounds: paymentAmountBounds,
      }),
    [methodsData, categories, paymentAmountBounds]
  );

  const normalizedRange = useMemo(() => {
    const fallback = paymentAmountBounds;
    const current = filterValues.amountRange;
    const min = Number.isFinite(current?.min) ? current.min : fallback.min;
    const max = Number.isFinite(current?.max) ? current.max : fallback.max;
    return {
      min: min ?? fallback.min ?? 0,
      max: max ?? fallback.max ?? 0,
    };
  }, [filterValues.amountRange, paymentAmountBounds]);

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

  const filteredCategoryBreakdown = useMemo(() => {
    if (!Array.isArray(categoryBreakdown)) {
      return [];
    }
    if (!filterValues.categories?.length) {
      return categoryBreakdown;
    }
    const selected = new Set(filterValues.categories);
    return categoryBreakdown.filter((entry) =>
      selected.has(entry.category || entry.name)
    );
  }, [categoryBreakdown, filterValues.categories]);

  const filteredTxSizeData = useMemo(() => {
    if (!Array.isArray(txSizeData)) {
      return [];
    }
    if (!filterValues.paymentMethods?.length) {
      return txSizeData;
    }
    return txSizeData
      .map((row) => {
        const base = { range: row.range };
        filterValues.paymentMethods.forEach((method) => {
          if (row[method] !== undefined) {
            base[method] = row[method];
          }
        });
        return base;
      })
      .filter((row) => Object.keys(row).length > 1);
  }, [txSizeData, filterValues.paymentMethods]);

  const filtersActive = useMemo(() => {
    if (baseFiltersActive) {
      return true;
    }
    if (filterValues.paymentMethods?.length) {
      return true;
    }
    if (filterValues.categories?.length) {
      return true;
    }
    if (filterValues.amountRange) {
      const { min, max } = filterValues.amountRange;
      if (
        (Number.isFinite(min) && min > paymentAmountBounds.min) ||
        (Number.isFinite(max) && max < paymentAmountBounds.max)
      ) {
        return true;
      }
    }
    return false;
  }, [
    baseFiltersActive,
    filterValues.paymentMethods,
    filterValues.categories,
    filterValues.amountRange,
    paymentAmountBounds.min,
    paymentAmountBounds.max,
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
    filteredCategoryBreakdown,
    filteredTxSizeData,
  };
};

export default usePaymentReportFilters;
