import React, { useMemo, useCallback } from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useBudgetTableConfig } from "../../hooks/useBudgetTableConfig";
import { BudgetSelectionDataTable } from "./BudgetSelectionDataTable";

export function BudgetSelectionTable({
  budgets = [],
  selectedBudgetIds = [],
  onSelectionChange,
}) {
  const { t } = useLanguage();
  const { columns, rows } = useBudgetTableConfig(budgets, t);

  const selectedRowsMap = useMemo(
    () =>
      selectedBudgetIds.reduce((accumulator, id) => {
        accumulator[id] = true;
        return accumulator;
      }, {}),
    [selectedBudgetIds],
  );

  const typedBudgetIdByKey = useMemo(
    () =>
      rows.reduce((accumulator, row) => {
        accumulator[String(row.id)] = row.id;
        return accumulator;
      }, {}),
    [rows],
  );

  const handleRowSelectionStateChange = useCallback(
    (nextSelection) => {
      if (!onSelectionChange) return;
      const nextIds = Object.entries(nextSelection || {})
        .filter(([, selected]) => selected === true)
        .map(([id]) => typedBudgetIdByKey[id] ?? id);
      onSelectionChange(nextIds);
    },
    [onSelectionChange, typedBudgetIdByKey],
  );

  return (
    <div className="w-full">
      <BudgetSelectionDataTable
        rows={rows}
        columns={columns}
        rowSelectionState={selectedRowsMap}
        onRowSelectionStateChange={handleRowSelectionStateChange}
        defaultPageSize={5}
      />
    </div>
  );
}

export default BudgetSelectionTable;
