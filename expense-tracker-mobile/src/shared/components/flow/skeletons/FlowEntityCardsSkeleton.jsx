import React from "react";
import { cn } from "@/lib/utils";

export function FlowEntityCardsSkeleton({ count = 4, className }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-card overflow-hidden"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-stretch">
            <div className="w-1.5 shrink-0 bg-muted" />
            <div className="flex-1 p-4 flex flex-col gap-3">
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
      ))}
    </div>
  );
}
