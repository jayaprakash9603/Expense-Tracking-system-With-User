import React from "react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

export function FlowEntityCard({ name, amount, count, color, icon, onClick, className }) {
  const { format: formatMoney } = useMoneyFormatter();
  const borderColor = color || "hsl(var(--primary))";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-stretch">
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: borderColor }}
        />
        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="text-lg shrink-0 flex items-center justify-center h-7 w-7"
              style={{ color: borderColor }}
            >
              {icon || name?.charAt(0)?.toUpperCase()}
            </span>
            <span className="font-semibold text-sm truncate text-foreground">
              {name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className="text-base font-bold"
              style={{ color: borderColor }}
            >
              {formatMoney(amount)}
            </span>
          </div>

          {count != null && (
            <p className="text-xs text-muted-foreground">
              {count} {count === 1 ? "expense" : "expenses"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
