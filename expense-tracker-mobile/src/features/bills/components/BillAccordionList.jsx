import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { FileText } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { BillAccordionCard } from "@/features/bills/components/BillAccordionCard";
import { AppPagination } from "@/shared/components/data/AppPagination";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";
import {
  BILLS_ACCORDION_DEFAULT_PAGE_SIZE,
  BILLS_ACCORDION_PAGE_SIZE_OPTIONS,
} from "@/features/bills/constants/billsAccordionLayout";

export function BillAccordionList({ rawBills, loading, onEdit, onDelete, className }) {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(BILLS_ACCORDION_DEFAULT_PAGE_SIZE);
  const [mobileLimit, setMobileLimit] = useState(10);
  const loadMoreRef = useRef(null);

  const total = rawBills?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Infinite scroll observer for mobile
  useEffect(() => {
    if (!isMobile || !total || mobileLimit >= total) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMobileLimit((prev) => Math.min(prev + 10, total));
        }
      },
      { rootMargin: "400px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, total, mobileLimit]);

  useEffect(() => {
    setPageIndex((prev) => {
      const maxIdx = Math.max(0, pageCount - 1);
      return prev > maxIdx ? maxIdx : prev;
    });
  }, [pageCount, total, pageSize]);

  const visibleBills = useMemo(() => {
    if (!rawBills?.length) return [];
    if (isMobile) {
      return rawBills.slice(0, mobileLimit);
    }
    const start = pageIndex * pageSize;
    return rawBills.slice(start, start + pageSize);
  }, [rawBills, isMobile, mobileLimit, pageIndex, pageSize]);

  const isLastPage = pageIndex === pageCount - 1;
  const padCount =
    !isMobile && pageSize === BILLS_ACCORDION_DEFAULT_PAGE_SIZE && isLastPage && visibleBills.length > 0
      ? Math.max(0, pageSize - visibleBills.length)
      : 0;

  const handlePageSizeChange = useCallback((next) => {
    setPageSize(next);
    setPageIndex(0);
  }, []);

  const desktopScrollClass =
    "sm:h-[27rem] sm:overflow-y-auto sm:overscroll-contain sm:theme-scrollbar sm:pr-1";

  if (loading) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-3", className)}>
        <div className="space-y-3 sm:h-[27rem] sm:overflow-hidden">
            {Array.from({ length: isMobile ? 6 : BILLS_ACCORDION_DEFAULT_PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-[5.75rem] sm:h-[4.25rem] shrink-0 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!total) {
    return (
      <NoDataPlaceholder
        message={t("bills.emptyTitle")}
        subMessage={t("bills.emptyDescription")}
        icon={FileText}
        size="md"
        fullWidth
        className={cn(className)}
      />
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className={cn("min-h-0 w-full overflow-visible", !isMobile && desktopScrollClass)}>
        <Accordion type="multiple" className="min-w-0 space-y-3">
          {visibleBills.map((raw) => (
            <BillAccordionCard
              key={raw.id ?? raw.billId}
              raw={raw}
              onEdit={onEdit}
              onDelete={onDelete}
            />
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
        {isMobile && mobileLimit < total && (
          <div ref={loadMoreRef} className="h-10 w-full" />
        )}
      </div>
      
      {!isMobile && (
        <AppPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={total}
          pageSizeOptions={BILLS_ACCORDION_PAGE_SIZE_OPTIONS}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSizeChange}
          pageSummaryText={t("common.tablePageStatus", {
            current: pageIndex + 1,
            total: pageCount,
          })}
          rowsPerPageLabel={t("common.rowsPerPage")}
        />
      )}
    </div>
  );
}
