import { useState, useEffect, useCallback } from "react";
import { fetchPaymentSummary } from "../utils/Api";
import { buildReportParams, computeDateRange } from "../utils/reportParams";
import { assemblePaymentReport } from "../utils/paymentReportData";

const DEFAULT_COLORS = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#ffd166",
  "#f77f00",
  "#e63946",
  "#073b4c",
  "#fcbf49",
  "#f95738",
  "#a8dadc",
  "#457b9d",
  "#1d3557",
];

export default function usePaymentReportData({
  friendId,
  initialTimeframe = "month",
  initialFlowType = "all",
}) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [flowType, setFlowType] = useState(initialFlowType);
  const [dateRange, setDateRange] = useState(() =>
    computeDateRange(initialTimeframe)
  );
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodsData, setMethodsData] = useState([]);
  const [txSizeData, setTxSizeData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchData = useCallback(
    async ({ nextTimeframe, nextFlowType, nextRange } = {}) => {
      const resolvedTimeframe = nextTimeframe ?? timeframe;
      const resolvedFlowType = nextFlowType ?? flowType;
      const resolvedRange = nextRange ?? dateRange;

      try {
        setLoading(true);
        setError("");
        const params = buildReportParams({
          timeframe: resolvedTimeframe,
          flowType: resolvedFlowType,
          friendId,
        });
        if (resolvedRange?.fromDate && resolvedRange?.toDate) {
          params.fromDate = resolvedRange.fromDate;
          params.toDate = resolvedRange.toDate;
        }
        const raw = await fetchPaymentSummary(params);
        const {
          methodsData: mData,
          txSizeData: txBins,
          categoryBreakdown: catBreak,
          categories: cats,
        } = assemblePaymentReport(raw, resolvedFlowType, DEFAULT_COLORS);
        setMethodsData(mData);
        setTxSizeData(txBins);
        setCategoryBreakdown(catBreak);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load payment report:", err);
        setError(
          err?.response?.data?.message || err.message || "Failed to load data"
        );
        setMethodsData([]);
        setTxSizeData([]);
        setCategoryBreakdown([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    },
    [friendId, timeframe, flowType, dateRange]
  );

  useEffect(() => {
    fetchData();
  }, [friendId, fetchData]);

  const handleTimeframeChange = useCallback((tf) => {
    setTimeframe(tf);
    setDateRange(computeDateRange(tf));
    setIsCustomRange(false);
  }, []);

  const handleFlowTypeChange = useCallback((fl) => {
    setFlowType(fl);
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
    setDateRange(computeDateRange(timeframe));
    setIsCustomRange(false);
  }, [timeframe]);

  return {
    timeframe,
    flowType,
    dateRange,
    isCustomRange,
    setTimeframe: handleTimeframeChange,
    setFlowType: handleFlowTypeChange,
    setCustomDateRange,
    resetDateRange,
    loading,
    error,
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
    refresh: () => fetchData(),
  };
}
