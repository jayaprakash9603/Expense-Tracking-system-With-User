/**
 * Shared daily spending aggregation helpers.
 *
 * Produces data compatible with `pages/Dashboard/DailySpendingChart.jsx`.
 *
 * Input expectation:
 * - `buckets`: array of "bucket" objects where each bucket has:
 *    - `name` (label shown in breakdown)
 *    - `expenses`: array of { date, details: { type, amount/netAmount }, ... }
 *
 * Output:
 * - Array of { isoDate, type: 'loss'|'gain', spending, budgetTotals: [{ name, total }] }
 *   (We reuse `budgetTotals` field name because the chart tooltip already supports it.)
 */

const toIsoDay = (value) => {
  if (!value) return null;
  const str = String(value);
  return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
};

const toLower = (value) => String(value ?? "").toLowerCase();

const getExpenseType = (expense) =>
  toLower(expense?.details?.type ?? expense?.type ?? "");

const getExpenseAmountAbs = (expense) => {
  const raw = Number(
    expense?.details?.amount ??
      expense?.amount ??
      expense?.details?.netAmount ??
      0
  );
  return Math.abs(Number.isFinite(raw) ? raw : 0);
};

export const normalizeFlowTypeForChart = (flowType) => {
  const normalized = toLower(flowType);
  if (normalized === "inflow") return "gain";
  if (normalized === "outflow") return "loss";
  return flowType;
};

export const buildDailySpendingByBucket = (buckets) => {
  const safeBuckets = Array.isArray(buckets) ? buckets : [];
  const dayTypeMap = new Map();

  const bucketCatalog = safeBuckets.map((bucket) => {
    const bucketName = String(
      bucket?.name ?? bucket?.method ?? bucket?.category ?? bucket?.id ?? ""
    ).trim();
    const bucketKey = bucketName || "Unknown";
    return { bucketKey, bucketName: bucketKey };
  });

  for (const bucket of safeBuckets) {
    const bucketName = String(
      bucket?.name ?? bucket?.method ?? bucket?.category ?? bucket?.id ?? ""
    ).trim();
    const bucketKey = bucketName || "Unknown";

    const expenses = Array.isArray(bucket?.expenses) ? bucket.expenses : [];
    for (const expense of expenses) {
      const day = toIsoDay(expense?.date ?? expense?.isoDate ?? expense?.day);
      if (!day) continue;

      const type = getExpenseType(expense);
      if (type !== "loss" && type !== "gain") continue;

      const amount = getExpenseAmountAbs(expense);
      if (!amount) continue;

      const key = `${day}|${type}`;
      if (!dayTypeMap.has(key)) {
        dayTypeMap.set(key, {
          isoDate: day,
          type,
          spending: 0,
          buckets: new Map(),
          expenses: [],
        });
      }

      const entry = dayTypeMap.get(key);
      entry.spending += amount;

      // Preserve the full expense object for drilldown and tooltip usage.
      // Attach the bucket label without mutating the original object.
      if (expense && typeof expense === "object") {
        entry.expenses.push({ ...expense, bucket: bucketKey });
      } else {
        entry.expenses.push(expense);
      }

      const prev = entry.buckets.get(bucketKey);
      if (prev) {
        prev.total += amount;
      } else {
        entry.buckets.set(bucketKey, { name: bucketKey, total: amount });
      }
    }
  }

  return Array.from(dayTypeMap.values())
    .map((entry) => {
      const bucketTotals = bucketCatalog
        .map((b) => {
          const found = entry.buckets.get(b.bucketKey);
          const total = found?.total ?? 0;
          return {
            name: b.bucketName,
            total: Math.round(total * 100.0) / 100.0,
          };
        })
        .sort((a, b) => b.total - a.total);

      return {
        isoDate: entry.isoDate,
        type: entry.type,
        spending: Math.round(entry.spending * 100.0) / 100.0,
        budgetTotals: bucketTotals,
        expenses: entry.expenses,
      };
    })
    .sort((a, b) => String(a.isoDate).localeCompare(String(b.isoDate)));
};
