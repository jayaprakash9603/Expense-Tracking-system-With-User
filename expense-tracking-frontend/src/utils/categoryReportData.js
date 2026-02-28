// Utilities for assembling Category Report data
// Extracts transformation logic from CategoryReport component.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const assembleCategoryReport = (raw, flowType = "all") => {
  const summary = raw?.summary ?? { totalAmount: 0, categoryTotals: {} };
  const totalAmount = Number(summary.totalAmount || 0);
  const categoryKeys = Object.keys(raw || {}).filter((k) => k !== "summary");
  const categories = categoryKeys.map((key) => {
    const c = raw[key] || {};
    const amount = Number(c.totalAmount || 0);
    const transactions = Number(
      c.expenseCount || (c.expenses?.length ?? 0) || 0
    );
    const percentage =
      totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0;
    const avgPerTransaction =
      transactions > 0 ? Math.round(amount / transactions) : 0;
    return {
      name: c.name || key,
      amount,
      percentage,
      transactions,
      avgPerTransaction,
      expenses: c.expenses || [],
      icon: c.icon || c.iconKey || c.categoryIcon || null,
      color: c.color || c.categoryColor || null,
    };
  });
  categories.sort((a, b) => b.amount - a.amount);

  // Daily spending map
  const dailyMap = new Map();
  categories.forEach((cat) => {
    (cat.expenses || []).forEach((e) => {
      const day = e.date;
      const amt = Number(
        e?.expense?.netAmount ??
          e?.expense?.amount ??
          e?.details?.netAmount ??
          e?.details?.amount ??
          e?.netAmount ??
          e?.amount ??
          0
      );
      if (!day) return;
      if (!dailyMap.has(day)) dailyMap.set(day, { day });
      dailyMap.get(day)[cat.name] = (dailyMap.get(day)[cat.name] || 0) + amt;
    });
  });
  const dailySpending = Array.from(dailyMap.values()).sort((a, b) =>
    a.day > b.day ? 1 : -1
  );

  // Monthly trends
  const monthMap = new Map();
  categories.forEach((cat) => {
    (cat.expenses || []).forEach((e) => {
      const dStr = e.date;
      if (!dStr) return;
      const d = new Date(dStr + "T00:00:00Z");
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = `${MONTHS[d.getUTCMonth()]} ${String(
        d.getUTCFullYear()
      ).slice(2)}`;
      const amt = Number(
        e?.expense?.netAmount ??
          e?.expense?.amount ??
          e?.details?.netAmount ??
          e?.details?.amount ??
          e?.netAmount ??
          e?.amount ??
          0
      );
      if (!monthMap.has(ym)) monthMap.set(ym, { month: label });
      monthMap.get(ym)[cat.name] = (monthMap.get(ym)[cat.name] || 0) + amt;
    });
  });
  const monthlyTrends = Array.from(monthMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([, v]) => v);

  return { categories, dailySpending, monthlyTrends };
};
