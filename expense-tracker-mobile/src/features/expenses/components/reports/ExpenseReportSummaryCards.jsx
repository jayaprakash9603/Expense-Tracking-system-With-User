import { Wallet, Trophy, BarChart3, Hash } from "lucide-react";
import { SummaryCard, SummaryCardGrid } from "@/shared/components/display/SummaryCard";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ExpenseReportSummaryCards({ reportCards }) {
  const { t } = useLanguage();
  const c = reportCards;

  return (
    <SummaryCardGrid>
      <SummaryCard
        title={t("reports.expenseReportCards.totalSpending")}
        rawAmount={c.totalSpending.rawAmount}
        percentage={c.totalSpending.percentage}
        trendDirection={c.totalSpending.trendDirection}
        sparklineData={c.totalSpending.sparklineData}
        icon={Wallet}
        variant="blue"
      />
      <SummaryCard
        title={t("reports.expenseReportCards.topExpenseName")}
        value={c.topExpense.value}
        percentage={c.topExpense.percentage}
        trendDirection={c.topExpense.trendDirection}
        sparklineData={c.topExpense.sparklineData}
        icon={Trophy}
        variant="purple"
      />
      <SummaryCard
        title={t("reports.expenseReportCards.avgTransaction")}
        rawAmount={c.avgTransaction.rawAmount}
        percentage={c.avgTransaction.percentage}
        trendDirection={c.avgTransaction.trendDirection}
        sparklineData={c.avgTransaction.sparklineData}
        icon={BarChart3}
        variant="amber"
      />
      <SummaryCard
        title={t("reports.expenseReportCards.totalTransactions")}
        value={c.totalTransactions.value}
        percentage={c.totalTransactions.percentage}
        trendDirection={c.totalTransactions.trendDirection}
        sparklineData={c.totalTransactions.sparklineData}
        icon={Hash}
        variant="rose"
      />
    </SummaryCardGrid>
  );
}
