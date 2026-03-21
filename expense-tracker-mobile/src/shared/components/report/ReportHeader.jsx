import React, { useMemo } from "react";
import { ArrowLeft, Filter } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppSelect } from "@/shared/components/form/AppSelect";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { ReportActionMenu } from "./ReportActionMenu";
import { ReportHeaderCenter } from "./ReportHeaderCenter";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";
import {
  CUSTOM_TIMEFRAME_PLACEHOLDER,
  DEFAULT_REPORT_FLOW_TYPES,
  DEFAULT_REPORT_TIMEFRAMES,
} from "@/features/reports/constants/reportFilters";

function ReportHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-b pb-6 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

function mapOptions(options, t) {
  return options.map((o) => ({
    value: o.value,
    label: o.labelKey ? t(o.labelKey) : o.label,
  }));
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
  timeframeOptions = DEFAULT_REPORT_TIMEFRAMES,
  flowTypeOptions = DEFAULT_REPORT_FLOW_TYPES,
  dateRangeProps,
  enableDateRangeBadge = true,
  isLoading = false,
  isCustomRangeActive = false,
  showBackButton = true,
  showFilterButton = true,
  filterButtonLabel,
  isFilterActive = false,
  extraSelects = [],
  rightActions = null,
  showExportButton = true,
  stickyBackground = false,
  onCustomize,
  onDownloadPdf,
  onRefresh,
  extraControls,
  className,
}) {
  const { t } = useLanguage();

  const tfOpts = useMemo(() => mapOptions(timeframeOptions, t), [timeframeOptions, t]);
  const flowOpts = useMemo(() => mapOptions(flowTypeOptions, t), [flowTypeOptions, t]);

  const hasMatchingTimeframe = useMemo(
    () => timeframeOptions.some((o) => o.value === timeframe),
    [timeframe, timeframeOptions],
  );
  const hasExplicitTimeframe = timeframe !== undefined && timeframe !== null && timeframe !== "";
  const shouldShowPlaceholder =
    (isCustomRangeActive || !hasMatchingTimeframe) && (hasExplicitTimeframe || isCustomRangeActive);
  const timeframeSelectValue = shouldShowPlaceholder
    ? CUSTOM_TIMEFRAME_PLACEHOLDER
    : hasExplicitTimeframe
      ? timeframe
      : "";

  if (isLoading) return <ReportHeaderSkeleton />;

  return (
    <div
      className={cn(
        "z-10 border-b pb-6 mb-6",
        stickyBackground && "sticky top-0 -mx-4 px-4 pt-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:items-start xl:gap-6">
        <div className="flex min-w-0 items-start gap-3 xl:col-span-5">
          {showBackButton && onBack && (
            <AppButton variant="ghost" size="icon" onClick={onBack} className="mt-0.5 shrink-0" aria-label={t("common.back")}>
              <AppIcon icon={ArrowLeft} size="md" />
            </AppButton>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-1 max-w-full text-sm leading-relaxed text-muted-foreground text-balance sm:max-w-[52ch] xl:max-w-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-2 xl:col-span-3 xl:justify-center">
          <ReportHeaderCenter
            enableDateRangeBadge={enableDateRangeBadge}
            dateRangeProps={dateRangeProps}
            isCustomRangeActive={isCustomRangeActive}
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end xl:col-span-4 xl:justify-end xl:pl-2">
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:justify-end sm:gap-2">
          {onFlowTypeChange && (
            <AppSelect
              value={flowType}
              onChange={onFlowTypeChange}
              options={flowOpts}
              placeholder={t("report.flowType") || "Flow"}
              triggerClassName="h-9 w-full min-w-0 sm:w-[min(100%,140px)]"
            />
          )}
          {onTimeframeChange && (
            <AppSelect
              value={timeframeSelectValue}
              onChange={(v) => {
                if (v === CUSTOM_TIMEFRAME_PLACEHOLDER) return;
                onTimeframeChange(v);
              }}
              options={[
                ...(shouldShowPlaceholder
                  ? [
                      {
                        value: CUSTOM_TIMEFRAME_PLACEHOLDER,
                        label: t("reports.selectTimeframe") || "Select timeframe",
                      },
                    ]
                  : []),
                ...tfOpts,
              ]}
              placeholder={t("report.timeframe") || "Timeframe"}
              triggerClassName="h-9 w-full min-w-0 sm:w-[min(100%,168px)]"
            />
          )}
          </div>
          {extraSelects.map((sel, index) => (
            <AppSelect
              key={sel.id || `extra-${index}`}
              value={sel.value ?? ""}
              onChange={sel.onChange}
              options={mapOptions(sel.options || [], t)}
              placeholder={sel.placeholder || "—"}
              triggerClassName={cn("h-9 w-full min-w-0 sm:w-[min(100%,160px)]", sel.triggerClassName)}
            />
          ))}
          {extraControls}
          {showFilterButton && onFilter && (
            <AppButton
              variant="outline"
              size="sm"
              onClick={onFilter}
              className={cn("h-9 gap-1.5", isFilterActive && "border-primary text-primary")}
            >
              <AppIcon icon={Filter} size="sm" />
              {filterButtonLabel || t("report.filterData") || "Filter"}
            </AppButton>
          )}
          {(showExportButton || onCustomize) && (
            <ReportActionMenu
              onExport={showExportButton ? onExport : undefined}
              onCustomize={onCustomize}
              onRefresh={onRefresh}
              onDownloadPdf={onDownloadPdf}
              onFilter={onFilter}
            />
          )}
          {rightActions}
        </div>
      </div>
    </div>
  );
}

export default ReportHeader;
