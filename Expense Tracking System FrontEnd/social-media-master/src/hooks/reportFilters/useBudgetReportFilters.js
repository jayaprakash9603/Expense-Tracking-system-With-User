import { useMemo } from "react";
import { buildReportFilterSections } from "../../constants/reportFilters";
import { getChartColors } from "../../utils/chartColors";
import useReportFilterState from "./useReportFilterState";

const COLORS = getChartColors();

const useBudgetReportFilters = ({
  timeframe,
  flowType,
  setTimeframe,
  setFlowType,
  dateRange,
  setCustomDateRange,
  resetDateRange,
  isCustomRange,
  budgetsData,
  categoryBreakdown,
  paymentMethodBreakdown,
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
    reportType: "budgets",
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe,
    setFlowType,
    setCustomDateRange,
    resetDateRange,
  });

  const budgetsCollection = useMemo(
    () => (Array.isArray(budgetsData) ? budgetsData : []),
    [budgetsData]
  );
  const baselineCategoryBreakdown = useMemo(
    () => (Array.isArray(categoryBreakdown) ? categoryBreakdown : []),
    [categoryBreakdown]
  );
  const baselinePaymentBreakdown = useMemo(
    () => (Array.isArray(paymentMethodBreakdown) ? paymentMethodBreakdown : []),
    [paymentMethodBreakdown]
  );

  const utilizationBounds = useMemo(() => {
    if (!budgetsCollection.length) {
      return { min: 0, max: 100 };
    }
    const percentages = budgetsCollection.map((budget) =>
      Number(budget.percentageUsed || 0)
    );
    const max = Math.max(...percentages, 100);
    return { min: 0, max: Math.min(Math.max(max, 100), 200) };
  }, [budgetsCollection]);

  const sections = useMemo(
    () =>
      buildReportFilterSections("budgets", {
        utilizationBounds,
        statusOptions: [
          { value: "active", label: "Active" },
          { value: "expired", label: "Expired" },
        ],
      }),
    [utilizationBounds]
  );

  const filteredBudgets = useMemo(() => {
    let list = [...budgetsCollection];
    if (filterValues.statuses?.length) {
      const selected = new Set(filterValues.statuses);
      list = list.filter((budget) =>
        selected.has(budget.isExpired ? "expired" : "active")
      );
    }
    const range = filterValues.utilizationRange || { min: 0, max: 100 };
    list = list.filter((budget) => {
      const percentage = Number(budget.percentageUsed || 0);
      return percentage >= (range.min ?? 0) && percentage <= (range.max ?? 100);
    });
    return list;
  }, [budgetsCollection, filterValues.statuses, filterValues.utilizationRange]);

  const filtersActive = useMemo(() => {
    if (baseFiltersActive) {
      return true;
    }
    const defaultStatuses = defaults.statuses || [];
    const currentStatuses = filterValues.statuses || [];
    const statusesDiffer =
      currentStatuses.length !== defaultStatuses.length ||
      currentStatuses.some((status) => !defaultStatuses.includes(status));
    if (statusesDiffer && currentStatuses.length) {
      return true;
    }
    const defaultRange = defaults.utilizationRange || { min: 0, max: 100 };
    const range = filterValues.utilizationRange || defaultRange;
    const normalizedMin = Number(range.min ?? defaultRange.min);
    const normalizedMax = Number(range.max ?? defaultRange.max);
    if (
      normalizedMin !== Number(defaultRange.min) ||
      normalizedMax !== Number(defaultRange.max)
    ) {
      return true;
    }
    return false;
  }, [
    baseFiltersActive,
    filterValues.statuses,
    filterValues.utilizationRange,
    defaults.statuses,
    defaults.utilizationRange,
  ]);

  const filteredBudgetSummary = useMemo(() => {
    if (!filteredBudgets.length) {
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        totalSpent: 0,
        totalRemaining: 0,
      };
    }
    const totalBudgets = filteredBudgets.length;
    const activeBudgets = filteredBudgets.filter((b) => !b.isExpired).length;
    const totalSpent = filteredBudgets.reduce(
      (sum, budget) => sum + Number(budget.totalSpent ?? budget.totalLoss ?? 0),
      0
    );
    const totalRemaining = filteredBudgets.reduce((sum, budget) => {
      const allocated = Number(budget.allocatedAmount || 0);
      const spent = Number(budget.totalSpent ?? budget.totalLoss ?? 0);
      return sum + Math.max(allocated - spent, 0);
    }, 0);
    return { totalBudgets, activeBudgets, totalSpent, totalRemaining };
  }, [filteredBudgets]);

  const effectiveCategoryBreakdown = useMemo(() => {
    if (!filtersActive) {
      return baselineCategoryBreakdown;
    }
    const aggregate = new Map();
    filteredBudgets.forEach((budget) => {
      Object.entries(budget.categoryBreakdown || {}).forEach(
        ([name, payload]) => {
          const amount = Number(payload.amount ?? payload.totalAmount ?? 0);
          const transactions = Number(
            payload.transactions ?? payload.count ?? 0
          );
          const current = aggregate.get(name) || { amount: 0, transactions: 0 };
          aggregate.set(name, {
            amount: current.amount + amount,
            transactions: current.transactions + transactions,
          });
        }
      );
    });
    const entries = Array.from(aggregate.entries()).map(
      ([name, payload], index) => ({
        name,
        amount: payload.amount,
        transactions: payload.transactions,
        percentage: 0,
        color: COLORS[index % COLORS.length],
      })
    );
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return entries.map((entry) => ({
      ...entry,
      percentage: total > 0 ? (entry.amount / total) * 100 : 0,
    }));
  }, [filteredBudgets, filtersActive, baselineCategoryBreakdown]);

  const effectivePaymentBreakdown = useMemo(() => {
    if (!filtersActive) {
      return baselinePaymentBreakdown;
    }
    const aggregate = new Map();
    filteredBudgets.forEach((budget) => {
      Object.entries(budget.paymentMethodBreakdown || {}).forEach(
        ([method, payload]) => {
          const amount = Number(
            payload.amount ?? payload.totalAmount ?? payload
          );
          const transactions = Number(
            payload.transactions ?? payload.count ?? 0
          );
          const current = aggregate.get(method) || {
            amount: 0,
            transactions: 0,
          };
          aggregate.set(method, {
            amount: current.amount + amount,
            transactions: current.transactions + transactions,
          });
        }
      );
    });
    const entries = Array.from(aggregate.entries()).map(
      ([method, payload], index) => ({
        method,
        amount: payload.amount,
        totalAmount: payload.amount,
        transactions: payload.transactions,
        percentage: 0,
        color: COLORS[index % COLORS.length],
      })
    );
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return entries.map((entry) => ({
      ...entry,
      percentage: total > 0 ? (entry.amount / total) * 100 : 0,
    }));
  }, [filteredBudgets, filtersActive, baselinePaymentBreakdown]);

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
    filteredBudgets,
    filteredBudgetSummary,
    effectiveCategoryBreakdown,
    effectivePaymentBreakdown,
  };
};

export default useBudgetReportFilters;
