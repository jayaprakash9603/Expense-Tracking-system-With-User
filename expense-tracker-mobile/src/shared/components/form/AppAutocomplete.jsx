import React, { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AppAutocomplete({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Search...",
  emptyText = "No results found.",
  error,
  disabled = false,
  required = false,
  className,
  name,
  getOptionLabel,
  getOptionValue,
  renderOption,
}) {
  const [open, setOpen] = useState(false);

  const resolvedOptions = useMemo(
    () =>
      options.map((opt) => {
        if (typeof opt === "string") return { label: opt, value: opt };
        return {
          label: getOptionLabel ? getOptionLabel(opt) : opt.label || String(opt),
          value: getOptionValue ? getOptionValue(opt) : opt.value || opt.label || String(opt),
          raw: opt,
        };
      }),
    [options, getOptionLabel, getOptionValue]
  );

  const selectedOption = useMemo(
    () => resolvedOptions.find((o) => o.value === value),
    [resolvedOptions, value]
  );

  const handleSelect = useCallback(
    (optValue) => {
      onChange?.(optValue === value ? "" : optValue);
      setOpen(false);
    },
    [onChange, value]
  );

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
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              !value && "text-muted-foreground"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {resolvedOptions.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => handleSelect(opt.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderOption ? renderOption(opt.raw || opt) : opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default AppAutocomplete;
