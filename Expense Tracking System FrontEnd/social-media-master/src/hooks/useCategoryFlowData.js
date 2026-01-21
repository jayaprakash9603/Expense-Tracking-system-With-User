import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesWithExpenses } from "../Redux/Expenses/expense.action";
import { getRangeLabel } from "../utils/flowDateUtils";
import {
  buildStackedChartData,
  deterministicColor,
} from "../utils/stackedChartUtils";
import { useTranslation } from "./useTranslation";

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

const getCategoryFlowViewStorageKey = (friendId, isFriendView, ownerId) => {
  const ownerSegment = ownerId ? `owner-${ownerId}` : "owner-unknown";
  const scope = isFriendView ? `friend-${friendId || "unknown"}` : "self";
  return `categoryflow:view-state:${ownerSegment}:${scope}`;
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
        : (sanitizedOffsets[activeRange] ?? 0),
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
      console.warn("Failed to parse category flow view state", error);
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
      console.warn("Failed to persist category flow view state", error);
    }
  }
};

/**
 * useCategoryFlowData
 * Handles fetching and transforming category + expense data for CategoryFlow.
 * Mirrors patterns from useCashflowData for consistency & reusability.
 *
 * Inputs: friendId, isFriendView, search
 * Outputs: activeRange, setActiveRange, offset, setOffset, flowTab, setFlowTab,
 *          loading, rawCategoryExpenses, pieData, categoryCards, stackedChartData,
 *          barSegments, xAxisKey, totals, rangeLabel.
 */
export default function useCategoryFlowData({
  friendId,
  isFriendView,
  search,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth || {});
  const ownerIdRaw =
    user?.id ?? user?._id ?? user?.userId ?? user?.user_id ?? null;
  const ownerId = ownerIdRaw == null ? null : String(ownerIdRaw);
  const storageKey = useMemo(
    () => getCategoryFlowViewStorageKey(friendId, isFriendView, ownerId),
    [friendId, isFriendView, ownerId],
  );
  const initialViewState = useMemo(
    () => readPersistedViewState(storageKey),
    [storageKey],
  );
  const [activeRange, setActiveRange] = useState(initialViewState.activeRange);
  const [rangeOffsets, setRangeOffsets] = useState(
    initialViewState.rangeOffsets || createDefaultRangeOffsets(),
  );
  const [flowTab, setFlowTab] = useState(initialViewState.flowTab);
  const { categoryExpenses, categoryFlowOwnerId, loading } = useSelector(
    (s) => s.expenses || {},
  );
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
      prev === persisted.activeRange ? prev : persisted.activeRange,
    );
    setRangeOffsets(persisted.rangeOffsets || createDefaultRangeOffsets());
    setFlowTab((prev) =>
      prev === persisted.flowTab ? prev : persisted.flowTab,
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
    [activeRange, offset, flowTab, isFriendView, friendId, ownerId],
  );

  useEffect(() => {
    dispatch(
      fetchCategoriesWithExpenses({
        ...requestDescriptor,
      }),
    );
  }, [dispatch, requestDescriptor]);

  const refreshCategoryFlow = useCallback(() => {
    dispatch(
      fetchCategoriesWithExpenses({
        ...requestDescriptor,
        forceRefetch: true,
      }),
    );
  }, [dispatch, requestDescriptor]);

  const isMismatchedOwner =
    ownerId && categoryFlowOwnerId && categoryFlowOwnerId !== ownerId;

  const effectiveCategoryExpenses = useMemo(() => {
    if (isMismatchedOwner) {
      return {};
    }
    return categoryExpenses || {};
  }, [categoryExpenses, isMismatchedOwner]);

  // Compute totals (inflow/outflow) aggregated across all category expenses
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    if (effectiveCategoryExpenses) {
      Object.keys(effectiveCategoryExpenses)
        .filter((k) => k !== "summary")
        .forEach((catName) => {
          const cat = effectiveCategoryExpenses[catName];
          const expenses = Array.isArray(cat?.expenses) ? cat.expenses : [];
          expenses.forEach((e) => {
            if (!e) return;
            const details = e.expense || e.details || e;
            const rawAmount = details.amount ?? details.netAmount ?? e.amount;
            const amt = Math.abs(Number(rawAmount || 0));
            const type = (details.type || e.type || "").toLowerCase();
            if (["gain", "income", "inflow"].includes(type)) inflow += amt;
            else outflow += amt;
          });
        });
    }
    return { inflow, outflow, total: inflow + outflow };
  }, [categoryExpenses]);

  // Deterministic color utility now imported (deterministicColor)

  // Derive pieData & categoryCards from categoryExpenses
  const { pieData, categoryCards } = useMemo(() => {
    if (!effectiveCategoryExpenses || !effectiveCategoryExpenses.summary) {
      return { pieData: [], categoryCards: [] };
    }
    const categories = Object.keys(effectiveCategoryExpenses)
      .filter((k) => k !== "summary")
      .map((k) => ({
        name: k,
        ...effectiveCategoryExpenses[k],
        value: effectiveCategoryExpenses[k].totalAmount,
      }));
    const cards = categories.map((c) => ({
      categoryName: c.name,
      categoryId: c.id,
      totalAmount: c.totalAmount,
      expenseCount: c.expenseCount || 0,
      color: c.color || deterministicColor(c.name),
      icon: c.icon || "",
      expenses: c.expenses || [],
    }));
    return {
      pieData: categories.map((cat) => ({
        name: cat.name,
        value: cat.totalAmount,
        color: cat.color || deterministicColor(cat.name),
      })),
      categoryCards: cards,
    };
  }, [categoryExpenses]);

  // Build stacked multi-bar data using shared utility
  const { barSegments, stackedChartData, xAxisKey } = useMemo(
    () =>
      buildStackedChartData({
        entityExpenses: effectiveCategoryExpenses,
        activeRange,
        offset,
        keyPrefix: "cat",
        colorAccessor: (name, entity) =>
          entity?.color || deterministicColor(name),
      }),
    [effectiveCategoryExpenses, activeRange, offset],
  );

  const rangeLabel = getRangeLabel(activeRange, offset, "category", {
    t,
    entityPlural: t("flows.entities.category.plural"),
  });

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    categoryExpenses: effectiveCategoryExpenses,
    totals,
    pieData,
    categoryCards,
    barSegments,
    stackedChartData,
    xAxisKey,
    rangeLabel,
    refreshCategoryFlow,
  };
}
