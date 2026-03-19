import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Wallet, CreditCard, Receipt, PiggyBank } from "lucide-react";

export function useOverviewData() {
  const expenses = useSelector((state) => state.expenses);
  const budgets = useSelector((state) => state.budgets);
  const bills = useSelector((state) => state.bills);

  const loading = expenses?.loading || budgets?.loading || bills?.loading;

  const cards = useMemo(() => {
    const totalExpenses = expenses?.stats?.totalExpenses || 0;
    const monthlySpending = expenses?.stats?.monthlySpending || 0;
    const creditDue = Math.abs(bills?.stats?.totalCreditDue || 0);
    const billsPaid = bills?.stats?.totalPaid || 0;

    return [
      {
        key: "total-balance",
        titleKey: "analytics.totalBalance",
        rawAmount: totalExpenses,
        icon: Wallet,
        variant: "blue",
        percentage: "+50.5%",
        trendDirection: "up",
        trendLabelKey: "analytics.moreThanLastMonth",
        sparklineData: [5, 6, 4, 7, 8, 5, 9],
      },
      {
        key: "monthly-spending",
        titleKey: "analytics.monthlySpending",
        rawAmount: monthlySpending,
        icon: Receipt,
        variant: "emerald",
        percentage: "-97.4%",
        trendDirection: "down",
        trendLabelKey: "analytics.lessThanLastMonth",
        sparklineData: [9, 8, 7, 9, 6, 5, 4],
      },
      {
        key: "credit-due",
        titleKey: "analytics.creditDue",
        rawAmount: creditDue,
        icon: CreditCard,
        variant: "amber",
        percentage: "+112.2%",
        trendDirection: "up",
        trendLabelKey: "analytics.moreThanLastMonth",
        sparklineData: [2, 3, 2, 4, 3, 5, 6],
      },
      {
        key: "bills-paid",
        titleKey: "analytics.billsPaid",
        rawAmount: billsPaid,
        icon: PiggyBank,
        variant: "rose",
        percentage: "-11.7%",
        trendDirection: "down",
        trendLabelKey: "analytics.lessThanPrevious",
        sparklineData: [4, 3, 5, 7, 6, 8, 9],
      },
    ];
  }, [expenses?.stats, bills?.stats]);

  return { cards, loading };
}

export default useOverviewData;
