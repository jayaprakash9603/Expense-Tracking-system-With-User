import { cn } from "@/lib/utils";
import {
  BILLS_ACCORDION_DEFAULT_PAGE_SIZE,
} from "@/features/bills/constants/billsAccordionLayout";

export function BillAccordionListLoading({ className }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="space-y-3 sm:h-[27rem] sm:overflow-hidden">
        {Array.from({ length: BILLS_ACCORDION_DEFAULT_PAGE_SIZE }).map((_, i) => (
          <div
            key={i}
            className="h-[5.75rem] sm:h-[4.25rem] shrink-0 animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}
