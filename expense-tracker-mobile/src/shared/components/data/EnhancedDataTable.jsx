import React, { useState, useMemo, useId, useEffect, useCallback } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import {
  GripVertical,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataPlaceholder } from "@/shared/components/feedback/NoDataPlaceholder";
import { SearchToolbar } from "@/shared/components/search/SearchToolbar";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { DataTableFilterPopover } from "@/shared/components/data/DataTableFilterPopover";
import { DataTablePagination } from "@/shared/components/data/DataTablePagination";
import { cn } from "@/lib/utils";
import { pxToRem } from "@/shared/constants/expenseFormLayout";

function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="size-3 text-muted-foreground" />
    </Button>
  );
}

function DraggableRow({ row, children, fixedRowStyle, fixedRowClassName }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id ?? row.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0",
        isDragging && "z-10 opacity-80 bg-muted/50",
        fixedRowClassName,
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...fixedRowStyle,
      }}
    >
      {children}
    </TableRow>
  );
}

function TableSkeleton({ colCount, rows = 5, rowHeightPx = null }) {
  const fixedStyle =
    rowHeightPx == null
      ? undefined
      : { height: pxToRem(rowHeightPx), maxHeight: pxToRem(rowHeightPx) };
  const fixedClass =
    rowHeightPx == null
      ? undefined
      : "overflow-hidden [&>td]:overflow-hidden [&>td]:align-middle [&>td]:py-2";
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i} className={fixedClass} style={fixedStyle}>
      {Array.from({ length: colCount }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full max-w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function matchesText(value, filter) {
  const operator = filter?.operator || "contains";
  const left = normalizeText(value);
  const right = normalizeText(filter?.value);
  if (!right) return true;
  if (operator === "contains") return left.includes(right);
  if (operator === "notContains") return !left.includes(right);
  if (operator === "equals") return left === right;
  if (operator === "startsWith") return left.startsWith(right);
  if (operator === "endsWith") return left.endsWith(right);
  if (operator === "neq") return left !== right;
  return true;
}

function matchesNumber(value, filter) {
  const operator = filter?.operator || "equals";
  const left = parseNumber(value);
  const right = parseNumber(filter?.value);
  if (left == null || right == null) return false;
  if (operator === "equals") return left === right;
  if (operator === "gt") return left > right;
  if (operator === "lt") return left < right;
  if (operator === "gte") return left >= right;
  if (operator === "lte") return left <= right;
  if (operator === "neq") return left !== right;
  return true;
}

function toDateOnlyKey(date) {
  return date.toISOString().split("T")[0];
}

function matchesDate(value, filter) {
  const operator = filter?.operator || "equals";
  const left = parseDate(value);
  if (!left) return false;

  if (operator === "range") {
    const from = parseDate(filter?.value?.from);
    const to = parseDate(filter?.value?.to);
    if (from && left < from) return false;
    if (to && left > to) return false;
    return true;
  }

  const right = parseDate(filter?.value);
  if (!right) return false;
  if (operator === "equals") return toDateOnlyKey(left) === toDateOnlyKey(right);
  if (operator === "before") return left < right;
  if (operator === "after") return left > right;
  if (operator === "neq") return toDateOnlyKey(left) !== toDateOnlyKey(right);
  return true;
}

function advancedColumnFilterFn(row, columnId, filter) {
  if (!filter) return true;
  const filterType = filter?.type || "text";
  const value = row.getValue(columnId);
  if (filterType === "number") return matchesNumber(value, filter);
  if (filterType === "date") return matchesDate(value, filter);
  return matchesText(value, filter);
}

function getSortIndicator(direction) {
  if (!direction) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
  if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5 text-primary" />;
  return <ArrowDown className="h-3.5 w-3.5 text-primary" />;
}

function isSimpleHeader(headerDef) {
  return typeof headerDef === "string" || typeof headerDef === "number";
}

function toHeaderLabel(column) {
  const headerDef = column?.columnDef?.header;
  if (typeof headerDef === "string" || typeof headerDef === "number") {
    return String(headerDef);
  }
  return String(column?.id || "");
}

const DEFAULT_SCROLL_BODY_MAX_ROWS = 5;
const DEFAULT_SCROLL_BODY_ROW_HEIGHT_PX = 42;
const DEFAULT_SCROLL_TABLE_HEADER_HEIGHT_PX = 41;
const SCROLL_VIEWPORT_SLACK_PX = 10;
const TABLE_BODY_ROW_SEPARATOR_PX = 1;
const LAST_PAGE_PADDED_ROW_TOTAL = 5;

function computeSizedBodyViewportHeightPx(
  scrollBodyMaxRows,
  scrollBodyRowHeightPx,
  scrollBodyHeightExtraPx,
) {
  return (
    scrollBodyMaxRows * scrollBodyRowHeightPx +
    scrollBodyHeightExtraPx +
    SCROLL_VIEWPORT_SLACK_PX +
    Math.max(0, scrollBodyMaxRows - 1) * TABLE_BODY_ROW_SEPARATOR_PX
  );
}

export function EnhancedDataTable({
  columns,
  data: initialData,
  loading = false,
  draggable = false,
  searchable = false,
  hideSearchToolbar = false,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  selectable = false,
  enableColumnFilters = false,
  showColumnVisibility = false,
  showPagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  onRowClick,
  onDataReorder,
  emptyMessage,
  emptySubMessage,
  emptyPlaceholderSize = "sm",
  onRetry,
  toolbar,
  className,
  getRowId,
  rowSelectionState,
  onRowSelectionStateChange,
  selectionCheckboxClassName,
  tableClassName,
  tableContainerClassName,
  tableSectionClassName,
  scrollBodyMaxRows = DEFAULT_SCROLL_BODY_MAX_ROWS,
  scrollBodyRowHeightPx = DEFAULT_SCROLL_BODY_ROW_HEIGHT_PX,
  scrollTableHeaderHeightPx = DEFAULT_SCROLL_TABLE_HEADER_HEIGHT_PX,
  scrollBodyHeightExtraPx = 0,
  scrollBodyAlwaysSized = false,
  filterRowGlobalFn,
  flexColumnSizing = false,
  lockColumnWidths: lockColumnWidthsProp,
}) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const [uncontrolledGlobalFilter, setUncontrolledGlobalFilter] = useState("");
  const isSearchControlled = controlledSearchQuery !== undefined;
  const globalFilter = isSearchControlled ? controlledSearchQuery : uncontrolledGlobalFilter;
  const setGlobalFilter = useCallback(
    (updater) => {
      if (isSearchControlled) {
        const prev = controlledSearchQuery;
        const next = typeof updater === "function" ? updater(prev) : updater;
        onSearchQueryChange?.(next);
        return;
      }
      setUncontrolledGlobalFilter((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    [isSearchControlled, controlledSearchQuery, onSearchQueryChange],
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: defaultPageSize });
  const sortableId = useId();
  const resolvedRowSelection = rowSelectionState ?? internalRowSelection;

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleRowSelectionChange = useCallback(
    (updater) => {
      if (rowSelectionState == null) {
        setInternalRowSelection((currentSelection) => {
          const nextSelection =
            typeof updater === "function"
              ? updater(currentSelection)
              : updater;
          onRowSelectionStateChange?.(nextSelection);
          return nextSelection;
        });
        return;
      }
      const nextSelection =
        typeof updater === "function"
          ? updater(rowSelectionState)
          : updater;
      onRowSelectionStateChange?.(nextSelection);
    },
    [rowSelectionState, onRowSelectionStateChange],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const lockColumnWidths = lockColumnWidthsProp ?? (scrollBodyMaxRows != null);

  const enhancedColumns = useMemo(() => {
    const cols = [];

    if (draggable) {
      cols.push({
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id ?? row.id} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              className={selectionCheckboxClassName}
              checked={
                table.getIsAllRowsSelected()
                  ? true
                  : table.getIsSomeRowsSelected()
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              className={selectionCheckboxClassName}
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    const nextColumns = columns.map((column) => {
      const filterType = column?.meta?.filterType;
      if (!enableColumnFilters || !filterType || column.filterFn) {
        return column;
      }
      return {
        ...column,
        filterFn: advancedColumnFilterFn,
      };
    });

    const merged = [...cols, ...nextColumns];
    if (!lockColumnWidths) return merged;
    return merged.map((col) => {
      const w = col.size;
      if (w == null) return col;
      const n = Number(w);
      if (Number.isNaN(n)) return col;
      return { ...col, minSize: n, maxSize: n };
    });
  }, [
    columns,
    draggable,
    selectable,
    enableColumnFilters,
    selectionCheckboxClassName,
    lockColumnWidths,
  ]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: resolvedRowSelection,
      globalFilter,
      pagination,
    },
    getRowId: getRowId || ((row, index) => String(row.id ?? row._id ?? index)),
    enableRowSelection: selectable,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(filterRowGlobalFn ? { globalFilterFn: filterRowGlobalFn } : {}),
  });

  const dataIds = useMemo(
    () => data.map((d) => d.id ?? d._id ?? ""),
    [data],
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((d) => (d.id ?? d._id) === active.id);
        const newIndex = prev.findIndex((d) => (d.id ?? d._id) === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        onDataReorder?.(reordered);
        return reordered;
      });
    }
  }

  const visibleColumns = table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide());
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredTotal = table.getFilteredRowModel().rows.length;
  const selectedRowsText = selectable
    ? t("common.tableRowsSelected", { selected: selectedCount, total: filteredTotal })
    : "";
  const pageSummaryText = t("common.tablePageStatus", {
    current: table.getState().pagination.pageIndex + 1,
    total: Math.max(1, table.getPageCount()),
  });
  const rowsPerPageLabel = t("common.rowsPerPage") || "Rows per page";

  const pageBodyRowCount = loading
    ? (scrollBodyMaxRows ?? DEFAULT_SCROLL_BODY_MAX_ROWS)
    : table.getRowModel().rows.length;
  const shouldApplyBodyScrollCap =
    scrollBodyMaxRows != null &&
    (scrollBodyAlwaysSized || pageBodyRowCount > scrollBodyMaxRows);

  const sizedBodyViewportHeightPx =
    shouldApplyBodyScrollCap && scrollBodyMaxRows != null
      ? computeSizedBodyViewportHeightPx(
          scrollBodyMaxRows,
          scrollBodyRowHeightPx,
          scrollBodyHeightExtraPx,
        )
      : null;

  const tableScrollMaxHeightPx =
    shouldApplyBodyScrollCap && sizedBodyViewportHeightPx != null
      ? scrollTableHeaderHeightPx + sizedBodyViewportHeightPx
      : null;

  const tableContainerStyle =
    tableScrollMaxHeightPx == null
      ? undefined
      : { maxHeight: pxToRem(tableScrollMaxHeightPx) };

  const emptyTableBodyMinHeightPx =
    !loading && table.getRowModel().rows.length === 0 && sizedBodyViewportHeightPx != null
      ? sizedBodyViewportHeightPx
      : null;

  const useFixedBodyRowMetrics = lockColumnWidths;
  const fixedDataRowStyle = useFixedBodyRowMetrics
    ? {
        height: pxToRem(scrollBodyRowHeightPx),
        maxHeight: pxToRem(scrollBodyRowHeightPx),
      }
    : null;
  const fixedDataRowClassName = useFixedBodyRowMetrics
    ? "overflow-hidden [&>td]:overflow-hidden [&>td]:align-middle [&>td]:py-1.5"
    : undefined;

  const renderHeaderCell = useCallback(
    (header) => {
      if (header.isPlaceholder) return null;
      const headerContent = flexRender(
        header.column.columnDef.header,
        header.getContext(),
      );
      const canSort =
        header.column.getCanSort() &&
        isSimpleHeader(header.column.columnDef.header);
      const sortDirection = header.column.getIsSorted();
      const filterType = header.column.columnDef.meta?.filterType;
      const canFilter = Boolean(
        enableColumnFilters &&
          filterType &&
          header.column.getCanFilter(),
      );
      const headerLabel =
        header.column.columnDef.meta?.filterLabel ||
        toHeaderLabel(header.column);

      const content = canSort ? (
        <button
          type="button"
          className="inline-flex w-full items-center gap-1 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={header.column.getToggleSortingHandler()}
        >
          <span className="truncate">{headerContent}</span>
          {getSortIndicator(sortDirection)}
        </button>
      ) : isSimpleHeader(header.column.columnDef.header) ? (
        <div className="truncate text-xs font-semibold text-muted-foreground">
          {headerContent}
        </div>
      ) : (
        headerContent
      );

      if (!canFilter) return content;

      return (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">{content}</div>
          <DataTableFilterPopover
            column={header.column}
            filterType={filterType}
            filterLabel={headerLabel}
          />
        </div>
      );
    },
    [enableColumnFilters],
  );

  const paginationState = table.getState().pagination;
  const currentPageRows = loading ? [] : table.getRowModel().rows;
  const pageRowCount = currentPageRows.length;
  const pageSize = paginationState.pageSize;
  const pageRemainder = pageSize - pageRowCount;
  const isLastPage = !table.getCanNextPage();
  let padRowCount = 0;
  if (
    showPagination &&
    !loading &&
    !draggable &&
    isLastPage &&
    pageRowCount > 0 &&
    pageRemainder > 0
  ) {
    const maxBlanksToReachTarget = Math.max(
      0,
      LAST_PAGE_PADDED_ROW_TOTAL - pageRowCount,
    );
    padRowCount = Math.min(pageRemainder, maxBlanksToReachTarget);
  }
  const pagePadTemplateCells =
    padRowCount > 0 ? currentPageRows[0]?.getVisibleCells() ?? [] : [];

  const tableTotalWidth = table.getTotalSize();

  const resolveColumnWidthStyle = (sizePx) => {
    if (!flexColumnSizing || !tableTotalWidth) {
      return { width: pxToRem(sizePx) };
    }
    return { width: `${(sizePx / tableTotalWidth) * 100}%` };
  };

  const tableContent = (
    <Table
      className={cn(tableClassName, lockColumnWidths && "table-fixed")}
      containerClassName={cn(
        "theme-scrollbar",
        shouldApplyBodyScrollCap && "overscroll-contain",
        tableContainerClassName,
      )}
      containerStyle={tableContainerStyle}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                style={resolveColumnWidthStyle(header.getSize())}
                className="sticky top-0 z-20 min-w-0 border-b border-border bg-muted"
              >
                {renderHeaderCell(header)}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableSkeleton
            colCount={enhancedColumns.length}
            rows={scrollBodyMaxRows ?? DEFAULT_SCROLL_BODY_MAX_ROWS}
            rowHeightPx={useFixedBodyRowMetrics ? scrollBodyRowHeightPx : null}
          />
        ) : table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={enhancedColumns.length}
              className={cn(emptyTableBodyMinHeightPx == null && "h-48")}
              style={
                emptyTableBodyMinHeightPx != null
                  ? {
                      height: pxToRem(emptyTableBodyMinHeightPx),
                      minHeight: pxToRem(emptyTableBodyMinHeightPx),
                    }
                  : undefined
              }
            >
              <NoDataPlaceholder
                message={emptyMessage || t("common.noData") || "No data"}
                subMessage={emptySubMessage}
                onRetry={onRetry}
                size={emptyTableBodyMinHeightPx != null ? "xs" : emptyPlaceholderSize}
                fullWidth
                className={
                  emptyTableBodyMinHeightPx != null
                    ? "h-full min-h-0 justify-center border-border bg-background"
                    : undefined
                }
              />
            </TableCell>
          </TableRow>
        ) : draggable ? (
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            {table.getRowModel().rows.map((row) => (
              <DraggableRow
                key={row.id}
                row={row}
                fixedRowStyle={fixedDataRowStyle ?? undefined}
                fixedRowClassName={fixedDataRowClassName}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    onClick={() => cell.column.id !== "drag" && cell.column.id !== "select" && onRowClick?.(row.original)}
                    className={cn(onRowClick && cell.column.id !== "drag" && cell.column.id !== "select" && "cursor-pointer")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </DraggableRow>
            ))}
          </SortableContext>
        ) : (
          <>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(onRowClick && "cursor-pointer", fixedDataRowClassName)}
                style={fixedDataRowStyle ?? undefined}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(flexColumnSizing && "min-w-0")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {padRowCount > 0 && pagePadTemplateCells.length > 0
              ? Array.from({ length: padRowCount }).map((_, padIndex) => (
                  <TableRow
                    key={`page-pad-${padIndex}`}
                    className={cn(
                      "pointer-events-none border-border/40 bg-muted/10",
                      fixedDataRowClassName,
                    )}
                    style={fixedDataRowStyle ?? undefined}
                    aria-hidden="true"
                  >
                    {pagePadTemplateCells.map((cell) => (
                      <TableCell
                        key={`${cell.column.id}-pad-${padIndex}`}
                        style={resolveColumnWidthStyle(cell.column.getSize())}
                      >
                        {"\u00a0"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {((searchable && !hideSearchToolbar) || showColumnVisibility || toolbar) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {searchable && !hideSearchToolbar && (
              <SearchToolbar
                value={globalFilter}
                onChange={(val) => setGlobalFilter(val)}
                placeholder={searchPlaceholder}
                className="flex-1 min-w-[12.5rem] max-w-sm"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            {showColumnVisibility && visibleColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">{t("common.columns") || "Columns"}</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {visibleColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className={cn("overflow-hidden rounded-lg border", tableSectionClassName)}>
        {draggable ? (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            {tableContent}
          </DndContext>
        ) : (
          tableContent
        )}
      </div>

      {showPagination ? (
        <DataTablePagination
          table={table}
          selectable={selectable}
          selectedRowsText={selectedRowsText}
          pageSummaryText={pageSummaryText}
          rowsPerPageLabel={rowsPerPageLabel}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
    </div>
  );
}

export default EnhancedDataTable;
