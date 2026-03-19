import React from "react";
import { AppCard } from "@/shared/components/display/AppCard";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

export function FlowEntityCard({ name, amount, count, color, icon, onClick, className }) {
  const { format: formatMoney } = useMoneyFormatter();

  return (
    <AppCard
      className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      <AppCard.Content className="p-4">
        <div className="flex items-center gap-3">
          {(color || icon) && (
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: color || "hsl(var(--primary))" }}
            >
              {icon || name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            {count != null && (
              <p className="text-xs text-muted-foreground">
                {count} {count === 1 ? "expense" : "expenses"}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold">{formatMoney(amount)}</p>
          </div>
        </div>
      </AppCard.Content>
    </AppCard>
  );
}
