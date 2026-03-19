import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toChartDataByCategory, toDailySpendingAreaData, toCashFlowBarData, toMonthlyTrendData } from "@/domain/expenses/expense.transformers";
import { buildChartConfig, assignChartColorVars } from "@/shared/utils/chart/chartColors";

export function useReportCharts(type = "monthly") {
  const expenses = useSelector((state) => state.expenses?.list || []);
  const loading = useSelector((state) => state.expenses?.loading || false);

  const monthlyData = useMemo(() => toMonthlyTrendData(expenses), [expenses]);
  const monthlyConfig = useMemo(() => buildChartConfig(["total", "average"], ["Total", "Average"]), []);

  const categoryData = useMemo(() => assignChartColorVars(toChartDataByCategory(expenses)), [expenses]);
  const categoryConfig = useMemo(() => {
    return toChartDataByCategory(expenses).reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [expenses]);

  const dailyData = useMemo(() => toDailySpendingAreaData(expenses), [expenses]);
  const dailyConfig = useMemo(() => buildChartConfig(["expense", "income"], ["Expense", "Income"]), []);

  const cashFlowData = useMemo(() => toCashFlowBarData(expenses, "month"), [expenses]);
  const cashFlowConfig = useMemo(() => buildChartConfig(["income", "expense"], ["Income", "Expense"]), []);

  return {
    loading,
    monthly: { data: monthlyData, config: monthlyConfig },
    category: { data: categoryData, config: categoryConfig },
    daily: { data: dailyData, config: dailyConfig },
    cashFlow: { data: cashFlowData, config: cashFlowConfig },
  };
}
