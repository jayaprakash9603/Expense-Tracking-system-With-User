import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { buildDateRangeParams } from "@/shared/utils/chart/dataTransformers";

const RANGE_OPTIONS = ["week", "month", "year"];

function buildStorageKey(prefix, userId) {
  return `${prefix}:view-state:${userId || "default"}`;
}

function loadPersistedState(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function persistState(storageKey, state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useFlowData({
  storagePrefix,
  fetchAction,
  defaultRange = "month",
  defaultFlowTab = "all",
  paramsBuilder,
  refetchOnFlowTabChange = true,
} = {}) {
  const dispatch = useDispatch();
  const storageKey = buildStorageKey(storagePrefix, "self");
  const initialState = loadPersistedState(storageKey);

  const [activeRange, setActiveRange] = useState(initialState?.activeRange || defaultRange);
  const [rangeOffsets, setRangeOffsets] = useState(
    initialState?.rangeOffsets || { week: 0, month: 0, year: 0 }
  );
  const [flowTab, setFlowTab] = useState(initialState?.flowTab || defaultFlowTab);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const mountRef = useRef(false);

  const offset = rangeOffsets[activeRange] ?? 0;

  const setOffset = useCallback((val) => {
    setRangeOffsets((prev) => ({
      ...prev,
      [activeRange]: typeof val === "function" ? val(prev[activeRange]) : val,
    }));
  }, [activeRange]);

  useEffect(() => {
    if (mountRef.current) {
      persistState(storageKey, { activeRange, rangeOffsets, flowTab });
    }
    mountRef.current = true;
  }, [activeRange, rangeOffsets, flowTab, storageKey]);

  const apiFlowType = useMemo(() => {
    if (flowTab === "inflow" || flowTab === "gain") return "gain";
    if (flowTab === "outflow" || flowTab === "loss") return "outflow";
    return null;
  }, [flowTab]);

  const fetchData = useCallback(async () => {
    if (!fetchAction) return;
    setLoading(true);

    let params;
    if (typeof paramsBuilder === "function") {
      params = paramsBuilder({ activeRange, offset, apiFlowType }) || {};
    } else {
      const rangeMap = { week: "this_week", month: "this_month", year: "this_year" };
      let timeframeKey = rangeMap[activeRange] || "this_month";
      if (offset < 0) {
        if (activeRange === "month" && offset === -1) timeframeKey = "last_month";
        else if (activeRange === "year" && offset === -1) timeframeKey = "last_year";
      }

      params = buildDateRangeParams(
        timeframeKey,
        apiFlowType === "gain" ? "gain" : apiFlowType === "outflow" ? "loss" : null
      );

      if (offset !== 0 && offset !== -1) {
        params.rangeType = activeRange;
        params.offset = offset;
        delete params.fromDate;
        delete params.toDate;
      }
    }

    const result = await dispatch(fetchAction(params));
    if (result?.success) {
      setRawData(result.data);
    }
    setLoading(false);
  }, [
    dispatch,
    fetchAction,
    activeRange,
    offset,
    paramsBuilder,
    ...(refetchOnFlowTabChange ? [apiFlowType] : []),
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goNext = useCallback(() => setOffset((o) => o + 1), [setOffset]);
  const goPrev = useCallback(() => setOffset((o) => o - 1), [setOffset]);
  const resetOffset = useCallback(() => setOffset(0), [setOffset]);

  const rangeLabel = useMemo(() => {
    if (offset === 0) {
      const labels = { week: "This Week", month: "This Month", year: "This Year" };
      return labels[activeRange] || "This Month";
    }
    const now = new Date();
    if (activeRange === "month") {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return d.toLocaleDateString("en", { month: "long", year: "numeric" });
    }
    if (activeRange === "year") {
      return String(now.getFullYear() + offset);
    }
    return `${offset > 0 ? "+" : ""}${offset} ${activeRange}s`;
  }, [activeRange, offset]);

  return {
    activeRange,
    setActiveRange,
    offset,
    setOffset,
    flowTab,
    setFlowTab,
    loading,
    rawData,
    rangeLabel,
    rangeOptions: RANGE_OPTIONS,
    goNext,
    goPrev,
    resetOffset,
    refresh: fetchData,
  };
}
