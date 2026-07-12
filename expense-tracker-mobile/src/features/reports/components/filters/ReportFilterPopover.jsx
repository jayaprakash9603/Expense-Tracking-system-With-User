import React from "react";
import { DataTableFilterPopover } from "@/shared/components/data/DataTableFilterPopover";

/**
 * Dedicated report filter popover wrapper for parity with legacy frontend behavior.
 */
export function ReportFilterPopover(props) {
  return <DataTableFilterPopover {...props} />;
}

export default ReportFilterPopover;
