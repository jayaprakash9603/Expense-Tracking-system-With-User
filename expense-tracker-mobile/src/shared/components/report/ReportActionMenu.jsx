import React from "react";
import { MoreVertical, RefreshCw, Upload, FileDown, Filter, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ReportActionMenu({
  onExport,
  onCustomize,
  onRefresh,
  onDownloadPdf,
  onFilter,
}) {
  const { t } = useLanguage();

  const hasAnyAction = onExport || onCustomize || onRefresh || onDownloadPdf || onFilter;
  if (!hasAnyAction) return null;

  const actions = [
    onRefresh && { key: "refresh", icon: RefreshCw, label: t("report.refresh") || "Refresh", onClick: onRefresh },
    onExport && { key: "export", icon: Upload, label: t("report.exportCsv") || "Export CSV", onClick: onExport },
    onDownloadPdf && { key: "pdf", icon: FileDown, label: t("report.downloadPdf") || "Download PDF", onClick: onDownloadPdf },
    onFilter && { key: "filter", icon: Filter, label: t("report.filterData") || "Filter Data", onClick: onFilter },
  ].filter(Boolean);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent transition-colors"
        >
          <AppIcon icon={MoreVertical} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => (
          <DropdownMenuItem key={action.key} onClick={action.onClick} className="gap-2">
            <AppIcon icon={action.icon} size="sm" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}

        {onCustomize && actions.length > 0 && <DropdownMenuSeparator />}

        {onCustomize && (
          <DropdownMenuItem onClick={onCustomize} className="gap-2">
            <AppIcon icon={Settings} size="sm" />
            <span>{t("report.customize") || "Customize Report"}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ReportActionMenu;
