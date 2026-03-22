import { ExpenseFormShell } from "@/features/expenses/components/form/ExpenseFormShell";
import { ExpenseFormRow } from "@/features/expenses/components/form/ExpenseFormRow";
import { Skeleton } from "@/components/ui/skeleton";

function BillFormFieldSkeleton({ inputClassName }) {
  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Skeleton className="h-4 w-28 shrink-0 lg:w-[9.375rem]" />
        <div className="w-full flex-1 max-w-full xl:max-w-[min(100%,18.75rem)]">
          <Skeleton className={inputClassName ?? "h-12 w-full rounded-lg"} />
        </div>
      </div>
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
          <BillFormFieldSkeleton />
        </ExpenseFormRow>

        <ExpenseFormRow className="md:grid md:grid-cols-2 md:gap-3 xl:flex xl:gap-4">
          <BillFormFieldSkeleton />
          <BillFormFieldSkeleton />
          <BillFormFieldSkeleton />
        </ExpenseFormRow>

        <div className="mt-4 flex flex-row gap-2 sm:justify-between">
          <Skeleton className="h-11 sm:h-9 flex-1 sm:flex-none sm:w-[8.5rem] rounded-md" />
          <Skeleton className="h-11 sm:h-9 flex-1 sm:flex-none sm:w-[10.5rem] rounded-md" />
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-card/40 px-2 py-2 sm:px-3 sm:py-3">
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <Skeleton className="h-[5.5rem] w-full rounded-lg" />
            <Skeleton className="h-[5.5rem] w-full rounded-lg hidden sm:block" />
            <Skeleton className="h-[5.5rem] w-full rounded-lg hidden md:block" />
            <Skeleton className="h-[5.5rem] w-full rounded-lg hidden lg:block" />
          </div>
          <div className="mt-3 flex justify-between border-t border-border/60 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="mt-2 flex justify-end pb-4 pt-4 lg:static">
          <Skeleton className="h-11 w-full max-w-[12.5rem] rounded-md sm:w-44" />
        </div>

        <span className="sr-only">{loadingLabel}</span>
      </div>
    </ExpenseFormShell>
  );
}
