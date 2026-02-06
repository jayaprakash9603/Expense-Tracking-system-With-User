import React, { useMemo, useState, useCallback, useEffect } from "react";
import "./PaymentMethodAccordion.css";
import { formatAmount as fmt } from "../utils/formatAmount";
import useUserSettings from "../hooks/useUserSettings";
import { useTheme } from "../hooks/useTheme";
import AccordionToolbar from "./accordion/AccordionToolbar";
import NoDataPlaceholder from "./NoDataPlaceholder";

/**
 * GenericAccordionGroup
 * Configurable accordion + tabbed table component for grouped datasets.
 * Supports light/dark theme via useTheme hook.
 */
const DEFAULT_TABS = [
  { key: "all", label: "All" },
  { key: "loss", label: "Loss" },
  { key: "profit", label: "Gain" },
];

export function GenericAccordionGroup({
  groups = [],
  currencySymbol,
  defaultOpen = null,
  tabs = DEFAULT_TABS,
  columns,
  classify,
  headerRender,
  rowRender,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  onToggle,
  // Optional UX features
  enableGroupSearch = false,
  enableGroupSort = false,
  enableRowSearch = false,
  enableRowSortControls = false,
  enableSelection = false,
  getGroupKey,
  getRowKey,
  onSelectionChange,
  // Group-level pagination configuration
  groupPaginationThreshold = 8,
  defaultGroupsPerPage = 8,
  groupPageSizeOptions = [8, 16, 24, 50],
}) {
  const settings = useUserSettings();
  const { colors } = useTheme();
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;

  const resolveGroupKey = useCallback(
    (group, fallbackIndex) => {
      if (typeof getGroupKey === "function") {
        const key = getGroupKey(group, fallbackIndex);
        if (key != null && String(key).trim() !== "") return String(key);
      }
      if (group && group.key != null && String(group.key).trim() !== "") {
        return String(group.key);
      }
      if (group && group.label != null && String(group.label).trim() !== "") {
        return String(group.label);
      }
      return String(fallbackIndex);
    },
    [getGroupKey],
  );

  const resolveRowKey = useCallback(
    (row, groupKey, fallbackIndex) => {
      if (typeof getRowKey === "function") {
        const key = getRowKey(row, groupKey, fallbackIndex);
        if (key != null && String(key).trim() !== "") return String(key);
      }
      const k = row?.id ?? row?.details?.id;
      if (k != null && String(k).trim() !== "") return String(k);
      return `${groupKey}::${fallbackIndex}`;
    },
    [getRowKey],
  );

  const normalizedGroups = useMemo(() => {
    return (Array.isArray(groups) ? groups : []).map((group, originalIndex) => {
      const key = resolveGroupKey(group, originalIndex);
      return { group, key, originalIndex };
    });
  }, [groups, resolveGroupKey]);

  const initialOpenKey = (() => {
    if (defaultOpen == null) return null;
    if (typeof defaultOpen === "number") {
      const entry = normalizedGroups[defaultOpen];
      return entry ? entry.key : null;
    }
    // defaultOpen can be a label or key
    const match = normalizedGroups.find(
      (e) => e.key === defaultOpen || e.group?.label === defaultOpen,
    );
    return match ? match.key : null;
  })();

  const [openGroupKey, setOpenGroupKey] = useState(initialOpenKey);
  const [tabByGroupKey, setTabByGroupKey] = useState({});
  const [pageByGroupKey, setPageByGroupKey] = useState({});
  const [pageSizeByGroupKey, setPageSizeByGroupKey] = useState({});
  const [sortByGroupKey, setSortByGroupKey] = useState({});

  const [groupSearch, setGroupSearch] = useState("");
  const [groupSort, setGroupSort] = useState({
    key: "default",
    direction: "desc",
  });
  const [rowSearchByGroup, setRowSearchByGroup] = useState({});
  const [rowSortUiByGroup, setRowSortUiByGroup] = useState({});

  const groupSearchOptions = useMemo(() => {
    if (!enableGroupSearch) return [];
    const seen = new Set();
    const out = [];
    normalizedGroups.forEach(({ group }) => {
      const label = String(group?.label || "").trim();
      if (!label) return;
      const k = label.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      out.push(label);
    });
    return out;
  }, [enableGroupSearch, normalizedGroups]);

  // Selection state: { [groupKey]: { [rowKey]: true } }
  const [selectedRowsByGroup, setSelectedRowsByGroup] = useState({});
  // Pagination state
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(defaultGroupsPerPage);

  const selectedCount = useMemo(() => {
    return Object.values(selectedRowsByGroup).reduce(
      (acc, m) => acc + Object.keys(m || {}).length,
      0,
    );
  }, [selectedRowsByGroup]);

  const hasActiveFilters = useMemo(() => {
    const hasGroupSearch =
      enableGroupSearch && String(groupSearch || "").trim().length > 0;

    const hasGroupSort =
      enableGroupSort &&
      !!groupSort &&
      (groupSort.key !== "default" || groupSort.direction !== "desc");

    const hasRowSearch =
      enableRowSearch &&
      Object.values(rowSearchByGroup || {}).some(
        (v) => String(v || "").trim().length > 0,
      );

    const hasRowSort = Object.values(sortByGroupKey || {}).some(
      (s) => s && s.key && s.key !== "none",
    );

    return hasGroupSearch || hasGroupSort || hasRowSearch || hasRowSort;
  }, [
    enableGroupSearch,
    groupSearch,
    enableGroupSort,
    groupSort,
    enableRowSearch,
    rowSearchByGroup,
    sortByGroupKey,
  ]);

  const showClearButton = selectedCount > 0 || hasActiveFilters;

  const clearSelectionAndFilters = useCallback(() => {
    setSelectedRowsByGroup({});
    setGroupSearch("");
    setGroupSort({ key: "default", direction: "desc" });
    setRowSearchByGroup({});
    setRowSortUiByGroup({});
    setSortByGroupKey({});
    setPageByGroupKey({});
    setGroupsPage(1);
    if (onSelectionChange) {
      onSelectionChange({ selectedRowsByGroup: {}, selectedCount: 0 });
    }
  }, [onSelectionChange]);

  const filteredSortedGroups = useMemo(() => {
    const q = String(groupSearch || "")
      .trim()
      .toLowerCase();
    const filtered = q
      ? normalizedGroups.filter((e) =>
          String(e.group?.label || "")
            .toLowerCase()
            .includes(q),
        )
      : normalizedGroups;

    if (!enableGroupSort || !groupSort?.key || groupSort.key === "default") {
      return filtered;
    }

    const dir = groupSort.direction === "asc" ? 1 : -1;
    const getVal = (entry) => {
      if (groupSort.key === "name") return String(entry.group?.label || "");
      if (groupSort.key === "amount")
        return Number(entry.group?.totalAmount || 0);
      if (groupSort.key === "count") {
        const c =
          entry.group?.count ||
          entry.group?.expenseCount ||
          (Array.isArray(entry.group?.items || entry.group?.expenses)
            ? (entry.group?.items || entry.group?.expenses).length
            : 0);
        return Number(c || 0);
      }
      return 0;
    };

    // Stable sort via originalIndex tie-breaker
    return [...filtered].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return a.originalIndex - b.originalIndex;
    });
  }, [normalizedGroups, groupSearch, enableGroupSort, groupSort]);

  const isGroupSearchActive =
    enableGroupSearch && String(groupSearch || "").trim().length > 0;

  const totalGroupPages = Math.max(
    1,
    Math.ceil(filteredSortedGroups.length / Math.max(1, groupsPerPage)),
  );
  const showGroupPagination =
    filteredSortedGroups.length >= groupPaginationThreshold;
  const safeGroupsPage = Math.min(groupsPage, totalGroupPages);
  const startGroup = (safeGroupsPage - 1) * groupsPerPage;
  const endGroup = startGroup + groupsPerPage;
  const visibleGroups = showGroupPagination
    ? filteredSortedGroups.slice(startGroup, endGroup)
    : filteredSortedGroups.slice(0, groupsPerPage);

  // Placeholders only if using base layout of 8 and fewer groups visible
  const BASE_GROUPS_PER_PAGE = 8;
  const totalGroups = filteredSortedGroups.length;
  // If total groups < BASE_GROUPS_PER_PAGE we no longer render placeholders and allow container to shrink.
  // Also, if groupsPerPage is set to 5 (as in budget report), don't add placeholders
  const missingPlaceholders =
    totalGroups < BASE_GROUPS_PER_PAGE || groupsPerPage <= 5
      ? 0
      : groupsPerPage === BASE_GROUPS_PER_PAGE
        ? Math.max(
            0,
            BASE_GROUPS_PER_PAGE -
              Math.min(BASE_GROUPS_PER_PAGE, visibleGroups.length),
          )
        : 0;
  // Scroll mode when larger page size selected; keep viewport height fixed to 8 items.
  const scrollMode = groupsPerPage > BASE_GROUPS_PER_PAGE;

  // Close open accordion if it leaves current page after page change.
  useEffect(() => {
    if (!showGroupPagination) return;
    if (openGroupKey == null) return;
    const onPage = visibleGroups.some((e) => e.key === openGroupKey);
    if (!onPage) setOpenGroupKey(null);
  }, [showGroupPagination, startGroup, endGroup, openGroupKey, visibleGroups]);

  // Close if search/sort removes the open group from the current filtered list.
  useEffect(() => {
    if (openGroupKey == null) return;
    const exists = filteredSortedGroups.some((e) => e.key === openGroupKey);
    if (!exists) setOpenGroupKey(null);
  }, [openGroupKey, filteredSortedGroups]);

  const toggle = useCallback(
    (groupKey, groupObj) => {
      setOpenGroupKey((prev) => {
        const next = prev === groupKey ? null : groupKey;
        if (onToggle && groupObj) onToggle(groupObj, next === groupKey);
        return next;
      });
    },
    [onToggle],
  );

  const formatAmount = (v) => fmt(v, { currencySymbol: displayCurrency });

  // Calculate total items count across all groups for Select All functionality
  const totalItemsCount = useMemo(() => {
    return filteredSortedGroups.reduce((total, { group }) => {
      const items = Array.isArray(group.items || group.expenses)
        ? group.items || group.expenses
        : [];
      return total + items.length;
    }, 0);
  }, [filteredSortedGroups]);

  // Check if all items across all groups are selected
  const isGlobalAllSelected = useMemo(() => {
    if (!enableSelection || totalItemsCount === 0) return false;
    return filteredSortedGroups.every(({ group, key: groupKey }) => {
      const items = Array.isArray(group.items || group.expenses)
        ? group.items || group.expenses
        : [];
      const selectedForGroup = selectedRowsByGroup[groupKey] || {};
      return items.every((row, i) => {
        const rowKey = resolveRowKey(row, groupKey, i);
        return !!selectedForGroup[rowKey];
      });
    });
  }, [
    enableSelection,
    totalItemsCount,
    filteredSortedGroups,
    selectedRowsByGroup,
    resolveRowKey,
  ]);

  // Check if some (but not all) items are selected
  const isGlobalSomeSelected = useMemo(() => {
    if (!enableSelection || totalItemsCount === 0 || isGlobalAllSelected)
      return false;
    return selectedCount > 0;
  }, [enableSelection, totalItemsCount, isGlobalAllSelected, selectedCount]);

  // Select/deselect all items across all groups
  const handleSelectAll = useCallback(
    (checked) => {
      if (!enableSelection) return;

      setSelectedRowsByGroup((prev) => {
        if (!checked) {
          // Deselect all
          if (onSelectionChange) {
            onSelectionChange({ selectedRowsByGroup: {}, selectedCount: 0 });
          }
          return {};
        }

        // Select all items across all groups
        const next = {};
        filteredSortedGroups.forEach(({ group, key: groupKey }) => {
          const items = Array.isArray(group.items || group.expenses)
            ? group.items || group.expenses
            : [];
          const bucket = {};
          items.forEach((row, i) => {
            const rowKey = resolveRowKey(row, groupKey, i);
            bucket[rowKey] = true;
          });
          if (Object.keys(bucket).length > 0) {
            next[groupKey] = bucket;
          }
        });

        const newSelectedCount = Object.values(next).reduce(
          (acc, m) => acc + Object.keys(m).length,
          0,
        );

        if (onSelectionChange) {
          onSelectionChange({
            selectedRowsByGroup: next,
            selectedCount: newSelectedCount,
          });
        }

        return next;
      });
    },
    [enableSelection, filteredSortedGroups, resolveRowKey, onSelectionChange],
  );

  // Theme-aware styles
  const themeStyles = {
    accordionGroup: {
      "--pm-bg-primary": colors.primary_bg,
      "--pm-bg-secondary": colors.secondary_bg,
      "--pm-bg-tertiary": colors.tertiary_bg,
      "--pm-border-color": colors.border_color,
      "--pm-text-primary": colors.primary_text,
      "--pm-text-secondary": colors.secondary_text,
      "--pm-text-tertiary": colors.tertiary_text,
      "--pm-accent-color": colors.accent_color,
      "--pm-scrollbar-thumb": colors.accent_color,
      "--pm-scrollbar-track": colors.secondary_bg,
    },
  };

  return (
    <div className="pm-accordion-group" style={themeStyles.accordionGroup}>
      <AccordionToolbar
        showGroupSearch={enableGroupSearch}
        groupSearch={groupSearch}
        groupSearchOptions={groupSearchOptions}
        onGroupSearchChange={(value) => {
          setGroupSearch(value);
          setGroupsPage(1);
        }}
        showGroupSort={enableGroupSort}
        groupSort={groupSort}
        onGroupSortChange={(nextSort) => setGroupSort(nextSort)}
        showClearSelection={showClearButton}
        onClearSelection={clearSelectionAndFilters}
        showSelectAll={enableSelection}
        isAllSelected={isGlobalAllSelected}
        isSomeSelected={isGlobalSomeSelected}
        onSelectAll={handleSelectAll}
        totalItemsCount={totalItemsCount}
        selectedCount={selectedCount}
      />

      <div
        className={`pm-groups-viewport ${
          scrollMode ? "scroll-mode" : "paged-mode"
        } ${
          (totalGroups < BASE_GROUPS_PER_PAGE && !isGroupSearchActive) ||
          groupsPerPage <= 5
            ? "compact"
            : ""
        }`}
      >
        {isGroupSearchActive && filteredSortedGroups.length === 0 ? (
          <NoDataPlaceholder
            message="No results found"
            subMessage="Try a different keyword to find a matching group."
            height="100%"
            dense
            fullWidth
            messageColor="var(--pm-accent-color)"
            iconColor="var(--pm-accent-color)"
            subMessageColor="var(--pm-text-secondary)"
          />
        ) : null}
        {visibleGroups.map(({ group, key: groupKey }, localIdx) => {
          const isOpen = groupKey === openGroupKey;
          const activeTab = tabByGroupKey[groupKey] || tabs[0]?.key || "all";
          const pageSize = pageSizeByGroupKey[groupKey] || defaultPageSize;
          const currentPage = pageByGroupKey[groupKey] || 1;
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
              row?.details?.amount ?? row?.details?.netAmount ?? 0,
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

          const rowSearch = String(rowSearchByGroup[groupKey] || "")
            .trim()
            .toLowerCase();
          const searched =
            enableRowSearch && rowSearch
              ? appliedFiltered.filter((row) => {
                  // Use columns as primary search surface; fallback to stringified row
                  const parts = [];
                  (columns || []).forEach((col) => {
                    const v = col.value
                      ? col.value(row)
                      : (row.details?.[col.key] ?? row[col.key]);
                    if (v != null) parts.push(String(v));
                  });
                  if (parts.length === 0) parts.push(JSON.stringify(row || {}));
                  return parts.join(" ").toLowerCase().includes(rowSearch);
                })
              : appliedFiltered;

          // Row sorting (existing header-click sorting)
          const sortCfg = sortByGroupKey[groupKey];
          let working = searched;
          if (sortCfg && sortCfg.key && columns) {
            const colDef = columns.find((c) => c.key === sortCfg.key);
            if (colDef) {
              const dir = sortCfg.direction === "desc" ? -1 : 1;
              working = [...searched].sort((a, b) => {
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

          const selectedForGroup = selectedRowsByGroup[groupKey] || {};
          const isRowSelected = (row, rowIndex) => {
            const rowKey = resolveRowKey(row, groupKey, rowIndex);
            return !!selectedForGroup[rowKey];
          };
          const toggleRow = (row, rowIndex, checked) => {
            const rowKey = resolveRowKey(row, groupKey, rowIndex);
            setSelectedRowsByGroup((prev) => {
              const next = { ...prev };
              const bucket = { ...(next[groupKey] || {}) };
              if (checked) bucket[rowKey] = true;
              else delete bucket[rowKey];
              if (Object.keys(bucket).length === 0) delete next[groupKey];
              else next[groupKey] = bucket;
              const selectedCount = Object.values(next).reduce(
                (acc, m) => acc + Object.keys(m).length,
                0,
              );
              if (onSelectionChange) {
                onSelectionChange({
                  selectedRowsByGroup: next,
                  selectedCount,
                });
              }
              return next;
            });
          };
          const selectMany = (rows, checked) => {
            setSelectedRowsByGroup((prev) => {
              const next = { ...prev };
              const bucket = { ...(next[groupKey] || {}) };
              rows.forEach((row, i) => {
                const rowKey = resolveRowKey(row, groupKey, i);
                if (checked) bucket[rowKey] = true;
                else delete bucket[rowKey];
              });
              if (Object.keys(bucket).length === 0) delete next[groupKey];
              else next[groupKey] = bucket;
              const selectedCount = Object.values(next).reduce(
                (acc, m) => acc + Object.keys(m).length,
                0,
              );
              if (onSelectionChange) {
                onSelectionChange({ selectedRowsByGroup: next, selectedCount });
              }
              return next;
            });
          };

          const groupAllSelected =
            enableSelection &&
            totalFiltered > 0 &&
            working.every((row, i) => isRowSelected(row, i));
          const groupSomeSelected =
            enableSelection &&
            !groupAllSelected &&
            working.some((row, i) => isRowSelected(row, i));
          const pageAllSelected =
            enableSelection &&
            pageSlice.length > 0 &&
            pageSlice.every((row, i) => isRowSelected(row, start + i));
          const pageSomeSelected =
            enableSelection &&
            !pageAllSelected &&
            pageSlice.some((row, i) => isRowSelected(row, start + i));

          return (
            <div
              key={groupKey}
              className={`pm-accordion-item ${isOpen ? "open" : ""}`}
            >
              {enableSelection ? (
                <div className="pm-accordion-header-row">
                  <div className="pm-accordion-select-wrap">
                    <input
                      type="checkbox"
                      className="pm-select-checkbox"
                      checked={!!groupAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !!groupSomeSelected;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // Select all rows in the current filtered set
                        selectMany(working, checked);
                      }}
                      aria-label={`Select ${group.label}`}
                    />
                  </div>
                  <div className="pm-accordion-header-content">
                    {headerRender ? (
                      headerRender(group, isOpen, () => toggle(groupKey, group))
                    ) : (
                      <button
                        type="button"
                        className="pm-accordion-header"
                        onClick={() => toggle(groupKey, group)}
                        aria-expanded={isOpen}
                      >
                        <div className="pm-header-left">
                          <span className="pm-method-name">{group.label}</span>
                          <span className="pm-method-count">
                            {group.count || group.expenseCount || items.length}{" "}
                            tx
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
                  </div>
                </div>
              ) : headerRender ? (
                headerRender(group, isOpen, () => toggle(groupKey, group))
              ) : (
                <button
                  type="button"
                  className="pm-accordion-header"
                  onClick={() => toggle(groupKey, group)}
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
                  {(enableRowSearch || enableRowSortControls) && (
                    <div className="pm-panel-toolbar">
                      {enableRowSearch && (
                        <input
                          className="pm-search-input pm-row-search"
                          value={rowSearchByGroup[groupKey] || ""}
                          onChange={(e) =>
                            setRowSearchByGroup((prev) => ({
                              ...prev,
                              [groupKey]: e.target.value,
                            }))
                          }
                          placeholder="Search records…"
                          aria-label="Search records"
                        />
                      )}
                      {enableRowSortControls &&
                        Array.isArray(columns) &&
                        columns.length > 0 && (
                          <div className="pm-row-sort-controls">
                            <label className="pm-toolbar-label">
                              <span>Sort rows:</span>
                              <select
                                value={
                                  rowSortUiByGroup[groupKey]?.key || "none"
                                }
                                onChange={(e) => {
                                  const key = e.target.value;
                                  setRowSortUiByGroup((prev) => ({
                                    ...prev,
                                    [groupKey]: {
                                      key,
                                      direction:
                                        prev[groupKey]?.direction || "desc",
                                    },
                                  }));
                                  setSortByGroupKey((prev) => {
                                    const copy = { ...prev };
                                    if (key === "none") delete copy[groupKey];
                                    else
                                      copy[groupKey] = {
                                        key,
                                        direction:
                                          rowSortUiByGroup[groupKey]
                                            ?.direction || "desc",
                                      };
                                    return copy;
                                  });
                                  setPageByGroupKey((prev) => ({
                                    ...prev,
                                    [groupKey]: 1,
                                  }));
                                }}
                                aria-label="Sort rows by"
                              >
                                <option value="none">None</option>
                                {columns.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="pm-toolbar-label">
                              <span>Dir:</span>
                              <select
                                value={
                                  rowSortUiByGroup[groupKey]?.direction ||
                                  "desc"
                                }
                                onChange={(e) => {
                                  const direction = e.target.value;
                                  setRowSortUiByGroup((prev) => ({
                                    ...prev,
                                    [groupKey]: {
                                      key: prev[groupKey]?.key || "none",
                                      direction,
                                    },
                                  }));
                                  setSortByGroupKey((prev) => {
                                    const copy = { ...prev };
                                    const activeKey =
                                      rowSortUiByGroup[groupKey]?.key ||
                                      copy[groupKey]?.key;
                                    if (!activeKey || activeKey === "none") {
                                      delete copy[groupKey];
                                      return copy;
                                    }
                                    copy[groupKey] = {
                                      key: activeKey,
                                      direction,
                                    };
                                    return copy;
                                  });
                                  setPageByGroupKey((prev) => ({
                                    ...prev,
                                    [groupKey]: 1,
                                  }));
                                }}
                                aria-label="Row sort direction"
                              >
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                              </select>
                            </label>
                          </div>
                        )}
                    </div>
                  )}

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
                          setTabByGroupKey((prev) => ({
                            ...prev,
                            [groupKey]: t.key,
                          }));
                          setPageByGroupKey((prev) => ({
                            ...prev,
                            [groupKey]: 1,
                          }));
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
                          {enableSelection && !rowRender ? (
                            <col style={{ width: "36px" }} />
                          ) : null}
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
                          {enableSelection && !rowRender ? (
                            <th className="pm-select-col">
                              <input
                                type="checkbox"
                                className="pm-select-checkbox"
                                checked={!!pageAllSelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = !!pageSomeSelected;
                                }}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  selectMany(pageSlice, checked);
                                }}
                                aria-label="Select rows on this page"
                              />
                            </th>
                          ) : null}
                          {(columns || []).map((col) => {
                            const active =
                              sortByGroupKey[groupKey]?.key === col.key;
                            const direction = active
                              ? sortByGroupKey[groupKey].direction
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
                                    setSortByGroupKey((prev) => {
                                      const copy = { ...prev };
                                      if (nd === "none") delete copy[groupKey];
                                      else
                                        copy[groupKey] = {
                                          key: col.key,
                                          direction: nd,
                                        };
                                      return copy;
                                    });
                                    setPageByGroupKey((prev) => ({
                                      ...prev,
                                      [groupKey]: 1,
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
                        {pageSlice.map((row, rowIdx) =>
                          rowRender ? (
                            rowRender(row, group, activeTab)
                          ) : (
                            <tr
                              key={resolveRowKey(row, groupKey, start + rowIdx)}
                            >
                              {enableSelection ? (
                                <td className="pm-select-cell">
                                  <input
                                    type="checkbox"
                                    className="pm-select-checkbox"
                                    checked={isRowSelected(row, start + rowIdx)}
                                    onChange={(e) =>
                                      toggleRow(
                                        row,
                                        start + rowIdx,
                                        e.target.checked,
                                      )
                                    }
                                    aria-label="Select row"
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
                                // Support custom render function for the cell
                                const cellContent = col.render
                                  ? col.render(val, row)
                                  : val != null
                                    ? val
                                    : "-";
                                return (
                                  <td
                                    key={col.key}
                                    className={cls}
                                    title={
                                      col.render ? undefined : String(val ?? "")
                                    }
                                  >
                                    {cellContent}
                                  </td>
                                );
                              })}
                            </tr>
                          ),
                        )}
                        {fillerRowsCount > 0 &&
                          Array.from({ length: fillerRowsCount }).map(
                            (_, i) => (
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
                            ),
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
                            setPageByGroupKey((prev) => ({
                              ...prev,
                              [groupKey]: safePage - 1,
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
                            setPageByGroupKey((prev) => ({
                              ...prev,
                              [groupKey]: safePage + 1,
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
                              setPageSizeByGroupKey((prev) => ({
                                ...prev,
                                [groupKey]: val,
                              }));
                              setPageByGroupKey((prev) => ({
                                ...prev,
                                [groupKey]: 1,
                              }));
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
              {filteredSortedGroups.length}
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
