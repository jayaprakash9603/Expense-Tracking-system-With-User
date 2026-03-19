import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { AppCard } from "@/shared/components/AppCard";
import { AppIconBox } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";

const STAT_ICONS = {
  monthly: Calendar,
  weekly: TrendingUp,
  daily: DollarSign,
  savings: TrendingDown,
};

export function ExpenseStats({ stats = [] }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();

  return (
    <>
      {stats.map((stat, index) => {
        const Icon = STAT_ICONS[stat.type] || DollarSign;
        return (
          <AppCard key={index} className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <AppIconBox icon={Icon} color="primary" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">{t(stat.label)}</p>
                <p className="text-lg font-bold">{format(stat.value)}</p>
              </div>
            </div>
          </AppCard>
        );
      })}
    </>
  );
}

export default ExpenseStats;
