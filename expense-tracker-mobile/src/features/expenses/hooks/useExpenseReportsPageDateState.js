import { useCallback, useMemo, useState } from "react";
import { getTimeframeDateRange } from "@/shared/utils/chart/timeframeResolver";
import { toYmd } from "@/features/expenses/utils/expenseReportsPageDateUtils";

export function useExpenseReportsPageDateState() {
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [fromDate, setFromDate] = useState(() => toYmd(getTimeframeDateRange("this_month").start));
  const [toDate, setToDate] = useState(() => toYmd(getTimeframeDateRange("this_month").end));

  const handleDateApply = useCallback(({ fromDate: from, toDate: to }) => {
    setFromDate(from);
    setToDate(to);
    setIsCustomRange(true);
  }, []);

  const handleDateReset = useCallback(() => {
    setIsCustomRange(false);
    const { start, end } = getTimeframeDateRange("this_month");
    setFromDate(toYmd(start));
    setToDate(toYmd(end));
  }, []);

  const dateRangeProps = useMemo(
    () => ({
      fromDate,
      toDate,
      onApply: handleDateApply,
      onReset: handleDateReset,
    }),
    [fromDate, toDate, handleDateApply, handleDateReset],
  );

  return {
    isCustomRange,
    fromDate,
    toDate,
    dateRangeProps,
  };
}
