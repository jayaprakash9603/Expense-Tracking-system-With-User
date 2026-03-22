import { useState } from "react";
import { DEFAULT_EXPENSE_REPORT_VIEW_FILTERS } from "@/features/expenses/constants/expenseReportViewFilterDefaults";

export function useExpenseReportsPageFilterState() {
  const [dailyTimeframe, setDailyTimeframe] = useState("this_month");
  const [dailyFlowType, setDailyFlowType] = useState("all");
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month");
  const [categoryFlowType, setCategoryFlowType] = useState("all");
  const [paymentTimeframe, setPaymentTimeframe] = useState("this_month");
  const [paymentFlowType, setPaymentFlowType] = useState("all");
  const [viewFilters, setViewFilters] = useState(() => ({ ...DEFAULT_EXPENSE_REPORT_VIEW_FILTERS }));

  return {
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
  };
}
