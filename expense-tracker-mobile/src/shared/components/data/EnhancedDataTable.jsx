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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { cn } from "@/lib/utils";

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

function DraggableRow({ row, children }) {
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
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {children}
    </TableRow>
  );
}

function TableSkeleton({ colCount, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: colCount }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
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

export function EnhancedDataTable({
  columns,
  data: initialData,
  loading = false,
  draggable = false,
  searchable = false,
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
  onRetry,
  toolbar,
  className,
  getRowId,
  rowSelectionState,
  onRowSelectionStateChange,
  selectionCheckboxClassName,
  tableClassName,
}) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
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
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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

    return [...cols, ...nextColumns];
  }, [
    columns,
    draggable,
    selectable,
    enableColumnFilters,
    selectionCheckboxClassName,
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

  const tableContent = (
    <Table className={tableClassName}>
      <TableHeader className="sticky top-0 z-10 bg-muted">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                {renderHeaderCell(header)}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableSkeleton colCount={enhancedColumns.length} />
        ) : table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={enhancedColumns.length} className="h-48">
              <NoDataPlaceholder
                message={emptyMessage || t("common.noData") || "No data"}
                subMessage={emptySubMessage}
                onRetry={onRetry}
                size="sm"
              />
            </TableCell>
          </TableRow>
        ) : draggable ? (
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row}>
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
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(searchable || showColumnVisibility || toolbar) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {searchable && (
              <SearchToolbar
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={searchPlaceholder}
                className="flex-1 min-w-[200px] max-w-sm"
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

      <div className="overflow-hidden rounded-lg border">
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

      {showPagination && (
        <div className="px-1">
          <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
            <div className="min-h-[20px] text-xs text-muted-foreground sm:text-sm md:justify-self-start">
              {selectable
                ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
                : ""}
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-self-center">
              <div className="text-xs font-medium sm:text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 md:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 md:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:justify-self-end">
              <span className="text-xs font-medium sm:text-sm">
                {t("common.rowsPerPage") || "Rows per page"}
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-8 rounded border border-input bg-background px-2 text-xs sm:text-sm"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedDataTable;
