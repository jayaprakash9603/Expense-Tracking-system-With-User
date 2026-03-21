import { useMemo, useCallback } from "react";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";
import { cn } from "@/lib/utils";

const SELECTION_CHECKBOX_CLASS =
  "h-4 w-4 rounded-[6px] border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-background data-[state=checked]:text-primary";

export function SelectableDataTable({
  columns,
  data,
  selectedIds = [],
  onSelectionChange,
  loading = false,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage,
  tableClassName,
  tableContainerClassName,
  flexColumnSizing = false,
  className,
}) {
  const rowSelectionState = useMemo(
    () =>
      selectedIds.reduce((acc, id) => {
        acc[String(id)] = true;
        return acc;
      }, {}),
    [selectedIds],
  );

  const typedIdByKey = useMemo(
    () =>
      data.reduce((acc, row) => {
        acc[String(row.id)] = row.id;
        return acc;
      }, {}),
    [data],
  );

  const handleRowSelectionStateChange = useCallback(
    (nextSelection) => {
      if (!onSelectionChange) return;
      const nextIds = Object.entries(nextSelection || {})
        .filter(([, selected]) => selected === true)
        .map(([id]) => typedIdByKey[id] ?? id);
      onSelectionChange(nextIds);
    },
    [onSelectionChange, typedIdByKey],
  );

  return (
    <EnhancedDataTable
      columns={columns}
      data={data}
      loading={loading}
      selectable
      enableColumnFilters
      showPagination
      scrollBodyAlwaysSized
      rowSelectionState={rowSelectionState}
      onRowSelectionStateChange={handleRowSelectionStateChange}
      getRowId={(row, index) => String(row?.id ?? index)}
      selectionCheckboxClassName={SELECTION_CHECKBOX_CLASS}
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      emptyMessage={emptyMessage}
      tableClassName={tableClassName}
      tableContainerClassName={tableContainerClassName}
      flexColumnSizing={flexColumnSizing}
      className={cn("w-full", className)}
    />
  );
}
