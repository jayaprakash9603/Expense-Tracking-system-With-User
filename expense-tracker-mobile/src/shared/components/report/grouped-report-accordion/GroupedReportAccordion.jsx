import React, { useMemo } from "react";
import { AccordionGroup } from "@/shared/components/data/AccordionGroup";
import { GroupedReportAccordionGroupHeader } from "./GroupedReportAccordionGroupHeader";
import { GroupedReportAccordionGroupTable } from "./GroupedReportAccordionGroupTable";
import { getAllSelectableExpenseIds } from "./groupedReportAccordionSelection";

export function GroupedReportAccordion({
  groups,
  columns,
  enableSelection = false,
  selectedGlobalIds = [],
  onSelectionChange,
  className,
}) {
  const allSelectableIds = useMemo(() => getAllSelectableExpenseIds(groups), [groups]);

  return (
    <AccordionGroup
      groups={groups}
      enableGroupSearch
      enableGroupSort
      enableSelection={enableSelection}
      allSelectableIds={allSelectableIds}
      selectedGlobalIds={selectedGlobalIds}
      onSelectionChange={onSelectionChange}
      className={className}
      headerRender={(group) => (
        <GroupedReportAccordionGroupHeader
          group={group}
          enableSelection={enableSelection}
          selectedGlobalIds={selectedGlobalIds}
          onSelectionChange={onSelectionChange}
        />
      )}
      contentRender={(group) => (
        <GroupedReportAccordionGroupTable
          group={group}
          columns={columns}
          enableSelection={enableSelection}
          selectedGlobalIds={selectedGlobalIds}
          onSelectionChange={onSelectionChange}
        />
      )}
    />
  );
}

export default GroupedReportAccordion;
