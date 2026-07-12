import { cn } from "@/lib/utils";

export function BudgetProgressBar({ budget }) {
  const w = budget.progressWidth ?? 0;
  const over = budget.isOverBudget;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", over ? "bg-destructive" : "bg-primary")}
        style={{ width: `${Math.min(100, w)}%` }}
      />
    </div>
  );
}
