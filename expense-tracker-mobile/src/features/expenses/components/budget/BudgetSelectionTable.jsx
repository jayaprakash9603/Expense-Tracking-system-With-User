import React from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useIsDesktop } from "@/shared/hooks/theme/useMediaQuery";
import { cn } from "@/lib/utils";
import { SelectableDataTable } from "@/shared/components/data/SelectableDataTable";
import { useBudgetTableConfig } from "../../hooks/useBudgetTableConfig";

export function BudgetSelectionTable({
  budgets = [],
  selectedBudgetIds = [],
  onSelectionChange,
  loading = false,
}) {
  const { t } = useLanguage();
  const isDesktop = useIsDesktop();
  const { columns, rows } = useBudgetTableConfig(budgets, t);

  return (
    <div className="w-full">
      <SelectableDataTable
        columns={columns}
        data={rows}
        selectedIds={selectedBudgetIds}
        onSelectionChange={onSelectionChange}
        defaultPageSize={5}
        loading={loading}
        emptyMessage={t("common.noResults")}
        flexColumnSizing={isDesktop}
        tableClassName={cn("w-full", isDesktop ? "min-w-0" : "min-w-[1220px]")}
        tableContainerClassName={cn(
          "theme-scrollbar overflow-y-auto overscroll-contain",
          isDesktop ? "overflow-x-hidden" : "overflow-x-auto",
        )}
      />
    </div>
  );
}

export default BudgetSelectionTable;
