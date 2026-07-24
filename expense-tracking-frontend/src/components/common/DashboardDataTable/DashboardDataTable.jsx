import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import "./DashboardDataTable.css";

const SortIcon = ({ direction }) => {
  if (direction === "asc") return <ArrowUp className="dashboard-data-table__sort-icon" />;
  if (direction === "desc") return <ArrowDown className="dashboard-data-table__sort-icon" />;
  return <ArrowUpDown className="dashboard-data-table__sort-icon" />;
};

const DashboardDataTable = ({
  columns = [],
  data = [],
  getRowId,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  defaultSorting = [],
  enablePagination = true,
  emptyTitle = "No records",
  emptySubtitle = "Nothing matches the current selection.",
  className = "",
  maxHeight,
  footerSelectionLabel,
}) => {
  const { colors, mode } = useTheme();
  const [sorting, setSorting] = useState(defaultSorting);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const tableColumns = useMemo(
    () =>
      columns.map((column) => ({
        id: column.id,
        accessorKey: column.accessorKey ?? column.id,
        accessorFn: column.accessorFn,
        header: column.header,
        cell: column.cell,
        enableSorting: column.enableSorting !== false,
        sortingFn: column.sortingFn,
        meta: {
          align: column.align || "left",
        },
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId: getRowId || ((row, index) => String(row?.id ?? index)),
    autoResetPageIndex: true,
  });

  const rowModel = table.getRowModel();
  const filteredCount = table.getFilteredRowModel?.()?.rows?.length ?? data.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const start = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, filteredCount);

  const themeVars = {
    "--ddt-bg": colors.primary_bg,
    "--ddt-surface": colors.secondary_bg || colors.tertiary_bg || colors.primary_bg,
    "--ddt-border": colors.border_color,
    "--ddt-text": colors.primary_text,
    "--ddt-muted": colors.secondary_text,
    "--ddt-accent": colors.primary_accent || colors.secondary_accent || "#14b8a6",
    "--ddt-hover": mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
    "--ddt-selected": mode === "dark" ? "rgba(20,184,166,0.14)" : "rgba(20,184,166,0.10)",
  };

  return (
    <div
      className={`dashboard-data-table ${className}`.trim()}
      style={themeVars}
    >
      <div
        className="dashboard-data-table__scroll"
        style={maxHeight ? { maxHeight, overflow: "auto" } : undefined}
      >
        <table className="dashboard-data-table__table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align || "left";
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={
                        align === "right"
                          ? "is-right"
                          : align === "center"
                            ? "is-center"
                            : ""
                      }
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className={`dashboard-data-table__sort-btn ${sorted ? "is-active" : ""}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <SortIcon direction={sorted || "none"} />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowModel.rows.length ? (
              rowModel.rows.map((row) => (
                <tr key={row.id} className={row.getIsSelected?.() ? "is-selected" : ""}>
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align || "left";
                    return (
                      <td
                        key={cell.id}
                        className={
                          align === "right"
                            ? "is-right"
                            : align === "center"
                              ? "is-center"
                              : ""
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumns.length}>
                  <div className="dashboard-data-table__empty">
                    <div className="dashboard-data-table__empty-title">
                      {emptyTitle}
                    </div>
                    {emptySubtitle ? (
                      <div className="dashboard-data-table__empty-sub">
                        {emptySubtitle}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && filteredCount > 0 ? (
        <div className="dashboard-data-table__footer">
          <div className="dashboard-data-table__footer-meta">
            {footerSelectionLabel ||
              `${start}-${end} of ${filteredCount} row${filteredCount === 1 ? "" : "s"}`}
          </div>
          <div className="dashboard-data-table__footer-controls">
            <label className="dashboard-data-table__page-size">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <span className="dashboard-data-table__page-indicator">
              Page {pageIndex + 1} of {Math.max(pageCount, 1)}
            </span>
            <div className="dashboard-data-table__nav">
              <button
                type="button"
                className="dashboard-data-table__nav-btn"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="First page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                type="button"
                className="dashboard-data-table__nav-btn"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="dashboard-data-table__nav-btn"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="dashboard-data-table__nav-btn"
                onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
                disabled={!table.getCanNextPage()}
                aria-label="Last page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

DashboardDataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      accessorKey: PropTypes.string,
      accessorFn: PropTypes.func,
      header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      cell: PropTypes.func,
      align: PropTypes.oneOf(["left", "center", "right"]),
      enableSorting: PropTypes.bool,
      sortingFn: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    })
  ),
  data: PropTypes.array,
  getRowId: PropTypes.func,
  defaultPageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  defaultSorting: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      desc: PropTypes.bool,
    })
  ),
  enablePagination: PropTypes.bool,
  emptyTitle: PropTypes.string,
  emptySubtitle: PropTypes.string,
  className: PropTypes.string,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  footerSelectionLabel: PropTypes.string,
};

export default DashboardDataTable;
