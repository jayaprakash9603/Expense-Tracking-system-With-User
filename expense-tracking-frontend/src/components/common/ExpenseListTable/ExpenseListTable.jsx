import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../hooks/useTranslation";
import { useStandardExpenseColumns } from "../../../hooks/useStandardExpenseColumns";
import GroupedDataTable from "../GroupedDataTable/GroupedDataTable";
import { FilterPopover } from "../../ui";

/**
 * Reusable table component for displaying lists of expenses.
 * Uses standard columns definition and consistent styling.
 * Now supports internal state for sorting and filtering.
 */
export const ExpenseListTable = ({
  rows = [],
  loading = false,
  error = null,
  showNet = false,
  showCredit = false,
  enableSelection = false,
  selectedRows = [], // Array of IDs if controlled
  onSelectionChange, // Adapter callback
  columns: propColumns,
  ...props
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- 1. Columns Resolution ---
  const standardColumns = useStandardExpenseColumns(t, navigate, {
    includeNet: showNet,
    includeCredit: showCredit,
  });
  const effectiveColumns = propColumns || standardColumns;

  // --- 2. Internal State for Filtering & Sorting ---
  const [sort, setSort] = useState({ key: "default", direction: "desc" });
  const [columnFilters, setColumnFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);

  // Determine effective state (prop overrides or internal)
  const effectiveColumnFilters = props.columnFilters || columnFilters;

  // --- 3. Filtering Logic ---
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Use effective filters
      return Object.entries(effectiveColumnFilters).every(([key, filter]) => {
        if (!filter || (!filter.value && filter.value !== 0)) return true;

        const colDef = effectiveColumns.find((c) => c.key === key);
        let cellValue;

        // Retrieve value using column definition if available
        if (colDef) {
          if (colDef.value) cellValue = colDef.value(row);
          else cellValue = row[key];
        } else {
          cellValue = row[key];
        }

        const stringVal = String(cellValue || "").toLowerCase();
        const filterVal = String(filter.value).toLowerCase();
        const operator = filter.operator || "contains";

        switch (operator) {
          case "contains":
            return stringVal.includes(filterVal);
          case "equals":
            return stringVal === filterVal;
          case "startsWith":
            return stringVal.startsWith(filterVal);
          case "endsWith":
            return stringVal.endsWith(filterVal);
          default:
            return true;
        }
      });
    });
  }, [rows, columnFilters, effectiveColumns]);

  // --- 4. Handlers ---
  const handleFilterClick = (e, column) => {
    setFilterAnchorEl(e.currentTarget);
    setFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setFilterColumn(null);
  };

  const handleFilterApply = (filterData) => {
    if (filterColumn) {
      setColumnFilters((prev) => ({
        ...prev,
        [filterColumn.key]: filterData,
      }));
    }
  };

  const handleFilterClear = () => {
    if (filterColumn) {
      setColumnFilters((prev) => {
        const next = { ...prev };
        delete next[filterColumn.key];
        return next;
      });
    }
  };

  // --- 5. Selection Adapter ---
  // Convert Array of IDs to Map {id: true}
  const selectedRowsMap = useMemo(() => {
    if (!enableSelection) return {};
    // If selectedRows is an array (controlled mode specific for this adapter)
    if (Array.isArray(selectedRows)) {
      return selectedRows.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
    }
    // Fallback if it's already a map
    return selectedRows;
  }, [selectedRows, enableSelection]);

  const handleRowSelect = (row, isSelected) => {
    if (!onSelectionChange) return;
    const rowId = row.id;

    if (Array.isArray(selectedRows)) {
      if (isSelected) {
        if (!selectedRows.includes(rowId)) {
          onSelectionChange([...selectedRows, rowId]);
        }
      } else {
        onSelectionChange(selectedRows.filter((id) => id !== rowId));
      }
    } else {
      // Pass through if parent handles map
      props.onRowSelect?.(row, isSelected);
    }
  };

  const handleSelectAll = (currentRows, isSelected) => {
    // currentRows is passed by GroupedDataTable
    if (!onSelectionChange) return;

    if (Array.isArray(selectedRows)) {
      if (isSelected) {
        const newIds = currentRows.map((r) => r.id);
        const uniqueIds = Array.from(new Set([...selectedRows, ...newIds]));
        onSelectionChange(uniqueIds);
      } else {
        const idsToUnselect = currentRows.map((r) => r.id);
        const remaining = selectedRows.filter(
          (id) => !idsToUnselect.includes(id),
        );
        onSelectionChange(remaining);
      }
    } else {
      props.onSelectAll?.(currentRows, isSelected);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loader w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <>
      <GroupedDataTable
        rows={filteredRows}
        columns={effectiveColumns}
        activeTab="all" // Default to showing all
        // Sorting
        sort={sort}
        onSortChange={setSort}
        // Filtering
        columnFilters={effectiveColumnFilters}
        onFilterClick={handleFilterClick}
        // Selection
        enableSelection={enableSelection}
        selectedRows={selectedRowsMap}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        resolveRowKey={(row) => row.id}
        {...props}
      />
      <FilterPopover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        column={filterColumn}
        type={filterColumn?.filterType || "text"}
        initialOperator={
          filterColumn && effectiveColumnFilters[filterColumn.key]
            ? effectiveColumnFilters[filterColumn.key].operator
            : undefined
        }
        initialValue={
          filterColumn && effectiveColumnFilters[filterColumn.key]
            ? effectiveColumnFilters[filterColumn.key].value
            : undefined
        }
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
      />
    </>
  );
};

export default ExpenseListTable;
