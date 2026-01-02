import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../config/api";

const EARLIEST_SUPPORTED_DATE = new Date(2002, 0, 15);

const formatDateString = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatReadableRange = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.replace(/,/g, "").trim();
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const mapTypeToFlowType = (value) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "gain" || normalized === "inflow") {
    return "inflow";
  }
  if (normalized === "loss" || normalized === "outflow") {
    return "outflow";
  }
  return null;
};

const normalizeExpenseEntry = (expenseDTO, fallbackType) => {
  if (!expenseDTO) {
    return null;
  }
  const details = expenseDTO.expense || expenseDTO.details || {};
  const rawAmount =
    details.amount ??
    details.netAmount ??
    expenseDTO.amount ??
    expenseDTO.total ??
    0;
  const normalizedType = (details.type || expenseDTO.type || fallbackType || "")
    .toString()
    .toLowerCase();

  return {
    id: expenseDTO.id ?? details.id ?? expenseDTO.expenseId ?? null,
    name:
      details.expenseName ||
      expenseDTO.expenseName ||
      expenseDTO.name ||
      expenseDTO.categoryName ||
      "Unknown",
    amount: Math.abs(toNumber(rawAmount)),
    category: expenseDTO.categoryName || expenseDTO.category?.name || "",
    paymentMethod: details.paymentMethod || "",
    date: expenseDTO.date || details.date || null,
    type: normalizedType || null,
    raw: expenseDTO,
  };
};

const normalizeBuckets = (buckets, fallbackType) => {
  if (!Array.isArray(buckets)) return [];

  return buckets.map((bucket) => {
    const expenses = Array.isArray(bucket.expenses)
      ? bucket.expenses
          .map((entry) => normalizeExpenseEntry(entry, fallbackType))
          .filter(Boolean)
      : [];

    const amount = Math.abs(toNumber(bucket.amount));
    const isoDate = bucket.isoDate || bucket.day || bucket.label || null;

    const typeSet = new Set(
      expenses
        .map((e) => e.type)
        .filter((t) => typeof t === "string" && t.length > 0)
    );

    const inferredType = (() => {
      if (typeSet.size === 0) {
        return fallbackType ? fallbackType.toLowerCase() : null;
      }
      if (typeSet.size === 1) {
        return Array.from(typeSet)[0];
      }
      return "mixed";
    })();

    return {
      day: isoDate,
      date: isoDate,
      spending: amount,
      expenses,
      type: inferredType,
      rawBucket: bucket,
    };
  });
};

const normalizeLegacyExpenses = (expenses, fallbackType) => {
  if (!Array.isArray(expenses)) return [];
  const dailyMap = new Map();
  expenses.forEach((expense) => {
    const date = expense?.date || expense?.expense?.date;
    if (!date) return;
    const normalized = normalizeExpenseEntry(expense, fallbackType);
    if (!normalized) return;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { spending: 0, expenses: [] });
    }
    const entry = dailyMap.get(date);
    entry.spending += normalized.amount;
    entry.expenses.push(normalized);
  });

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([day, info]) => ({
      day,
      date: day,
      spending: Math.abs(toNumber(info.spending)),
      expenses: info.expenses,
      type: (() => {
        const types = new Set(info.expenses.map((e) => e.type).filter(Boolean));
        if (types.size === 0) return fallbackType || null;
        if (types.size === 1) return Array.from(types)[0];
        return "mixed";
      })(),
    }));
};

const buildTotalsFromChart = (chartData = []) => {
  return chartData.reduce(
    (acc, bucket) => {
      const amount = Math.abs(toNumber(bucket.spending));
      const bucketType = (bucket.type || "").toLowerCase();
      if (bucketType === "gain" || bucketType === "inflow") {
        acc.inflow += amount;
      } else if (bucketType === "loss" || bucketType === "outflow") {
        acc.outflow += amount;
      } else {
        acc.outflow += amount; // default to outflow for mixed/unknown to keep totals visible
      }
      acc.total += amount;
      return acc;
    },
    { inflow: 0, outflow: 0, total: 0 }
  );
};

const buildFallbackRangeContext = (config) => {
  if (!config) return null;
  const { window, query } = config;
  const startDate = window?.startDate || query.startDate || null;
  const endDate = window?.endDate || query.endDate || null;
  return {
    rangeType: query.range || "custom",
    offset: Number(query.offset || 0),
    startDate,
    endDate,
    label: config.label || formatReadableRange(startDate, endDate),
    flowType: null,
    search: null,
  };
};

