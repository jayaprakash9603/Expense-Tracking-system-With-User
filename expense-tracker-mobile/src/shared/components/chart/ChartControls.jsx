import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { DEFAULT_TIMEFRAME_OPTIONS, DEFAULT_TYPE_OPTIONS } from "@/config/chartConfig";
import { cn } from "@/lib/utils";

export function TimeframeSelector({ value, onChange, options = DEFAULT_TIMEFRAME_OPTIONS, className }) {
  const { t } = useLanguage();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[110px] h-8 text-xs", className)}>
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

export function ChartTypeToggle({ value, onChange, options = DEFAULT_TYPE_OPTIONS, className }) {
  const { t } = useLanguage();
  return (
    <div className={cn("flex gap-1 rounded-md bg-muted p-0.5", className)}>
      {options.map((opt) => (
        <Button
          key={opt.id}
          variant={value === opt.id ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => onChange(opt.id)}
        >
          {t(opt.labelKey)}
        </Button>
      ))}
    </div>
  );
}
