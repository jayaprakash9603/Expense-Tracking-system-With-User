import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { SearchToolbar } from "@/shared/components/search/SearchToolbar";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

function SortIndicator({ sortKey, sortDir, columnKey }) {
  if (sortKey !== columnKey) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="h-3.5 w-3.5" />
    : <ArrowDown className="h-3.5 w-3.5" />;
}

function TableSkeleton({ columns, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i}>
      {columns.map((col) => (
        <TableCell key={col.key}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function AppDataTable({
  columns = [],
  data = [],
  loading = false,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  sortKey,
  sortDir,
  onSort,
  page = 0,
  pageSize = 10,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  selectable = false,
  selectedRows,
  onToggleRow,
  onToggleAll,
  isAllSelected = false,
  rowKey = "id",
  onRowClick,
  emptyMessage,
  emptySubMessage,
  onRetry,
  toolbar,
  className,
}) {
  const { t } = useLanguage();

  return (
    <div className={cn("space-y-3", className)}>
      {(onSearchChange || toolbar) && (
        <div className="flex items-center gap-2 flex-wrap">
          {onSearchChange && (
            <SearchToolbar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-[200px]"
            />
          )}
          {toolbar}
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={onToggleAll}
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable !== false && onSort && "cursor-pointer select-none",
                      col.className
                    )}
                    style={{ width: col.width, minWidth: col.minWidth }}
                    onClick={() => col.sortable !== false && onSort?.(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && onSort && (
                        <SortIndicator sortKey={sortKey} sortDir={sortDir} columnKey={col.key} />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={selectable ? [{ key: "check" }, ...columns] : columns} />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-48">
                    <NoDataPlaceholder
                      message={emptyMessage || t("common.noData")}
                      subMessage={emptySubMessage}
                      onRetry={onRetry}
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const id = typeof rowKey === "function" ? rowKey(row) : row[rowKey];
                  const isSelected = selectedRows?.has?.(id);

                  return (
                    <TableRow
                      key={id}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        isSelected && "bg-primary/5"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleRow?.(id)}
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell key={col.key} className={col.cellClassName}>
                          {col.render ? col.render(col.value ? col.value(row) : row[col.key], row) : (col.value ? col.value(row) : row[col.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t("common.rowsPerPage")}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="h-8 rounded border border-input bg-background px-2 text-sm"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span>
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} {t("common.of")}{" "}
              {totalItems}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AppButton
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 0}
              className="h-8 w-8"
            >
              <AppIcon icon={ChevronLeft} size="sm" />
            </AppButton>
            <AppButton
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages - 1}
              className="h-8 w-8"
            >
              <AppIcon icon={ChevronRight} size="sm" />
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppDataTable;
