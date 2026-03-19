import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppButton } from "@/shared/components/form/AppButton";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export function RecentTransactions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { format, animation } = usePresentation();
  const { recentTransactions } = useDashboardData();

  return (
    <AppCard className="h-full">
      <AppCard.Header>
        <SectionHeader icon={Clock} title={t("dashboard.recentTransactions")}>
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => navigate("/expenses")}
          >
            {t("dashboard.viewAll")}
          </AppButton>
        </SectionHeader>
      </AppCard.Header>
      <AppCard.Content>
        {recentTransactions.length === 0 ? (
          <EmptyState
            title={t("dashboard.noExpenses")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                format={format}
                animated={animation.enabled}
                onClick={() => navigate(`/expenses/${tx.id}`)}
              />
            ))}
          </div>
        )}
      </AppCard.Content>
    </AppCard>
  );
}

function TransactionRow({ transaction, format, animated, onClick }) {
  const amount = Number(transaction.amount || transaction.expenseAmount || 0);
  const type = transaction.type || "";
  const isIncome = type === "INCOME" || type === "GAIN";
  const displayAmount = isIncome
    ? `+${format(Math.abs(amount))}`
    : `-${format(Math.abs(amount))}`;
  const name = transaction.name || transaction.itemName || transaction.expenseName || transaction.title || "";
  const category = transaction.category || transaction.categoryName || transaction.subtitle || "";
  const date = transaction.date || transaction.expenseDate || "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg border border-border cursor-pointer",
        animated && "transition-all duration-150 hover:bg-muted/50",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {category} &middot; {date}
        </p>
      </div>
      <span className={cn(
        "text-sm font-semibold whitespace-nowrap",
        isIncome ? "text-emerald-500" : "text-red-500"
      )}>
        {displayAmount}
      </span>
    </div>
  );
}

export default RecentTransactions;
