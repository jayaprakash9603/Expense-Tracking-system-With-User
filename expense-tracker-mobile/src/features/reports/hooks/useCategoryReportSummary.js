import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toChartDataByCategory } from "@/domain/expenses/expense.transformers";

export function useCategoryReportSummary() {
  const expenses = useSelector((state) => state.expenses?.list || []);

  return useMemo(() => {
    const rows = toChartDataByCategory(expenses);
    const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0);
    const sorted = [...rows].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
    const top = sorted[0];
    const avg = rows.length > 0 ? total / rows.length : 0;
    return {
      categoryCount: rows.length,
      totalSpent: total,
      topCategoryName: top?.name || "—",
      topCategoryAmount: Number(top?.value) || 0,
      avgPerCategory: avg,
    };
  }, [expenses]);
}
