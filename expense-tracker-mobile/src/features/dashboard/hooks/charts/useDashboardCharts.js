import { useMemo } from "react";
import { useSelector } from "react-redux";
import { toDailySpendingAreaData, toMonthlyTrendData } from "@/domain/expenses/expense.transformers";
import { assignChartColorVars } from "@/shared/utils/chart/chartColors";
import {
  normalizeCategoryDistribution,
  normalizePaymentMethodDistribution,
} from "@/shared/utils/chart/dataTransformers";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import {
  aggregateDailyToMonthlyBuckets,
  buildMonthlyComparisonRows,
  normalizeCashflowResponse,
  normalizeDashboardExpense,
  shouldDashboardUseMonthlyView,
} from "@/features/dashboard/utils/dashboardChartHelpers";

const LOSS_COLOR = "hsl(0, 84%, 60%)";
const GAIN_COLOR = "hsl(142, 71%, 45%)";

export function useDashboardCharts() {
  const rawExpenses = useSelector((state) => state.expenses?.list || []);
  const apiDailySpending = useSelector((state) => state.expenses?.dailySpending);
  const apiCategoryDistribution = useSelector((state) => state.expenses?.categoryDistribution);
  const apiPaymentMethodDistribution = useSelector((state) => state.expenses?.paymentMethodDistribution);
  const loading = useSelector((state) => state.expenses?.loading || false);
  const categoryLoading = useSelector((state) => state.expenses?.categoryDistributionLoading || false);
  const paymentMethodLoading = useSelector((state) => state.expenses?.paymentMethodDistributionLoading || false);

  const { spendingType, spendingTimeframe } = useDashboardContext();

  const expenses = useMemo(() => rawExpenses.map(normalizeDashboardExpense), [rawExpenses]);

  const spendingTrendData = useMemo(() => {
    let dailyData = normalizeCashflowResponse(apiDailySpending);
    if (dailyData.length === 0) {
      dailyData = toDailySpendingAreaData(expenses).filter((d) => d.expense > 0 || d.income > 0);
    }

    if (shouldDashboardUseMonthlyView(spendingTimeframe) && dailyData.length > 0) {
      const labelWithYear = spendingTimeframe === "all_time" || spendingTimeframe === "last_year";
      return aggregateDailyToMonthlyBuckets(dailyData, labelWithYear);
    }

    return dailyData;
  }, [apiDailySpending, expenses, spendingTimeframe]);

  const spendingTrendConfig = useMemo(() => {
    const color = spendingType === "gain" ? GAIN_COLOR : LOSS_COLOR;
    return {
      expense: { label: spendingType === "gain" ? "Income" : "Expense", color },
    };
  }, [spendingType]);

  const categoryData = useMemo(() => {
    const items = normalizeCategoryDistribution(apiCategoryDistribution);
    return assignChartColorVars(items);
  }, [apiCategoryDistribution]);

  const categoryConfig = useMemo(() => {
    const items = normalizeCategoryDistribution(apiCategoryDistribution);
    return items.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [apiCategoryDistribution]);

  const paymentMethodData = useMemo(() => {
    const items = normalizePaymentMethodDistribution(apiPaymentMethodDistribution);
    return assignChartColorVars(items);
  }, [apiPaymentMethodDistribution]);

  const paymentMethodConfig = useMemo(() => {
    const items = normalizePaymentMethodDistribution(apiPaymentMethodDistribution);
    return items.reduce((cfg, item, i) => {
      cfg[item.name] = { label: item.name, color: `hsl(var(--chart-${(i % 10) + 1}))` };
      return cfg;
    }, {});
  }, [apiPaymentMethodDistribution]);

  const monthlyData = useMemo(() => {
    let dailyData = normalizeCashflowResponse(apiDailySpending);
    if (dailyData.length === 0) {
      dailyData = toDailySpendingAreaData(expenses).map((d) => ({
        date: d.date,
        expense: d.expense,
        expenses: [],
      }));
    }
    if (dailyData.length > 0) {
      const rows = buildMonthlyComparisonRows(dailyData);
      if (rows.some((r) => r.total > 0)) return rows;
    }
    return toMonthlyTrendData(expenses);
  }, [apiDailySpending, expenses]);

  const monthlyConfig = useMemo(
    () => ({
      total: { label: "Total", color: "hsl(var(--chart-1))" },
      average: { label: "Average", color: "hsl(var(--chart-2))" },
    }),
    [],
  );

  return {
    loading,
    categoryLoading,
    paymentMethodLoading,
    spendingTrend: { data: spendingTrendData, config: spendingTrendConfig },
    categoryBreakdown: { data: categoryData, config: categoryConfig },
    paymentMethodBreakdown: { data: paymentMethodData, config: paymentMethodConfig },
    monthlyComparison: { data: monthlyData, config: monthlyConfig },
  };
}
