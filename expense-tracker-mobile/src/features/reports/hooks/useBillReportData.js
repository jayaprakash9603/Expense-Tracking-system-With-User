import { useState, useEffect, useCallback, useMemo } from "react";
import { billApi } from "@/infrastructure/api";
import { fromApiResponse } from "@/domain/bills/bill.transformers";
import { getDateRangeForReportTimeframe } from "@/features/reports/utils/reportTimeframeRange";
import { assignChartColorVars } from "@/shared/utils/chart/chartColors";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

function billMatchesFlow(bill, flowType) {
  if (!flowType || flowType === "all") return true;
  const isGain = bill.type === "gain";
  if (flowType === "inflow" || flowType === "gain") return isGain;
  if (flowType === "outflow" || flowType === "loss") return !isGain;
  return true;
}

function billInDateRange(bill, fromStr, toStr) {
  const slice = bill.date && String(bill.date).slice(0, 10);
  if (!slice) return false;
  return slice >= fromStr && slice <= toStr;
}

function aggregateBills(bills, timeframe, flowType, dateRange, isCustomRange, t) {
  const range =
    isCustomRange && dateRange?.fromDate && dateRange?.toDate
      ? { fromDate: dateRange.fromDate, toDate: dateRange.toDate }
      : getDateRangeForReportTimeframe(timeframe);
  const { fromDate, toDate } = range;

  const filtered = bills.filter((raw) => {
    const b = fromApiResponse(raw);
    return billInDateRange(b, fromDate, toDate) && billMatchesFlow(b, flowType);
  });

  const categoryMap = new Map();
  const paymentMap = new Map();
  let totalLoss = 0;
  let totalGain = 0;
  const dailyMap = new Map();

  filtered.forEach((raw) => {
    const b = fromApiResponse(raw);
    const amt = Math.abs(Number(b.amount) || 0);
    const catLabel = raw.categoryName || raw.category || b.categoryId || "Uncategorized";
    const payLabel = String(b.paymentMethod || "unknown");

    if (b.type === "gain") totalGain += amt;
    else totalLoss += amt;

    categoryMap.set(catLabel, (categoryMap.get(catLabel) || 0) + amt);
    paymentMap.set(payLabel, (paymentMap.get(payLabel) || 0) + amt);

    const day = b.date && String(b.date).slice(0, 10);
    if (day) {
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, income: 0, expense: 0, expenses: [] });
      }
      const dayData = dailyMap.get(day);
      if (b.type === "gain") dayData.income += amt;
      else dayData.expense += amt;
      dayData.expenses.push(b);
    }
  });

  const categoryData = assignChartColorVars(
    [...categoryMap.entries()].map(([name, amount]) => ({
      name: String(name),
      value: amount,
      amount,
    })),
  );

  const paymentData = assignChartColorVars(
    [...paymentMap.entries()].map(([name, amount]) => ({
      name: String(name),
      value: amount,
      amount,
    })),
  );

  const dailyRows = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  let displayDaily = { data: [], config: {}, dataKeys: [] };
  const translate = (key) => {
    if (key === "chart.labels.expense") return t("chart.labels.expense") || "Expense";
    if (key === "chart.labels.income") return t("chart.labels.income") || "Income";
    return t(key) || key;
  };

  if (flowType === "inflow") {
    displayDaily = {
      data: dailyRows.map((r) => ({ date: r.date, expense: r.income, expenses: r.expenses })),
      config: { expense: { label: translate("chart.labels.income"), color: "hsl(142, 71%, 45%)" } },
      dataKeys: ["expense"],
    };
  } else if (flowType === "outflow") {
    displayDaily = {
      data: dailyRows.map((r) => ({ date: r.date, expense: r.expense, expenses: r.expenses })),
      config: { expense: { label: translate("chart.labels.expense"), color: "hsl(0, 84%, 60%)" } },
      dataKeys: ["expense"],
    };
  } else {
    displayDaily = {
      data: dailyRows,
      config: {
        income: { label: translate("chart.labels.income"), color: "hsl(142, 71%, 45%)" },
        expense: { label: translate("chart.labels.expense"), color: "hsl(0, 84%, 60%)" },
      },
      dataKeys: ["income", "expense"],
    };
  }

  return {
    filteredBills: filtered.map((raw) => fromApiResponse(raw)),
    rawFiltered: filtered,
    categoryData,
    paymentData,
    displayDaily,
    totalLoss,
    totalGain,
    billCount: filtered.length,
    rangeLabel: `${fromDate} – ${toDate}`,
  };
}

export function useBillReportData({ targetId = "" } = {}) {
  const { t } = useLanguage();
  const [timeframe, setTimeframeState] = useState("this_month");
  const [flowType, setFlowType] = useState("all");
  const [dateRange, setDateRange] = useState(() => getDateRangeForReportTimeframe("this_month"));
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bills, setBills] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = targetId ? { targetId } : {};
    const { data, error: err } = await billApi.getAll(params);
    if (err) {
      setError(err.message || "Failed to load bills");
      setBills([]);
    } else {
      const list = Array.isArray(data)
        ? data
        : data?.content || data?.data || data?.bills || [];
      setBills(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  }, [targetId]);

  useEffect(() => {
    load();
  }, [load]);

  const setTimeframe = useCallback((next) => {
    setTimeframeState(next);
    setDateRange(getDateRangeForReportTimeframe(next));
    setIsCustomRange(false);
  }, []);

  const setCustomDateRange = useCallback((range) => {
    if (!range?.fromDate || !range?.toDate) return;
    setDateRange({
      fromDate: range.fromDate.slice(0, 10),
      toDate: range.toDate.slice(0, 10),
    });
    setIsCustomRange(true);
  }, []);

  const resetDateRange = useCallback(() => {
    setDateRange(getDateRangeForReportTimeframe(timeframe));
    setIsCustomRange(false);
  }, [timeframe]);

  const aggregated = useMemo(
    () => aggregateBills(bills, timeframe, flowType, dateRange, isCustomRange, t),
    [bills, timeframe, flowType, dateRange, isCustomRange, t],
  );

  return {
    timeframe,
    setTimeframe,
    flowType,
    setFlowType,
    dateRange,
    setCustomDateRange,
    resetDateRange,
    isCustomRange,
    loading,
    error,
    refresh: load,
    bills,
    ...aggregated,
  };
}
