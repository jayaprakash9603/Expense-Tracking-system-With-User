import { Skeleton } from "@/shared/components/app-shadcn";
import { ExpenseFormRow } from "@/shared/components/entity-form";

function BudgetFieldSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
      <Skeleton className="h-4 w-28 shrink-0 lg:w-[9.375rem]" />
      <Skeleton className="h-12 w-full flex-1 rounded-md" />
    </div>
  );
}

function BudgetDescriptionSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-0">
      <Skeleton className="mt-0.5 h-4 w-28 shrink-0 lg:w-[9.375rem]" />
      <Skeleton className="min-h-[4.5rem] w-full max-w-full flex-1 rounded-lg lg:max-w-[47.5rem]" />
    </div>
  );
}

export function BudgetFormPageSkeleton() {
  return (
    <div
      className="mt-2 flex flex-col gap-3 lg:gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <BudgetFieldSkeleton />
        <BudgetFieldSkeleton />
      </ExpenseFormRow>
      <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
        <BudgetFieldSkeleton />
        <BudgetFieldSkeleton />
      </ExpenseFormRow>
      <ExpenseFormRow>
        <BudgetDescriptionSkeleton />
      </ExpenseFormRow>
      <div className="mt-1 flex flex-wrap gap-2">
        <Skeleton className="h-10 w-full rounded-md sm:w-44" />
      </div>
      <div className="rounded-lg border border-border/60 bg-card/50 p-3">
        <Skeleton className="h-28 w-full rounded-md sm:h-36" />
      </div>
      <div className="flex justify-end pb-2 pt-4">
        <Skeleton className="h-11 w-full max-w-[12.5rem] rounded-md sm:w-44" />
      </div>
    </div>
  );
}
