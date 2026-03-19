import React, { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

dayjs.extend(isBetween);

const SHORTCUTS = [
  { labelKey: "dateRange.yesterday", getValue: () => ({ from: dayjs().subtract(1, "day").toDate(), to: dayjs().subtract(1, "day").toDate() }) },
  { labelKey: "dateRange.last7Days", getValue: () => ({ from: dayjs().subtract(6, "day").toDate(), to: dayjs().toDate() }) },
  { labelKey: "dateRange.last30Days", getValue: () => ({ from: dayjs().subtract(29, "day").toDate(), to: dayjs().toDate() }) },
  { labelKey: "dateRange.last3Months", getValue: () => ({ from: dayjs().subtract(3, "month").toDate(), to: dayjs().toDate() }) },
  { labelKey: "dateRange.yearToDate", getValue: () => ({ from: dayjs().startOf("year").toDate(), to: dayjs().toDate() }) },
  { labelKey: "dateRange.lastYear", getValue: () => ({ from: dayjs().subtract(1, "year").startOf("year").toDate(), to: dayjs().subtract(1, "year").endOf("year").toDate() }) },
];

const SHORTCUT_FALLBACK_LABELS = {
  "dateRange.yesterday": "Yesterday",
  "dateRange.last7Days": "Last 7 days",
  "dateRange.last30Days": "Last 30 days",
  "dateRange.last3Months": "Last 3 months",
  "dateRange.yearToDate": "Year to date",
  "dateRange.lastYear": "Last year",
};

export function DateRangePicker({
  fromDate,
  toDate,
  onApply,
  onReset,
  dateFormat = "DD MMM YYYY",
  className,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });

  useEffect(() => {
    setRange({
      from: fromDate ? dayjs(fromDate).toDate() : undefined,
      to: toDate ? dayjs(toDate).toDate() : undefined,
    });
  }, [fromDate, toDate]);

  const handleSelect = useCallback((selected) => {
    setRange(selected || { from: undefined, to: undefined });
  }, []);

  const handleShortcut = useCallback((shortcut) => {
    const val = shortcut.getValue();
    setRange(val);
  }, []);

  const handleApply = useCallback(() => {
    if (range.from && range.to) {
      onApply?.({
        fromDate: dayjs(range.from).format("YYYY-MM-DD"),
        toDate: dayjs(range.to).format("YYYY-MM-DD"),
      });
      setOpen(false);
    }
  }, [range, onApply]);

  const handleCancel = useCallback(() => {
    setRange({
      from: fromDate ? dayjs(fromDate).toDate() : undefined,
      to: toDate ? dayjs(toDate).toDate() : undefined,
    });
    setOpen(false);
  }, [fromDate, toDate]);

  const displayFrom = fromDate ? dayjs(fromDate).format(dateFormat) : "--";
  const displayTo = toDate ? dayjs(toDate).format(dateFormat) : "--";

  const numberOfMonths = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) return 1;
    return 2;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-primary/30",
            "bg-primary/10 px-4 py-2 text-sm font-medium",
            "hover:bg-primary/20 transition-colors",
            className
          )}
        >
          <AppIcon icon={CalendarDays} size="sm" color="primary" />
          <span className="text-primary">{displayFrom}</span>
          <span className="opacity-60">→</span>
          <span className="text-primary">{displayTo}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
        <div className="flex flex-col sm:flex-row">
          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              defaultMonth={range.from || new Date()}
            />
          </div>

          <div className="flex flex-row sm:flex-col border-t sm:border-t-0 sm:border-l p-3 gap-1 overflow-x-auto sm:overflow-visible sm:min-w-[140px]">
            {SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.labelKey}
                type="button"
                onClick={() => handleShortcut(shortcut)}
                className={cn(
                  "text-left px-3 py-2 text-sm rounded-md whitespace-nowrap",
                  "hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
              >
                {t(shortcut.labelKey) || SHORTCUT_FALLBACK_LABELS[shortcut.labelKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {range.from ? dayjs(range.from).format(dateFormat) : "--"}{" "}
            –{" "}
            {range.to ? dayjs(range.to).format(dateFormat) : "--"}
          </p>
          <div className="flex gap-2">
            <AppButton variant="ghost" size="sm" onClick={handleCancel}>
              {t("common.cancel") || "Cancel"}
            </AppButton>
            <AppButton
              size="sm"
              onClick={handleApply}
              disabled={!range.from || !range.to}
            >
              {t("common.apply") || "Apply"}
            </AppButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
