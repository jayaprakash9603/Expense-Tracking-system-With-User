import { Accordion } from "@/shared/components/app-shadcn";
import { BillAccordionCard } from "@/features/bills/components/accordion/BillAccordionCard";
import { AppPagination } from "@/shared/components/data/AppPagination";
import { cn } from "@/lib/utils";
import { BILLS_ACCORDION_DEFAULT_PAGE_SIZE } from "@/features/bills/constants/billsAccordionLayout";

const DESKTOP_SCROLL_CLASS =
  "sm:h-[27rem] sm:overflow-y-auto sm:overscroll-contain sm:theme-scrollbar sm:pr-1";

export function BillAccordionListInner({
  t,
  isMobile,
  pageIndex,
  setPageIndex,
  pageSize,
  pageCount,
  total,
  visibleBills,
  padCount,
  loadMoreRef,
  mobileLimit,
  handlePageSizeChange,
  pageSizeOptions,
  onEdit,
  onDelete,
  className,
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className={cn("min-h-0 w-full overflow-visible", !isMobile && DESKTOP_SCROLL_CLASS)}>
        <Accordion type="multiple" className="min-w-0 space-y-3">
          {visibleBills.map((raw) => (
            <BillAccordionCard key={raw.id ?? raw.billId} raw={raw} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {padCount > 0
            ? Array.from({ length: padCount }).map((_, idx) => (
                <div
                  key={`pad-${idx}`}
                  className="min-h-[5.75rem] sm:min-h-[4.25rem] shrink-0 rounded-xl border border-border/40 bg-muted/10 pointer-events-none"
                  aria-hidden="true"
                />
              ))
            : null}
        </Accordion>
        {isMobile && mobileLimit < total ? <div ref={loadMoreRef} className="h-10 w-full" /> : null}
      </div>

      {!isMobile ? (
        <AppPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={total}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSizeChange}
          pageSummaryText={t("common.tablePageStatus", {
            current: pageIndex + 1,
            total: pageCount,
          })}
          rowsPerPageLabel={t("common.rowsPerPage")}
        />
      ) : null}
    </div>
  );
}

export function BillAccordionListSkeleton({ isMobile, className }) {
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
