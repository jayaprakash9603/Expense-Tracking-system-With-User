import React from "react";
import { AppSheet } from "@/shared/components/overlay/AppSheet";

/**
 * Generic chart drilldown drawer used by analytics and reports.
 */
export function ChartDrilldownDrawer({ open, onOpenChange, title = "Drilldown", children }) {
  return (
    <AppSheet open={open} onOpenChange={onOpenChange} title={title} side="right">
      <div className="space-y-3 p-3 md:p-4">{children}</div>
    </AppSheet>
  );
}

export default ChartDrilldownDrawer;
