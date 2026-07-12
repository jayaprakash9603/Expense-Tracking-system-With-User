import { useExpenseReportApiData } from "./useExpenseReportApiData";
import { useExpenseReportsPageDateState } from "./useExpenseReportsPageDateState";
import { useExpenseReportsPageFilterState } from "./useExpenseReportsPageFilterState";
import { useExpenseReportsHeaderActions } from "./useExpenseReportsHeaderActions";

export function useExpenseReportsPageController() {
  const dates = useExpenseReportsPageDateState();
  const {
    dailyTimeframe,
    setDailyTimeframe,
    dailyFlowType,
    setDailyFlowType,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    paymentTimeframe,
    setPaymentTimeframe,
    paymentFlowType,
    setPaymentFlowType,
    viewFilters,
    setViewFilters,
  } = useExpenseReportsPageFilterState();

  const api = useExpenseReportApiData({
    useCustomRange: dates.isCustomRange,
    customFrom: dates.fromDate,
    customTo: dates.toDate,
    dailyTimeframe,
    dailyFlowType,
    categoryTimeframe,
    categoryFlowType,
    paymentTimeframe,
    paymentFlowType,
  });

  const { handleHeaderTimeframeChange, handleHeaderFlowChange, handleExport } = useExpenseReportsHeaderActions({
    fromDate: dates.fromDate,
    toDate: dates.toDate,
    isCustomRange: dates.isCustomRange,
    dailyTimeframe,
    dailyFlowType,
    setDailyTimeframe,
    setCategoryTimeframe,
    setPaymentTimeframe,
    setDailyFlowType,
    setCategoryFlowType,
    setPaymentFlowType,
  });

  return {
    dates,
    viewFilters,
    setViewFilters,
    dailyTimeframe,
    setDailyTimeframe,
    dailyFlowType,
    setDailyFlowType,
    categoryTimeframe,
    setCategoryTimeframe,
    categoryFlowType,
    setCategoryFlowType,
    paymentTimeframe,
    setPaymentTimeframe,
    paymentFlowType,
    setPaymentFlowType,
    api,
    handleHeaderTimeframeChange,
    handleHeaderFlowChange,
    handleExport,
  };
}
