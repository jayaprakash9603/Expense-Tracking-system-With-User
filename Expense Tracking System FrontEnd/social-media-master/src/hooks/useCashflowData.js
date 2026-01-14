import { useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchCashflowExpenses } from "../Redux/Expenses/expense.action";
import { getRangeLabel, weekDays, yearMonths } from "../utils/flowDateUtils";
import { useTranslation } from "./useTranslation";

const normalizeSearchField = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().toLowerCase();
};

const buildSearchBlob = (item) => {
  const exp = item?.expense || {};
  return [
    exp.expenseName || item.name || "",
    exp.comments || item.comments || "",
    exp.amount ?? item.amount ?? "",
    item.categoryName || item.category?.name || item.category || "",
    exp.paymentMethod || item.paymentMethodName || item.paymentMethod || "",
    exp.date || item.date || "",
  ]
    .map(normalizeSearchField)
    .filter(Boolean)
    .join("|");
};

const createDefaultRangeOffsets = () => ({
  week: 0,
  month: 0,
  year: 0,
});

const VIEW_STATE_DEFAULTS = {
  activeRange: "month",
  offset: 0,
  flowTab: "all",
};

const buildDefaultViewState = () => ({
  ...VIEW_STATE_DEFAULTS,
  rangeOffsets: createDefaultRangeOffsets(),
});

const VALID_RANGES = new Set(["week", "month", "year"]);
const VALID_FLOW_TABS = new Set(["all", "inflow", "outflow"]);

const getCashflowViewStorageKey = (friendId, isFriendView, ownerId) => {
  const ownerSegment = ownerId ? `owner-${ownerId}` : "owner-unknown";
  const scope = isFriendView ? `friend-${friendId || "unknown"}` : "self";
  return `cashflow:view-state:${ownerSegment}:${scope}`;
};

const sanitizeViewState = (incomingState = buildDefaultViewState()) => {
  const state = incomingState || buildDefaultViewState();
  const activeRange = VALID_RANGES.has(state.activeRange)
    ? state.activeRange
    : VIEW_STATE_DEFAULTS.activeRange;
  const sanitizedOffsets = {
    ...createDefaultRangeOffsets(),
    ...(state.rangeOffsets || {}),
  };

  if (
    typeof state.offset === "number" &&
    Number.isFinite(state.offset) &&
    sanitizedOffsets[activeRange] === undefined
  ) {
    sanitizedOffsets[activeRange] = state.offset;
  }

  return {
    activeRange,
    offset:
      typeof state.offset === "number" && Number.isFinite(state.offset)
        ? state.offset
        : sanitizedOffsets[activeRange] ?? VIEW_STATE_DEFAULTS.offset,
    flowTab: VALID_FLOW_TABS.has(state.flowTab)
      ? state.flowTab
      : VIEW_STATE_DEFAULTS.flowTab,
    rangeOffsets: sanitizedOffsets,
  };
};

const readPersistedViewState = (key) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return buildDefaultViewState();
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return buildDefaultViewState();
    }
    const parsed = JSON.parse(raw);
    return sanitizeViewState(parsed);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to parse cashflow view state", error);
    }
    return buildDefaultViewState();
  }
};

const persistViewState = (key, state) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    const sanitized = sanitizeViewState(state);
    window.localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to persist cashflow view state", error);
    }
  }
};

