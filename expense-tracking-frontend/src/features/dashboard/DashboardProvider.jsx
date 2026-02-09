import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import useAnalyticsSummary from "../../hooks/useAnalyticsSummary";
import useCategoryDistributionData from "../../hooks/useCategoryDistributionData";
import usePaymentMethodsData from "../../hooks/usePaymentMethodsData";
import useMonthlyTrendData from "../../hooks/useMonthlyTrendData";
import useDailySpendingData from "../../hooks/useDailySpendingData";
import { useDashboardLayout } from "../../hooks/useDashboardLayout";

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

  // Dashboard layout configuration - get this first to determine which APIs to skip
  const layoutConfig = useDashboardLayout();

  // Check which sections are visible to optimize API calls
  const allSectionsHidden = layoutConfig.visibleSections.length === 0;
  const sectionVisibility = useMemo(
    () => ({
      category: layoutConfig.visibleSections.some(
        (s) => s.id === "category-breakdown"
      ),
      payment: layoutConfig.visibleSections.some(
        (s) => s.id === "payment-methods"
      ),
      daily: layoutConfig.visibleSections.some(
        (s) => s.id === "daily-spending"
      ),
      monthlyTrend: layoutConfig.visibleSections.some(
        (s) => s.id === "monthly-trend"
      ),
      // These sections use analyticsSummary
      needsAnalytics: layoutConfig.visibleSections.some((s) =>
        [
          "metrics",
          "recent-transactions",
          "budget-overview",
          "summary-overview",
        ].includes(s.id)
      ),
    }),
    [layoutConfig.visibleSections]
  );

  // Data hooks wired to shared refreshKey - skip when section not visible
  const {
    summary: analyticsSummary,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalyticsSummary({
    timeframe,
    refreshTrigger: refreshKey,
    skip: allSectionsHidden || !sectionVisibility.needsAnalytics,
  });
  const {
    distribution: categoryDistribution,
    loading: categoryLoading,
    error: categoryError,
  } = useCategoryDistributionData({
    timeframe: categoryTimeframe,
    flowType: categoryFlowType,
    refreshTrigger: refreshKey,
    skip: allSectionsHidden || !sectionVisibility.category,
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
    skip: allSectionsHidden || !sectionVisibility.payment,
  });
  const {
    data: dailySpendingData,
    loading: dailySpendingLoading,
    error: dailySpendingError,
  } = useDailySpendingData({
    initialTimeframe: timeframe,
    initialType: dailyType,
    refreshTrigger: refreshKey,
    skip: allSectionsHidden || !sectionVisibility.daily,
  });
  const {
    data: monthlyTrendData,
    loading: monthlyTrendLoading,
    error: monthlyTrendError,
  } = useMonthlyTrendData({
    year: trendYear,
    refreshTrigger: refreshKey,
    skip: allSectionsHidden || !sectionVisibility.monthlyTrend,
  });

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
    // layout configuration
    layoutConfig,
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
