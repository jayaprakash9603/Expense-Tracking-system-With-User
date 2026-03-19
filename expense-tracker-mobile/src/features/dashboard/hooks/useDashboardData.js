import { useMemo } from "react";
import { useSelector } from "react-redux";
import { sumAmounts } from "@/domain/shared/money";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";

export function useDashboardData() {
  const expenses = useSelector((s) => s.expenses);
  const budgets = useSelector((s) => s.budgets);
  const bills = useSelector((s) => s.bills);
  const friends = useSelector((s) => s.friends);

  let overviewData = null;
  let overviewLoading = false;
  try {
    const ctx = useDashboardContext();
    overviewData = ctx.overviewData;
    overviewLoading = ctx.overviewLoading;
  } catch {
    // useDashboardData can be used outside DashboardProvider -- fall back to Redux
  }

  const loading = overviewLoading || expenses?.loading || budgets?.loading || bills?.loading;

  const overview = useMemo(() => {
    if (overviewData) {
      const last10 = [...(expenses?.list || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      return {
        totalExpenses: overviewData.totalExpenses ?? 0,
        creditDue: Math.abs(overviewData.totalCreditDue ?? 0),
        activeBudgets: overviewData.activeBudgets ?? overviewData.totalBudgets ?? 0,
        friendsCount: overviewData.friendsCount ?? 0,
        groupsCount: overviewData.totalGroups ?? 0,
        avgDailySpend: overviewData.avgDailySpendLast30Days ?? 0,
        savingsRate: overviewData.savingsRateLast30Days ?? 0,
        upcomingBillsAmount: overviewData.upcomingBillsAmount ?? 0,
        topExpenses: overviewData.topExpenses ?? [],
        totalBudgetAmount: overviewData.totalBudgetAmount ?? 0,
        totalSpent: overviewData.totalLosses ?? 0,
        remainingBudget: overviewData.remainingBudget ?? 0,
        budgetUsedPercent: overviewData.totalBudgetAmount > 0
          ? Math.round(((overviewData.totalLosses ?? 0) / overviewData.totalBudgetAmount) * 100)
          : 0,
        recentTransactions: overviewData.lastTenExpenses ?? last10,
        upcomingBills: (bills?.upcoming || []).slice(0, 5),
      };
    }

    const expenseList = expenses?.list || [];
    const budgetList = budgets?.list || [];
    const billList = bills?.list || [];
    const friendList = friends?.list || [];

    const totalExpenses = sumAmounts(expenseList);
    const creditDue = sumAmounts(
      billList.filter((b) => b.status === "PENDING" || b.status === "OVERDUE")
    );
    const activeBudgets = budgetList.length;
    const friendsCount = friendList.length;
    const totalBudgetAmount = sumAmounts(budgetList);
    const totalSpent = sumAmounts(budgetList, "spent");
    const remainingBudget = totalBudgetAmount - totalSpent;
    const budgetUsedPercent = totalBudgetAmount > 0
      ? Math.round((totalSpent / totalBudgetAmount) * 100)
      : 0;

    const last10 = [...expenseList]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return {
      totalExpenses,
      creditDue,
      activeBudgets,
      friendsCount,
      groupsCount: 0,
      avgDailySpend: 0,
      savingsRate: 0,
      upcomingBillsAmount: 0,
      topExpenses: [],
      totalBudgetAmount,
      totalSpent,
      remainingBudget,
      budgetUsedPercent,
      recentTransactions: last10,
      upcomingBills: (bills?.upcoming || []).slice(0, 5),
    };
  }, [overviewData, expenses?.list, budgets?.list, bills?.list, bills?.upcoming, friends?.list]);

  return { ...overview, loading };
}
