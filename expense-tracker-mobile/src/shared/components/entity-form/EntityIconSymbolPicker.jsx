import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ENTITY_ICON_SYMBOL_CATEGORIES,
  DEFAULT_ENTITY_ICON_SYMBOL,
  DEFAULT_ENTITY_COLOR,
} from "./entityVisualConfig";
import { hexWithAlpha, pickForegroundForBackground } from "./entityAccentUtils";

const TAB_SCROLL_STEP_PX = 180;

export function EntityIconSymbolPicker({
  value,
  onChange,
  label,
  categories = ENTITY_ICON_SYMBOL_CATEGORIES,
  accentColor,
  className,
}) {
  const accent = accentColor || DEFAULT_ENTITY_COLOR;
  const tabFg = pickForegroundForBackground(accent);
  const categoryNames = useMemo(() => Object.keys(categories), [categories]);
  const [activeCategory, setActiveCategory] = useState(() => categoryNames[0] || "");
  const tabScrollRef = useRef(null);
  const selectedIcon = value || DEFAULT_ENTITY_ICON_SYMBOL;
  const icons = categories[activeCategory] || [];

  const scrollTabs = (direction) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * TAB_SCROLL_STEP_PX, behavior: "smooth" });
  };

  return (
    <div className={cn("flex h-fit w-full flex-col space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex h-fit w-full flex-col rounded-md border border-border">
        <div className="flex shrink-0 items-center gap-1 border-b border-border p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => scrollTabs(-1)}
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-4 w-4" style={{ color: accent }} />
          </Button>
          <div
            ref={tabScrollRef}
            className="no-scrollbar min-h-8 flex-1 overflow-x-auto overflow-y-hidden"
          >
            <div className="flex w-max min-w-0 gap-1 py-0.5">
              {categoryNames.map((categoryName) => {
                const isActive = categoryName === activeCategory;
                return (
                  <button
                    key={categoryName}
                    type="button"
                    className={cn(
                      "h-8 shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors",
                      !isActive && "bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                    style={
                      isActive
                        ? { backgroundColor: accent, color: tabFg }
                        : undefined
                    }
                    onClick={() => setActiveCategory(categoryName)}
                  >
                    {categoryName}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => scrollTabs(1)}
            aria-label="Next categories"
          >
            <ChevronRight className="h-4 w-4" style={{ color: accent }} />
          </Button>
        </div>
        <div className="theme-scrollbar p-2 pt-1.5">
          <div className="grid grid-cols-8 gap-1.5">
            {icons.map((iconSymbol) => {
              const isSelected = iconSymbol === selectedIcon;
              return (
                <button
                  key={`${activeCategory}-${iconSymbol}`}
                  type="button"
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-transparent text-base leading-none transition-colors",
                    !isSelected && "hover:bg-muted",
                  )}
                  style={
                    isSelected
                      ? {
                          backgroundColor: hexWithAlpha(accent, 0.22),
                          borderColor: accent,
                        }
                      : undefined
                  }
                  onClick={() => onChange?.(iconSymbol)}
                >
                  {iconSymbol}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntityIconSymbolPicker;
