import React from "react";
import { AppButton } from "@/shared/components/form/AppButton";
import { cn } from "@/lib/utils";

export function ExpenseSubmitArea({
  isSubmitting = false,
  disabled = false,
  onSubmit,
  label,
  className,
}) {
  return (
    <div
      className={cn(
        "w-full flex justify-end",
        "mt-1 lg:mt-2 pb-4 lg:pb-0 sticky bottom-0 left-0 right-0 pt-2 lg:pt-0 lg:static z-10 bg-card/95 backdrop-blur-sm lg:backdrop-blur-0",
        className,
      )}
    >
      <AppButton
        type="button"
        onClick={onSubmit}
        isLoading={isSubmitting}
        disabled={disabled || isSubmitting}
        className="px-6 py-2 font-semibold rounded w-full sm:w-auto"
      >
        {label}
      </AppButton>
    </div>
  );
}

export default ExpenseSubmitArea;
