import React, { useState, useMemo } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import GroupedDataTable from "../GroupedDataTable/GroupedDataTable";
import { useBudgetTableConfig } from "../../../hooks/useBudgetTableConfig";
import { FilterPopover } from "../../ui"; // Adjust import based on where FilterPopover is located

const BudgetSelectionTable = ({
  budgets = [],
  selectedBudgetIds = [],
  onSelectionChange,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // --- Table Configuration ---
  const {
    columns,
    columnFilters,
    setColumnFilters,
    sort,
    setSort,
    filteredRows,
  } = useBudgetTableConfig(budgets, t);

  // --- Filter Popover State ---
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);

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

  // --- Selection Logic Adapter ---
  const selectedRowsMap = useMemo(() => {
    return selectedBudgetIds.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
  }, [selectedBudgetIds]);

  const handleRowSelect = (row, isSelected) => {
    if (!onSelectionChange) return;
    const rowId = row.id;

    if (isSelected) {
      if (!selectedBudgetIds.includes(rowId)) {
        onSelectionChange([...selectedBudgetIds, rowId]);
      }
    } else {
      onSelectionChange(selectedBudgetIds.filter((id) => id !== rowId));
    }
  };

  const handleSelectAll = (rows, isSelected) => {
    if (!onSelectionChange) return;

    if (isSelected) {
      const newIds = rows.map((r) => r.id);
      // Merge unique
      const merged = Array.from(new Set([...selectedBudgetIds, ...newIds]));
      onSelectionChange(merged);
    } else {
      const idsToUnselect = rows.map((r) => r.id);
      const remaining = selectedBudgetIds.filter(
        (id) => !idsToUnselect.includes(id),
      );
      onSelectionChange(remaining);
    }
  };

  return (
    <div
      className="w-full relative"
      style={{
        "--pm-text-primary": colors.primary_text,
        "--pm-text-secondary": colors.secondary_text,
        "--pm-text-tertiary": colors.secondary_text,
        "--pm-bg-primary": colors.active_bg,
        "--pm-bg-secondary": colors.secondary_bg,
        "--pm-border-color": colors.border_color,
        "--pm-accent-color": colors.primary_accent,
        "--pm-hover-bg": colors.hover_bg,
        "--pm-scrollbar-thumb": colors.primary_accent,
        "--pm-scrollbar-track": colors.secondary_bg,
      }}
    >
      <GroupedDataTable
        rows={filteredRows}
        columns={columns}
        sort={sort}
        onSortChange={setSort}
        columnFilters={columnFilters}
        onFilterClick={handleFilterClick}
        enableSelection={true}
        selectedRows={selectedRowsMap}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        resolveRowKey={(row) => row.id}
        className="w-full"
        defaultPageSize={5}
      />
      <FilterPopover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        column={filterColumn}
        type={filterColumn?.filterType || "text"}
        initialOperator={
          filterColumn && columnFilters[filterColumn.key]
            ? columnFilters[filterColumn.key].operator
            : undefined
        }
        initialValue={
          filterColumn && columnFilters[filterColumn.key]
            ? columnFilters[filterColumn.key].value
            : undefined
        }
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
      />
    </div>
  );
};

export default BudgetSelectionTable;
