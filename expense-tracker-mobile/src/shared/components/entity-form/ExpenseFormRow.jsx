import React from "react";
import { cn } from "@/lib/utils";

export function ExpenseFormRow({ children, first = false, className }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5 lg:flex-row lg:items-start lg:gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default ExpenseFormRow;
