// Utility helpers for Payment Methods Report data transformations
// These functions are extracted from the original component to keep UI lean.

// Build transaction size histogram bins
// Note: Bin labels now use dynamic currency symbol passed as parameter.
// UI components should pass user's currency preference when calling this function.
export const buildTxSizeBins = (methods = [], currencySymbol = "₹") => {
  const bins = [
    { label: `${currencySymbol}0-100`, min: 0, max: 100 },
    { label: `${currencySymbol}100-500`, min: 100, max: 500 },
    { label: `${currencySymbol}500-1000`, min: 500, max: 1000 },
    { label: `${currencySymbol}1000-5000`, min: 1000, max: 5000 },
    { label: `${currencySymbol}5000+`, min: 5000, max: Infinity },
  ];
  const result = bins.map((b) => ({ range: b.label }));
  methods.forEach((m) => {
    const name = m.method;
    (m.expenses || []).forEach((e) => {
      const amt = Math.abs(
        Number(
          e?.expense?.netAmount ??
            e?.expense?.amount ??
            e?.details?.netAmount ??
            e?.details?.amount ??
            e?.netAmount ??
            e?.amount ??
            0
        )
      );
      const bin = bins.find((b) => amt >= b.min && amt < b.max);
      if (!bin) return;
      const r = result.find((x) => x.range === bin.label);
      r[name] = (r[name] || 0) + 1;
    });
  });
  return result;
};

const getExpenseTypeLower = (expense) =>
  String(
    expense?.expense?.type ?? expense?.details?.type ?? expense?.type ?? ""
  ).toLowerCase();

const getExpenseAmountAbs = (expense) => {
  const raw = Number(
    expense?.expense?.netAmount ??
      expense?.expense?.amount ??
      expense?.details?.netAmount ??
      expense?.details?.amount ??
      expense?.netAmount ??
      expense?.amount ??
      0
  );
  return Math.abs(Number.isFinite(raw) ? raw : 0);
};

const getExpenseCategoryLabel = (expense) =>
  expense?.details?.categoryName ||
  expense?.categoryName ||
  expense?.expense?.expenseName ||
  expense?.details?.expenseName ||
  "Uncategorized";

// Build category-wise breakdown aggregated by payment method
export const buildCategoryBreakdown = (methods = [], flow = "all") => {
  const map = new Map(); // key: categoryName -> { category, [method]: amount }
  methods.forEach((m) => {
    const method = m.method;
    (m.expenses || []).forEach((e) => {
      const t = getExpenseTypeLower(e);
      if (flow === "outflow" && t && t !== "loss") return;
      if (flow === "inflow" && t && t !== "profit") return;

      const cat = getExpenseCategoryLabel(e);
      const amt = getExpenseAmountAbs(e);
      if (!map.has(cat)) map.set(cat, { category: cat });
      const obj = map.get(cat);
      obj[method] = (obj[method] || 0) + amt;
    });
  });
  const arr = Array.from(map.values());
  arr.sort((a, b) => {
    const sum = (o) =>
      Object.entries(o).reduce(
        (s, [k, v]) => (k === "category" ? s : s + Number(v || 0)),
        0
      );
    return sum(b) - sum(a);
  });
  return arr;
};

// Extract unique categories directly from expenses for generic use (filters, chips, etc.)
export const extractCategoriesFromExpenses = (methods = [], flow = "all") => {
  const map = new Map(); // name -> { name, totalAmount, transactions }
  methods.forEach((m) => {
    (m.expenses || []).forEach((e) => {
      const t = getExpenseTypeLower(e);
      if (flow === "outflow" && t && t !== "loss") return;
      if (flow === "inflow" && t && t !== "profit") return;

      const name = getExpenseCategoryLabel(e);
      const amt = getExpenseAmountAbs(e);
      const rec = map.get(name) || { name, totalAmount: 0, transactions: 0 };
      rec.totalAmount += amt;
      rec.transactions += 1;
      map.set(name, rec);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

// Assemble full report data from raw API response
export const assemblePaymentReport = (
  raw,
  flowType = "all",
  colors = [],
  currencySymbol = "₹"
) => {
  const summary = raw?.summary ?? { totalAmount: 0, paymentMethodTotals: {} };
  const totalAmount = Number(summary.totalAmount || 0);

  const keys = Object.keys(raw || {}).filter((k) => k !== "summary");
  const methods = keys.map((key, idx) => {
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
      method: c.name || key,
      totalAmount: amount,
      percentage,
      transactions,
      avgPerTransaction,
      expenses: c.expenses || [],
      icon: c.icon || c.iconKey || null,
      color: c.color || colors[idx % colors.length] || "#8884d8",
      trend: 0,
    };
  });
  methods.sort((a, b) => b.totalAmount - a.totalAmount);

  const txSizeData = buildTxSizeBins(methods, currencySymbol);
  const categoryBreakdown = buildCategoryBreakdown(methods, flowType);
  const categories = extractCategoriesFromExpenses(methods, flowType);

  return { methodsData: methods, txSizeData, categoryBreakdown, categories };
};
