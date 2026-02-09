import { useMemo } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import useReportFilterState from "./useReportFilterState";

const extractCategoryNames = (categories) =>
  (Array.isArray(categories) ? categories : [])
    .map((item) => item.name || item.category)
    .filter(Boolean);

const useCategoryReportFilters = ({
  timeframe,
  flowType,
  setTimeframe,
  setFlowType,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  categorySpending,
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
    reportType: "categories",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const sections = useMemo(
    () =>
      buildReportFilterSections("categories", {
        availableCategories: extractCategoryNames(categorySpending),
      }),
    [categorySpending]
  );

  const filteredCategories = useMemo(() => {
    const dataset = Array.isArray(categorySpending)
      ? [...categorySpending]
      : [];
    let working = dataset;
    if (filterValues.categories?.length) {
      const selected = new Set(filterValues.categories);
      working = working.filter((item) =>
        selected.has(item.name || item.category)
      );
    }
    const sorted = [...working].sort((a, b) => {
      const direction = filterValues.sortOrder === "asc" ? 1 : -1;
      return direction * (Number(a.amount || 0) - Number(b.amount || 0));
    });
    return sorted;
  }, [categorySpending, filterValues.categories, filterValues.sortOrder]);

  const filtersActive = useMemo(() => {
    if (baseFiltersActive) {
      return true;
    }
    if (filterValues.categories?.length) {
      return true;
    }
    if (
      filterValues.sortOrder &&
      filterValues.sortOrder !== defaults.sortOrder
    ) {
      return true;
    }
    return false;
  }, [
    baseFiltersActive,
    filterValues.categories,
    filterValues.sortOrder,
    defaults.sortOrder,
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
    filteredCategories,
  };
};

export default useCategoryReportFilters;
