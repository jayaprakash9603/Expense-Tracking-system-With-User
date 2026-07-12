import React from "react";
import { FLOW_ENTITY_CARDS_GRID_LAYOUT_CLASS } from "@/shared/components/flow/FlowEntityCardsGrid";
import { cn } from "@/lib/utils";

function FlowEntityCardSkeletonCell({ delayMs, compact }) {
  if (compact) {
    return (
      <div
        className="h-full min-h-[5.5rem] animate-pulse overflow-hidden rounded-lg border bg-card"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <div className="flex h-full items-stretch">
          <div className="w-1 shrink-0 bg-muted" />
          <div className="flex flex-1 flex-col gap-1.5 p-2 sm:p-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-5 w-5 shrink-0 rounded-full bg-muted" />
              <div className="h-3 min-w-0 flex-1 rounded bg-muted" />
            </div>
            <div className="h-3.5 w-16 rounded bg-muted" />
            <div className="h-2.5 w-14 rounded bg-muted/60" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="animate-pulse overflow-hidden rounded-lg border bg-card"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0 bg-muted" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-5 w-5 rounded bg-muted/50" />
          </div>
          <div className="h-5 w-20 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export function FlowEntityCardsSkeleton({ count = 4, layout = "stack", className }) {
  const isGrid = layout === "grid";
  const compact = isGrid;
  return (
    <div
      className={cn(
        isGrid ? "flex min-h-0 flex-col gap-2" : "flex flex-col gap-3",
        className,
      )}
    >
      {isGrid ? (
        <div className={FLOW_ENTITY_CARDS_GRID_LAYOUT_CLASS}>
          {Array.from({ length: count }).map((_, i) => (
            <FlowEntityCardSkeletonCell key={i} delayMs={i * 80} compact />
          ))}
        </div>
      ) : (
        Array.from({ length: count }).map((_, i) => (
          <FlowEntityCardSkeletonCell key={i} delayMs={i * 100} compact={false} />
        ))
      )}
    </div>
  );
}
