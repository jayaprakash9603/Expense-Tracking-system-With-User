import React from "react";
import { cn } from "@/lib/utils";

export function ExpenseFormRow({ children, first = false, className }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:gap-4",
        first ? "mt-2" : "mt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default ExpenseFormRow;
