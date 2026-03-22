import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { DEFAULT_TIMEFRAME_OPTIONS, SPENDING_FLOW_OPTIONS } from "@/config/chart/chartConfig";
import { cn } from "@/lib/utils";

export function TimeframeSelector({ value, onChange, options = DEFAULT_TIMEFRAME_OPTIONS, className }) {
  const { t } = useLanguage();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[6.875rem] h-8 text-xs", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>{t(opt.labelKey)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ChartTypeToggle({ value, onChange, options = SPENDING_FLOW_OPTIONS, className, disabled = false }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex gap-0.5 rounded-lg bg-muted p-0.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = value != null && value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-md transition-all duration-200",
              isActive
                ? "text-white shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={isActive && opt.color ? {
              backgroundColor: opt.color,
              boxShadow: `0 0 0 2px ${opt.color}20, 0 2px 6px ${opt.color}30`,
            } : undefined}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
