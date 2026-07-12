import React from "react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  GroupedReportAccordion,
  GroupedReportAccordionViewToolbar,
} from "@/shared/components/report/grouped-report-accordion";

export function ExpenseReportGroupedPanel({
  groupedReportViewMode,
  onGroupedReportViewModeChange,
  accordionSectionTitleKey,
  accordionGroups,
  columns,
  selectedGlobalIds,
  onSelectedGlobalIdsChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-2 w-full space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t(accordionSectionTitleKey)}</h3>
        <GroupedReportAccordionViewToolbar
          value={groupedReportViewMode}
          onValueChange={onGroupedReportViewModeChange}
        />
        <GroupedReportAccordion
          groups={accordionGroups}
          columns={columns}
          enableSelection={true}
          selectedGlobalIds={selectedGlobalIds}
          onSelectionChange={onSelectedGlobalIdsChange}
        />
      </div>
    </div>
  );
}
