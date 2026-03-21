import React from "react";
import { ExpenseReportExportMenu } from "@/features/expenses/components/ExpenseReportExportMenu";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function ExpenseReportHeaderToolbar({ filterControls, onExport }) {
  const { t } = useLanguage();
  return (
    <div className="hidden min-w-0 flex-nowrap items-center justify-end gap-2 lg:flex">
      {filterControls}
      <ExpenseReportExportMenu
        onExport={onExport}
        exportLabel={t("report.exportCsv")}
        moreLabel={t("report.moreActions")}
      />
    </div>
  );
}
