import { rawCashflowBuckets } from "@/features/expenses/utils/expenseReportApiTransforms";
import { normalizeCategoryDistribution } from "@/shared/utils/chart/dataTransformers";

function formatSignedPct(diff) {
  if (!Number.isFinite(diff)) return "0.0%";
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}%`;
}

function trendFromHalves(series) {
  if (!series?.length || series.length < 2) {
    return { percentage: "+0.0%", trendDirection: "up" };
  }
  const mid = Math.floor(series.length / 2) || 1;
  const first = series.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
  const rest = series.slice(mid);
  const second = rest.length ? rest.reduce((s, v) => s + v, 0) / rest.length : first;
  const denom = Math.max(Math.abs(first), 1e-6);
  const raw = ((second - first) / denom) * 100;
  return {
    percentage: formatSignedPct(raw),
    trendDirection: raw >= 0 ? "up" : "down",
  };
}

function dailyAmountSeries(areaModel, flowType) {
  const data = areaModel?.data || [];
  if (!data.length) return [];
  if (flowType === "all") {
    return data.map((d) => Math.abs(Number(d.expense ?? 0)) + Math.abs(Number(d.income ?? 0)));
  }
  if (flowType === "inflow" || flowType === "outflow") {
    return data.map((d) => Math.abs(Number(d.expense ?? d.income ?? 0)));
  }
  return data.map((d) => Math.abs(Number(d.expense ?? 0)) + Math.abs(Number(d.income ?? 0)));
}

function dailyTransactionCounts(cashflowRaw) {
  const rawBuckets = rawCashflowBuckets(cashflowRaw);
  if (!rawBuckets.length) return [];
  return rawBuckets.map((b) => {
    if (Array.isArray(b.expenses) && b.expenses.length > 0) return b.expenses.length;
    if (b.amount != null || b.expense != null || b.income != null) return 1;
    return 0;
  });
}

function ensureSparklinePoints(points) {
  if (!points?.length) return [0, 0];
  if (points.length === 1) return [points[0], points[0]];
  return points;
}

function normalizeSparklineShape(points) {
  const p = ensureSparklinePoints(points);
  const max = Math.max(...p, 1e-6);
  return p.map((v) => Math.max(0, (v / max) * 10));
}

export function deriveExpenseReportCardMetrics({ categoryRaw, cashflowRaw, areaModel, flowType }) {
  const catRows = normalizeCategoryDistribution(categoryRaw);
  const totalSpending = catRows.reduce((s, r) => s + Math.abs(Number(r.value ?? 0)), 0);

  const sorted = [...catRows].sort(
    (a, b) => Math.abs(Number(b.value ?? 0)) - Math.abs(Number(a.value ?? 0)),
  );
  const top = sorted[0];
  const topName = top?.name && String(top.name).trim() ? String(top.name) : "—";
  const topVal = Math.abs(Number(top?.value ?? 0));
  const topSharePct = totalSpending > 0 ? (topVal / totalSpending) * 100 : 0;

  const dailyAmounts = dailyAmountSeries(areaModel, flowType);
  const counts = dailyTransactionCounts(cashflowRaw);
  const len = Math.max(dailyAmounts.length, counts.length);
  const alignedCounts = [];
  const alignedAmounts = [];
  for (let i = 0; i < len; i += 1) {
    alignedAmounts.push(dailyAmounts[i] ?? 0);
    alignedCounts.push(counts[i] ?? (dailyAmounts[i] > 0 ? 1 : 0));
  }

  const totalTransactions = alignedCounts.reduce((s, c) => s + c, 0);
  const avgTransaction = totalTransactions > 0 ? totalSpending / totalTransactions : 0;

  const dailyAvg = alignedAmounts.map((amt, i) => {
    const c = alignedCounts[i] || 1;
    return amt / c;
  });

  const spendingTrend = trendFromHalves(dailyAmounts);
  const avgTrend = trendFromHalves(dailyAvg);
  const txTrend = trendFromHalves(alignedCounts);

  return {
    totalSpending: {
      rawAmount: totalSpending,
      percentage: spendingTrend.percentage,
      trendDirection: spendingTrend.trendDirection,
      sparklineData: normalizeSparklineShape(dailyAmounts),
    },
    topExpense: {
      value: topName,
      percentage: `${topSharePct.toFixed(2)}%`,
      trendDirection: "up",
      sparklineData: normalizeSparklineShape(dailyAmounts),
    },
    avgTransaction: {
      rawAmount: avgTransaction,
      percentage: avgTrend.percentage,
      trendDirection: avgTrend.trendDirection,
      sparklineData: normalizeSparklineShape(dailyAvg),
    },
    totalTransactions: {
      value: String(totalTransactions),
      percentage: txTrend.percentage,
      trendDirection: txTrend.trendDirection,
      sparklineData: normalizeSparklineShape(alignedCounts.map(Number)),
    },
  };
}
