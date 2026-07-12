import {
  normalizeCategoryDistribution,
  normalizePaymentMethodDistribution,
} from "@/shared/utils/chart/dataTransformers";
import { assignChartColorVars, buildPieChartConfig } from "@/shared/utils/chart/chartColors";
import { extractExpenseDetails } from "@/domain/expenses/expense.utils";

const LOSS_COLOR = "hsl(0, 84%, 60%)";
const GAIN_COLOR = "hsl(142, 71%, 45%)";
const CREDIT_LABEL_PATTERN = /credit|loan|emi|bnpl/i;

const CHART_LABEL_KEYS = {
  expense: "chart.labels.expense",
  income: "chart.labels.income",
  transactions: "chart.labels.transactions",
};

const CHART_LABEL_FALLBACK = {
  expense: "Expense",
  income: "Income",
  transactions: "Transactions",
};

function resolveChartLabel(translate, kind) {
  if (typeof translate === "function") {
    return translate(CHART_LABEL_KEYS[kind]);
  }
  return CHART_LABEL_FALLBACK[kind];
}

export function extractCashflowBucketsFromApi(apiData) {
  if (!apiData) return [];
  if (Array.isArray(apiData)) return apiData;
  for (const key of ["chartData", "data", "buckets", "items"]) {
    if (Array.isArray(apiData[key])) return apiData[key];
  }
  return [];
}

export function resolveCashflowBucketDate(bucket) {
  const iso = bucket?.isoDate ?? bucket?.date;
  if (iso) return String(iso).split("T")[0];
  const bk = bucket?.bucketKey;
  if (bk && /^\d{4}-\d{2}-\d{2}$/.test(String(bk))) return String(bk);
  if (bk && /^\d{4}-\d{2}$/.test(String(bk))) return `${bk}-01`;
  const label = bucket?.label;
  if (label && /^\d{4}-\d{2}-\d{2}/.test(String(label))) return String(label).split("T")[0];
  if (label && /^\d{4}-\d{2}$/.test(String(label))) return `${String(label).slice(0, 7)}-01`;
  return String(label ?? "").trim() || "";
}

function bucketToIncomeExpense(bucket, flowType) {
  let income = 0;
  let expense = 0;
  const expenses = Array.isArray(bucket?.expenses) ? bucket.expenses : [];
  if (bucket?.income != null || bucket?.expense != null) {
    income += Math.abs(Number(bucket?.income ?? 0));
    expense += Math.abs(Number(bucket?.expense ?? 0));
  }
  expenses.forEach((exp) => {
    const details = extractExpenseDetails(exp);
    const amt = Math.abs(Number(details?.amount ?? exp?.amount ?? 0));
    const type = (details?.type ?? exp?.type ?? "outflow").toString().toLowerCase();
    if (["gain", "income", "inflow"].includes(type)) income += amt;
    else expense += amt;
  });
  if (expenses.length === 0 && bucket?.amount != null) {
    if (flowType === "inflow") income += Math.abs(Number(bucket.amount));
    else expense += Math.abs(Number(bucket.amount));
  }
  return { income, expense };
}

function countMatchingExpenses(bucket, flowType) {
  const expenses = Array.isArray(bucket?.expenses) ? bucket.expenses : [];
  if (!expenses.length) {
    if (bucket?.amount != null && Number(bucket.amount) !== 0) {
      return flowType === "all" ? 1 : 0;
    }
    return 0;
  }
  let n = 0;
  expenses.forEach((exp) => {
    const details = extractExpenseDetails(exp);
    const type = (details?.type ?? exp?.type ?? "outflow").toString().toLowerCase();
    const isGain = ["gain", "income", "inflow"].includes(type);
    if (flowType === "inflow" && isGain) n += 1;
    else if (flowType === "outflow" && !isGain) n += 1;
    else if (flowType === "all") n += 1;
  });
  return n;
}

