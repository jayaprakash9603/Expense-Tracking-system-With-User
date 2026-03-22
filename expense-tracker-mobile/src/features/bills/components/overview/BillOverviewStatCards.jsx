import { Wallet, Trophy, BarChart3, Hash } from "lucide-react";
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

export function BillOverviewStatCards({ stats, loading, className }) {
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
        title={t("bills.overviewStat.totalBills")}
        value={String(c.allCount ?? 0)}
        sparklineData={toSparklineSeries(c.sparkBills)}
        icon={Wallet}
        variant="blue"
      />
      <SummaryCard
        title={t("bills.overviewStat.incomeTotal")}
        rawAmount={c.incomeSum ?? 0}
        sparklineData={toSparklineSeries(c.sparkIncome)}
        icon={Trophy}
        variant="purple"
      />
      <SummaryCard
        title={t("bills.overviewStat.expenseTotal")}
        rawAmount={c.expenseSum ?? 0}
        sparklineData={toSparklineSeries(c.sparkExpense)}
        icon={BarChart3}
        variant="amber"
      />
      <SummaryCard
        title={t("bills.overviewStat.netFlow")}
        rawAmount={c.netSum ?? 0}
        sparklineData={toSparklineSeries(c.sparkNet)}
        icon={Hash}
        variant="rose"
      />
    </SummaryCardGrid>
  );
}
