import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { pxToRem } from "@/shared/constants/expenseFormLayout";

export function LoadingSpinner({ className, size = 32 }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[12.5rem]", className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: pxToRem(size), height: pxToRem(size) }} />
    </div>
  );
}

export default LoadingSpinner;
