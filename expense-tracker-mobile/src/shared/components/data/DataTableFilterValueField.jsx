import { useMemo } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

function RangeSummary({ from, to }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">
      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
      <span className="tabular-nums">
        {from || "—"} → {to || "—"}
      </span>
    </div>
  );
}

function SingleDateSummary({ value }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">
      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
      <span className="tabular-nums">{value || "—"}</span>
    </div>
  );
}

export function DataTableFilterValueField({
  filterType,
  operator,
  value,
  onValueChange,
  range,
  onRangeChange,
  valuePlaceholder,
}) {
  const rangeSelected = useMemo(() => {
    if (!range.from && !range.to) return undefined;
    return {
      from: range.from ? dayjs(range.from).toDate() : undefined,
      to: range.to ? dayjs(range.to).toDate() : undefined,
    };
  }, [range.from, range.to]);

  if (filterType === "date" && operator === "range") {
    return (
      <div className="space-y-2">
        <RangeSummary from={range.from} to={range.to} />
        <Calendar
          mode="range"
          selected={rangeSelected}
          onSelect={(r) => {
            if (!r) {
              onRangeChange({ from: "", to: "" });
              return;
            }
            onRangeChange({
              from: r.from ? dayjs(r.from).format("YYYY-MM-DD") : "",
              to: r.to ? dayjs(r.to).format("YYYY-MM-DD") : "",
            });
          }}
          numberOfMonths={1}
          defaultMonth={rangeSelected?.from || rangeSelected?.to || new Date()}
          className="w-full rounded-md border border-input bg-background p-2 [--cell-size:1.75rem]"
        />
      </div>
    );
  }

  if (filterType === "date") {
    return (
      <div className="space-y-2">
        <SingleDateSummary value={value} />
        <Calendar
          mode="single"
          selected={value ? dayjs(value).toDate() : undefined}
          onSelect={(d) => onValueChange(d ? dayjs(d).format("YYYY-MM-DD") : "")}
          defaultMonth={value ? dayjs(value).toDate() : new Date()}
          className="w-full rounded-md border border-input bg-background p-2 [--cell-size:1.75rem]"
        />
      </div>
    );
  }

  if (filterType === "number") {
    return (
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={valuePlaceholder}
        className="font-mono tabular-nums"
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={valuePlaceholder}
      autoComplete="off"
    />
  );
}

export default DataTableFilterValueField;
