import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/app-shadcn";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

function defaultGetOptionLabel(option) {
  if (option == null) return "";
  if (typeof option === "string") return option;
  if (typeof option === "object") {
    return option.label || option.name || option.value || "";
  }
  return String(option);
}

function defaultIsOptionEqualToValue(option, value, getOptionLabel) {
  if (option == null || value == null) return false;
  if (typeof value === "string") {
    return getOptionLabel(option) === value;
  }
  return getOptionLabel(option) === getOptionLabel(value);
}

export function ExpenseThemedAutocomplete({
  options = [],
  value,
  onChange,
  onInputChange,
  onOpen,
  onClose,
  getOptionLabel = defaultGetOptionLabel,
  isOptionEqualToValue,
  filterOptions,
  renderOption,
  placeholder,
  noOptionsText,
  error = false,
  disabled = false,
  loading = false,
  freeSolo = false,
  clearOnEscape = true,
  maxWidth = "100%",
  inputHeight = "48px",
  startAdornment,
  className,
}) {
  const { t } = useLanguage();
  const resolvedNoOptionsText = noOptionsText ?? t("expenseForm.actions.noOptions");
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const resolvedOptions = useMemo(
    () => (Array.isArray(options) ? options : []),
    [options],
  );

  const compareOption = useCallback(
    (option, comparedValue) => {
      if (typeof isOptionEqualToValue === "function") {
        return isOptionEqualToValue(option, comparedValue);
      }
      return defaultIsOptionEqualToValue(option, comparedValue, getOptionLabel);
    },
    [isOptionEqualToValue, getOptionLabel],
  );

  const selectedOption = useMemo(() => {
    if (value == null || value === "") return null;
    if (typeof value === "string" && freeSolo) {
      return value;
    }
    return resolvedOptions.find((option) => compareOption(option, value)) || null;
  }, [value, freeSolo, resolvedOptions, compareOption]);

  useEffect(() => {
    const selectedLabel =
      typeof selectedOption === "string"
        ? selectedOption
        : selectedOption
          ? getOptionLabel(selectedOption)
          : "";
    if (!open) {
      setInputValue(selectedLabel || "");
    }
  }, [selectedOption, getOptionLabel, open]);

  const filteredOptions = useMemo(() => {
    if (typeof filterOptions === "function") {
      return filterOptions(resolvedOptions, { inputValue });
    }
    if (!inputValue.trim()) return resolvedOptions;
    const lower = inputValue.toLowerCase();
    return resolvedOptions.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(lower),
    );
  }, [filterOptions, resolvedOptions, inputValue, getOptionLabel]);

  const hasExactInputMatch = useMemo(() => {
    const normalized = inputValue.trim().toLowerCase();
    if (!normalized) return false;
    return resolvedOptions.some(
      (option) => getOptionLabel(option).trim().toLowerCase() === normalized,
    );
  }, [inputValue, resolvedOptions, getOptionLabel]);

  const showFreeSoloOption = freeSolo && inputValue.trim() && !hasExactInputMatch;

  const handleOpenChange = useCallback(
    (nextOpen) => {
      setOpen(nextOpen);
      if (nextOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }
    },
    [onOpen, onClose],
  );

  const handleInputValueChange = useCallback(
    (nextValue) => {
      setInputValue(nextValue);
      onInputChange?.(null, nextValue, "input");
    },
    [onInputChange],
  );

  const selectOption = useCallback(
    (option) => {
      const selectedLabel =
        typeof option === "string" ? option : getOptionLabel(option);
      setInputValue(selectedLabel);
      onInputChange?.(null, selectedLabel, "select");
      onChange?.(null, option);
      handleOpenChange(false);
    },
    [onChange, onInputChange, getOptionLabel, handleOpenChange],
  );

  const handleTriggerKeyDown = useCallback(
    (event) => {
      if (!clearOnEscape || event.key !== "Escape") return;
      if (freeSolo && inputValue) {
        setInputValue("");
        onInputChange?.(event, "", "clear");
        onChange?.(event, "");
      }
    },
    [clearOnEscape, freeSolo, inputValue, onInputChange, onChange],
  );

  const selectedLabel =
    typeof selectedOption === "string"
      ? selectedOption
      : selectedOption
        ? getOptionLabel(selectedOption)
        : "";

  const triggerHeight = typeof inputHeight === "number" ? `${inputHeight}px` : inputHeight;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border-2 bg-card px-3 py-2 text-sm font-medium shadow-sm transition-[border-color,box-shadow]",
            "focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
              : "border-primary/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
            className,
          )}
          style={{ height: triggerHeight, maxWidth }}
        >
          <span className="min-w-0 flex items-center gap-2">
            {startAdornment ? <span className="shrink-0">{startAdornment}</span> : null}
            <span
              className={cn(
                "truncate",
                !selectedLabel && !inputValue && "text-muted-foreground",
              )}
            >
              {selectedLabel || inputValue || placeholder}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={handleInputValueChange}
            placeholder={placeholder}
          />
          <CommandList>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">{t("common.loading")}</div>
            ) : (
              <CommandGroup>
                {showFreeSoloOption ? (
                  <CommandItem
                    value={inputValue}
                    onSelect={() => selectOption(inputValue.trim())}
                  >
                    <span className="truncate">"{inputValue.trim()}"</span>
                  </CommandItem>
                ) : null}
                {filteredOptions.map((option, index) => {
                  const optionLabel = getOptionLabel(option);
                  const selected = selectedOption ? compareOption(option, selectedOption) : false;

                  return (
                    <CommandItem
                      key={`${optionLabel}-${String(option?.id ?? option?.value ?? index)}`}
                      value={optionLabel}
                      onSelect={() => selectOption(option)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                      {typeof renderOption === "function"
                        ? renderOption(option, { inputValue })
                        : <span className="truncate">{optionLabel}</span>}
                    </CommandItem>
                  );
                })}
                {!showFreeSoloOption && filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{resolvedNoOptionsText}</div>
                ) : null}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ExpenseThemedAutocomplete;
