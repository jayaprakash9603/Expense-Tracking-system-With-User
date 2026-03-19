import React from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function RangePeriodNavigator({
  showBackButton = false,
  onBackNavigate,
  rangeTypes = [],
  activeRange,
  setActiveRange,
  offset = 0,
  handleBack,
  handleNext,
  rangeLabel,
  onResetSelection,
  disablePrevAt = -52,
  disableNextAt = 0,
  className,
}) {
  const { t } = useLanguage();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        {showBackButton && (
          <AppButton
            variant="outline"
            size="sm"
            onClick={onBackNavigate}
            className="gap-1.5"
          >
            <AppIcon icon={ArrowLeft} size="sm" />
            {t("common.back") || "Back"}
          </AppButton>
        )}

        <div className="flex items-center gap-2">
          {rangeTypes.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                if (activeRange === tab.value) {
                  onResetSelection?.();
                }
                setActiveRange(tab.value);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                activeRange === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={offset <= disablePrevAt}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
            offset <= disablePrevAt
              ? "opacity-40 cursor-not-allowed bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={t("common.previous") || "Previous"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-foreground">
          {rangeLabel}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={offset >= disableNextAt}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
            offset >= disableNextAt
              ? "opacity-40 cursor-not-allowed bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={t("common.next") || "Next"}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default RangePeriodNavigator;
