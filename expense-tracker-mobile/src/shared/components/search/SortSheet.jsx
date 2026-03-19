import React, { useCallback } from "react";
import { ArrowUpDown, ArrowDown, ArrowUp, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

const DEFAULT_SORT_OPTIONS = [
  { value: "recent", label: "Recent First", icon: Clock },
  { value: "high", label: "High to Low", icon: ArrowDown },
  { value: "low", label: "Low to High", icon: ArrowUp },
];

export function SortSheet({
  sortType,
  onSelect,
  options = DEFAULT_SORT_OPTIONS,
  open,
  onOpenChange,
  triggerClassName,
}) {
  const { isMobile } = useLayout();
  const { t } = useLanguage();

  const handleSelect = useCallback(
    (value) => {
      onSelect?.(value);
      onOpenChange?.(false);
    },
    [onSelect, onOpenChange]
  );

  const resolvedOptions = options.map((opt) => ({
    ...opt,
    label: opt.labelKey ? t(opt.labelKey) : opt.label,
  }));

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="pb-safe-bottom">
          <SheetHeader>
            <SheetTitle>{t("common.sort") || "Sort"}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-1">
            {resolvedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  sortType === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {opt.icon && <AppIcon icon={opt.icon} size="sm" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center h-9 w-9 rounded-md",
            "border border-input bg-background hover:bg-accent transition-colors",
            triggerClassName
          )}
        >
          <AppIcon icon={ArrowUpDown} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={sortType} onValueChange={handleSelect}>
          {resolvedOptions.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={opt.value}
              className="gap-2"
            >
              {opt.icon && <AppIcon icon={opt.icon} size="xs" />}
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SortSheet;
