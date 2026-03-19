import React from "react";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function BudgetSelectionDataTable({
  rows = [],
  columns = [],
  rowSelectionState = {},
  onRowSelectionStateChange,
  className,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { t } = useLanguage();

  return (
    <EnhancedDataTable
      columns={columns}
      data={rows}
      selectable
      enableColumnFilters
      showPagination
      rowSelectionState={rowSelectionState}
      onRowSelectionStateChange={onRowSelectionStateChange}
      getRowId={(row, index) => String(row?.id ?? index)}
      selectionCheckboxClassName="h-4 w-4 rounded-[6px] border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-background data-[state=checked]:text-primary"
      tableClassName="min-w-[920px] lg:min-w-0"
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      emptyMessage={t("common.noResults")}
      className={cn("w-full", className)}
    />
  );
}

export default BudgetSelectionDataTable;
