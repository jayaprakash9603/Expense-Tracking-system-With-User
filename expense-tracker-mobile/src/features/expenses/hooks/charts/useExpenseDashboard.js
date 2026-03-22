import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDailySpendingAction, fetchCashflowAction } from "@/redux/expenses/expenses.actions";
import { selectDailySpending, selectCashflow, selectExpenseList, selectExpenseLoading } from "@/redux/selectors";
import { getMonthlyTotal, getWeeklyTotal, getTopCategories } from "@/domain/expenses/expense.rules";
import { toChartDataByCategory, toChartDataByDate } from "@/domain/expenses/expense.transformers";

export function useExpenseDashboard() {
  const dispatch = useDispatch();
  const expenses = useSelector(selectExpenseList);
  const dailySpending = useSelector(selectDailySpending);
  const cashflow = useSelector(selectCashflow);
  const loading = useSelector(selectExpenseLoading);

  useEffect(() => {
    dispatch(fetchDailySpendingAction());
    dispatch(fetchCashflowAction());
  }, [dispatch]);

  return {
    expenses,
    dailySpending,
    cashflow,
    loading,
    monthlyTotal: getMonthlyTotal(expenses),
    weeklyTotal: getWeeklyTotal(expenses),
    topCategories: getTopCategories(expenses),
    categoryChartData: toChartDataByCategory(expenses),
    dateChartData: toChartDataByDate(expenses),
  };
}

export default useExpenseDashboard;
