import React from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { AppButton } from "@/shared/components/form/AppButton";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const SIZE_HEIGHTS = {
  xs: "min-h-0",
  sm: "min-h-[8.75rem]",
  md: "min-h-[11.25rem]",
  lg: "min-h-[16.25rem]",
  fill: "min-h-[20rem]",
};

export function NoDataPlaceholder({
  message,
  subMessage,
  size = "md",
  onRetry,
  actionLabel,
  icon: CustomIcon,
  dense = false,
  fullWidth = false,
  className,
}) {
  const { t } = useLanguage();
  const resolvedMessage = message ?? t("common.noData");
  const resolvedActionLabel = actionLabel ?? t("common.retry");
  const IconComponent = CustomIcon || BarChart3;
  const heightClass = SIZE_HEIGHTS[size] || SIZE_HEIGHTS.md;
  const iconSize = dense ? "md" : "xl";
  const messageClass = dense ? "text-sm font-semibold text-foreground" : "text-base font-semibold text-foreground";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "border border-dashed border-border rounded-lg bg-background",
        heightClass,
        dense ? "gap-1.5 px-3 py-3 sm:px-4" : "gap-3 px-6",
        fullWidth && "w-full",
        className
      )}
    >
      <div className="opacity-60">
        <AppIcon icon={IconComponent} size={iconSize} color="muted" />
      </div>

      <p className={messageClass}>{resolvedMessage}</p>

      {subMessage && (
        <p className="text-sm text-muted-foreground max-w-[22.5rem]">{subMessage}</p>
      )}

      {onRetry && (
        <AppButton
          size="sm"
          onClick={onRetry}
          className={dense ? "mt-1" : "mt-2"}
        >
          <AppIcon icon={RefreshCw} size="xs" className="mr-1.5" />
          {resolvedActionLabel}
        </AppButton>
      )}
    </div>
  );
}

export default NoDataPlaceholder;
