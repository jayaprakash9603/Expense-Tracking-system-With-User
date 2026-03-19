import React from "react";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = [65, 40, 85, 55, 70, 30, 90, 45, 75, 50, 60, 35];

export function FlowChartSkeleton({ className }) {
  return (
    <div className={cn("w-full animate-pulse", className)} style={{ height: 280 }}>
      <div className="flex h-full gap-2 p-4">
        <div className="flex flex-col justify-between items-end w-8 pb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-6 rounded bg-muted" />
          ))}
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 bottom-6 flex flex-col justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-px bg-border/30" />
            ))}
          </div>

          <div className="flex-1 flex items-end justify-around gap-1 pb-2 relative z-[1]">
            {BAR_HEIGHTS.slice(0, 7).map((h, i) => (
              <div key={i} className="flex-1 max-w-10 flex items-end h-full">
                <div
                  className="w-full rounded-t bg-muted"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-around pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 w-6 rounded bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
