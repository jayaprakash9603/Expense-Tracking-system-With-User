import React from "react";
import { LayoutGrid } from "lucide-react";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { FLOW_ENTITY_CARDS_PANEL_BODY_MIN_CLASS } from "@/shared/components/flow/FlowEntityCardsGrid";
import { cn } from "@/lib/utils";

export function FlowEntityCardsEmptyPanel({ title, message, className }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {title != null ? (
        <div className="border-b border-border/80 px-3 py-2.5 md:px-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        </div>
      ) : null}
      <div className="p-3 sm:p-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-12 text-center text-muted-foreground sm:py-16",
            FLOW_ENTITY_CARDS_PANEL_BODY_MIN_CLASS,
          )}
        >
          <AppIcon icon={LayoutGrid} color="muted" size="xl" className="shrink-0 opacity-80" />
          <p className="max-w-[18rem] text-xs leading-snug sm:text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
