import React from "react";
import { AlertTriangle } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { cn } from "@/lib/utils";

/**
 * @param {{title?: string, message?: string, onRetry?: () => void, retryLabel?: string, className?: string}} props
 */
export function ErrorState({
  title = "Something went wrong",
  message = "We were not able to load this section.",
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center",
        className,
      )}
    >
      <AlertTriangle className="mb-2 h-8 w-8 text-destructive" />
      <h3 className="text-sm md:text-base font-semibold text-destructive">{title}</h3>
      <p className="mt-1 max-w-md text-xs md:text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <AppButton className="mt-4" variant="outline" onClick={onRetry}>
          {retryLabel}
        </AppButton>
      ) : null}
    </div>
  );
}

export default ErrorState;
