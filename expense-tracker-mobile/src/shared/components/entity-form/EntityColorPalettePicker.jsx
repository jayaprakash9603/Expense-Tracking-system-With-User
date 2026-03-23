import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ENTITY_COLOR_OPTIONS, DEFAULT_ENTITY_COLOR } from "./entityVisualConfig";

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
      <div className="grid w-full grid-cols-8 gap-2 rounded-md border border-border p-2.5">
        {colors.map((colorValue) => {
          const isSelected = selectedColor === colorValue;
          return (
            <button
              key={colorValue}
              type="button"
              aria-label={`Select color ${colorValue}`}
              className={cn(
                "h-7 w-7 rounded-full border transition-opacity hover:opacity-90",
                isSelected ? "border-foreground ring-2 ring-ring/50" : "border-border",
              )}
              style={{ backgroundColor: colorValue }}
              onClick={() => onChange?.(colorValue)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default EntityColorPalettePicker;
