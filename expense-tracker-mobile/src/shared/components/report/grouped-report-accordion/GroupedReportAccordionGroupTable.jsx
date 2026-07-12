import React, { useMemo } from "react";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useGroupedExpenseTableColumns } from "@/shared/hooks/data/useGroupedExpenseTableColumns";
import { getGroupExpenseRows, buildTableRowSelectionMap, mergeTableRowSelection } from "./groupedReportAccordionSelection";
import { ACCORDION_SELECTION_CHECKBOX_CLASS as GROUPED_REPORT_CHECKBOX_CLASS } from "@/shared/components/data/accordionSelectionCheckboxClass";

export function GroupedReportAccordionGroupTable({
  group,
  columns,
  enableSelection,
  selectedGlobalIds,
  onSelectionChange,
}) {
  const { t } = useLanguage();
  const rows = useMemo(() => getGroupExpenseRows(group), [group]);
  const tableColumns = useGroupedExpenseTableColumns(columns);

  return (
    <div className="flex flex-col gap-4 pt-2">
      <EnhancedDataTable
        columns={tableColumns}
        data={rows}
        searchable
        enableColumnFilters
        searchPlaceholder={t("common.searchRecords")}
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
        selectable={enableSelection}
        selectionCheckboxClassName={enableSelection ? GROUPED_REPORT_CHECKBOX_CLASS : undefined}
        rowSelectionState={
          enableSelection ? buildTableRowSelectionMap(rows, selectedGlobalIds) : undefined
        }
        onRowSelectionStateChange={(state) => {
          if (!onSelectionChange) return;
          mergeTableRowSelection(state, rows, selectedGlobalIds, onSelectionChange);
        }}
        getRowId={(row) => String(row.id)}
      />
    </div>
  );
}
