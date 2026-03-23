import { useState, useEffect, useCallback, useMemo } from "react";
import { billApi } from "@/infrastructure/api";
import { fromApiResponse } from "@/domain/bills/bill.transformers";
import { getDateRangeForReportTimeframe } from "@/features/reports/utils/reportTimeframeRange";
import { assignChartColorVars } from "@/shared/utils/chart/chartColors";

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

function aggregateBills(bills, timeframe, flowType, dateRange, isCustomRange) {
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
      dailyMap.set(day, (dailyMap.get(day) || 0) + (b.type === "gain" ? -amt : amt));
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

  const dailyTrend = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amount]) => ({ label: day, amount: Math.abs(amount) }));

  return {
    filteredBills: filtered.map((raw) => fromApiResponse(raw)),
    rawFiltered: filtered,
    categoryData,
    paymentData,
    dailyTrend,
    totalLoss,
    totalGain,
    billCount: filtered.length,
    rangeLabel: `${fromDate} – ${toDate}`,
  };
}

export function useBillReportData({ targetId = "" } = {}) {
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
    () => aggregateBills(bills, timeframe, flowType, dateRange, isCustomRange),
    [bills, timeframe, flowType, dateRange, isCustomRange],
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