export default function useCashflowData({ friendId, isFriendView, search }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth || {});
  const ownerIdRaw =
    user?.id ?? user?._id ?? user?.userId ?? user?.user_id ?? null;
  const ownerId = ownerIdRaw == null ? null : String(ownerIdRaw);
  const storageKey = useMemo(
    () => getCashflowViewStorageKey(friendId, isFriendView, ownerId),
    [friendId, isFriendView, ownerId]
  );
  const initialViewState = useMemo(
    () => readPersistedViewState(storageKey),
    [storageKey]
  );
  const [activeRange, setActiveRange] = useState(initialViewState.activeRange);
  const [rangeOffsets, setRangeOffsets] = useState(
    initialViewState.rangeOffsets || createDefaultRangeOffsets()
  );
  const [flowTab, setFlowTab] = useState(initialViewState.flowTab);
  const { cashflowExpenses, cashflowDashboard, cashflowOwnerId, loading } =
    useSelector((s) => s.expenses || {});
  const { settings } = useSelector((s) => s.userSettings || {});
  const maskSensitiveData = settings?.maskSensitiveData;
  const trimmedSearch = useMemo(() => (search || "").trim(), [search]);
  const deferredSearch = useDeferredValue(trimmedSearch);
  const normalizedSearch = useMemo(
    () => deferredSearch.toLowerCase(),
    [deferredSearch]
  );
  const searchQuery = deferredSearch.length ? deferredSearch : null;
  const previousStorageKeyRef = useRef(storageKey);
  const hydratedStorageKeyRef = useRef(storageKey);

  const normalizedRangeOffsets = useMemo(() => {
    if (
      !rangeOffsets ||
      typeof rangeOffsets !== "object" ||
      Array.isArray(rangeOffsets)
    ) {
      return createDefaultRangeOffsets();
    }
    return {
      ...createDefaultRangeOffsets(),
      ...Object.entries(rangeOffsets).reduce((acc, [key, value]) => {
        acc[key] = Number.isFinite(value) ? value : 0;
        return acc;
      }, {}),
    };
  }, [rangeOffsets]);

  const offset = normalizedRangeOffsets[activeRange] ?? 0;

  const setOffset = (valueOrUpdater) => {
    setRangeOffsets((prev = createDefaultRangeOffsets()) => {
      const current = prev[activeRange] ?? 0;
      const next =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(current)
          : valueOrUpdater;
      if (next === current || !Number.isFinite(next)) {
        return prev;
      }
      return {
        ...prev,
        [activeRange]: next,
      };
    });
  };

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== storageKey) {
      return;
    }
    persistViewState(storageKey, {
      activeRange,
      offset,
      flowTab,
      rangeOffsets: normalizedRangeOffsets,
    });
  }, [storageKey, activeRange, offset, flowTab, normalizedRangeOffsets]);

  useEffect(() => {
    if (previousStorageKeyRef.current === storageKey) {
      return;
    }
    previousStorageKeyRef.current = storageKey;
    const persisted = readPersistedViewState(storageKey);
    setActiveRange((prev) =>
      prev === persisted.activeRange ? prev : persisted.activeRange
    );
    setRangeOffsets(persisted.rangeOffsets || createDefaultRangeOffsets());
    setFlowTab((prev) =>
      prev === persisted.flowTab ? prev : persisted.flowTab
    );
    hydratedStorageKeyRef.current = storageKey;
  }, [storageKey]);

  // fetch
  useEffect(() => {
    dispatch(
      fetchCashflowExpenses({
        range: activeRange,
        offset,
        flowType: flowTab === "all" ? null : flowTab,
        // category intentionally null for base cashflow screen filtering by text search only
        // type left undefined to fetch both loss & gain unless flowTab narrows via flowType
        targetId: isFriendView ? friendId : undefined,
        ownerId,
        groupBy: false, // flat list for timeline visualization
        search: searchQuery,
      })
    );
  }, [
    activeRange,
    offset,
    flowTab,
    dispatch,
    friendId,
    isFriendView,
    maskSensitiveData,
    ownerId,
    searchQuery,
  ]);

  const isMismatchedOwner =
    ownerId && cashflowOwnerId && cashflowOwnerId !== ownerId;

  const expenseList = useMemo(() => {
    if (isMismatchedOwner) {
      return [];
    }
    return Array.isArray(cashflowExpenses) ? cashflowExpenses : [];
  }, [cashflowExpenses, isMismatchedOwner]);

  const dashboardPayload = useMemo(() => {
    if (isMismatchedOwner) {
      return null;
    }
    if (!cashflowDashboard || typeof cashflowDashboard !== "object") {
      return null;
    }
    return cashflowDashboard;
  }, [cashflowDashboard, isMismatchedOwner]);

  const shouldUseClientAggregation = !dashboardPayload;

  const searchIndex = useMemo(() => {
    if (!shouldUseClientAggregation) {
      return [];
    }
    return expenseList.map((item) => ({ item, blob: buildSearchBlob(item) }));
  }, [expenseList, shouldUseClientAggregation]);

  const filteredExpensesForView = useMemo(() => {
    if (!shouldUseClientAggregation) {
      return expenseList;
    }
    if (!normalizedSearch) return expenseList;
    return searchIndex
      .filter(({ blob }) => blob.includes(normalizedSearch))
      .map(({ item }) => item);
  }, [expenseList, normalizedSearch, searchIndex, shouldUseClientAggregation]);

  const fallbackAggregation = useMemo(() => {
    if (!shouldUseClientAggregation) {
      return null;
    }
    if (
      !Array.isArray(filteredExpensesForView) ||
      filteredExpensesForView.length === 0
    ) {
      return {
        chartData: [],
        cardData: [],
        totals: { inflow: 0, outflow: 0, total: 0 },
        xKey: activeRange === "year" ? "month" : "day",
      };
    }

    const buildCardsFromExpenses = (expenses, transform) =>
      expenses.map((item) => ({
        ...item,
        name: item.expense?.expenseName || "",
        amount: item.expense?.amount || 0,
        comments: item.expense?.comments || "",
        ...transform(item),
      }));

    let chartData = [];
    let cardData = [];

    if (activeRange === "week") {
      const weekMap = {};
      weekDays.forEach(
        (d) => (weekMap[d] = { day: d, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const dayIdx = dayjs(date).day();
        const weekDay = weekDays[(dayIdx + 6) % 7];
        weekMap[weekDay].amount += item.expense?.amount || 0;
        weekMap[weekDay].expenses.push(item);
      });
      chartData = weekDays.map((d) => ({
        day: d,
        amount: weekMap[d].amount,
        expenses: weekMap[d].expenses,
      }));
      cardData = weekDays.flatMap((d) =>
        buildCardsFromExpenses(weekMap[d].expenses, () => ({ day: d }))
      );
    } else if (activeRange === "month") {
      const targetMonth = dayjs().startOf("month").add(offset, "month");
      const daysInMonth = targetMonth.daysInMonth();
      const monthMap = {};
      for (let i = 1; i <= daysInMonth; i++) {
        monthMap[i] = { day: i, amount: 0, expenses: [] };
      }
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const d = dayjs(date);
        if (d.isSame(targetMonth, "month")) {
          const day = d.date();
          if (monthMap[day]) {
            monthMap[day].amount += item.expense?.amount || 0;
            monthMap[day].expenses.push(item);
          }
        }
      });
      chartData = Array.from({ length: daysInMonth }, (_, i) => ({
        day: (i + 1).toString(),
        amount: monthMap[i + 1].amount,
        expenses: monthMap[i + 1].expenses,
      }));
      cardData = Array.from({ length: daysInMonth }, (_, i) =>
        buildCardsFromExpenses(monthMap[i + 1].expenses, () => ({
          day: (i + 1).toString(),
        }))
      ).flat();
    } else if (activeRange === "year") {
      const targetYear = dayjs().add(offset, "year").year();
      const yearMap = {};
      yearMonths.forEach(
        (m, idx) => (yearMap[idx] = { month: m, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const d = dayjs(date);
        if (d.year() === targetYear) {
          const monthIdx = d.month();
          yearMap[monthIdx].amount += item.expense?.amount || 0;
          yearMap[monthIdx].expenses.push(item);
        }
      });
      chartData = yearMonths.map((m, idx) => ({
        month: m,
        amount: yearMap[idx].amount,
        expenses: yearMap[idx].expenses,
      }));
      cardData = yearMonths.flatMap((m, idx) =>
        buildCardsFromExpenses(yearMap[idx].expenses, () => ({ month: m }))
      );
    } else {
      chartData = [];
      cardData = buildCardsFromExpenses(filteredExpensesForView, () => ({}));
    }

    let inflow = 0;
    let outflow = 0;
    filteredExpensesForView.forEach((item) => {
      const amount = item.expense?.amount || item.amount || 0;
      const type = (item.type || item.expense?.type || "outflow").toLowerCase();
      if (type === "inflow" || type === "gain") inflow += amount;
      else outflow += amount;
    });

    return {
      chartData,
      cardData,
      totals: { inflow, outflow, total: inflow + outflow },
      xKey: activeRange === "year" ? "month" : "day",
    };
  }, [
    shouldUseClientAggregation,
    filteredExpensesForView,
    activeRange,
    offset,
  ]);

  const resolvedChartData =
    dashboardPayload?.chartData ?? fallbackAggregation?.chartData ?? [];
  const resolvedCardData =
    dashboardPayload?.cardData ?? fallbackAggregation?.cardData ?? [];
  const resolvedTotals = dashboardPayload?.totals ??
    fallbackAggregation?.totals ?? {
      inflow: 0,
      outflow: 0,
      total: 0,
    };
  const xKey =
    dashboardPayload?.xKey ??
    fallbackAggregation?.xKey ??
    (activeRange === "year" ? "month" : "day");

  const normalizedCardData = useMemo(
    () =>
      resolvedCardData.map((card, idx) => ({
        ...card,
        originalIndex:
          typeof card?.originalIndex === "number" ? card.originalIndex : idx,
      })),
    [resolvedCardData]
  );

  const rangeLabel =
    dashboardPayload?.rangeContext?.label ??
    getRangeLabel(activeRange, offset, "cashflow", { t });

  const barChartStyles = {
    barWidth: 20,
    hideNumbers: false,
    hideAxisLabels: false,
  };

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    cashflowExpenses,
    loading,
    chartData: resolvedChartData,
    cardData: normalizedCardData,
    xKey,
    barChartStyles,
    totals: resolvedTotals,
    rangeLabel,
  };
}
