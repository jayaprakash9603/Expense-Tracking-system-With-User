import { assignChartColorVars, getChartColorVar } from "@/shared/utils/chart/chartColors";

function withPieValue(items) {
  return items.map((item) => ({ ...item, value: item.amount ?? item.value ?? 0 }));
}

export function normalizeFlowTypeForBudgetApi(flowType) {
  const key = String(flowType || "").toLowerCase();
  if (!key || key === "all") return "all";
  if (key === "outflow" || key === "loss") return "loss";
  if (key === "inflow" || key === "gain") return "gain";
  return "all";
}

export function transformDetailedBudgetResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      summary: {},
      categoryBreakdown: [],
      paymentMethodBreakdown: [],
      expenseGroups: [],
      rawData: data,
    };
  }

  const transformedData = {
    summary: data.summary || {},
    categoryBreakdown: [],
    paymentMethodBreakdown: [],
    expenseGroups: [],
    rawData: data,
  };

  if (data.summary?.categoryTotals && Array.isArray(data.summary.categoryTotals)) {
    const categoryTotal = data.summary.categoryTotals.reduce(
      (sum, item) => sum + (item.totalAmount ?? 0),
      0,
    );
    transformedData.categoryBreakdown = data.summary.categoryTotals.map((item) => {
      const amount = item.totalAmount ?? item.total ?? item.value ?? 0;
      const percentage =
        categoryTotal > 0 ? Math.round((amount / categoryTotal) * 100 * 10) / 10 : 0;
      return {
        name: item.category || item.name || item.label || item.expenseName,
        amount,
        count: item.count ?? item.transactions ?? 0,
        percentage,
      };
    });
  } else if (data.summary?.expenseNameTotals) {
    const expenseTotal = data.summary.expenseNameTotals.reduce(
      (sum, item) => sum + (item.totalAmount ?? 0),
      0,
    );
    transformedData.categoryBreakdown = data.summary.expenseNameTotals.map((item) => {
      const amount = item.totalAmount ?? 0;
      const percentage =
        expenseTotal > 0 ? Math.round((amount / expenseTotal) * 100 * 10) / 10 : 0;
      return {
        name: item.expenseName,
        amount,
        count: item.count,
        percentage,
      };
    });
  }

  if (data.summary?.paymentMethodTotals) {
    const totals = data.summary.paymentMethodTotals;
    const isArrayShape = Array.isArray(totals);

    const normalizeEntry = (entry) => {
      if (!entry && entry !== 0) return 0;
      if (typeof entry === "number") return entry;
      if (typeof entry === "string") return Number(entry) || 0;
      if (typeof entry === "object") {
        return (
          Number(entry.totalAmount ?? entry.total ?? entry.value ?? entry.amount ?? 0) || 0
        );
      }
      return 0;
    };

    const paymentTotal = isArrayShape
      ? totals.reduce((sum, item) => sum + normalizeEntry(item), 0)
      : Object.values(totals).reduce((sum, value) => sum + normalizeEntry(value), 0);

    const breakdownEntries = isArrayShape
      ? totals.map((item) => ({
          method: item.paymentMethod ?? item.method ?? item.label ?? "Unknown",
          amount: normalizeEntry(item),
          count: item.count ?? item.transactions ?? 0,
          icon: item.icon,
        }))
      : Object.entries(totals).map(([method, value]) => ({
          method,
          amount: normalizeEntry(value),
          count:
            typeof value === "object"
              ? value.count ?? value.transactions ?? value.expenseCount ?? 0
              : 0,
          icon: value?.icon,
        }));

    transformedData.paymentMethodBreakdown = breakdownEntries.map(({ method, amount, count, icon }) => {
      const value = Number(amount) || 0;
      const percentage = paymentTotal > 0 ? Math.round((value / paymentTotal) * 100 * 10) / 10 : 0;
      return {
        name: method,
        method,
        amount: value,
        totalAmount: value,
        count,
        percentage,
        icon,
      };
    });
  }

  const expenseGroups = [];
  Object.keys(data).forEach((key) => {
    if (key !== "summary") {
      const group = data[key];
      expenseGroups.push({
        groupName: key,
        method: key,
        expenseCount: group.expenseCount,
        totalAmount: group.totalAmount,
        transactions: group.expenseCount,
        expenses: group.expenses || [],
      });
    }
  });
  transformedData.expenseGroups = expenseGroups;

  return transformedData;
}

export function transformFilteredBudgetsReport(filteredBudgetsReport) {
  if (!filteredBudgetsReport?.budgets) {
    return {
      budgetsData: [],
      categoryBreakdown: [],
      paymentMethodBreakdown: [],
      topRecurringExpenses: [],
      summary: {},
    };
  }

  const { budgets, summary, topRecurringExpenses } = filteredBudgetsReport;

  const seen = new Map();
  const uniqueBudgets = [];
  for (const b of budgets) {
    const key = b.budgetId ?? b.budgetName;
    if (!seen.has(key)) {
      seen.set(key, true);
      uniqueBudgets.push(b);
    }
  }

  const budgetsData = uniqueBudgets.map((budget, index) => ({
    budgetId: budget.budgetId,
    budgetName: budget.budgetName,
    name: budget.budgetName,
    method: budget.budgetName,
    allocatedAmount: budget.allocatedAmount || 0,
    totalLoss: budget.totalLoss || 0,
    totalSpent: budget.totalLoss || 0,
    totalGain: budget.totalGain || 0,
    remainingAmount: budget.remainingAmount || 0,
    amount: budget.totalLoss || 0,
    percentage: budget.percentageUsed || 0,
    percentageUsed: budget.percentageUsed || 0,
    transactions: budget.transactions || 0,
    totalTransactions: budget.transactions || 0,
    cashLoss: budget.cashLoss || 0,
    creditNeedToPaidLoss: budget.creditNeedToPaidLoss || 0,
    creditPaidLoss: budget.creditPaidLoss || 0,
    color: getChartColorVar(index),
    startDate: budget.startDate,
    endDate: budget.endDate,
    valid: budget.valid,
    isExpired: budget.valid === false,
    expenses: budget.expenses || [],
    paymentMethodBreakdown: budget.paymentMethodBreakdown || {},
    categoryBreakdown: budget.categoryBreakdown || {},
  }));

  const categoryBreakdown = summary.overallCategoryBreakdown
    ? assignChartColorVars(
        withPieValue(
          Object.entries(summary.overallCategoryBreakdown)
            .map(([catName, catData]) => ({
              name: catName,
              category: catName,
              amount: catData.amount || 0,
              transactions: catData.transactions || 0,
              percentage: catData.percentage || 0,
            }))
            .sort((a, b) => b.amount - a.amount),
        ),
      )
    : [];

  const paymentMethodBreakdown = summary.overallPaymentMethodBreakdown
    ? assignChartColorVars(
        withPieValue(
          Object.entries(summary.overallPaymentMethodBreakdown)
            .map(([method, methodData]) => ({
              method,
              name: method,
              amount: methodData.amount || 0,
              totalAmount: methodData.amount || 0,
              transactions: methodData.transactions || 0,
              percentage: methodData.percentage || 0,
            }))
            .sort((a, b) => b.amount - a.amount),
        ),
      )
    : [];

  return {
    budgetsData,
    categoryBreakdown,
    paymentMethodBreakdown,
    topRecurringExpenses: Array.isArray(topRecurringExpenses) ? topRecurringExpenses : [],
    summary: summary || {},
  };
}
