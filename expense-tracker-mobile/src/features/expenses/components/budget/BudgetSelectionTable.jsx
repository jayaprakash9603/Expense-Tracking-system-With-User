import React from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { SelectableDataTable } from "@/shared/components/data/SelectableDataTable";
import { useBudgetTableConfig } from "../../hooks/useBudgetTableConfig";

export function BudgetSelectionTable({
  budgets = [],
  selectedBudgetIds = [],
  onSelectionChange,
  loading = false,
}) {
  const { t } = useLanguage();
  const { columns, rows } = useBudgetTableConfig(budgets, t);

  return (
    <div className="w-full min-w-0 max-w-full">
      <SelectableDataTable
        columns={columns}
        data={rows}
        selectedIds={selectedBudgetIds}
        onSelectionChange={onSelectionChange}
        defaultPageSize={5}
        loading={loading}
        emptyMessage={t("common.noResults")}
        flexColumnSizing={true}
        lockColumnWidths={true}
        tableClassName="w-full min-w-[55rem]"
        tableContainerClassName="theme-scrollbar overflow-x-auto overflow-y-auto overscroll-contain"
        tableSectionClassName="max-w-full"
      />
    </div>
  );
}

export default BudgetSelectionTable;
