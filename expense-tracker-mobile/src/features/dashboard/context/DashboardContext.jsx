import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useDashboardFetch } from "@/features/dashboard/hooks/useDashboardFetch";
import { useApplicationOverview } from "@/features/dashboard/hooks/useApplicationOverview";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("loss");
  const [spendingTimeframe, setSpendingTimeframe] = useState("this_year");
  const [spendingType, setSpendingType] = useState("loss");
  const [paymentMethodsTimeframe, setPaymentMethodsTimeframe] = useState("this_month");
  const [paymentMethodsFlowType, setPaymentMethodsFlowType] = useState("loss");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useDashboardFetch(refreshKey, {
    spendingTimeframe,
    spendingType,
    categoryTimeframe,
    categoryFlowType,
    paymentMethodsTimeframe,
    paymentMethodsFlowType,
  });
  const { data: overviewData, loading: overviewLoading } = useApplicationOverview(refreshKey);

  const value = useMemo(() => ({
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    spendingTimeframe,
    setSpendingTimeframe,
    spendingType,
    setSpendingType,
    paymentMethodsTimeframe,
    setPaymentMethodsTimeframe,
    paymentMethodsFlowType,
    setPaymentMethodsFlowType,
    refreshKey,
    forceRefresh,
    overviewData,
    overviewLoading,
  }), [
    categoryTimeframe, categoryFlowType,
    spendingTimeframe, spendingType,
    paymentMethodsTimeframe, paymentMethodsFlowType,
    refreshKey, forceRefresh, overviewData, overviewLoading,
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext must be used within DashboardProvider");
  return ctx;
}
