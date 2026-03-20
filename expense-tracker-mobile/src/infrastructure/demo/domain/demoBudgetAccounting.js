function isGainExpense(expense) {
  const t = String(expense?.type ?? "").toLowerCase();
  return ["gain", "income", "inflow"].includes(t);
}

function budgetCategoryIds(budget) {
  const raw = budget?.categories;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return new Set(raw.map((c) => String(c?.id ?? c ?? "").trim()).filter(Boolean));
}

function expenseAmountTowardBudget(expense, budget) {
  if (isGainExpense(expense)) return 0;
  const ids = Array.isArray(expense.budgetIds) ? expense.budgetIds.map(String) : [];
  if (!ids.includes(String(budget.id))) return 0;
  const allowed = budgetCategoryIds(budget);
  if (!allowed) return Math.abs(Number(expense.amount || 0));
  return allowed.has(String(expense.categoryId)) ? Math.abs(Number(expense.amount || 0)) : 0;
}

export function sumSpentForBudget(expenses, budget) {
  let sum = 0;
  for (const e of expenses || []) {
    sum += expenseAmountTowardBudget(e, budget);
  }
  return sum;
}

export function recalculateBudgetSpent(store) {
  if (!store?.budgets || !store?.expenses) return;
  for (const b of store.budgets) {
    b.spent = sumSpentForBudget(store.expenses, b);
  }
}
