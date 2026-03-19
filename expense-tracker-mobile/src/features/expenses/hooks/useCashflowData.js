import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFlowData } from "@/shared/hooks/flow/useFlowData";
import { fetchDailySpendingAction } from "@/redux/expenses/expenses.actions";

function deriveIncomeExpenseFromBucket(bucket, flowTab) {
  let income = 0;
  let expense = 0;
  const expenses = Array.isArray(bucket?.expenses) ? bucket.expenses : [];

  if (bucket?.income != null || bucket?.expense != null) {
    income += Math.abs(Number(bucket?.income ?? 0));
    expense += Math.abs(Number(bucket?.expense ?? 0));
  }

  expenses.forEach((exp) => {
    const details = exp?.expense || exp;
    const amt = Math.abs(Number(details?.amount ?? exp?.amount ?? 0));
    const type = (details?.type ?? exp?.type ?? "outflow").toString().toLowerCase();
    if (["gain", "income", "inflow"].includes(type)) {
      income += amt;
    } else {
      expense += amt;
    }
  });
  if (expenses.length === 0 && bucket?.amount != null) {
    if (flowTab === "inflow") {
      income += Math.abs(Number(bucket.amount));
    } else {
      expense += Math.abs(Number(bucket.amount));
    }
  }
  return { income, expense, expenses };
}

function normalizeChartData(apiData, flowTab) {
  if (!apiData) return [];
  const rawBuckets = Array.isArray(apiData.chartData)
    ? apiData.chartData
    : Array.isArray(apiData)
      ? apiData
      : [];

  if (!rawBuckets.length) return [];

  return rawBuckets.map((b) => {
    const { income, expense, expenses } = deriveIncomeExpenseFromBucket(b, flowTab);
    const label = b.day ?? b.month ?? b.label ?? "";
    return {
      label,
      income,
      expense,
      expenses,
    };
  });
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
  const paramsBuilder = useCallback(({ activeRange, offset, apiFlowType }) => {
    const params = {
      range: activeRange,
      offset,
    };

    if (apiFlowType === "gain") {
      params.flowType = "inflow";
      params.type = "gain";
    } else if (apiFlowType === "outflow") {
      params.flowType = "outflow";
      params.type = "loss";
    }

    return params;
  }, []);

  const flow = useFlowData({
    storagePrefix: "cashflow",
    fetchAction: fetchDailySpendingAction,
    paramsBuilder,
  });

  const apiData = useSelector((s) => s.expenses?.dailySpending);
  const chartData = useMemo(() => normalizeChartData(apiData, flow.flowTab), [apiData, flow.flowTab]);
  const totals = useMemo(() => computeTotals(chartData), [chartData]);
  const cardData = useMemo(() => {
    if (Array.isArray(apiData?.cardData) && apiData.cardData.length > 0) {
      return apiData.cardData.map((c) => {
        const details = c.expense || {};
        return {
          id: c.id ?? c.expenseId,
          name: c.name ?? details.expenseName ?? "Unknown",
          amount: Math.abs(Number(c.amount ?? details.amount ?? 0)),
          category: c.categoryName ?? c.category ?? "",
          paymentMethod: details.paymentMethod ?? c.paymentMethod ?? "",
          date: c.isoDate ?? c.date ?? details.date ?? "",
          comments: c.comments ?? details.comments ?? "",
          type: (details.type ?? c.type ?? "outflow").toString().toLowerCase(),
        };
      }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }
    return buildCardData(chartData);
  }, [apiData, chartData]);

  const chartConfig = useMemo(() => ({
    income: { label: "Gain", color: "#10b981" },
    expense: { label: "Loss", color: "#ef4444" },
  }), []);

  return {
    ...flow,
    chartData,
    cardData,
    totals,
    chartConfig,
  };
}
