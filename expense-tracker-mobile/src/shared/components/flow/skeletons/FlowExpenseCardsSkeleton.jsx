import React from "react";
import { cn } from "@/lib/utils";

function buildSkeletonGroups(count) {
  const safeCount = Math.max(2, Math.min(count, 5));
  const firstGroupCards = Math.min(3, safeCount);
  const secondGroupCards = Math.max(1, safeCount - firstGroupCards);

  return [
    { id: "first", showDivider: false, cards: firstGroupCards },
    { id: "second", showDivider: true, cards: secondGroupCards },
  ];
}

export function FlowExpenseCardsSkeleton({ count = 5, className }) {
  const groups = buildSkeletonGroups(count);

  return (
    <div className={cn("flex flex-col min-h-0 gap-2 sm:gap-3", className)}>
      <div className="rounded-lg bg-card border px-2.5 sm:px-3 py-1.5 sm:py-2 animate-pulse">
        <div className="sm:hidden flex items-center gap-1.5">
          <div className="h-6 w-[6.5rem] rounded-full bg-muted" />
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <div className="h-7 w-7 rounded-full bg-muted" />
            <div className="h-6 flex-1 rounded-full bg-muted" />
            <div className="h-7 w-7 rounded-full bg-muted" />
          </div>
          <div className="h-7 w-7 rounded-full bg-muted" />
        </div>

        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted" />
            <div className="h-6 w-28 sm:w-36 rounded-full bg-muted" />
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted" />
          </div>

          <div className="flex items-center gap-1 justify-self-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted" />
            <div className="h-6 w-24 sm:w-28 rounded-full bg-muted" />
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted" />
          </div>

          <div className="justify-self-end h-6 w-24 sm:w-28 rounded-full bg-muted" />
        </div>
      </div>

      <div className="flex flex-col min-h-0 gap-3 sm:gap-4 h-[17.5rem] sm:h-[20rem] md:h-[22.5rem] lg:h-[24.375rem] overflow-hidden pr-1 pb-2">
        {groups.map((group, groupIdx) => (
          <div key={group.id}>
            {group.showDivider && (
              <div className="flex items-center gap-4 my-4 animate-pulse">
                <div className="flex-1 h-0.5 bg-muted/50" />
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="flex-1 h-0.5 bg-muted/50" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2 items-start">
              {Array.from({ length: group.cards }).map((_, cardIdx) => (
                <div
                  key={`${group.id}-${cardIdx}`}
                  className="rounded-lg border bg-card p-2 sm:p-2.5 flex flex-col gap-1 w-full animate-pulse"
                  style={{ animationDelay: `${(groupIdx * 4 + cardIdx) * 70}ms` }}
                >
                  <div className="border-b border-border pb-1">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded-full bg-muted" />
                    <div className="h-5 w-20 rounded bg-muted" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <div className="h-3 w-3 rounded bg-muted/60" />
                      <div className="h-3 w-16 rounded bg-muted/60" />
                    </div>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <div className="h-3 w-3 rounded bg-muted/60" />
                      <div className="h-3 w-16 rounded bg-muted/60" />
                    </div>
                  </div>
                  <div className="border-t border-border pt-0.5">
                    <div className="h-3 w-11/12 rounded bg-muted/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
