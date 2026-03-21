import React from "react";

export function SidebarProfileFooterSkeleton({ collapsed, label }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-1" aria-busy="true" aria-label={label}>
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }
  return (
    <div
      className="rounded-lg border border-border bg-muted/40 px-2 py-2"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted/80" />
        </div>
      </div>
    </div>
  );
}
