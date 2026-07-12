import { useCallback } from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { runExpenseReportExport } from "@/features/expenses/utils/expenseReportExport";

export function useExpenseReportsHeaderActions({
  fromDate,
  toDate,
  isCustomRange,
  dailyTimeframe,
  dailyFlowType,
  setDailyTimeframe,
  setCategoryTimeframe,
  setPaymentTimeframe,
  setDailyFlowType,
  setCategoryFlowType,
  setPaymentFlowType,
}) {
  const { t } = useLanguage();

  const handleHeaderTimeframeChange = useCallback(
    (value) => {
      setDailyTimeframe(value);
      setCategoryTimeframe(value);
      setPaymentTimeframe(value);
    },
    [setDailyTimeframe, setCategoryTimeframe, setPaymentTimeframe],
  );

  const handleHeaderFlowChange = useCallback(
    (value) => {
      setDailyFlowType(value);
      setCategoryFlowType(value);
      setPaymentFlowType(value);
    },
    [setDailyFlowType, setCategoryFlowType, setPaymentFlowType],
  );

  const handleExport = useCallback(async () => {
    await runExpenseReportExport({
      fromDate,
      toDate,
      isCustomRange,
      dailyTimeframe,
      dailyFlowType,
      errorMessage: t("common.error"),
    });
  }, [fromDate, toDate, isCustomRange, dailyTimeframe, dailyFlowType, t]);

  return {
    handleHeaderTimeframeChange,
    handleHeaderFlowChange,
    handleExport,
  };
}
