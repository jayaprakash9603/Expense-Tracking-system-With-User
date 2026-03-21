import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const NAV_BTN = "h-8 w-8";

function PageSizeSelect({ value, options, label, onChange, className, showLabel = true }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel ? (
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </span>
      ) : null}
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger
          className={cn(
            "h-8 border-input bg-background text-xs sm:text-sm",
            showLabel ? "w-[4.5rem]" : "w-[3.25rem] shrink-0 px-2",
          )}
          aria-label={label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TablePageNav({ pageIndex, pageCount, setPageIndex, aria }) {
  const lastPageIndex = Math.max(0, pageCount - 1);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < lastPageIndex;

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={NAV_BTN}
            aria-label={aria.first}
            disabled={!canPrev}
            onClick={() => setPageIndex(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={NAV_BTN}
            aria-label={aria.previous}
            disabled={!canPrev}
            onClick={() => setPageIndex(pageIndex - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={NAV_BTN}
            aria-label={aria.next}
            disabled={!canNext}
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={NAV_BTN}
            aria-label={aria.last}
            disabled={!canNext}
            onClick={() => setPageIndex(lastPageIndex)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function AppPagination({
  pageIndex,
  pageSize,
  totalItems,
  pageCount: explicitPageCount,
  pageSizeOptions = [10, 20, 30, 50],
  onPageChange,
  onPageSizeChange,
  selectable = false,
  selectedRowsText = "",
  pageSummaryText,
  rowsPerPageLabel,
  className,
}) {
  const { t } = useLanguage();
  const resolvedRowsLabel = rowsPerPageLabel ?? t("common.rowsPerPage");
  const paginationAria = {
    first: t("common.pagination.first"),
    previous: t("common.pagination.previous"),
    next: t("common.pagination.next"),
    last: t("common.pagination.last"),
  };
  const pageCount = explicitPageCount ?? Math.ceil(totalItems / pageSize);
  const pageCurrent = pageIndex + 1;
  const pageTotal = Math.max(1, pageCount);
  const mobilePageIndicator = `${pageCurrent} / ${pageTotal}`;

  return (
    <div className={cn("rounded-lg border border-border bg-card/50 px-2 py-3 sm:px-3", className)}>
      <div className="flex items-center gap-2 md:hidden">
        <span
          className="shrink-0 text-xs font-semibold tabular-nums text-foreground"
          aria-label={pageSummaryText}
        >
          {mobilePageIndicator}
        </span>
        <div className="flex min-w-0 flex-1 justify-center">
          <TablePageNav
            pageIndex={pageIndex}
            pageCount={pageCount}
            setPageIndex={onPageChange}
            aria={paginationAria}
          />
        </div>
        <PageSizeSelect
          value={pageSize}
          options={pageSizeOptions}
          label={resolvedRowsLabel}
          onChange={onPageSizeChange}
          showLabel={false}
          className="shrink-0 justify-end"
        />
      </div>

      <div className="relative hidden min-h-9 items-center gap-3 md:flex">
        <div className="relative z-[1] min-h-5 min-w-0 max-w-[42%] shrink-0 text-sm font-medium text-primary">
          {selectable ? selectedRowsText : null}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-2">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium tabular-nums sm:text-sm">{pageSummaryText}</span>
            <TablePageNav
              pageIndex={pageIndex}
              pageCount={pageCount}
              setPageIndex={onPageChange}
              aria={paginationAria}
            />
          </div>
        </div>
        <PageSizeSelect
          value={pageSize}
          options={pageSizeOptions}
          label={resolvedRowsLabel}
          onChange={onPageSizeChange}
          className="relative z-[1] ml-auto shrink-0 justify-end"
        />
      </div>
    </div>
  );
}

export default AppPagination;
