import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGE_LABELS = { week: "Week", month: "Month", year: "Year" };

export function FlowRangeGranularityTabs({
  activeRange,
  setActiveRange,
  rangeOptions = ["week", "month", "year"],
  className,
}) {
  return (
    <div
      className={cn(
        "grid w-full max-w-[220px] grid-cols-3 items-center gap-1 rounded-lg bg-muted p-1 touch-manipulation",
        "sm:flex sm:w-fit sm:max-w-none",
        className,
      )}
    >
      {rangeOptions.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setActiveRange(r)}
          className={cn(
            "!cursor-pointer h-9 w-full select-none rounded-md px-3 text-sm font-semibold transition-colors",
            "touch-manipulation sm:h-8 sm:w-auto sm:min-w-[72px] sm:px-2 sm:text-xs",
            activeRange === r
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          {RANGE_LABELS[r] || r}
        </button>
      ))}
    </div>
  );
}

export function FlowPeriodNavigation({ rangeLabel, onPrev, onNext, onReset, className }) {
  return (
    <div className={cn("flex shrink-0 touch-manipulation items-center justify-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 cursor-pointer touch-manipulation select-none rounded-md border-border text-foreground hover:bg-accent"
        onClick={() => onPrev?.()}
      >
        <ChevronLeft className="h-4 w-4 pointer-events-none" />
      </Button>
      <button
        type="button"
        onClick={() => onReset?.()}
        className="h-9 min-w-[100px] cursor-pointer touch-manipulation select-none rounded-md px-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:min-w-[140px] sm:px-4"
      >
        {rangeLabel}
      </button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 cursor-pointer touch-manipulation select-none rounded-md border-border text-foreground hover:bg-accent"
        onClick={() => onNext?.()}
      >
        <ChevronRight className="h-4 w-4 pointer-events-none" />
      </Button>
    </div>
  );
}

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
      <FlowRangeGranularityTabs
        activeRange={activeRange}
        setActiveRange={setActiveRange}
        rangeOptions={rangeOptions}
        className="justify-self-stretch sm:justify-self-start w-full"
      />
      <FlowPeriodNavigation
        rangeLabel={rangeLabel}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
        className="w-full"
      />
    </div>
  );
}
