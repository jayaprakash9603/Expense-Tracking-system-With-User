import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Receipt } from "lucide-react";
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
    <AppCard className="flex h-full min-h-0 flex-col">
      <AppCard.Header className="shrink-0">
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
      <AppCard.Content className="flex min-h-0 flex-1 flex-col pt-0">
        {recentTransactions.length === 0 ? (
          <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="col-span-full flex min-h-[min(16rem,45vh)] w-full flex-1 items-center justify-center sm:col-span-2 sm:min-h-[17rem]">
              <EmptyState
                icon={Receipt}
                title={t("dashboard.noExpenses")}
                className="w-full max-w-none justify-center px-4 py-6 sm:py-8 md:py-10"
              />
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
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
