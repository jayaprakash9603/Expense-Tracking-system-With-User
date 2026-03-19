import React from "react";
import { Filter, ArrowLeft } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppSelect } from "@/shared/components/form/AppSelect";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { DateRangePicker } from "@/shared/components/navigation/DateRangePicker";
import { ReportActionMenu } from "./ReportActionMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/shared/hooks/layout/useLayout";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

const DEFAULT_TIMEFRAMES = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

const DEFAULT_FLOW_TYPES = [
  { value: "all", label: "All" },
  { value: "outflow", label: "Expenses" },
  { value: "inflow", label: "Income" },
];

function ReportHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

export function ReportHeader({
  title,
  subtitle,
  timeframe,
  flowType,
  onBack,
  onFilter,
  onExport,
  onTimeframeChange,
  onFlowTypeChange,
  timeframeOptions = DEFAULT_TIMEFRAMES,
  flowTypeOptions = DEFAULT_FLOW_TYPES,
  dateRangeProps,
  isLoading = false,
  showBackButton = true,
  showFilterButton = true,
  isFilterActive = false,
  extraControls,
  onCustomize,
  onDownloadPdf,
  onRefresh,
  className,
}) {
  const { t } = useLanguage();
  const { isMobile } = useLayout();

  if (isLoading) return <ReportHeaderSkeleton />;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        "pb-6 mb-6 border-b",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && onBack && (
          <AppButton variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <AppIcon icon={ArrowLeft} size="md" />
          </AppButton>
        )}
        <div className="min-w-0">
          {title && <h2 className="text-lg font-bold truncate">{title}</h2>}
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {dateRangeProps && <DateRangePicker {...dateRangeProps} />}

        {onTimeframeChange && (
          <AppSelect
            value={timeframe}
            onChange={onTimeframeChange}
            options={timeframeOptions}
            placeholder={t("report.timeframe") || "Timeframe"}
            triggerClassName="h-9 w-[140px]"
          />
        )}

        {onFlowTypeChange && (
          <AppSelect
            value={flowType}
            onChange={onFlowTypeChange}
            options={flowTypeOptions}
            placeholder={t("report.flowType") || "Flow Type"}
            triggerClassName="h-9 w-[120px]"
          />
        )}

        {extraControls}

        {showFilterButton && onFilter && (
          <AppButton
            variant="outline"
            size="icon"
            onClick={onFilter}
            className={cn("h-9 w-9", isFilterActive && "border-primary text-primary")}
          >
            <AppIcon icon={Filter} size="sm" />
          </AppButton>
        )}

        <ReportActionMenu
          onExport={onExport}
          onCustomize={onCustomize}
          onRefresh={onRefresh}
          onDownloadPdf={onDownloadPdf}
          onFilter={onFilter}
        />
      </div>
    </div>
  );
}

export default ReportHeader;
