import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/shared/hooks/theme/useMediaQuery";
import {
  BILLS_ACCORDION_DEFAULT_PAGE_SIZE,
  BILLS_ACCORDION_PAGE_SIZE_OPTIONS,
} from "@/features/bills/constants/billsAccordionLayout";

export function useBillAccordionListView(rawBills) {
  const isMinSm = useMediaQuery("(min-width: 640px)");
  const isMobile = !isMinSm;
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(BILLS_ACCORDION_DEFAULT_PAGE_SIZE);
  const [mobileLimit, setMobileLimit] = useState(10);
  const loadMoreRef = useRef(null);

  const total = rawBills?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!isMobile || !total || mobileLimit >= total) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMobileLimit((prev) => Math.min(prev + 10, total));
        }
      },
      { rootMargin: "400px" },
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

  return {
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
    pageSizeOptions: BILLS_ACCORDION_PAGE_SIZE_OPTIONS,
  };
}
