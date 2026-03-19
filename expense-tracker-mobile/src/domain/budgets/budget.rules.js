export function getBudgetStatus(budget) {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  if (percentage >= 100) return "exceeded";
  if (percentage >= budget.alertThreshold) return "warning";
  if (percentage >= 50) return "on-track";
  return "healthy";
}

export function shouldAlertBudget(budget) {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  return percentage >= (budget.alertThreshold || 80);
}

export function calculateDailyAllowance(budget) {
  const remaining = Math.max(budget.amount - budget.spent, 0);
  const endDate = budget.endDate ? new Date(budget.endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  const today = new Date();
  const daysLeft = Math.max(Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)), 1);
  return Math.round((remaining / daysLeft) * 100) / 100;
}
