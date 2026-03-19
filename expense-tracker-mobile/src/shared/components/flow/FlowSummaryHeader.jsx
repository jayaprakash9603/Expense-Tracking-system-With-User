import React from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function FlowSummaryHeader({ totals, className }) {
  const { format: formatMoney } = useMoneyFormatter();
  const { t } = useLanguage();

  const income = totals?.income ?? totals?.inflow ?? 0;
  const expense = totals?.expense ?? totals?.outflow ?? 0;
  const net = income - expense;

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      <SummaryItem
        icon={TrendingUp}
        label={t("dashboard.gain")}
        amount={income}
        formatMoney={formatMoney}
        color="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <SummaryItem
        icon={TrendingDown}
        label={t("dashboard.loss")}
        amount={expense}
        formatMoney={formatMoney}
        color="text-red-500"
        bgColor="bg-red-500/10"
      />
      <SummaryItem
        icon={Wallet}
        label={t("analytics.net")}
        amount={Math.abs(net)}
        formatMoney={formatMoney}
        color={net >= 0 ? "text-emerald-500" : "text-red-500"}
        bgColor={net >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        prefix={net >= 0 ? "+" : "-"}
      />
    </div>
  );
}

function SummaryItem({ icon: Icon, label, amount, formatMoney, color, bgColor, prefix }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-card border p-3">
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", bgColor)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold", color)}>
        {prefix}{formatMoney(amount)}
      </p>
    </div>
  );
}
