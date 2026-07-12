import React from "react";
import { EnhancedDataTable } from "@/shared/components/data/EnhancedDataTable";

/**
 * Thin wrapper around shared EnhancedDataTable for report pages.
 */
export function AdvancedReportTable(props) {
  return (
    <EnhancedDataTable
      searchable
      showColumnVisibility
      enableColumnFilters
      showPagination
      defaultPageSize={20}
      {...props}
    />
  );
}

export default AdvancedReportTable;
