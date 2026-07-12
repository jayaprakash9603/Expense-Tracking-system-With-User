import React from "react";
import { ArrowUp, ArrowDown, Tag, CreditCard } from "lucide-react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

export function FlowExpenseCard({
  expense,
  flowTab,
  onClick,
  className,
  hideCategory = false,
  hidePaymentMethod = false,
}) {
  const { format: formatMoney } = useMoneyFormatter();

  const rawType = expense.type?.toLowerCase() || "outflow";
  const isGain =
    flowTab === "inflow" ||
    (flowTab === "all" && ["gain", "income", "inflow"].includes(rawType));
  const amountColor = isGain ? "text-emerald-500" : "text-red-500";
  const ArrowIcon = isGain ? ArrowUp : ArrowDown;

  const categoryName = expense.categoryName || expense.category || "Uncategorized";
  const paymentMethod = expense.paymentMethod || "Unknown";
  const comments = expense.comments || expense.description || "";

  return (
    <div
      className={cn(
        "flex w-full cursor-pointer flex-col gap-0.5 rounded-md border bg-card px-1.5 py-1 transition-shadow hover:shadow-md sm:px-2 sm:py-1.5",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex min-w-0 items-center border-b border-border pb-0.5">
        <span
          className="truncate text-xs font-bold text-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {expense.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ArrowIcon className={cn("h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5", amountColor)} />
        <span className={cn("text-xs font-bold sm:text-sm", amountColor)}>{formatMoney(expense.amount)}</span>
      </div>

      {(!hideCategory || !hidePaymentMethod) && (
        <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
          {!hideCategory ? (
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              <Tag className="h-2.5 w-2.5 shrink-0 text-primary sm:h-3 sm:w-3" />
              <span className="truncate font-medium">{categoryName}</span>
            </div>
          ) : null}
          {!hidePaymentMethod ? (
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              <CreditCard className="h-2.5 w-2.5 shrink-0 text-muted-foreground sm:h-3 sm:w-3" />
              <span className="truncate font-medium">{paymentMethod}</span>
            </div>
          ) : null}
        </div>
      )}

      {comments && (
        <div
          className="border-t border-border pt-0.5 text-[0.6875rem] leading-snug text-muted-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {comments}
        </div>
      )}
    </div>
  );
}
