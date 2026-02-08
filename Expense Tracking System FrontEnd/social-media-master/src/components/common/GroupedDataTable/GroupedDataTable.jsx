import React, { useState, useMemo, useEffect } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import { formatAmount as fmt } from "../../../utils/formatAmount";
import "../../PaymentMethodAccordion.css"; // Reuse existing styles

// Define stable default objects outside component
const DEFAULT_SORT = { key: "default", direction: "desc" };
const DEFAULT_FILTERS = {};
const DEFAULT_SELECTED_ROWS = {};

const GroupedDataTable = ({
  rows = [],
  columns = [],
  showPagination = true,
  // Sorting (Controlled)
  sort = DEFAULT_SORT,
  onSortChange,
  // Selection (Controlled)
  enableSelection = false,
  selectedRows = DEFAULT_SELECTED_ROWS, // { [rowKey]: true }
  onRowSelect, // (row, checked) => void
  onSelectAll, // (displayedRows, checked) => void
  resolveRowKey, // (row, index) => string
  // Filtering (UI triggers only)
  columnFilters = DEFAULT_FILTERS,
  onFilterClick, // (event, column) => void
  // Appearance
  activeTab = "all",
  rowRender,
  group, // Context for rowRender
  currencySymbol,
  className = "",
  // Pagination Defaults
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  // --- Local State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset page when key filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, columnFilters, sort]);

  // Reset page when rows array identity changes significantly?
  // Probably not needed if 'rows' changes on search, as safePage handles bounds.

  // --- Sorting Logic ---
  // The parent passes "rows". BUT, usually sorting happens *before* pagination.
  // If the parent passes unsorted rows, we sort here.
  // If the parent passes sorted rows, we just use them.
  // Looking at GenericAccordionGroup, it calculates 'working' (sorted) then 'pageSlice'.
  // So this component should receive *SEARCHED* but *UNSORTED* rows?
  // OR *SORTED* rows?
  // Use case: The headers have sort buttons. `onSortChange` updates state in parent?
  // If we want this component to be self-contained for display:
  // It handles sorting internally if `onSortChange` is NOT provided, or controlled if it IS.

  // Let's implement internal sorting matching GenericAccordionGroup logic if explicit rows aren't pre-sorted.
  // Actually, GenericAccordionGroup passes `sortByGroupKey`.
  // Let's assume `rows` passed in are ALREADY filtered (search/tabs) but NOT sorted.

  const sortedRows = useMemo(() => {
    if (!sort || !sort.key || sort.key === "none" || sort.key === "default") {
      return rows;
    }

    // Find column def
    const colDef = columns.find((c) => c.key === sort.key);
    if (!colDef) return rows;

    const dir = sort.direction === "desc" ? -1 : 1;

    return [...rows].sort((a, b) => {
      const getVal = (row) => {
        if (colDef.sortValue) return colDef.sortValue(row);
        if (colDef.value) return colDef.value(row);
        return row[colDef.key];
      };
      const va = getVal(a);
      const vb = getVal(b);

      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [rows, sort, columns]);

  // --- Pagination Logic ---
  const totalFiltered = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Ensure current page is valid
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  if (safePage !== currentPage && totalFiltered > 0) {
    // Schedule update if we are out of bounds (passive fix)
    // or just use safePage for render
  }

  const start = (safePage - 1) * pageSize;
  const pageSlice = sortedRows.slice(start, start + pageSize);

  // Derived Selection State
  // Check selection against ALL sorted/filtered rows, not just the current page
  const allRowsSelected =
    enableSelection &&
    sortedRows.length > 0 &&
    sortedRows.every((row, i) => {
      const key = resolveRowKey ? resolveRowKey(row, i) : row.id || i;
      return selectedRows[key];
    });

  const anyRowsSelected =
    enableSelection &&
    !allRowsSelected &&
    sortedRows.some((row, i) => {
      const key = resolveRowKey ? resolveRowKey(row, i) : row.id || i;
      return selectedRows[key];
    });

  // Handlers
  const handleSortClick = (colKey) => {
    if (!onSortChange) return;

    const active = sort.key === colKey;
    let nextDir = "asc";
    if (active) {
      if (sort.direction === "asc") nextDir = "desc";
      else if (sort.direction === "desc") nextDir = "none";
    }

    if (nextDir === "none") {
      onSortChange({ key: "none", direction: "desc" });
    } else {
      onSortChange({ key: colKey, direction: nextDir });
    }
    setCurrentPage(1); // Reset page on sort
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const val = Number(e.target.value) || defaultPageSize;
    setPageSize(val);
    setCurrentPage(1);
  };

  // Layout Constants
  const BASE_VISIBLE_ROWS = 5;
  const ROW_HEIGHT = 48;
  const headerHeight = 48;
  const useScroll = pageSize > BASE_VISIBLE_ROWS;
  // If pageSlice is smaller than pageSize (e.g. last page), do we fill?
  // GenericAccordionGroup logic:
  const effectiveRows = pageSlice.length + (pageSlice.length === 0 ? 1 : 0);
  const fillerRowsCount =
    !useScroll && effectiveRows < pageSize ? pageSize - effectiveRows : 0;
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  return (
    <div className={`pm-table-container ${className}`}>
      <div
        className="pm-expense-table-wrapper"
        style={
          useScroll
            ? {
                maxHeight: headerHeight + BASE_VISIBLE_ROWS * ROW_HEIGHT,
                overflowY: "auto",
              }
            : {
                maxHeight: headerHeight + pageSize * ROW_HEIGHT,
                overflow: "hidden",
              }
        }
      >
        <table
          className={`pm-expense-table pm-fixed ${pageSlice.length === 0 ? "pm-empty-state" : ""}`}
        >
          {columns && (
            <colgroup>
              {enableSelection && !rowRender ? (
                <col style={{ width: "36px" }} />
              ) : null}
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                />
              ))}
            </colgroup>
          )}
          <thead>
            <tr>
              {enableSelection && !rowRender ? (
                <th className="pm-select-col">
                  <input
                    type="checkbox"
                    className="pm-select-checkbox"
                    checked={!!allRowsSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !!anyRowsSelected;
                    }}
                    onChange={(e) => {
                      if (onSelectAll)
                        onSelectAll(sortedRows, e.target.checked);
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              ) : null}
              {(columns || []).map((col) => {
                const active = sort.key === col.key;
                const direction = active ? sort.direction : "none";
                const icon =
                  direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕";

                return (
                  <th
                    key={col.key}
                    className={`pm-sortable ${active ? "active" : ""}`}
                    aria-sort={
                      direction === "none"
                        ? "none"
                        : direction === "asc"
                          ? "ascending"
                          : "descending"
                    }
                  >
                    <div
                      className="pm-th-content"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <button
                        type="button"
                        className="pm-sort-button"
                        style={{ flex: 1, justifyContent: "flex-start" }}
                        onClick={() => handleSortClick(col.key)}
                      >
                        <span className="pm-sort-label">
                          {col.label}
                          <span className={`pm-sort-icon ${direction}`}>
                            {icon}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onFilterClick && onFilterClick(e, col)}
                        className={`pm-filter-trigger ${columnFilters[col.key] ? "active" : ""}`}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          color: columnFilters[col.key]
                            ? "var(--pm-accent-color)"
                            : "var(--pm-text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          opacity: 0.7,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0.7)
                        }
                      >
                        <FilterListIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 && (
              <tr className="pm-empty-row">
                <td
                  colSpan={
                    (columns || []).length +
                    (enableSelection && !rowRender ? 1 : 0)
                  }
                  className="pm-empty-centered"
                >
                  <div className="pm-empty-message">
                    <div className="pm-empty-icon">🗂️</div>
                    <div className="pm-empty-title">
                      {activeTab === "all"
                        ? "No Records"
                        : "No Filtered Records"}
                    </div>
                    <div className="pm-empty-sub">
                      Nothing matches the current selection.
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {pageSlice.map((row, rowIdx) => {
              const actualIndex = start + rowIdx;
              const rowKey = resolveRowKey
                ? resolveRowKey(row, actualIndex)
                : row.id || actualIndex;
              const isSelected = selectedRows[rowKey];

              if (rowRender) {
                return rowRender(row, group, activeTab);
              }

              return (
                <tr key={rowKey}>
                  {enableSelection ? (
                    <td className="pm-select-cell">
                      <input
                        type="checkbox"
                        className="pm-select-checkbox"
                        checked={!!isSelected}
                        onChange={(e) =>
                          onRowSelect &&
                          onRowSelect(row, e.target.checked, actualIndex)
                        }
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => {
                    const val = col.value
                      ? col.value(row)
                      : (row.details?.[col.key] ?? row[col.key]);
                    const cls =
                      typeof col.className === "function"
                        ? col.className(row)
                        : col.className;
                    const content = col.render
                      ? col.render(val, row)
                      : val != null
                        ? val
                        : "-";
                    return (
                      <td
                        key={col.key}
                        className={cls}
                        title={col.render ? undefined : String(val ?? "")}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {fillerRowsCount > 0 &&
              Array.from({ length: fillerRowsCount }).map((_, i) => (
                <tr
                  key={`filler-${i}`}
                  className="pm-filler-row"
                  aria-hidden="true"
                >
                  <td
                    colSpan={
                      (columns || []).length +
                      (enableSelection && !rowRender ? 1 : 0)
                    }
                  >
                    &nbsp;
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div 
          className="pm-pagination-bar bottom" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            position: 'relative',
            borderTop: '1px solid var(--pm-border-color, #e5e7eb)',
            padding: '16px 20px',
            backgroundColor: 'var(--pm-bg-secondary, transparent)' // Ensure background matches/is consistent
          }}
        >
          {enableSelection && selectedCount > 0 && (
            <div
              className="pm-selection-count"
              style={{
                fontSize: "14px",
                color: "var(--pm-primary-accent, #00dac6)",
                fontWeight: "500",
                marginLeft: "0",
              }}
            >
              {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
            </div>
          )}
          {(!enableSelection || selectedCount === 0) && <div style={{ width: '1px' }}></div>}
          <div className="pm-page-controls pm-centered" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="pm-page-btn"
              disabled={safePage <= 1}
              onClick={(e) => {
                e.preventDefault(); // Prevent default action
                e.stopPropagation();
                handlePageChange(safePage - 1);
              }}
              style={{
                cursor: safePage <= 1 ? "not-allowed" : "pointer",
                zIndex: 10,
                position: "relative",
              }}
            >
              ‹
            </button>
            <span className="pm-page-indicator">
              {start + 1}-{Math.min(start + pageSize, totalFiltered)} of{" "}
              {totalFiltered}
            </span>
            <button
              type="button"
              className="pm-page-btn"
              disabled={safePage >= totalPages}
              onClick={(e) => {
                e.preventDefault(); // Prevent default action
                e.stopPropagation();
                handlePageChange(safePage + 1);
              }}
              style={{
                cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                zIndex: 10,
                position: "relative",
              }}
            >
              ›
            </button>
          </div>
          <div className="pm-page-size pm-right">
            <label>
              <span className="pm-page-size-label">Rows per page:</span>
              <select value={pageSize} onChange={handlePageSizeChange}>
                {pageSizeOptions.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedDataTable;
