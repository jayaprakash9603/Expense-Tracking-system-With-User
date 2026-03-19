import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGE_LABELS = { week: "W", month: "M", year: "Y" };

export function FlowRangeNavigator({
  activeRange,
  setActiveRange,
  rangeLabel,
  onPrev,
  onNext,
  onReset,
  rangeOptions = ["week", "month", "year"],
  className,
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
        {rangeOptions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRange(r)}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-md transition-colors",
              activeRange === r
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {RANGE_LABELS[r] || r}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium px-2 py-1 rounded hover:bg-muted transition-colors min-w-[100px] text-center"
        >
          {rangeLabel}
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
