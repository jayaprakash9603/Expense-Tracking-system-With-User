import { useMemo } from "react";

export function usePaymentReportSummary(cashFlowData) {
  return useMemo(() => {
    const rows = cashFlowData || [];
    let totalIncome = 0;
    let totalExpense = 0;
    rows.forEach((r) => {
      totalIncome += Number(r.income) || 0;
      totalExpense += Number(r.expense) || 0;
    });
    const net = totalIncome - totalExpense;
    return {
      periodCount: rows.length,
      totalIncome,
      totalExpense,
      net,
    };
  }, [cashFlowData]);
}
