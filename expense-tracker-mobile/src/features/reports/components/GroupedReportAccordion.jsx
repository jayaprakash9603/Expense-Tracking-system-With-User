import React from "react";
import { AccordionGroup } from "@/shared/components/data/AccordionGroup";

/**
 * Reusable grouped accordion view for report entities.
 */
export function GroupedReportAccordion({
  groups,
  tabs,
  classify,
  headerRender,
  contentRender,
  className,
}) {
  return (
    <AccordionGroup
      groups={groups}
      tabs={tabs}
      classify={classify}
      headerRender={headerRender}
      contentRender={contentRender}
      enableGroupSearch
      enableGroupSort
      className={className}
    />
  );
}

export default GroupedReportAccordion;
