import { PiggyBank, Wallet, BarChart3, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  SummaryCard,
  SummaryCardGrid,
  SummaryCardSkeleton,
} from "@/shared/components/display/SummaryCard";

function toSparklineSeries(values) {
  if (!values?.length) return [0, 0];
  const nums = values.map((v) => Number(v) || 0);
  return nums.length > 1 ? nums : [nums[0] ?? 0, nums[0] ?? 0];
}

export function BudgetOverviewStatCards({ stats, loading, className }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <SummaryCardGrid className={className}>
        <SummaryCardSkeleton variant="blue" />
        <SummaryCardSkeleton variant="purple" />
        <SummaryCardSkeleton variant="amber" />
        <SummaryCardSkeleton variant="rose" />
      </SummaryCardGrid>
    );
  }

  const c = stats ?? {};

  return (
    <SummaryCardGrid className={cn(className)}>
      <SummaryCard
        title={t("budgets.overviewStat.totalBudgets")}
        value={String(c.allCount ?? 0)}
        sparklineData={toSparklineSeries(c.sparkCount)}
        icon={PiggyBank}
        variant="blue"
      />
      <SummaryCard
        title={t("budgets.overviewStat.totalAllocated")}
        rawAmount={c.totalAllocated ?? 0}
        sparklineData={toSparklineSeries(c.sparkAllocated)}
        icon={Wallet}
        variant="purple"
      />
      <SummaryCard
        title={t("budgets.overviewStat.totalSpent")}
        rawAmount={c.totalSpent ?? 0}
        sparklineData={toSparklineSeries(c.sparkSpent)}
        icon={BarChart3}
        variant="amber"
      />
      <SummaryCard
        title={t("budgets.overviewStat.totalRemaining")}
        rawAmount={c.totalRemaining ?? 0}
        sparklineData={toSparklineSeries(c.sparkRemaining)}
        icon={Scale}
        variant="rose"
      />
    </SummaryCardGrid>
  );
}
