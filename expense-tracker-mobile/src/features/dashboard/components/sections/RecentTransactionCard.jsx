import React, { useMemo } from "react";
import { Button } from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";
import { buildRecentTransactionRow } from "@/features/dashboard/utils/buildRecentTransactionRow";

export function RecentTransactionCard({
  transaction,
  format,
  animated,
  onExpenseNavigate,
  onCategoryNavigate,
}) {
  const row = useMemo(() => buildRecentTransactionRow(transaction), [transaction]);
  const absFormatted = format(Math.abs(row.amount));
  const signPrefix = row.variant === "gain" ? "+" : "-";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border px-3 py-2",
        row.variant === "loss" && "bg-red-50 dark:bg-red-500/[0.06]",
        row.variant === "gain" && "bg-emerald-50 dark:bg-emerald-500/[0.06]",
        animated && "transition-colors duration-200",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base leading-none",
          row.variant === "loss" && "bg-muted",
          row.variant === "gain" && "bg-emerald-100 dark:bg-emerald-500/15",
        )}
        aria-hidden
      >
        {row.variant === "gain" ? "💰" : "💸"}
      </div>
      <div className="min-w-0 flex-1">
        <Button
          type="button"
          variant="link"
          onClick={(e) => {
            e.stopPropagation();
            if (row.id != null) onExpenseNavigate?.(row.id);
          }}
          className="h-auto w-full justify-start truncate p-0 text-left text-sm font-semibold text-foreground underline-offset-2 hover:underline"
        >
          {row.name || "—"}
        </Button>
        <Button
          type="button"
          variant="link"
          disabled={!row.categoryId}
          onClick={(e) => {
            e.stopPropagation();
            if (row.categoryId) onCategoryNavigate?.(row.categoryId);
          }}
          className={cn(
            "mt-0.5 h-auto w-full justify-start truncate p-0 text-left text-xs text-muted-foreground",
            row.categoryId && "cursor-pointer underline-offset-2 hover:underline",
            !row.categoryId && "cursor-default",
          )}
        >
          {row.categoryName || "—"}
        </Button>
        <p className="mt-0.5 text-xs text-muted-foreground/90">{row.dateLabel}</p>
      </div>
      <div
        className={cn(
          "shrink-0 text-sm font-bold tabular-nums",
          row.variant === "loss" && "text-red-500",
          row.variant === "gain" && "text-emerald-500",
        )}
      >
        {signPrefix}
        {absFormatted}
      </div>
    </div>
  );
}
