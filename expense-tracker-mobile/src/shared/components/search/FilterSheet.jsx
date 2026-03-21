import React, { useState, useCallback, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AppButton } from "@/shared/components/form/AppButton";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function FilterSheet({
  open,
  onOpenChange,
  filters = [],
  values = {},
  onApply,
  onReset,
  title,
}) {
  const { t } = useLanguage();
  const { isMobile } = useLayout();
  const [draft, setDraft] = useState(values);

  const handleOpen = useCallback(
    (isOpen) => {
      if (isOpen) setDraft(values);
      onOpenChange(isOpen);
    },
    [values, onOpenChange]
  );

  const handleFieldChange = useCallback((key, val) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleCheckboxToggle = useCallback((key, option) => {
    setDraft((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [key]: next };
    });
  }, []);

  const handleApply = useCallback(() => {
    onApply?.(draft);
    onOpenChange(false);
  }, [draft, onApply, onOpenChange]);

  const handleReset = useCallback(() => {
    const empty = {};
    filters.forEach((f) => {
      empty[f.key] = f.type === "checkbox" ? [] : "";
    });
    setDraft(empty);
    onReset?.(empty);
  }, [filters, onReset]);

  const activeCount = useMemo(() => {
    let count = 0;
    filters.forEach((f) => {
      const val = draft[f.key];
      if (f.type === "checkbox" && Array.isArray(val) && val.length > 0) count++;
      else if (val && typeof val === "string" && val.trim()) count++;
    });
    return count;
  }, [filters, draft]);

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {title || t("common.filters")}
            {activeCount > 0 && (
              <span className="ml-2 text-xs text-primary">({activeCount})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label className="text-sm font-medium">{filter.label}</Label>

              {filter.type === "text" && (
                <Input
                  value={draft[filter.key] || ""}
                  onChange={(e) => handleFieldChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || ""}
                  className="h-9"
                />
              )}

              {filter.type === "select" && (
                <select
                  value={draft[filter.key] || ""}
                  onChange={(e) => handleFieldChange(filter.key, e.target.value)}
                  className={cn(
                    "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                >
                  <option value="">{filter.placeholder || t("common.all")}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === "checkbox" && (
                <div className="grid grid-cols-2 gap-2">
                  {filter.options?.map((opt) => {
                    const checked = (draft[filter.key] || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            handleCheckboxToggle(filter.key, opt.value)
                          }
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          <AppButton variant="outline" onClick={handleReset} className="flex-1">
            {t("common.reset")}
          </AppButton>
          <AppButton onClick={handleApply} className="flex-1">
            {t("common.apply")}
          </AppButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default FilterSheet;
