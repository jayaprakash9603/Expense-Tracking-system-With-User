import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGE_LABELS = { week: "Week", month: "Month", year: "Year" };

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
    <div className={cn("grid grid-cols-1 md:grid-cols-2 items-center gap-3 w-full", className)}>
      <div className="grid grid-cols-3 sm:flex items-center gap-1 w-full sm:w-fit justify-self-stretch sm:justify-self-start bg-muted rounded-lg p-1">
        {rangeOptions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRange(r)}
            className={cn(
              "h-9 sm:h-8 w-full sm:w-auto sm:min-w-[72px] px-3 sm:px-2 text-sm sm:text-xs font-semibold rounded-md transition-colors",
              activeRange === r
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {RANGE_LABELS[r] || r}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 w-full">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-md border-border text-foreground hover:bg-accent"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={onReset}
          className="h-9 text-sm font-semibold px-4 rounded-md hover:bg-accent transition-colors min-w-[120px] md:min-w-[140px] text-center text-foreground"
        >
          {rangeLabel}
        </button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-md border-border text-foreground hover:bg-accent"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
