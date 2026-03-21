import { ExpenseFormShell } from "@/features/expenses/components/form/ExpenseFormShell";
import { ExpenseFormRow } from "@/features/expenses/components/form/ExpenseFormRow";
import { Skeleton } from "@/components/ui/skeleton";

function BillFormFieldSkeleton({ inputClassName }) {
  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
      <Skeleton className="h-4 w-28 shrink-0 lg:w-[150px]" />
      <Skeleton className={inputClassName ?? "h-12 w-full flex-1 rounded-md"} />
    </div>
  );
}

export function BillFormLoadingState({ title, loadingLabel, onClose }) {
  return (
    <ExpenseFormShell title={title} onClose={onClose} className="bill-form-loading">
      <div
        className="mt-2 flex flex-col gap-3 lg:gap-4"
        aria-busy="true"
        aria-live="polite"
        aria-label={loadingLabel}
      >
        <ExpenseFormRow first className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <BillFormFieldSkeleton />
          <BillFormFieldSkeleton />
          <div className="w-full md:col-span-2 xl:col-span-1 xl:min-w-0 xl:flex-1">
            <BillFormFieldSkeleton />
          </div>
        </ExpenseFormRow>

        <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <BillFormFieldSkeleton />
          <BillFormFieldSkeleton />
          <div className="w-full md:col-span-2 xl:col-span-1 xl:min-w-0 xl:flex-1">
            <BillFormFieldSkeleton />
          </div>
        </ExpenseFormRow>

        <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <div className="w-full md:max-w-md">
            <BillFormFieldSkeleton />
          </div>
        </ExpenseFormRow>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Skeleton className="h-11 w-full rounded-md sm:w-40" />
          <Skeleton className="h-11 w-full rounded-md sm:w-44" />
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-card/40 p-3">
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-[4.5rem] w-full rounded-lg" />
            <Skeleton className="h-[4.5rem] w-full rounded-lg" />
            <Skeleton className="h-[4.5rem] w-full rounded-lg md:hidden" />
          </div>
          <Skeleton className="mt-3 h-4 w-full max-w-[12rem] self-end sm:ml-auto" />
        </div>

        <div className="mt-2 flex justify-end pb-4 pt-4 lg:static">
          <Skeleton className="h-11 w-full max-w-[200px] rounded-md sm:w-44" />
        </div>

        <span className="sr-only">{loadingLabel}</span>
      </div>
    </ExpenseFormShell>
  );
}
