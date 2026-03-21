import React, { useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

const MONTH_KEY_IDS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

export function MonthPicker({
  value,
  onChange,
  availableMonths,
  className,
}) {
  const { t } = useLanguage();
  const monthNames = useMemo(
    () => MONTH_KEY_IDS.map((id) => t(`common.monthsShort.${id}`)),
    [t],
  );
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) return dayjs(value).year();
    return dayjs().year();
  });

  const currentMonth = value ? dayjs(value).month() : dayjs().month();
  const currentYear = value ? dayjs(value).year() : dayjs().year();

  const availableSet = useMemo(() => {
    if (!availableMonths) return null;
    const set = new Set();
    availableMonths.forEach((item) => {
      set.add(`${item.year}-${item.month}`);
    });
    return set;
  }, [availableMonths]);

  const isMonthAvailable = useCallback(
    (year, monthIndex) => {
      if (!availableSet) return true;
      const monthStr = String(monthIndex + 1).padStart(2, "0");
      return availableSet.has(`${year}-${monthStr}`);
    },
    [availableSet]
  );

  const handleSelect = useCallback(
    (monthIndex) => {
      onChange?.({ year: viewYear, month: monthIndex });
      setOpen(false);
    },
    [viewYear, onChange]
  );

  const displayLabel = value
    ? dayjs(value).format("MMM YYYY")
    : t("common.selectMonth");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 h-9 px-3 rounded-md",
            "border border-input bg-background text-sm",
            "hover:bg-accent transition-colors",
            className
          )}
        >
          <AppIcon icon={CalendarDays} size="sm" color="muted" />
          <span>{displayLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {monthNames.map((name, idx) => {
            const isSelected = viewYear === currentYear && idx === currentMonth;
            const isAvailable = isMonthAvailable(viewYear, idx);

            return (
              <button
                key={MONTH_KEY_IDS[idx]}
                type="button"
                onClick={() => isAvailable && handleSelect(idx)}
                disabled={!isAvailable}
                className={cn(
                  "py-2 rounded-md text-sm font-medium transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && isAvailable && "hover:bg-accent",
                  !isAvailable && "opacity-40 cursor-not-allowed"
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MonthPicker;
