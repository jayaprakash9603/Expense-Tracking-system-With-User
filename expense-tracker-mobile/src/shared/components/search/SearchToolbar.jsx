import React, { useState, useCallback, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { Badge } from "@/components/ui/badge";
import { useDebouncedCallback } from "@/shared/hooks/utility/useDebounce";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function SearchToolbar({
  value = "",
  onChange,
  onFilterClick,
  placeholder,
  filterCount = 0,
  debounceMs = 300,
  className,
}) {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedChange = useDebouncedCallback((val) => {
    onChange?.(val);
  }, debounceMs);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setLocalValue(val);
      debouncedChange(val);
    },
    [debouncedChange]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange?.("");
  }, [onChange]);

  const resolvedPlaceholder = placeholder || t("common.search") || "Search...";

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div className="relative flex-1">
        <AppIcon
          icon={Search}
          size="sm"
          color="muted"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <Input
          value={localValue}
          onChange={handleChange}
          placeholder={resolvedPlaceholder}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className={cn(
            "relative flex items-center justify-center h-9 w-9 shrink-0",
            "rounded-md border border-input bg-background",
            "hover:bg-accent hover:text-accent-foreground transition-colors"
          )}
        >
          <AppIcon icon={SlidersHorizontal} size="sm" />
          {filterCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
              {filterCount}
            </Badge>
          )}
        </button>
      )}
    </div>
  );
}

export default SearchToolbar;
