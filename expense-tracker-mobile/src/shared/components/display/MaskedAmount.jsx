import React from "react";
import { EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMasking } from "@/shared/hooks/settings/useMasking";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { cn } from "@/lib/utils";

export function MaskedAmount({
  amount,
  currency = "",
  partial = false,
  className,
  showIcon = false,
}) {
  const { formatMaskedAmount, isMasked } = useMasking();

  const displayValue = partial
    ? formatMaskedAmount(amount, currency)
    : formatMaskedAmount(amount, currency);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {displayValue}
      {isMasked && showIcon && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <AppIcon icon={EyeOff} size="xs" color="muted" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Amount is masked for privacy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}

export default MaskedAmount;
