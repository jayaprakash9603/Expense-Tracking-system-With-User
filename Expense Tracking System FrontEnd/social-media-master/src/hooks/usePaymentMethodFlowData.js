import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentMethodsWithExpenses } from "../Redux/Payment Method/paymentMethod.action";
import { getRangeLabel } from "../utils/flowDateUtils";
import {
  buildStackedChartData,
  deterministicColor,
} from "../utils/stackedChartUtils";

const createDefaultRangeOffsets = () => ({
  week: 0,
  month: 0,
  year: 0,
});

const VIEW_STATE_DEFAULTS = {
  activeRange: "month",
  flowTab: "all",
};

const buildDefaultViewState = () => ({
  ...VIEW_STATE_DEFAULTS,
  offset: 0,
  rangeOffsets: createDefaultRangeOffsets(),
});

const VALID_RANGES = new Set(["week", "month", "year"]);
const VALID_FLOW_TABS = new Set(["all", "inflow", "outflow"]);

const getPaymentMethodFlowViewStorageKey = (
  friendId,
  isFriendView,
  ownerId
) => {
  const ownerSegment = ownerId ? `owner-${ownerId}` : "owner-unknown";
  const scope = isFriendView ? `friend-${friendId || "unknown"}` : "self";
  return `paymentmethodflow:view-state:${ownerSegment}:${scope}`;
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
        : sanitizedOffsets[activeRange] ?? 0,
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
    return sanitizeViewState(JSON.parse(raw));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to parse payment method flow view state", error);
    }
    return buildDefaultViewState();
  }
};

const persistViewState = (key, state) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(sanitizeViewState(state)));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to persist payment method flow view state", error);
    }
  }
};

/**
 * usePaymentMethodFlowData
 * Aligns with useCategoryFlowData/cashflow for cached view-state persistence.
 * Returns orchestrator state, derived summaries, and refresh helper.
 */
export default function usePaymentMethodFlowData({
  friendId,
  isFriendView,
  search,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth || {});
  const ownerIdRaw =
    user?.id ?? user?._id ?? user?.userId ?? user?.user_id ?? null;
  const ownerId = ownerIdRaw == null ? null : String(ownerIdRaw);
  const storageKey = useMemo(
    () => getPaymentMethodFlowViewStorageKey(friendId, isFriendView, ownerId),
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
  const { paymentMethodExpenses, paymentMethodFlowOwnerId, loading } =
    useSelector((s) => s.paymentMethod || {});
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
      const currentValue = prev[activeRange] ?? 0;
      const nextValue =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(currentValue)
          : valueOrUpdater;
      if (!Number.isFinite(nextValue) || nextValue === currentValue) {
        return prev;
      }
      return {
        ...prev,
        [activeRange]: nextValue,
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
  }, [storageKey, activeRange, flowTab, normalizedRangeOffsets]);

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

  const requestDescriptor = useMemo(
    () => ({
      rangeType: activeRange,
      offset,
      flowType: flowTab === "all" ? null : flowTab,
      targetId: isFriendView ? friendId : undefined,
      ownerId,
    }),
    [activeRange, offset, flowTab, isFriendView, friendId, ownerId]
  );

  useEffect(() => {
    dispatch(
      fetchPaymentMethodsWithExpenses({
        ...requestDescriptor,
      })
    );
  }, [dispatch, requestDescriptor]);

  const refreshPaymentMethodFlow = useCallback(() => {
    dispatch(
      fetchPaymentMethodsWithExpenses({
        ...requestDescriptor,
        forceRefetch: true,
      })
    );
  }, [dispatch, requestDescriptor]);

  const isMismatchedOwner =
    ownerId && paymentMethodFlowOwnerId && paymentMethodFlowOwnerId !== ownerId;

  const effectivePaymentMethodExpenses = useMemo(() => {
    if (isMismatchedOwner) {
      return {};
    }
    return paymentMethodExpenses || {};
  }, [paymentMethodExpenses, isMismatchedOwner]);

  // Compute totals aggregated across all payment method expenses
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    if (effectivePaymentMethodExpenses) {
      Object.keys(effectivePaymentMethodExpenses)
        .filter((k) => k !== "summary")
        .forEach((pmName) => {
          const pm = effectivePaymentMethodExpenses[pmName];
          const expenses = Array.isArray(pm?.expenses) ? pm.expenses : [];
          expenses.forEach((e) => {
            if (!e) return;
            const details = e.details || e;
            const amt = Number(details.amount || e.amount || 0);
            const type = (details.type || e.type || "").toLowerCase();
            if (["gain", "income", "inflow"].includes(type)) inflow += amt;
            else outflow += amt;
          });
        });
    }
    return { inflow, outflow, total: inflow + outflow };
  }, [effectivePaymentMethodExpenses]);

  // Derive pieData & payment method cards
  const { pieData, paymentMethodCards } = useMemo(() => {
    if (
      !effectivePaymentMethodExpenses ||
      !effectivePaymentMethodExpenses.summary
    ) {
      return { pieData: [], paymentMethodCards: [] };
    }
    const methods = Object.keys(effectivePaymentMethodExpenses)
      .filter((k) => k !== "summary")
      .map((k) => ({
        name: k,
        ...effectivePaymentMethodExpenses[k],
        value: effectivePaymentMethodExpenses[k].totalAmount,
      }));
    const cards = methods.map((m) => ({
      categoryName: m.name, // maintain existing naming to reduce downstream changes
      categoryId: m.id,
      totalAmount: m.totalAmount,
      expenseCount: m.expenseCount || 0,
      color: m.color || deterministicColor(m.name),
      expenses: m.expenses || [],
    }));
    return {
      pieData: methods.map((pm) => ({
        name: pm.name,
        value: pm.totalAmount,
        color: pm.color || deterministicColor(pm.name),
      })),
      paymentMethodCards: cards,
    };
  }, [effectivePaymentMethodExpenses]);

  // Build stacked chart data using shared util
  const { barSegments, stackedChartData, xAxisKey } = useMemo(
    () =>
      buildStackedChartData({
        entityExpenses: effectivePaymentMethodExpenses,
        activeRange,
        offset,
        keyPrefix: "pm",
        colorAccessor: (name, entity) =>
          entity?.color || deterministicColor(name),
      }),
    [effectivePaymentMethodExpenses, activeRange, offset]
  );

  const rangeLabel = getRangeLabel(activeRange, offset, "paymentMethod");

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    paymentMethodExpenses: effectivePaymentMethodExpenses,
    totals,
    pieData,
    paymentMethodCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
    refreshPaymentMethodFlow,
  };
}
