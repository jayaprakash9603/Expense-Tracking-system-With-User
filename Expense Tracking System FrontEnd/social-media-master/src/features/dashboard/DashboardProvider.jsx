import React, { createContext, useContext, useState, useCallback } from "react";
import useAnalyticsSummary from "../../hooks/useAnalyticsSummary";
import useCategoryDistributionData from "../../hooks/useCategoryDistributionData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import useMonthlyTrendData from "../../hooks/useMonthlyTrendData";
import useDailySpendingData from "../../hooks/useDailySpendingData";

// Dashboard context holds UI selection state + aggregated hook outputs.
const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  // Selection states (centralized)
  const [timeframe, setTimeframe] = useState("this_month"); // daily + summary timeframe
  const [dailyType, setDailyType] = useState("loss");
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("loss");
  const [paymentMethodsTimeframe, setPaymentMethodsTimeframe] =
    useState("this_month");
  const [paymentMethodsFlowType, setPaymentMethodsFlowType] = useState("loss");
  const currentYear = new Date().getFullYear();
  const [trendYear, setTrendYear] = useState(currentYear);
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Data hooks wired to shared refreshKey
  const {
    summary: analyticsSummary,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalyticsSummary({ timeframe, refreshTrigger: refreshKey });
  const {
    distribution: categoryDistribution,
    loading: categoryLoading,
    error: categoryError,
  } = useCategoryDistributionData({
    timeframe: categoryTimeframe,
    flowType: categoryFlowType,
    refreshTrigger: refreshKey,
  });
  const {
    data: paymentMethodsData,
    rawData: paymentMethodsRawData,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = usePaymentMethodsData({
    timeframe: paymentMethodsTimeframe,
    flowType: paymentMethodsFlowType,
    refreshTrigger: refreshKey,
  });
  const {
    data: dailySpendingData,
    loading: dailySpendingLoading,
    error: dailySpendingError,
  } = useDailySpendingData({
    initialTimeframe: timeframe,
    initialType: dailyType,
    refreshTrigger: refreshKey,
  });
  const {
    data: monthlyTrendData,
    loading: monthlyTrendLoading,
    error: monthlyTrendError,
  } = useMonthlyTrendData({ year: trendYear, refreshTrigger: refreshKey });

  const value = {
    // selections
    timeframe,
    setTimeframe,
    dailyType,
    setDailyType,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    trendYear,
    setTrendYear,
    refreshKey,
    forceRefresh,
    currentYear,
    // data & loading
    analyticsSummary,
    analyticsLoading,
    analyticsError,
    categoryDistribution,
    categoryLoading,
    categoryError,
    paymentMethodsData,
    paymentMethodsRawData,
    paymentMethodsLoading,
    paymentMethodsError,
    dailySpendingData,
    dailySpendingLoading,
    dailySpendingError,
    monthlyTrendData,
    monthlyTrendLoading,
    monthlyTrendError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error(
      "useDashboardContext must be used within DashboardProvider"
    );
  return ctx;
}
