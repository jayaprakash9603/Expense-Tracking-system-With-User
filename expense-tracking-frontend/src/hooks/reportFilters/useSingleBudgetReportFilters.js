import { useMemo } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import useReportFilterState from "./useReportFilterState";

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const dedupeStrings = (values = []) => {
  const unique = new Set();
  values.forEach((val) => {
    if (val === null || val === undefined) {
      return;
    }
    const normalized = String(val).trim();
    if (normalized.length) {
      unique.add(normalized);
    }
  });
  return Array.from(unique.values());
};

const getExpenseAmount = (expense) =>
  Number(
    expense?.details?.amount ??
      expense?.details?.netAmount ??
      expense?.amount ??
      expense?.totalAmount ??
      0
  );

const getExpenseCategory = (expense) =>
  expense?.details?.category ||
  expense?.details?.categoryName ||
  expense?.details?.expenseCategory ||
  expense?.category ||
  expense?.categoryName;

const matchesCategory = (expense, selectedCategories) => {
  if (!selectedCategories.size) {
    return true;
  }
  const category = getExpenseCategory(expense);
  if (!category) {
    return true; // keep items without explicit category metadata
  }
  return selectedCategories.has(category);
};

const normalizeExpenseGroups = (groups) =>
  ensureArray(groups).map((group) => ({
    ...group,
    method: group.method || group.groupName || group.name,
    totalAmount: Number(group.totalAmount ?? group.amount ?? 0),
    transactions: Number(
      group.transactions ?? group.expenseCount ?? group.count ?? 0
    ),
    expenses: ensureArray(group.expenses),
  }));

const useSingleBudgetReportFilters = ({
  timeframe,
  flowType,
  setTimeframe,
  setFlowType,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  categoryBreakdown,
  paymentMethodBreakdown,
  expenseGroups,
  timeframeOptions,
  budgetPeriodRange,
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
    reportType: "singleBudget",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const normalizedExpenseGroups = useMemo(
    () => normalizeExpenseGroups(expenseGroups),
    [expenseGroups]
  );

  const paymentAmountBounds = useMemo(() => {
    const source = ensureArray(paymentMethodBreakdown);
    const totals = source.length
      ? source.map((entry) =>
          Math.abs(Number(entry.totalAmount ?? entry.amount ?? 0))
        )
      : normalizedExpenseGroups.map((group) =>
          Math.abs(Number(group.totalAmount || 0))
        );
    if (!totals.length) {
      return { min: 0, max: 1000 };
    }
    const max = Math.max(...totals, 0);
    return { min: 0, max: Math.max(max, 1000) };
  }, [paymentMethodBreakdown, normalizedExpenseGroups]);

  const sections = useMemo(
    () =>
      buildReportFilterSections("singleBudget", {
        availableMethods: dedupeStrings(
          normalizedExpenseGroups.map((group) => group.method)
        ),
        availableCategories: dedupeStrings(
          ensureArray(categoryBreakdown).map(
            (entry) => entry.category || entry.name
          )
        ),
        amountBounds: paymentAmountBounds,
        timeframeOptions,
        dateRangeMin:
          timeframe === "budget" ? budgetPeriodRange?.fromDate : undefined,
        dateRangeMax:
          timeframe === "budget" ? budgetPeriodRange?.toDate : undefined,
        dateRangeHelperText:
          timeframe === "budget" && budgetPeriodRange
            ? "Custom range is limited to the selected budget period."
            : undefined,
      }),
    [
      normalizedExpenseGroups,
      categoryBreakdown,
      paymentAmountBounds,
      timeframeOptions,
      timeframe,
      budgetPeriodRange,
    ]
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

  const filteredCategoryBreakdown = useMemo(() => {
    const source = ensureArray(categoryBreakdown);
    if (!filterValues.categories?.length) {
      return source;
    }
    const selected = new Set(filterValues.categories);
    return source.filter((entry) => selected.has(entry.category || entry.name));
  }, [categoryBreakdown, filterValues.categories]);

  const filteredPaymentBreakdown = useMemo(() => {
    const source = ensureArray(paymentMethodBreakdown);
    if (!source.length) {
      return [];
    }
    const selected = new Set(filterValues.paymentMethods || []);
    const restrictByMethod = selected.size > 0;
    return source.filter((entry) => {
      const methodName = entry.method || entry.name;
      if (restrictByMethod && !selected.has(methodName)) {
        return false;
      }
      const total = Number(entry.totalAmount ?? entry.amount ?? 0);
      return total >= normalizedRange.min && total <= normalizedRange.max;
    });
  }, [
    paymentMethodBreakdown,
    filterValues.paymentMethods,
    normalizedRange.min,
    normalizedRange.max,
  ]);

  const filteredExpenseGroups = useMemo(() => {
    if (!normalizedExpenseGroups.length) {
      return [];
    }
    const selectedMethods = new Set(filterValues.paymentMethods || []);
    const selectedCategories = new Set(filterValues.categories || []);
    const restrictByMethod = selectedMethods.size > 0;
    const restrictByCategory = selectedCategories.size > 0;

    return normalizedExpenseGroups
      .map((group) => {
        if (restrictByMethod && !selectedMethods.has(group.method)) {
          return null;
        }
        let expenses = group.expenses;
        if (restrictByCategory) {
          expenses = group.expenses.filter((expense) =>
            matchesCategory(expense, selectedCategories)
          );
        }
        const recalculatedTotal = restrictByCategory
          ? expenses.reduce(
              (sum, expense) => sum + getExpenseAmount(expense),
              0
            )
          : group.totalAmount;
        const recalculatedTransactions = restrictByCategory
          ? expenses.length
          : group.transactions;
        const total = Number(recalculatedTotal || 0);
        if (total < normalizedRange.min || total > normalizedRange.max) {
          return null;
        }
        return {
          ...group,
          expenses,
          totalAmount: total,
          transactions: recalculatedTransactions,
        };
      })
      .filter(Boolean);
  }, [
    normalizedExpenseGroups,
    filterValues.paymentMethods,
    filterValues.categories,
    normalizedRange.min,
    normalizedRange.max,
  ]);

  const amountRangeActive = useMemo(() => {
    const range = filterValues.amountRange;
    if (!range) {
      return false;
    }
    const hasMin = Number.isFinite(range.min);
    const hasMax = Number.isFinite(range.max);
    if (hasMin && range.min > paymentAmountBounds.min) {
      return true;
    }
    if (hasMax && range.max < paymentAmountBounds.max) {
      return true;
    }
    return false;
  }, [filterValues.amountRange, paymentAmountBounds]);

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
    if (amountRangeActive) {
      return true;
    }
    return false;
  }, [
    baseFiltersActive,
    filterValues.paymentMethods,
    filterValues.categories,
    amountRangeActive,
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
    filteredCategoryBreakdown,
    filteredPaymentBreakdown,
    filteredExpenseGroups,
  };
};

export default useSingleBudgetReportFilters;