const resolveTimeframeConfig = (timeframe) => {
  const now = new Date();
  const setWindow = (start, end) => ({
    startDate: formatDateString(start),
    endDate: formatDateString(end),
  });

  switch (timeframe) {
    case "this_week": {
      const start = new Date(now);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        query: { range: "week", offset: 0 },
        window: setWindow(start, end),
        label: "This Week",
      };
    }
    case "last_week": {
      const start = new Date(now);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day - 6);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        query: { range: "week", offset: -1 },
        window: setWindow(start, end),
        label: "Last Week",
      };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        query: { range: "month", offset: 0 },
        window: setWindow(start, end),
        label: "This Month",
      };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        query: { range: "month", offset: -1 },
        window: setWindow(start, end),
        label: "Last Month",
      };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return {
        query: { range: "year", offset: 0 },
        window: setWindow(start, end),
        label: "This Year",
      };
    }
    case "last_year": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return {
        query: { range: "year", offset: -1 },
        window: setWindow(start, end),
        label: "Last Year",
      };
    }
    case "last_3_months":
    case "last_3": {
      const end = new Date(now);
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      return {
        query: {
          startDate: formatDateString(start),
          endDate: formatDateString(end),
        },
        window: setWindow(start, end),
        label: "Last 3 Months",
      };
    }
    case "all_time": {
      const start = new Date(EARLIEST_SUPPORTED_DATE);
      const end = new Date(now);
      return {
        query: {
          startDate: formatDateString(start),
          endDate: formatDateString(end),
        },
        window: setWindow(start, end),
        label: "All Time",
      };
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now);
      return {
        query: {
          startDate: formatDateString(start),
          endDate: formatDateString(end),
        },
        window: setWindow(start, end),
        label: "Custom Range",
      };
    }
  }
};

const createInitialDataset = () => ({
  chartData: [],
  totals: { inflow: 0, outflow: 0, total: 0 },
  rangeContext: null,
  rawExpenses: [],
  rawResponse: null,
});

export default function useDailySpendingData({
  initialTimeframe = "this_month",
  initialType = "loss",
  targetId = null,
  includeTypeInRequest = true,
  refreshTrigger,
} = {}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [type, setType] = useState(initialType);
  const [dataset, setDataset] = useState(createInitialDataset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeframeConfig = useMemo(
    () => resolveTimeframeConfig(timeframe),
    [timeframe]
  );

  const performFetch = useCallback(
    async (abortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(timeframeConfig.query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        if (includeTypeInRequest && type) {
          params.append("type", type);
        }

        const flowTypeValue = mapTypeToFlowType(type);
        if (flowTypeValue) {
          params.append("flowType", flowTypeValue);
        }

        if (targetId) {
          params.append("targetId", targetId);
        }

        const response = await api.get(
          `/api/expenses/cashflow?${params.toString()}`,
          { signal: abortSignal }
        );

        if (abortSignal?.aborted) {
          return;
        }

        const payload = response.data;
        const chartBuckets = Array.isArray(payload?.chartData)
          ? normalizeBuckets(payload.chartData, type)
          : Array.isArray(payload)
          ? normalizeLegacyExpenses(payload, type)
          : [];

        const rawExpenses = Array.isArray(payload?.rawExpenses)
          ? payload.rawExpenses
          : Array.isArray(payload)
          ? payload
          : [];

        setDataset({
          chartData: chartBuckets,
          totals: payload?.totals ?? buildTotalsFromChart(chartBuckets),
          rangeContext:
            payload?.rangeContext ?? buildFallbackRangeContext(timeframeConfig),
          rawExpenses,
          rawResponse: payload,
        });
      } catch (fetchError) {
        if (abortSignal?.aborted) {
          return;
        }
        console.error("Daily spending fetch failed", fetchError);
        setError(fetchError);
        setDataset(createInitialDataset());
      } finally {
        if (!abortSignal?.aborted) {
          setLoading(false);
        }
      }
    },
    [timeframeConfig, includeTypeInRequest, type, targetId]
  );

  const refetch = useCallback(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
    return controller;
  }, [performFetch]);

  useEffect(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
    return () => controller.abort();
  }, [performFetch, refreshTrigger]);

  return {
    data: dataset.chartData,
    dataset,
    loading,
    error,
    refetch,
    setTimeframe,
    setType,
    timeframe,
    type,
  };
}
