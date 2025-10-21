import { useState, useEffect, useCallback } from "react";
import { fetchPaymentSummary } from "../utils/Api";
import { buildReportParams } from "../utils/reportParams";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodsData, setMethodsData] = useState([]);
  const [txSizeData, setTxSizeData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchData = useCallback(
    async (tf = timeframe, fl = flowType) => {
      try {
        setLoading(true);
        setError("");
        const params = buildReportParams({
          timeframe: tf,
          flowType: fl,
          friendId,
        });
        const raw = await fetchPaymentSummary(params);
        const {
          methodsData: mData,
          txSizeData: txBins,
          categoryBreakdown: catBreak,
          categories: cats,
        } = assemblePaymentReport(raw, fl, DEFAULT_COLORS);
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
    [friendId, timeframe, flowType]
  );

  useEffect(() => {
    fetchData();
  }, [friendId, fetchData]);

  return {
    timeframe,
    flowType,
    setTimeframe: (tf) => {
      setTimeframe(tf);
      fetchData(tf, flowType);
    },
    setFlowType: (fl) => {
      setFlowType(fl);
      fetchData(timeframe, fl);
    },
    loading,
    error,
    methodsData,
    txSizeData,
    categoryBreakdown,
    categories,
    refresh: () => fetchData(),
  };
}
