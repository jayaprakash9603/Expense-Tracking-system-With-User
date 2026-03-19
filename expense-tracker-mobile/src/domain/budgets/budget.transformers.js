export function fromApiResponse(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.budgetName || "",
    amount: Number(raw.amount || raw.budgetAmount || 0),
    spent: Number(raw.spent || raw.amountSpent || 0),
    category: raw.category || raw.categoryName || "",
    categoryId: raw.categoryId || null,
    period: raw.period || "MONTHLY",
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    createdAt: raw.createdAt || "",
  };
}

export function toApiPayload(formData) {
  return {
    name: formData.name?.trim(),
    amount: Number(formData.amount),
    category: formData.category,
    period: formData.period,
    startDate: formData.startDate,
    endDate: formData.endDate,
  };
}

export function toListItem(budget) {
  return {
    id: budget.id,
    title: budget.name,
    subtitle: budget.category,
    amount: budget.amount,
    spent: budget.spent,
    remaining: budget.amount - budget.spent,
    percentage: budget.amount ? Math.round((budget.spent / budget.amount) * 100) : 0,
  };
}

export function toProgressRadialData(budgets) {
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0);
  const percentage = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
  return [{ name: "budget", value: totalSpent, max: totalBudget, percentage, fill: "hsl(var(--chart-1))" }];
}

export function toDistributionPieData(budgets) {
  return budgets
    .filter((b) => Number(b.amount) > 0)
    .map((b) => ({ name: b.category || b.name, value: Number(b.amount || 0) }));
}

export function toLossGainBarData(budgets) {
  return budgets.map((b) => {
    const remaining = Number(b.amount || 0) - Number(b.spent || 0);
    return {
      label: b.category || b.name,
      savings: remaining > 0 ? remaining : 0,
      overBudget: remaining < 0 ? Math.abs(remaining) : 0,
    };
  });
}
