import React from "react";
import { cn } from "@/lib/utils";

const GRID_PRESETS = {
  stats: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5",
  cards: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4",
  list: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3",
  settings: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3",
  form: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
};

const GAP_MAP = {
  sm: "gap-2 md:gap-3",
  md: "gap-3 md:gap-4 lg:gap-5",
  lg: "gap-4 md:gap-5 lg:gap-6",
};

export function ResponsiveGrid({ children, preset = "cards", gap = "md", className }) {
  const gridClass = GRID_PRESETS[preset] || preset;
  const gapClass = GAP_MAP[gap] || gap;

  return (
    <div className={cn("grid", gridClass, gapClass, className)}>
      {children}
    </div>
  );
}

export default ResponsiveGrid;
