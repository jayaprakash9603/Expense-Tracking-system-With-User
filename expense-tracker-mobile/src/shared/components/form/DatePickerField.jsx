import React, { useState, useCallback } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { cn } from "@/lib/utils";

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  dateFormat = "DD MMM YYYY",
  error,
  disabled = false,
  required = false,
  className,
  name,
  minDate,
  maxDate,
}) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? dayjs(value).toDate() : undefined;

  const handleSelect = useCallback(
    (date) => {
      onChange?.(date ? dayjs(date).format("YYYY-MM-DD") : "");
      setOpen(false);
    },
    [onChange]
  );

  const displayValue = value ? dayjs(value).format(dateFormat) : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={name} className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={name}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              !displayValue && "text-muted-foreground"
            )}
          >
            <AppIcon icon={CalendarDays} size="sm" color="muted" className="mr-2" />
            <span className="flex-1 text-left">
              {displayValue || placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate || new Date()}
            disabled={(date) => {
              if (minDate && dayjs(date).isBefore(dayjs(minDate), "day")) return true;
              if (maxDate && dayjs(date).isAfter(dayjs(maxDate), "day")) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default DatePickerField;
