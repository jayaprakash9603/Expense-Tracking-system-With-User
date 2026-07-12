import React from "react";
import { Checkbox } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { getGroupExpenseRows, isEveryGroupRowSelected, mergeCheckboxSelectionForGroup } from "./groupedReportAccordionSelection";
import { ACCORDION_SELECTION_CHECKBOX_CLASS as GROUPED_REPORT_CHECKBOX_CLASS } from "@/shared/components/data/accordionSelectionCheckboxClass";

export function GroupedReportAccordionGroupHeader({
  group,
  enableSelection,
  selectedGlobalIds,
  onSelectionChange,
}) {
  const { t } = useLanguage();
  const { format: formatMoney } = useMoneyFormatter();
  const rows = getGroupExpenseRows(group);
  const allSelected = enableSelection && isEveryGroupRowSelected(group, selectedGlobalIds);

  return (
    <div className="flex flex-1 flex-col gap-1.5 pr-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:pr-4">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
        {enableSelection ? (
          <div className="mr-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              className={GROUPED_REPORT_CHECKBOX_CLASS}
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (!onSelectionChange) return;
                onSelectionChange(mergeCheckboxSelectionForGroup(!!checked, group, selectedGlobalIds));
              }}
            />
          </div>
        ) : null}
        <span className="flex items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-sm">{group.label}</span>
        <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {t("common.count")} {group.count ?? rows.length}
        </span>
        {group.creditDueTotal > 0 ? (
          <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            {t("reports.groupedAccordion.dueShort")} {formatMoney(group.creditDueTotal)}
          </span>
        ) : null}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs sm:mt-0 sm:gap-3 sm:text-sm md:gap-4">
        <span className="font-medium text-amber-600 dark:text-amber-500">
          {t("reports.groupedAccordion.avgShort")} {formatMoney(group.avgPerTransaction)}
        </span>
        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
          {formatMoney(group.totalAmount || 0)} ({group.percentage}%)
        </span>
      </div>
    </div>
  );
}
