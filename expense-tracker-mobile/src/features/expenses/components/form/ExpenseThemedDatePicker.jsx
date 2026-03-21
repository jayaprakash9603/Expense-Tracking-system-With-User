import React, { useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ExpenseThemedDatePicker({
  value,
  onChange,
  dateFormat = "DD/MM/YYYY",
  error = false,
  disableFuture = true,
  placeholder,
  width = "100%",
  height = 48,
  className,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : undefined;
  }, [value]);

  const displayValue = useMemo(() => {
    if (!value) return "";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format(dateFormat) : "";
  }, [value, dateFormat]);

  const maxWidthValue =
    typeof width === "number" ? `${width}px` : width;

  const handleSelect = useCallback(
    (nextDate) => {
      if (!nextDate) return;
      const day = dayjs(nextDate);
      if (!day.isValid()) return;
      onChange?.(day.format("YYYY-MM-DD"), day);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex w-full items-center rounded-lg border-2 bg-card px-3 text-left text-sm font-medium shadow-sm",
            "transition-[border-color,box-shadow] focus-visible:outline-none",
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
              : "border-primary/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
            className,
          )}
          style={{ height: `${height}px`, maxWidth: maxWidthValue }}
          aria-label={t("common.aria.selectDate")}
        >
          <CalendarDays className="mr-2 h-4 w-4 text-primary" />
          <span className={cn("truncate", !displayValue && "text-muted-foreground")}>
            {displayValue || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
          disabled={(date) => {
            if (!disableFuture) return false;
            return dayjs(date).isAfter(dayjs(), "day");
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ExpenseThemedDatePicker;
