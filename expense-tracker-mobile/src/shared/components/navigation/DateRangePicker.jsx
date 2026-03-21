import React, { useState, useEffect, useCallback } from "react";
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

function useWideScreenCalendar() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return wide;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onApply,
  onReset,
  dateFormat = "DD MMM YYYY",
  className,
  showInlineLabels = false,
  showFromToLabels = false,
  buttonLabels,
  showCalendarIcon = true,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const showTwoMonths = useWideScreenCalendar();

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
  const labelFrom = buttonLabels?.from ?? t("dateRange.from");
  const labelTo = buttonLabels?.to ?? t("dateRange.to");

  const triggerDates = (
    <>
      {showFromToLabels ? (
        <>
          <span className="shrink-0 text-primary">{labelFrom}</span>
          <span className="min-w-0 truncate text-foreground">{displayFrom}</span>
          <span className="shrink-0 opacity-60">–</span>
          <span className="shrink-0 text-primary">{labelTo}</span>
          <span className="min-w-0 truncate text-foreground">{displayTo}</span>
        </>
      ) : (
        <>
          <span
            className={cn(
              "min-w-0 truncate tabular-nums text-foreground",
              showInlineLabels ? "text-foreground" : "text-primary",
            )}
          >
            {displayFrom}
          </span>
          <span className="shrink-0 opacity-60">–</span>
          <span
            className={cn(
              "min-w-0 truncate tabular-nums text-foreground",
              showInlineLabels ? "text-foreground" : "text-primary",
            )}
          >
            {displayTo}
          </span>
        </>
      )}
    </>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex max-w-full min-w-0 items-center justify-center gap-1 rounded-full border border-primary/30",
            "bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs md:text-sm",
            "hover:bg-primary/20 transition-colors sm:max-w-[min(100%,22rem)]",
            className,
          )}
        >
          {showCalendarIcon ? (
            <AppIcon icon={CalendarDays} size="sm" color="primary" className="size-3.5 shrink-0 sm:size-4" />
          ) : null}
          {triggerDates}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-1.25rem)] max-w-[min(100vw-1.25rem,18.5rem)] p-0 sm:max-w-[22rem] md:max-w-[26rem] lg:max-w-none lg:w-auto"
        align="start"
        alignOffset={-4}
        side="bottom"
        sideOffset={6}
        collisionPadding={8}
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="w-full p-2 sm:p-2.5 md:p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={showTwoMonths ? 2 : 1}
              defaultMonth={range.from || new Date()}
              className={cn(
                "w-full max-w-full p-1 [--cell-size:1.625rem] sm:p-2 sm:[--cell-size:1.875rem] md:[--cell-size:2rem]",
                "[&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-month]:max-w-full [&_.rdp-table]:w-full [&_.rdp-cell]:text-center",
                "lg:[--cell-size:2.25rem]",
              )}
            />
          </div>

          <div className="flex flex-row flex-wrap gap-1 border-t border-border p-2 sm:min-w-[8.5rem] sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-l sm:border-t-0 sm:p-2 md:min-w-[9.5rem] md:p-2.5">
            {SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.labelKey}
                type="button"
                onClick={() => handleShortcut(shortcut)}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left text-xs whitespace-nowrap sm:w-full sm:px-2.5 sm:text-sm",
                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                )}
              >
                {t(shortcut.labelKey) || SHORTCUT_FALLBACK_LABELS[shortcut.labelKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
          <p className="text-xs text-muted-foreground tabular-nums sm:text-sm">
            {range.from ? dayjs(range.from).format(dateFormat) : "--"}
            <span className="mx-1">–</span>
            {range.to ? dayjs(range.to).format(dateFormat) : "--"}
          </p>
          <div className="flex justify-end gap-2">
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
