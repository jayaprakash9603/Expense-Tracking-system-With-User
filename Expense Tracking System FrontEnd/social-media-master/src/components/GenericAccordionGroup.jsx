import React, { useState, useCallback, useEffect } from "react";
import "./PaymentMethodAccordion.css";
import { formatAmount as fmt } from "../utils/formatAmount";

/**
 * GenericAccordionGroup
 * Configurable accordion + tabbed table component for grouped datasets.
 */
const DEFAULT_TABS = [
  { key: "all", label: "All" },
  { key: "loss", label: "Loss" },
  { key: "profit", label: "Gain" },
];

export function GenericAccordionGroup({
  groups = [],
  currencySymbol = "₹",
  defaultOpen = null,
  tabs = DEFAULT_TABS,
  columns,
  classify,
  headerRender,
  rowRender,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  onToggle,
  // Group-level pagination configuration
  groupPaginationThreshold = 8,
  defaultGroupsPerPage = 8,
  groupPageSizeOptions = [8, 16, 24, 50],
}) {
  const initialOpen = (() => {
    if (defaultOpen == null) return null;
    if (typeof defaultOpen === "number") return defaultOpen;
    const idx = groups.findIndex((g) => g.label === defaultOpen);
    return idx >= 0 ? idx : null;
  })();

  const [openIndex, setOpenIndex] = useState(initialOpen);
  const [tabByIndex, setTabByIndex] = useState({});
  const [pageByIndex, setPageByIndex] = useState({});
  const [pageSizeByIndex, setPageSizeByIndex] = useState({});
  const [sortByIndex, setSortByIndex] = useState({});
  // Pagination state
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(defaultGroupsPerPage);

  const totalGroupPages = Math.max(
    1,
    Math.ceil(groups.length / Math.max(1, groupsPerPage))
  );
  const showGroupPagination = groups.length >= groupPaginationThreshold;
  const safeGroupsPage = Math.min(groupsPage, totalGroupPages);
  const startGroup = (safeGroupsPage - 1) * groupsPerPage;
  const endGroup = startGroup + groupsPerPage;
  const visibleGroups = showGroupPagination
    ? groups.slice(startGroup, endGroup)
    : groups.slice(0, groupsPerPage);

  // Placeholders only if using base layout of 8 and fewer groups visible
  const BASE_GROUPS_PER_PAGE = 8;
  const totalGroups = groups.length;
  // If total groups < BASE_GROUPS_PER_PAGE we no longer render placeholders and allow container to shrink.
  const missingPlaceholders =
    totalGroups < BASE_GROUPS_PER_PAGE
      ? 0
      : groupsPerPage === BASE_GROUPS_PER_PAGE
      ? Math.max(
          0,
          BASE_GROUPS_PER_PAGE -
            Math.min(BASE_GROUPS_PER_PAGE, visibleGroups.length)
        )
      : 0;
  // Scroll mode when larger page size selected; keep viewport height fixed to 8 items.
  const scrollMode = groupsPerPage > BASE_GROUPS_PER_PAGE;

  // Close open accordion if it leaves current page after page change.
  useEffect(() => {
    if (!showGroupPagination) return;
    if (openIndex == null) return;
    if (openIndex < startGroup || openIndex >= endGroup) {
      setOpenIndex(null);
    }
  }, [showGroupPagination, startGroup, endGroup, openIndex]);

  const toggle = useCallback(
    (idx) => {
      setOpenIndex((prev) => {
        const next = prev === idx ? null : idx;
        if (onToggle && groups[idx]) onToggle(groups[idx], next === idx);
        return next;
      });
    },
    [onToggle, groups]
  );

  const formatAmount = (v) => fmt(v, { currencySymbol });

  return (
    <div className="pm-accordion-group">
      <div
        className={`pm-groups-viewport ${
          scrollMode ? "scroll-mode" : "paged-mode"
        } ${totalGroups < BASE_GROUPS_PER_PAGE ? "compact" : ""}`}
      >
        {visibleGroups.map((group, localIdx) => {
          const idx = startGroup + localIdx; // original global index
          const isOpen = idx === openIndex;
          const activeTab = tabByIndex[idx] || tabs[0]?.key || "all";
          const pageSize = pageSizeByIndex[idx] || defaultPageSize;
          const currentPage = pageByIndex[idx] || 1;
          const items = Array.isArray(group.items || group.expenses)
            ? group.items || group.expenses
            : [];

          const appliedFiltered = items.filter((row) => {
            if (!activeTab || activeTab === "all") return true;
            const tabDef = tabs.find((t) => t.key === activeTab);
            if (tabDef?.predicate) return !!tabDef.predicate(row);
            if (classify) return classify(row) === activeTab;
            const rawType = (row?.details?.type || row?.type || "")
              .toLowerCase()
              .trim();
            const amt = Number(
              row?.details?.amount ?? row?.details?.netAmount ?? 0
            );
            if (activeTab === "loss") {
              if (rawType === "loss") return true;
              if (!rawType) return amt < 0;
              return false;
            }
            if (activeTab === "profit") {
              if (rawType === "gain" || rawType === "profit") return true;
              if (!rawType) return amt > 0;
              return false;
            }
            return false;
          });

          const sortCfg = sortByIndex[idx];
          let working = appliedFiltered;
          if (sortCfg && sortCfg.key && columns) {
            const colDef = columns.find((c) => c.key === sortCfg.key);
            if (colDef) {
              const dir = sortCfg.direction === "desc" ? -1 : 1;
              working = [...appliedFiltered].sort((a, b) => {
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
            }
          }

          const totalFiltered = working.length;
          const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
          const safePage = Math.min(currentPage, totalPages);
          const start = (safePage - 1) * pageSize;
          const pageSlice = working.slice(start, start + pageSize);

          const BASE_VISIBLE_ROWS = 5;
          const ROW_HEIGHT = 48;
          const headerHeight = 48;
          const useScroll = pageSize > BASE_VISIBLE_ROWS;
          const effectiveRows =
            pageSlice.length + (pageSlice.length === 0 ? 1 : 0);
          const fillerRowsCount =
            !useScroll && effectiveRows < pageSize
              ? pageSize - effectiveRows
              : 0;
          const showPagination = totalFiltered > 5;

          return (
            <div
              key={group.label || idx}
              className={`pm-accordion-item ${isOpen ? "open" : ""}`}
            >
              {headerRender ? (
                headerRender(group, isOpen, () => toggle(idx))
              ) : (
                <button
                  type="button"
                  className="pm-accordion-header"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <div className="pm-header-left">
                    <span className="pm-method-name">{group.label}</span>
                    <span className="pm-method-count">
                      {group.count || group.expenseCount || items.length} tx
                    </span>
                  </div>
                  <div className="pm-header-right">
                    {group.totalAmount != null && (
                      <span className="pm-method-amount">
                        {formatAmount(group.totalAmount)}
                      </span>
                    )}
                    <span className="pm-chevron" aria-hidden>
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </div>
                </button>
              )}
              {isOpen && (
                <div className="pm-accordion-panel">
                  <div
                    className="pm-tabs"
                    data-active={activeTab}
                    style={{
                      ["--pm-indicator-width"]: `${100 / tabs.length}%`,
                      ["--pm-indicator-x"]: `${
                        tabs.findIndex((t) => t.key === activeTab) * 100
                      }%`,
                      ["--pm-highlight-width"]: `${100 / tabs.length}%`,
                      ["--pm-highlight-x"]: `${
                        tabs.findIndex((t) => t.key === activeTab) * 100
                      }%`,
                    }}
                  >
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        className={`pm-tab ${
                          activeTab === t.key ? "active" : ""
                        } ${
                          activeTab === t.key && t.key === "loss"
                            ? "pm-tab-loss-active"
                            : activeTab === t.key && t.key === "profit"
                            ? "pm-tab-gain-active"
                            : ""
                        }`}
                        data-key={t.key}
                        onClick={() => {
                          if (activeTab === t.key) return;
                          setTabByIndex((prev) => ({ ...prev, [idx]: t.key }));
                          setPageByIndex((prev) => ({ ...prev, [idx]: 1 }));
                        }}
                        aria-pressed={activeTab === t.key}
                      >
                        <span>{t.label}</span>
                        <span className="pm-tab-underline" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <div
                    className="pm-expense-table-wrapper"
                    style={
                      useScroll
                        ? {
                            maxHeight:
                              headerHeight + BASE_VISIBLE_ROWS * ROW_HEIGHT,
                            overflowY: "auto",
                          }
                        : {
                            maxHeight: headerHeight + pageSize * ROW_HEIGHT,
                            overflow: "hidden",
                          }
                    }
                  >
                    <table
                      className={`pm-expense-table pm-fixed ${
                        pageSlice.length === 0 ? "pm-empty-state" : ""
                      }`}
                    >
                      {columns && (
                        <colgroup>
                          {columns.map((col) => (
                            <col
                              key={col.key}
                              style={
                                col.width ? { width: col.width } : undefined
                              }
                            />
                          ))}
                        </colgroup>
                      )}
                      <thead>
                        <tr>
                          {(columns || []).map((col) => {
                            const active = sortByIndex[idx]?.key === col.key;
                            const direction = active
                              ? sortByIndex[idx].direction
                              : "none";
                            const nextDirection = () => {
                              if (!active) return "asc";
                              if (direction === "asc") return "desc";
                              if (direction === "desc") return "none";
                              return "asc";
                            };
                            const icon =
                              direction === "asc"
                                ? "▲"
                                : direction === "desc"
                                ? "▼"
                                : "↕";
                            return (
                              <th
                                key={col.key}
                                className={`pm-sortable ${
                                  active ? "active" : ""
                                }`}
                                aria-sort={
                                  direction === "none"
                                    ? "none"
                                    : direction === "asc"
                                    ? "ascending"
                                    : "descending"
                                }
                              >
                                <button
                                  type="button"
                                  className="pm-sort-button"
                                  onClick={() => {
                                    const nd = nextDirection();
                                    setSortByIndex((prev) => {
                                      const copy = { ...prev };
                                      if (nd === "none") delete copy[idx];
                                      else
                                        copy[idx] = {
                                          key: col.key,
                                          direction: nd,
                                        };
                                      return copy;
                                    });
                                    setPageByIndex((prev) => ({
                                      ...prev,
                                      [idx]: 1,
                                    }));
                                  }}
                                  aria-label={`Sort by ${col.label}`}
                                >
                                  <span className="pm-sort-label">
                                    {col.label}
                                    <span
                                      className={`pm-sort-icon ${direction}`}
                                    >
                                      {icon}
                                    </span>
                                  </span>
                                </button>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {pageSlice.length === 0 && (
                          <tr className="pm-empty-row">
                            <td
                              colSpan={(columns || []).length}
                              className="pm-empty-centered"
                            >
                              <div className="pm-empty-message">
                                <div className="pm-empty-icon">🗂️</div>
                                <div className="pm-empty-title">
                                  {activeTab === "all"
                                    ? "No Records"
                                    : `No ${
                                        tabs.find((t) => t.key === activeTab)
                                          ?.label || "Filtered"
                                      } Records`}
                                </div>
                                <div className="pm-empty-sub">
                                  Nothing matches the current selection.
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {pageSlice.map((row) =>
                          rowRender ? (
                            rowRender(row, group, activeTab)
                          ) : (
                            <tr key={row.id || row.details?.id}>
                              {columns.map((col) => {
                                const val = col.value
                                  ? col.value(row)
                                  : row.details?.[col.key] ?? row[col.key];
                                const cls =
                                  typeof col.className === "function"
                                    ? col.className(row)
                                    : col.className;
                                return (
                                  <td
                                    key={col.key}
                                    className={cls}
                                    title={String(val ?? "")}
                                  >
                                    {val != null ? val : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          )
                        )}
                        {fillerRowsCount > 0 &&
                          Array.from({ length: fillerRowsCount }).map(
                            (_, i) => (
                              <tr
                                key={`filler-${i}`}
                                className="pm-filler-row"
                                aria-hidden="true"
                              >
                                <td colSpan={(columns || []).length}>&nbsp;</td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                  {showPagination && (
                    <div className="pm-pagination-bar bottom">
                      <div className="pm-page-controls pm-centered">
                        <button
                          type="button"
                          className="pm-page-btn"
                          disabled={safePage <= 1}
                          onClick={() =>
                            setPageByIndex((prev) => ({
                              ...prev,
                              [idx]: safePage - 1,
                            }))
                          }
                          aria-label="Previous page"
                        >
                          ‹
                        </button>
                        <span className="pm-page-indicator">
                          {start + 1}-
                          {Math.min(start + pageSize, totalFiltered)} of{" "}
                          {totalFiltered}
                        </span>
                        <button
                          type="button"
                          className="pm-page-btn"
                          disabled={safePage >= totalPages}
                          onClick={() =>
                            setPageByIndex((prev) => ({
                              ...prev,
                              [idx]: safePage + 1,
                            }))
                          }
                          aria-label="Next page"
                        >
                          ›
                        </button>
                      </div>
                      <div className="pm-page-size pm-right">
                        <label>
                          <span className="pm-page-size-label">
                            Rows per page:
                          </span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              const val =
                                Number(e.target.value) || defaultPageSize;
                              setPageSizeByIndex((prev) => ({
                                ...prev,
                                [idx]: val,
                              }));
                              setPageByIndex((prev) => ({ ...prev, [idx]: 1 }));
                            }}
                          >
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
              )}
            </div>
          );
        })}
        {!scrollMode &&
          missingPlaceholders > 0 &&
          Array.from({ length: missingPlaceholders }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="pm-accordion-item pm-placeholder"
              aria-hidden="true"
            >
              <div className="pm-accordion-header pm-placeholder-header">
                <div className="pm-header-left">
                  <span className="pm-method-name placeholder-block" />
                  <span className="pm-method-count placeholder-block" />
                </div>
                <div className="pm-header-right">
                  <span className="pm-method-amount placeholder-block" />
                  <span className="pm-chevron">▸</span>
                </div>
              </div>
            </div>
          ))}
      </div>
      {showGroupPagination && (
        <div className="pm-group-pagination-bar">
          <div className="pm-group-page-controls">
            <button
              type="button"
              className="pm-page-btn"
              disabled={safeGroupsPage <= 1}
              onClick={() => setGroupsPage((p) => Math.max(1, p - 1))}
              aria-label="Previous groups page"
            >
              ‹
            </button>
            <span className="pm-page-indicator">
              Groups {startGroup + 1}-{Math.min(endGroup, groups.length)} of{" "}
              {groups.length}
            </span>
            <button
              type="button"
              className="pm-page-btn"
              disabled={safeGroupsPage >= totalGroupPages}
              onClick={() =>
                setGroupsPage((p) => Math.min(totalGroupPages, p + 1))
              }
              aria-label="Next groups page"
            >
              ›
            </button>
          </div>
          <div className="pm-group-page-size">
            <label>
              <span className="pm-page-size-label">Groups per page:</span>
              <select
                value={groupsPerPage}
                onChange={(e) => {
                  const val = Number(e.target.value) || defaultGroupsPerPage;
                  setGroupsPerPage(val);
                  setGroupsPage(1);
                }}
              >
                {groupPageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenericAccordionGroup;
