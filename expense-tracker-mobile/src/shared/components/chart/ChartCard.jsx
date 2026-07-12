import React from "react";
import { AppCard } from "@/shared/components/display/AppCard";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  children,
  className,
  actions,
  contentClassName,
  fillHeight = false,
  stackActionsBelowTitleOnSmall = false,
  cardHeaderFrom = "all",
}) {
  const hasHeader = title || description || actions;
  const hideHeaderBelowSm = cardHeaderFrom === "sm";

  return (
    <AppCard className={cn(fillHeight && "flex h-full min-h-0 flex-col", className)}>
      {hasHeader && (
        <AppCard.Header
          className={cn(
            "flex shrink-0 pb-2",
            hideHeaderBelowSm && "hidden sm:flex",
            stackActionsBelowTitleOnSmall
              ? "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              : "flex-row items-center justify-between",
          )}
        >
          <div className={cn(stackActionsBelowTitleOnSmall && "min-w-0 w-full sm:w-auto")}>
            {title && <AppCard.Title className="text-base">{title}</AppCard.Title>}
            {description && <AppCard.Description>{description}</AppCard.Description>}
          </div>
          {actions && (
            <div
              className={cn(
                "flex items-center gap-2",
                stackActionsBelowTitleOnSmall && "w-full justify-between sm:w-auto sm:justify-end",
                !stackActionsBelowTitleOnSmall && "flex-wrap justify-end",
              )}
            >
              {actions}
            </div>
          )}
        </AppCard.Header>
      )}
      <AppCard.Content
        className={cn(
          hasHeader ? "pt-0" : "",
          fillHeight && "flex min-h-0 flex-1 flex-col",
          contentClassName,
        )}
      >
        {fillHeight ? (
          <div className="flex min-h-0 w-full flex-1 flex-col items-stretch justify-center">
            {children}
          </div>
        ) : (
          children
        )}
      </AppCard.Content>
    </AppCard>
  );
}
