import { useMemo, useEffect, useCallback } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import useReportFilterState from "./useReportFilterState";

export const BILL_TIMEFRAME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

export const BILL_FLOW_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "loss", label: "Loss" },
  { value: "gain", label: "Gain" },
];

const normalizeList = (items = [], accessor) => {
  const set = new Set();
  items.forEach((item) => {
    const value = accessor(item);
    if (value) {
      set.add(value);
    }
  });
  return Array.from(set).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
  );
};

const deriveAmountBounds = (bills) => {
  if (!bills.length) {
    return { min: 0, max: 1000 };
  }
  const totals = bills.map((bill) => Math.abs(Number(bill.amount) || 0));
  const max = Math.max(...totals, 0);
  const normalizedMax = Math.max(1000, Math.ceil(max / 100) * 100);
  return { min: 0, max: normalizedMax };
};

const useBillReportFilters = ({
  bills,
  timeframe,
  flowType,
  selectedCategory,
  setTimeframe,
  setFlowType,
  setSelectedCategory,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  activeRange,
  timeframeOptions = BILL_TIMEFRAME_OPTIONS,
}) => {
  const normalizedBills = useMemo(
    () => (Array.isArray(bills) ? bills : []),
    [bills]
  );

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
    reportType: "bills",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const uniqueCategories = useMemo(
    () => normalizeList(normalizedBills, (bill) => bill?.category?.trim()),
    [normalizedBills]
  );

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      uniqueCategories.length &&
      !uniqueCategories.includes(selectedCategory)
    ) {
      setSelectedCategory?.("all");
    }
  }, [selectedCategory, uniqueCategories, setSelectedCategory]);

  const availableMethods = useMemo(
    () => normalizeList(normalizedBills, (bill) => bill?.paymentMethod?.trim()),
    [normalizedBills]
  );

  const amountBounds = useMemo(
    () => deriveAmountBounds(normalizedBills),
    [normalizedBills]
  );

  const sections = useMemo(
    () =>
      buildReportFilterSections("bills", {
        availableMethods,
        amountBounds,
        availableCategories: uniqueCategories,
        timeframeOptions,
        flowTypeOptions: BILL_FLOW_TYPE_OPTIONS,
      }),
    [availableMethods, amountBounds, uniqueCategories, timeframeOptions]
  );

  const drawerValues = useMemo(
    () => ({
      ...filterValues,
      category: selectedCategory,
    }),
    [filterValues, selectedCategory]
  );

  const normalizedAmountRange = useMemo(() => {
    const range = filterValues.amountRange;
    if (!range) {
      return amountBounds;
    }
    const min = Number.isFinite(range.min)
      ? Number(range.min)
      : amountBounds.min;
    const max = Number.isFinite(range.max)
      ? Number(range.max)
      : amountBounds.max;
    return {
      min: Math.max(amountBounds.min, min),
      max: Math.max(min, max),
    };
  }, [filterValues.amountRange, amountBounds]);

  const selectedMethods = useMemo(() => {
    if (!Array.isArray(filterValues.paymentMethods)) {
      return new Set();
    }
    return new Set(filterValues.paymentMethods);
  }, [filterValues.paymentMethods]);

  const rangeStart =
    activeRange?.start instanceof Date ? activeRange.start : null;
  const rangeEnd = activeRange?.end instanceof Date ? activeRange.end : null;
  const rangeStartKey = rangeStart ? rangeStart.getTime() : null;
  const rangeEndKey = rangeEnd ? rangeEnd.getTime() : null;

  const filteredBills = useMemo(() => {
    if (!normalizedBills.length) {
      return [];
    }
    return normalizedBills.filter((bill) => {
      const categoryMatch =
        selectedCategory === "all" || bill.category === selectedCategory;

      if (!categoryMatch) {
        return false;
      }

      const typeValue = (bill.type || "loss").toLowerCase();
      const flowMatch =
        flowType === "all" || typeValue === flowType.toLowerCase();
      if (!flowMatch) {
        return false;
      }

      if (
        selectedMethods.size &&
        (!bill.paymentMethod || !selectedMethods.has(bill.paymentMethod))
      ) {
        return false;
      }

      const amountValue = Math.abs(Number(bill.amount) || 0);
      if (
        amountValue < normalizedAmountRange.min ||
        amountValue > normalizedAmountRange.max
      ) {
        return false;
      }

      if (rangeStart && rangeEnd) {
        if (!bill.date) {
          return false;
        }
        const billDate = new Date(bill.date);
        if (Number.isNaN(billDate.getTime())) {
          return false;
        }
        if (billDate < rangeStart || billDate > rangeEnd) {
          return false;
        }
      }

      return true;
    });
  }, [
    normalizedBills,
    selectedCategory,
    flowType,
    selectedMethods,
    normalizedAmountRange.min,
    normalizedAmountRange.max,
    rangeStartKey,
    rangeEndKey,
  ]);

  const handleApplyFilters = useCallback(
    (nextValues) => {
      const nextCategory = nextValues.category ?? defaults.category ?? "all";
      if (nextCategory !== selectedCategory) {
        setSelectedCategory?.(nextCategory);
      }
      applyCommonFilters(nextValues);
    },
    [
      applyCommonFilters,
      defaults.category,
      selectedCategory,
      setSelectedCategory,
    ]
  );

  const handleResetFilters = useCallback(() => {
    const payload = resetCommonFilters();
    const nextCategory = payload.category ?? defaults.category ?? "all";
    if (nextCategory !== selectedCategory) {
      setSelectedCategory?.(nextCategory);
    }
    return payload;
  }, [
    resetCommonFilters,
    defaults.category,
    selectedCategory,
    setSelectedCategory,
  ]);

  const filtersActive = useMemo(() => {
    if (baseFiltersActive) {
      return true;
    }
    if (selectedCategory !== (defaults.category ?? "all")) {
      return true;
    }
    if (selectedMethods.size) {
      return true;
    }
    const hasRangeOverride =
      normalizedAmountRange.min > amountBounds.min ||
      normalizedAmountRange.max < amountBounds.max;
    return hasRangeOverride;
  }, [
    baseFiltersActive,
    selectedCategory,
    defaults.category,
    selectedMethods,
    normalizedAmountRange.min,
    normalizedAmountRange.max,
    amountBounds.min,
    amountBounds.max,
  ]);

  return {
    filterDefaults: defaults,
    drawerValues,
    sections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredBills,
    uniqueCategories,
  };
};

export default useBillReportFilters;
