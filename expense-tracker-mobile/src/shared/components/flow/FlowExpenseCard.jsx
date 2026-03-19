import React from "react";
import { ArrowUp, ArrowDown, Tag, CreditCard } from "lucide-react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

export function FlowExpenseCard({ expense, flowTab, onClick, className }) {
  const { format: formatMoney } = useMoneyFormatter();

  const type = flowTab === "all"
    ? (expense.type || "outflow")
    : flowTab;
  const isGain = !["outflow", "loss"].includes(type);
  const amountColor = isGain ? "text-emerald-500" : "text-red-500";
  const ArrowIcon = isGain ? ArrowUp : ArrowDown;

  const categoryName = expense.categoryName || expense.category || "Uncategorized";
  const paymentMethod = expense.paymentMethod || "Unknown";
  const comments = expense.comments || expense.description || "";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-2.5 sm:p-3 cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-1.5",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center min-w-0 border-b border-border pb-1.5">
        <span
          className="font-bold text-sm text-foreground truncate"
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

      <div className="flex items-center gap-1.5">
        <ArrowIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", amountColor)} />
        <span className={cn("text-sm sm:text-base font-bold", amountColor)}>
          {formatMoney(expense.amount)}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Tag className="h-3 w-3 shrink-0 text-primary" />
          <span className="truncate font-medium">{categoryName}</span>
        </div>
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <CreditCard className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{paymentMethod}</span>
        </div>
      </div>

      {comments && (
        <div
          className="text-xs text-muted-foreground border-t border-border pt-1 leading-relaxed"
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
