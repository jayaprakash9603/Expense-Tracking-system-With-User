import React from "react";
import { cn } from "@/lib/utils";
import { EXPENSE_FORM_LAYOUT } from "@/shared/constants/expenseFormLayout";

export function ExpenseFieldLayout({
  label,
  htmlFor,
  required = false,
  error,
  children,
  layout = "horizontal",
  labelWidth = EXPENSE_FORM_LAYOUT.labelWidth,
  className,
  contentClassName,
}) {
  const isVertical = layout === "vertical";
  const hasError = Boolean(error);
  const errorText = typeof error === "string" ? error : "";

  return (
    <div className={cn("flex flex-col flex-1 w-full", className)}>
      <div
        className={cn(
          isVertical
            ? "flex flex-col gap-1"
            : "flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-0",
        )}
      >
        {label ? (
          <label
            htmlFor={htmlFor}
            className={cn(
              "text-sm font-semibold",
              hasError ? "text-destructive" : "text-foreground",
              isVertical ? "w-full" : "w-full lg:shrink-0",
            )}
            style={
              isVertical
                ? undefined
                : { width: labelWidth, minWidth: labelWidth }
            }
          >
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </label>
        ) : null}
        <div
          className={cn(
            "w-full flex-1 max-w-full xl:max-w-[min(100%,18.75rem)]",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
      {hasError && errorText && htmlFor ? (
        <span id={`${htmlFor}-error`} className="sr-only">
          {errorText}
        </span>
      ) : null}
    </div>
  );
}

export default ExpenseFieldLayout;
