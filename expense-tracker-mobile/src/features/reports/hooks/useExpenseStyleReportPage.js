import { useCallback, useState } from "react";
import { useExpenseReportApiData } from "@/features/expenses/hooks/reports/useExpenseReportApiData";
import { useExpenseReportsPageDateState } from "@/features/expenses/hooks/reports/useExpenseReportsPageDateState";
import { useExpenseReportsHeaderActions } from "@/features/expenses/hooks/reports/useExpenseReportsHeaderActions";
import { useExpenseReportChartModels } from "@/features/expenses/hooks/reports/useExpenseReportChartModels";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";

export function useExpenseStyleReportPage() {
  const dates = useExpenseReportsPageDateState();
  const [timeframe, setTimeframe] = useState("this_month");
  const [flowType, setFlowType] = useState("all");
  const [refreshSignal, setRefreshSignal] = useState(0);

  const { handleHeaderTimeframeChange, handleHeaderFlowChange, handleExport } = useExpenseReportsHeaderActions({
    fromDate: dates.fromDate,
    toDate: dates.toDate,
    isCustomRange: dates.isCustomRange,
    dailyTimeframe: timeframe,
    dailyFlowType: flowType,
    setDailyTimeframe: setTimeframe,
    setCategoryTimeframe: setTimeframe,
    setPaymentTimeframe: setTimeframe,
    setDailyFlowType: setFlowType,
    setCategoryFlowType: setFlowType,
    setPaymentFlowType: setFlowType,
  });

  const api = useExpenseReportApiData({
    useCustomRange: dates.isCustomRange,
    customFrom: dates.fromDate,
    customTo: dates.toDate,
    dailyTimeframe: timeframe,
    dailyFlowType: flowType,
    categoryTimeframe: timeframe,
    categoryFlowType: flowType,
    paymentTimeframe: timeframe,
    paymentFlowType: flowType,
    refreshSignal,
  });

  const onRefresh = useCallback(() => setRefreshSignal((n) => n + 1), []);

  const chartModels = useExpenseReportChartModels({
    reportCards: api.reportCards,
    dailySpending: api.dailySpending,
    category: api.category,
    payment: api.payment,
    viewFilters: DEFAULT_EXPENSE_REPORT_VIEW_FILTERS,
    dailyFlowType: flowType,
  });

  return {
    dates,
    timeframe,
    flowType,
    handleHeaderTimeframeChange,
    handleHeaderFlowChange,
    handleExport,
    onRefresh,
    api,
    ...chartModels,
  };
}
