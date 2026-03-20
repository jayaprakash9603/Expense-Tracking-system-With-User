function sumAmounts(items, key = "amount") {
  return items.reduce((acc, x) => acc + Number(x[key] || 0), 0);
}

export function buildDemoAnalyticsOverview(store) {
  const expenses = store.expenses || [];
  const budgets = store.budgets || [];
  const bills = store.bills || [];
  const friends = store.friends || [];
  const totalExpenses = sumAmounts(expenses);
  const totalBudgetAmount = sumAmounts(budgets, "amount");
  const totalLosses = sumAmounts(budgets, "spent");
  const pendingBills = bills.filter((b) => b.status === "PENDING" || b.status === "OVERDUE");
  const upcomingBillsAmount = sumAmounts(pendingBills);
  const lastTen = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return {
    totalExpenses,
    totalCreditDue: 0,
    activeBudgets: budgets.length,
    totalBudgets: budgets.length,
    friendsCount: friends.length,
    totalGroups: 0,
    avgDailySpendLast30Days: totalExpenses > 0 ? Math.round((totalExpenses / 30) * 100) / 100 : 0,
    savingsRateLast30Days: 0,
    upcomingBillsAmount,
    topExpenses: lastTen.slice(0, 5),
    totalBudgetAmount,
    totalLosses,
    remainingBudget: Math.max(0, totalBudgetAmount - totalLosses),
    lastTenExpenses: lastTen,
  };
}
