import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ENTITY_COLOR_OPTIONS, DEFAULT_ENTITY_COLOR } from "./entityVisualConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function EntityColorPalettePicker({
  value,
  onChange,
  label,
  colors = ENTITY_COLOR_OPTIONS,
  className,
}) {
  const selectedColor = value || DEFAULT_ENTITY_COLOR;

  return (
    <div className={cn("flex h-fit w-full flex-col space-y-2", className)}>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between px-3 font-normal h-[2.625rem]"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm">Select Color</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <div className="grid grid-cols-6 gap-2">
            {colors.map((colorValue) => {
              const isSelected = selectedColor === colorValue;
              return (
                <button
                  key={colorValue}
                  type="button"
                  aria-label={`Select color ${colorValue}`}
                  className={cn(
                    "h-8 w-8 rounded-full border transition-opacity hover:opacity-90",
                    isSelected ? "border-foreground ring-2 ring-ring/50" : "border-border",
                  )}
                  style={{ backgroundColor: colorValue }}
                  onClick={() => onChange?.(colorValue)}
                />
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default EntityColorPalettePicker;
