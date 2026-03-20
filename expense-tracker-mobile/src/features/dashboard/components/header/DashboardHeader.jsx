import React from "react";
import { MoreVertical, RefreshCw, Download, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  title,
  subtitle,
  onRefresh,
  onExport,
  onFilter,
  onCustomize,
}) {
  const { t } = useLanguage();
  const { animation } = usePresentation();

  const displayTitle = title || t("dashboard.financialDashboard");
  const displaySubtitle = subtitle || t("dashboard.realTimeInsights");

  const hasActions = onRefresh || onExport || onFilter || onCustomize;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border border-border",
        "bg-gradient-to-br from-card to-muted/30 p-4 md:p-5 mb-4 md:mb-6",
        "shadow-sm backdrop-blur-sm",
        animation.enabled && "transition-all duration-200",
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-primary leading-tight">
          {displayTitle}
        </h1>
        {displaySubtitle && (
          <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
            {displaySubtitle}
          </p>
        )}
      </div>

      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onRefresh && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("dashboard.refresh")}
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                {t("dashboard.exportCsv")}
              </DropdownMenuItem>
            )}
            {onFilter && (
              <DropdownMenuItem onClick={onFilter}>
                <Filter className="mr-2 h-4 w-4" />
                {t("dashboard.filter")}
              </DropdownMenuItem>
            )}
            {(onRefresh || onExport || onFilter) && onCustomize && (
              <DropdownMenuSeparator />
            )}
            {onCustomize && (
              <DropdownMenuItem onClick={onCustomize}>
                <Settings className="mr-2 h-4 w-4" />
                {t("dashboard.customize")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default DashboardHeader;
