import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toDailySpendingAreaData, toMonthlyTrendData } from "@/domain/expenses/expense.transformers";
import { assignChartColorVars } from "@/shared/utils/chart/chartColors";
import { normalizeCategoryDistribution, normalizePaymentMethodDistribution } from "@/shared/utils/chart/dataTransformers";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";

function normalizeExpense(e) {
  return {
    ...e,
    amount: Number(e.amount || e.expenseAmount || 0),
    date: e.date || e.expenseDate || e.createdAt || "",
    category: e.category || e.categoryName || "Uncategorized",
    type: (e.type || "NEED").toString().toUpperCase(),
    name: e.name || e.itemName || e.expenseName || "",
    paymentMethod: e.paymentMethod || "Other",
  };
}

function normalizeExpenseEntry(dto) {
  if (!dto) return null;
  const details = dto.expense || dto.details || {};
  return {
    id: dto.id ?? details.id ?? dto.expenseId ?? null,
    name: details.expenseName || dto.expenseName || dto.name || dto.categoryName || "Unknown",
    amount: Math.abs(Number(details.amount ?? details.netAmount ?? dto.amount ?? dto.total ?? 0)),
    category: dto.categoryName || dto.category?.name || "",
    paymentMethod: details.paymentMethod || "",
    date: dto.date || details.date || null,
    type: (details.type || dto.type || "").toString().toLowerCase(),
  };
}

function normalizeCashflowResponse(apiData) {
  if (!apiData) return [];
  const buckets = Array.isArray(apiData.chartData) ? apiData.chartData : Array.isArray(apiData) ? apiData : [];
  if (buckets.length === 0) return [];

  return buckets
    .map((bucket) => {
      const expenseEntries = Array.isArray(bucket.expenses)
        ? bucket.expenses.map(normalizeExpenseEntry).filter(Boolean)
        : [];
      const isoDate = bucket.isoDate || bucket.day || bucket.label || "";
      const amount = Math.abs(Number(bucket.amount ?? 0));
      if (amount === 0 && expenseEntries.length === 0) return null;
      return { date: isoDate, expense: amount, expenses: expenseEntries };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateToMonthlyBuckets(dailyData, labelWithYear = false) {
  const map = {};
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

  dailyData.forEach((point) => {
    const dateStr = point.date || "";
    if (!dateStr) return;
    const monthKey = dateStr.slice(0, 7);
    if (!map[monthKey]) {
      const d = new Date(dateStr + "T00:00:00");
      const monthLabel = !isNaN(d.getTime())
        ? labelWithYear
          ? `${monthFormatter.format(d)} ${d.getFullYear()}`
          : monthFormatter.format(d)
        : monthKey;
      map[monthKey] = {
        date: monthLabel,
        expense: 0,
        expenses: [],
        _sortKey: monthKey,
      };
    }
    map[monthKey].expense += point.expense || 0;
    if (Array.isArray(point.expenses)) {
      map[monthKey].expenses.push(...point.expenses);
    }
  });

  return Object.values(map).sort((a, b) => a._sortKey.localeCompare(b._sortKey));
}

function shouldUseMonthlyView(timeframe) {
  return timeframe === "this_year" || timeframe === "last_year" || timeframe === "all_time";
}

const LOSS_COLOR = "hsl(0, 84%, 60%)";
const GAIN_COLOR = "hsl(142, 71%, 45%)";

export function useDashboardCharts() {
  const rawExpenses = useSelector((state) => state.expenses?.list || []);
  const apiDailySpending = useSelector((state) => state.expenses?.dailySpending);
  const apiCategoryDistribution = useSelector((state) => state.expenses?.categoryDistribution);
  const apiPaymentMethodDistribution = useSelector((state) => state.expenses?.paymentMethodDistribution);
  const loading = useSelector((state) => state.expenses?.loading || false);
  const categoryLoading = useSelector((state) => state.expenses?.categoryDistributionLoading || false);
  const paymentMethodLoading = useSelector((state) => state.expenses?.paymentMethodDistributionLoading || false);

  const { spendingType, spendingTimeframe } = useDashboardContext();

  const expenses = useMemo(() => rawExpenses.map(normalizeExpense), [rawExpenses]);

  const spendingTrendData = useMemo(() => {
    let dailyData = normalizeCashflowResponse(apiDailySpending);
    if (dailyData.length === 0) {
      dailyData = toDailySpendingAreaData(expenses).filter((d) => d.expense > 0 || d.income > 0);
    }

    if (shouldUseMonthlyView(spendingTimeframe) && dailyData.length > 0) {
      const labelWithYear = spendingTimeframe === "all_time" || spendingTimeframe === "last_year";
      return aggregateToMonthlyBuckets(dailyData, labelWithYear);
    }

    return dailyData;
  }, [apiDailySpending, expenses, spendingTimeframe]);

  const spendingTrendConfig = useMemo(() => {
    const color = spendingType === "gain" ? GAIN_COLOR : LOSS_COLOR;
    return {
      expense: { label: spendingType === "gain" ? "Income" : "Expense", color },
    };
  }, [spendingType]);

  const categoryData = useMemo(() => {
    const items = normalizeCategoryDistribution(apiCategoryDistribution);
    return assignChartColorVars(items);
  }, [apiCategoryDistribution]);

  const categoryConfig = useMemo(() => {
    const items = normalizeCategoryDistribution(apiCategoryDistribution);
    return items.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [apiCategoryDistribution]);

  const paymentMethodData = useMemo(() => {
    const items = normalizePaymentMethodDistribution(apiPaymentMethodDistribution);
    return assignChartColorVars(items);
  }, [apiPaymentMethodDistribution]);

  const paymentMethodConfig = useMemo(() => {
    const items = normalizePaymentMethodDistribution(apiPaymentMethodDistribution);
    return items.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [apiPaymentMethodDistribution]);

  const monthlyData = useMemo(() => toMonthlyTrendData(expenses), [expenses]);
  const monthlyConfig = useMemo(() => ({
    total: { label: "Total", color: "hsl(var(--chart-1))" },
    average: { label: "Average", color: "hsl(var(--chart-2))" },
  }), []);

  return {
    loading,
    categoryLoading,
    paymentMethodLoading,
    spendingTrend: { data: spendingTrendData, config: spendingTrendConfig },
    categoryBreakdown: { data: categoryData, config: categoryConfig },
    paymentMethodBreakdown: { data: paymentMethodData, config: paymentMethodConfig },
    monthlyComparison: { data: monthlyData, config: monthlyConfig },
  };
}