export function buildAreaChartModelFromCashflowApi(apiData, flowType, translate) {
  const rawBuckets = extractCashflowBucketsFromApi(apiData);
  if (!rawBuckets.length) {
    return {
      data: [],
      config: { expense: { label: resolveChartLabel(translate, "expense"), color: LOSS_COLOR } },
      dataKeys: ["expense"],
    };
  }

  const rows = rawBuckets.map((b) => {
    const { income, expense } = bucketToIncomeExpense(b, flowType);
    const date = resolveCashflowBucketDate(b);
    const expenses = Array.isArray(b.expenses) ? b.expenses : [];
    return { date, income, expense, expenses };
  });

  if (flowType === "inflow") {
    const data = rows.map((r) => ({ date: r.date, expense: r.income, expenses: r.expenses }));
    return {
      data,
      config: { expense: { label: resolveChartLabel(translate, "income"), color: GAIN_COLOR } },
      dataKeys: ["expense"],
    };
  }

  if (flowType === "outflow") {
    const data = rows.map((r) => ({ date: r.date, expense: r.expense, expenses: r.expenses }));
    return {
      data,
      config: { expense: { label: resolveChartLabel(translate, "expense"), color: LOSS_COLOR } },
      dataKeys: ["expense"],
    };
  }

  const data = rows.map((r) => ({
    date: r.date,
    income: r.income,
    expense: r.expense,
    expenses: r.expenses,
  }));
  return {
    data,
    config: {
      expense: { label: resolveChartLabel(translate, "expense"), color: LOSS_COLOR },
      income: { label: resolveChartLabel(translate, "income"), color: GAIN_COLOR },
    },
    dataKeys: ["expense", "income"],
  };
}

export function cashflowApiToCountChartModel(apiData, flowType, translate) {
  const rawBuckets = extractCashflowBucketsFromApi(apiData);
  if (!rawBuckets.length) {
    return {
      data: [],
      config: { count: { label: resolveChartLabel(translate, "transactions"), color: LOSS_COLOR } },
      dataKeys: ["count"],
    };
  }
  const rows = rawBuckets.map((b) => {
    const date = resolveCashflowBucketDate(b);
    const count = countMatchingExpenses(b, flowType);
    return { date, count };
  });
  return {
    data: rows,
    config: { count: { label: resolveChartLabel(translate, "transactions"), color: LOSS_COLOR } },
    dataKeys: ["count"],
  };
}

export function categoryApiToPieModel(rawData) {
  const rows = normalizeCategoryDistribution(rawData);
  return {
    data: assignChartColorVars(rows),
    config: buildPieChartConfig(rows),
  };
}

export function paymentApiToPieModel(rawData) {
  const rows = normalizePaymentMethodDistribution(rawData);
  return {
    data: assignChartColorVars(rows),
    config: buildPieChartConfig(rows),
  };
}

function sumPieRows(rows) {
  return rows.reduce((s, r) => s + Math.abs(Number(r.value ?? 0)), 0);
}

function sumCreditFromPaymentRows(rows) {
  return rows.reduce((sum, r) => {
    const name = String(r.name || "");
    if (!CREDIT_LABEL_PATTERN.test(name)) return sum;
    return sum + Math.abs(Number(r.value ?? 0));
  }, 0);
}

function monthlySumFromAreaData(areaData, dataKeys, monthPrefix) {
  if (!areaData?.length || !monthPrefix) return 0;
  return areaData.reduce((sum, row) => {
    const d = String(row.date || "").split("T")[0];
    if (!d.startsWith(monthPrefix)) return sum;
    let line = 0;
    dataKeys.forEach((k) => {
      line += Math.abs(Number(row[k] ?? 0));
    });
    return sum + line;
  }, 0);
}

export function deriveReportOverviewFromApis({
  categoryRaw,
  paymentRaw,
  areaModel,
  upcomingBills,
  fromDate,
  toDate,
}) {
  const catRows = normalizeCategoryDistribution(categoryRaw);
  const payRows = normalizePaymentMethodDistribution(paymentRaw);
  const totalExpenses = sumPieRows(catRows);
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const totalSpent = monthlySumFromAreaData(areaModel.data, areaModel.dataKeys, monthPrefix);
  const creditDue = sumCreditFromPaymentRows(payRows);
  let upcomingBillsAmount = 0;
  if (Array.isArray(upcomingBills) && fromDate && toDate) {
    upcomingBillsAmount = upcomingBills.reduce((sum, b) => {
      const d = String(b.dueDate || b.nextDueDate || b.date || "").split("T")[0];
      if (!d || d < fromDate || d > toDate) return sum;
      return sum + Math.abs(Number(b.amount || 0));
    }, 0);
  }

  return {
    totalExpenses,
    totalSpent,
    creditDue,
    upcomingBillsAmount,
  };
}
