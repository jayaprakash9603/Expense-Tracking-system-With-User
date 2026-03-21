import { normalizeApiList } from "@/shared/utils/api/normalizeApiList";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";

export function normalizeDashboardExpense(e) {
  const amt = Math.abs(
    Number(
      e?.amount ??
        e?.expenseAmount ??
        e?.expense?.amount ??
        e?.expense?.expenseAmount ??
        0,
    ),
  );
  const dateRaw = e?.date || e?.expenseDate || e?.expense?.date || e?.createdAt || "";
  return {
    ...e,
    amount: amt,
    date: String(dateRaw).split("T")[0],
    category: e?.category || e?.categoryName || e?.expense?.categoryName || "Uncategorized",
    type: (e?.type || e?.expense?.type || "NEED").toString().toUpperCase(),
    name: e?.name || e?.itemName || e?.expenseName || e?.expense?.expenseName || "",
    paymentMethod: e?.paymentMethod || e?.expense?.paymentMethod || "Other",
  };
}

export function normalizeCashflowExpenseEntry(dto) {
  if (!dto) return null;
  const details = extractExpenseDetails(dto);
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

export function normalizeCashflowResponse(apiData) {
  if (!apiData) return [];
  const buckets = normalizeApiList(apiData, "chartData");
  if (buckets.length === 0) return [];

  return buckets
    .map((bucket) => {
      const expenseEntries = Array.isArray(bucket.expenses)
        ? bucket.expenses.map(normalizeCashflowExpenseEntry).filter(Boolean)
        : [];
      const isoDate =
        bucket.isoDate ||
        bucket.day ||
        bucket.label ||
        (expenseEntries[0]?.date ? String(expenseEntries[0].date).split("T")[0] : "") ||
        "";
      if (!isoDate) return null;
      const day = isoDate.split("T")[0];
      const bucketAmt = Math.abs(
        Number(bucket.amount ?? bucket.total ?? bucket.totalLoss ?? bucket.loss ?? 0),
      );
      const entriesAmt = expenseEntries.reduce((sum, ent) => sum + ent.amount, 0);
      const expense = bucketAmt > 0 ? bucketAmt : entriesAmt;
      if (expense === 0 && expenseEntries.length === 0) return null;
      return { date: day, expense, expenses: expenseEntries };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateDailyToMonthlyBuckets(dailyData, labelWithYear = false) {
  const map = {};
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

  dailyData.forEach((point) => {
    const dateStr = point.date || "";
    if (!dateStr) return;
    const monthKey = dateStr.slice(0, 7);
    if (!map[monthKey]) {
      const d = new Date(`${dateStr}T00:00:00`);
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

export function shouldDashboardUseMonthlyView(timeframe) {
  return timeframe === "this_year" || timeframe === "last_year" || timeframe === "all_time";
}

export function buildMonthlyComparisonRows(dailyData) {
  if (!dailyData?.length) return [];
  const buckets = aggregateDailyToMonthlyBuckets(dailyData, true);
  const rows = buckets.map((b) => ({
    label: b._sortKey,
    total: Math.round(Number(b.expense) || 0),
  }));
  const avg = rows.length ? rows.reduce((s, r) => s + r.total, 0) / rows.length : 0;
  const roundedAvg = Math.round(avg);
  return rows.map((r) => ({ ...r, average: roundedAvg }));
}
