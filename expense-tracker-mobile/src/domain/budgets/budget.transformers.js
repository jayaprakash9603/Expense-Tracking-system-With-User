export function fromApiResponse(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.budgetName || "",
    description: raw.description || raw.budgetDescription || "",
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
    description: formData.description?.trim(),
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

function parseLocalDay(iso) {
  if (!iso) return null;
  const s = String(iso).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toBudgetCardModel(raw) {
  const b = fromApiResponse(raw);
  const amount = Number(b.amount) || 0;
  const spent = Number(b.spent) || 0;
  const remaining = amount - spent;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseLocalDay(b.startDate);
  const end = parseLocalDay(b.endDate);
  let status = "active";
  if (end && today > end) status = "expired";
  else if (start && today < start) status = "upcoming";
  return {
    id: b.id,
    title: b.name,
    description: b.description || "",
    category: b.category || "",
    amount,
    spent,
    remaining,
    percentage: amount ? Math.round((spent / amount) * 1000) / 10 : 0,
    progressWidth: Math.min(100, amount ? (spent / amount) * 100 : 0),
    isOverBudget: remaining < 0,
    status,
    startDate: b.startDate,
    endDate: b.endDate,
  };
}

export function toProgressRadialData(budgets) {
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0);
  const percentage = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
  return [
    {
      name: "budget",
      value: totalSpent,
      max: totalBudget,
      percentage,
      fill: "hsl(var(--chart-1))",
    },
  ];
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
