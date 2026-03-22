import React from "react";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default: {
    bar: "w-1.5",
    body: "gap-2 p-4",
    icon: "h-7 w-7 text-lg",
    name: "text-sm",
    amount: "text-base",
    count: "text-xs",
  },
  compact: {
    bar: "w-1",
    body: "gap-1 p-2 sm:p-2.5",
    icon: "h-5 w-5 text-sm",
    name: "text-xs",
    amount: "text-sm",
    count: "text-[0.625rem] sm:text-[0.6875rem]",
  },
};

export function FlowEntityCard({
  name,
  amount,
  count,
  color,
  icon,
  onClick,
  className,
  variant = "default",
}) {
  const { format: formatMoney } = useMoneyFormatter();
  const borderColor = color || "hsl(var(--primary))";
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      className={cn(
        "h-full min-h-0 cursor-pointer overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex h-full min-h-0 items-stretch">
        <div className={cn("shrink-0", v.bar)} style={{ backgroundColor: borderColor }} />
        <div className={cn("flex min-w-0 flex-1 flex-col", v.body)}>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span
              className={cn("flex shrink-0 items-center justify-center", v.icon)}
              style={{ color: borderColor }}
            >
              {icon || name?.charAt(0)?.toUpperCase()}
            </span>
            <span className={cn("truncate font-semibold text-foreground", v.name)}>{name}</span>
          </div>
          <span
            className={cn("block min-w-0 truncate font-bold leading-tight", v.amount)}
            style={{ color: borderColor }}
            title={formatMoney(amount)}
          >
            {formatMoney(amount)}
          </span>
          {count != null ? (
            <p className={cn("text-muted-foreground", v.count)}>
              {count} {count === 1 ? "expense" : "expenses"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
