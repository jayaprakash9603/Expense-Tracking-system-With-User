import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toChartDataByCategory, toDailySpendingAreaData, toCashFlowBarData, toMonthlyTrendData } from "@/domain/expenses/expense.transformers";
import { buildChartConfig, assignChartColorVars } from "@/shared/utils/chart/chartColors";

export function useDashboardCharts() {
  const expenses = useSelector((state) => state.expenses?.list || []);
  const loading = useSelector((state) => state.expenses?.loading || false);

  const spendingTrendData = useMemo(() => toDailySpendingAreaData(expenses), [expenses]);
  const spendingTrendConfig = useMemo(() => buildChartConfig(["income", "expense"], ["Income", "Expense"]), []);

  const categoryData = useMemo(() => {
    const raw = toChartDataByCategory(expenses);
    return assignChartColorVars(raw);
  }, [expenses]);
  const categoryConfig = useMemo(() => {
    const raw = toChartDataByCategory(expenses);
    return raw.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [expenses]);

  const monthlyData = useMemo(() => toMonthlyTrendData(expenses), [expenses]);
  const monthlyConfig = useMemo(() => buildChartConfig(["total", "average"], ["Total", "Average"]), []);

  const cashFlowData = useMemo(() => toCashFlowBarData(expenses, "month"), [expenses]);
  const cashFlowConfig = useMemo(() => buildChartConfig(["income", "expense"], ["Income", "Expense"]), []);

  return {
    loading,
    spendingTrend: { data: spendingTrendData, config: spendingTrendConfig },
    categoryBreakdown: { data: categoryData, config: categoryConfig },
    monthlyComparison: { data: monthlyData, config: monthlyConfig },
    cashFlow: { data: cashFlowData, config: cashFlowConfig },
  };
}
