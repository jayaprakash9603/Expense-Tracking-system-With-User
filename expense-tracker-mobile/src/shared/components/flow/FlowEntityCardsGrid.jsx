import React from "react";
import { cn } from "@/lib/utils";

export const FLOW_ENTITY_CARDS_PANEL_BODY_MIN_CLASS = "min-h-[min(38vh,300px)]";

export const FLOW_ENTITY_CARDS_GRID_LAYOUT_CLASS = cn(
  "grid content-start gap-2",
  FLOW_ENTITY_CARDS_PANEL_BODY_MIN_CLASS,
  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
);

export function FlowEntityCardsGrid({ title, children, className }) {
  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      {title != null ? (
        <h3 className="px-0.5 text-sm font-semibold text-muted-foreground">{title}</h3>
      ) : null}
      <div className={FLOW_ENTITY_CARDS_GRID_LAYOUT_CLASS}>{children}</div>
    </div>
  );
}
