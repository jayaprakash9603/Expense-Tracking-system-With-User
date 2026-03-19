import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toChartDataByCategory, toDailySpendingAreaData } from "@/domain/expenses/expense.transformers";
import { buildChartConfig, assignChartColorVars } from "@/shared/utils/chart/chartColors";

export function useExpenseCharts() {
  const expenses = useSelector((state) => state.expenses?.list || []);
  const loading = useSelector((state) => state.expenses?.loading || false);

  const dailyData = useMemo(() => toDailySpendingAreaData(expenses), [expenses]);
  const dailyConfig = useMemo(() => buildChartConfig(["expense", "income"], ["Expense", "Income"]), []);

  const categoryData = useMemo(() => assignChartColorVars(toChartDataByCategory(expenses)), [expenses]);
  const categoryConfig = useMemo(() => {
    const raw = toChartDataByCategory(expenses);
    return raw.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [expenses]);

  return {
    loading,
    daily: { data: dailyData, config: dailyConfig },
    category: { data: categoryData, config: categoryConfig },
  };
}
