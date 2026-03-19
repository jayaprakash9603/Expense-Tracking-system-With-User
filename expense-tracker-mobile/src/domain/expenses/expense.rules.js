import { sumAmounts } from "../shared/money";
import { isCurrentMonth, isCurrentWeek } from "../shared/dateRules";

export function isOverBudget(expenses, budgetLimit) {
  const total = sumAmounts(expenses);
  return total > budgetLimit;
}

export function getBudgetUtilization(expenses, budgetLimit) {
  if (!budgetLimit) return { percentage: 0, remaining: 0, spent: 0 };
  const spent = sumAmounts(expenses);
  return {
    percentage: Math.min(Math.round((spent / budgetLimit) * 100), 100),
    remaining: Math.max(budgetLimit - spent, 0),
    spent,
  };
}

export function getDuplicateWarning(newExpense, existingExpenses) {
  const sameName = existingExpenses.filter(
    (e) =>
      e.name?.toLowerCase() === newExpense.name?.toLowerCase() &&
      e.date === newExpense.date &&
      Number(e.amount) === Number(newExpense.amount)
  );
  return sameName.length > 0
    ? { isDuplicate: true, matches: sameName }
    : { isDuplicate: false, matches: [] };
}

export function getMonthlyTotal(expenses) {
  return sumAmounts(expenses.filter((e) => isCurrentMonth(e.date)));
}

export function getWeeklyTotal(expenses) {
  return sumAmounts(expenses.filter((e) => isCurrentWeek(e.date)));
}

export function getTopCategories(expenses, limit = 5) {
  const map = {};
  expenses.forEach((e) => {
    const cat = e.category || "Uncategorized";
    map[cat] = (map[cat] || 0) + Number(e.amount || 0);
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category, total]) => ({ category, total }));
}
