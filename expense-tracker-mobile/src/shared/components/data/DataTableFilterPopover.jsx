import React, { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DataTableFilterValueField } from "@/shared/components/data/DataTableFilterValueField";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

const FILTER_OPERATOR_VALUES = {
  text: ["contains", "notContains", "equals", "startsWith", "endsWith", "neq"],
  number: ["equals", "gt", "lt", "gte", "lte", "neq"],
  date: ["equals", "range", "before", "after", "neq"],
};

function getOperatorTranslationKey(filterType, value) {
  if (filterType === "date" && value === "equals") return "tableFilters.operators.isOn";
  if (filterType === "date" && value === "neq") return "tableFilters.operators.notOn";
  return `tableFilters.operators.${value}`;
}

function getDefaultOperator(filterType) {
  if (filterType === "number") return "equals";
  if (filterType === "date") return "range";
  return "contains";
}

function getLocalized(t, key, fallback, variables) {
  const translated = t?.(key, variables);
  if (!translated || translated === key) return fallback;
  return translated;
}

function getOperatorOptions(filterType) {
  return FILTER_OPERATOR_VALUES[filterType] || FILTER_OPERATOR_VALUES.text;
}

function normalizeDraft(filterType, filterValue) {
  const defaultOperator = getDefaultOperator(filterType);
  const operator = filterValue?.operator || defaultOperator;
  if (filterType === "date" && operator === "range") {
    return {
      operator,
      value: "",
      range: {
        from: filterValue?.value?.from || "",
        to: filterValue?.value?.to || "",
      },
    };
  }
  return {
    operator,
    value: filterValue?.value ?? "",
    range: { from: "", to: "" },
  };
}

function hasFilterInput(filterType, operator, value, range) {
  if (filterType === "date" && operator === "range") {
    return Boolean(range.from || range.to);
  }
  return value != null && value !== "";
}

function buildFilterValue(filterType, operator, value, range) {
  if (filterType === "date" && operator === "range") {
    return {
      type: filterType,
      operator,
      value: { from: range.from, to: range.to },
    };
  }
  return {
    type: filterType,
    operator,
    value,
  };
}

export function DataTableFilterPopover({
  column,
  filterType = "text",
  filterLabel = "",
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const activeFilter = column?.getFilterValue();
  const draft = useMemo(
    () => normalizeDraft(filterType, activeFilter),
    [activeFilter, filterType],
  );
  const [operator, setOperator] = useState(draft.operator);
  const [value, setValue] = useState(draft.value);
  const [range, setRange] = useState(draft.range);

  useEffect(() => {
    if (!open) return;
    const nextDraft = normalizeDraft(filterType, column?.getFilterValue());
    setOperator(nextDraft.operator);
    setValue(nextDraft.value);
    setRange(nextDraft.range);
  }, [open, filterType, column?.id]);

  const operatorOptions = getOperatorOptions(filterType);
  const canApply = hasFilterInput(filterType, operator, value, range);
  const isActive = hasFilterInput(
    filterType,
    activeFilter?.operator || getDefaultOperator(filterType),
    activeFilter?.value,
    activeFilter?.value || { from: "", to: "" },
  );

  const dialogTitle = getLocalized(
    t,
    "tableFilters.filterBy",
    `Filter by ${filterLabel}`,
    { name: filterLabel },
  );

  const operatorLabel = getLocalized(t, "tableFilters.operator", "Operator");
  const valueLabel = getLocalized(t, "tableFilters.value", "Value");
  const valuePlaceholder = getLocalized(
    t,
    "tableFilters.valuePlaceholder",
    "Filter value...",
  );
  const clearLabel = getLocalized(t, "common.clear", "Clear");
  const applyLabel = getLocalized(t, "common.apply", "Apply");
  const closeLabel = getLocalized(t, "common.close", "Close");

  const handleApply = () => {
    if (!column) return;
    if (!canApply) {
      column.setFilterValue(undefined);
      setOpen(false);
      return;
    }
    const nextFilter = buildFilterValue(filterType, operator, value, range);
    column.setFilterValue(nextFilter);
    setOpen(false);
  };

  const handleClear = () => {
    if (!column) return;
    const defaultOperator = getDefaultOperator(filterType);
    setOperator(defaultOperator);
    setValue("");
    setRange({ from: "", to: "" });
    column.setFilterValue(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded border border-transparent text-muted-foreground hover:text-foreground",
            isActive && "border-primary/30 bg-primary/10 text-primary",
          )}
          aria-label={dialogTitle}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,21.25rem)] max-w-[21.25rem] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">{dialogTitle}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {operatorLabel}
            </Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operatorOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(getOperatorTranslationKey(filterType, value))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{valueLabel}</Label>
            <DataTableFilterValueField
              filterType={filterType}
              operator={operator}
              value={value}
              onValueChange={setValue}
              range={range}
              onRangeChange={setRange}
              valuePlaceholder={valuePlaceholder}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            {clearLabel}
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DataTableFilterPopover;
