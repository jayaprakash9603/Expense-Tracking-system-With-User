import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { fetchDailySpendingAction } from "@/redux/expenses/expenses.actions";
import { weekDays, yearMonths } from "@/shared/utils/chart/timeframeResolver";

function getStartOfIsoWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function normalizeChartData(apiData, activeRange, offset) {
  if (!apiData) return [];
  const rawBuckets = Array.isArray(apiData.chartData)
    ? apiData.chartData
    : Array.isArray(apiData)
      ? apiData
      : [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let baseStart;
  let bucketCount;
  let labels;

  if (activeRange === "week") {
    baseStart = getStartOfIsoWeek(now);
    baseStart.setDate(baseStart.getDate() + offset * 7);
    bucketCount = 7;
    labels = weekDays;
  } else if (activeRange === "month") {
    baseStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    bucketCount = new Date(baseStart.getFullYear(), baseStart.getMonth() + 1, 0).getDate();
    labels = Array.from({ length: bucketCount }, (_, i) => `${i + 1}`);
  } else {
    baseStart = new Date(now.getFullYear() + offset, 0, 1);
    bucketCount = 12;
    labels = yearMonths;
  }

  const data = Array.from({ length: bucketCount }, (_, i) => ({
    label: labels[i],
    income: 0,
    expense: 0,
    expenses: [],
  }));

  rawBuckets.forEach((b) => {
    const d = new Date(b.isoDate || b.day || b.label || "");
    if (isNaN(d.getTime())) return;

    let idx = -1;

    if (activeRange === "week") {
      const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const baseDate = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate());
      const diffTime = dDate.getTime() - baseDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        idx = diffDays;
      }
    } else if (activeRange === "month") {
      if (d.getFullYear() === baseStart.getFullYear() && d.getMonth() === baseStart.getMonth()) {
        idx = d.getDate() - 1;
      }
    } else {
      if (d.getFullYear() === baseStart.getFullYear()) {
        idx = d.getMonth();
      }
    }

    if (idx >= 0 && idx < bucketCount) {
      data[idx].income += Math.abs(Number(b.income ?? 0));
      data[idx].expense += Math.abs(Number(b.expense ?? b.amount ?? 0));
      if (Array.isArray(b.expenses)) {
        data[idx].expenses.push(...b.expenses);
      }
    }
  });

  return data;
}

function computeTotals(chartData) {
  let income = 0;
  let expense = 0;
  chartData.forEach((b) => {
    income += b.income || 0;
    expense += b.expense || 0;
  });
  return { income, expense };
}

function buildCardData(chartData) {
  const all = [];
  chartData.forEach((bucket) => {
    (bucket.expenses || []).forEach((exp) => {
      const details = exp.expense || exp.details || {};
      all.push({
        id: exp.id ?? details.id ?? exp.expenseId,
        name: details.expenseName || exp.expenseName || exp.name || "Unknown",
        amount: Math.abs(Number(details.amount ?? exp.amount ?? 0)),
        category: exp.categoryName || exp.category || "",
        paymentMethod: details.paymentMethod || exp.paymentMethod || "",
        date: exp.date || details.date || bucket.label,
        type: (details.type || exp.type || "").toString().toLowerCase(),
      });
    });
  });
  return all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function useCashflowData() {
  const flow = useFlowData({
    storagePrefix: "cashflow",
    fetchAction: fetchDailySpendingAction,
  });

  const apiData = useSelector((s) => s.expenses?.dailySpending);
  const chartData = useMemo(() => normalizeChartData(apiData, flow.activeRange, flow.offset), [apiData, flow.activeRange, flow.offset]);
  const totals = useMemo(() => computeTotals(chartData), [chartData]);
  const cardData = useMemo(() => buildCardData(chartData), [chartData]);

  const chartConfig = useMemo(() => ({
    income: { label: "Income", color: "hsl(142, 71%, 45%)" },
    expense: { label: "Expense", color: "hsl(0, 84%, 60%)" },
  }), []);

  return {
    ...flow,
    chartData,
    cardData,
    totals,
    chartConfig,
  };
}
