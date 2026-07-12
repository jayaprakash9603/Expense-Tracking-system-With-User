import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { ReportHeroTitleBlock } from "@/shared/components/report/ReportHeroTitleBlock";
import { ReportHeroHeader } from "@/shared/components/report/ReportHeroHeader";
import { ReportHeroDateRangeSlot, REPORT_HERO_DATE_BADGE_CLASS } from "@/shared/components/report/ReportHeroDateRangeSlot";
import { ReportActionMenu } from "@/shared/components/report/ReportActionMenu";
import { ExpenseReportHeaderFilters } from "@/features/expenses/components/filters/ExpenseReportHeaderFilters";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useReportHeroTimeframeSelect } from "@/features/reports/hooks/useReportHeroTimeframeSelect";
import { DEFAULT_REPORT_FLOW_TYPES, DEFAULT_REPORT_TIMEFRAMES } from "@/shared/constants/reportFilters";

function mapOptions(options, t) {
  return options.map((o) => ({
    value: o.value,
    label: o.labelKey ? t(o.labelKey) : o.label,
  }));
}

export function AnalyticsReportHeader({
  title,
  subtitle,
  titleIcon: TitleIcon = FileText,
  iconShellClassName = "bg-violet-500/12 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  timeframe,
  flowType,
  onTimeframeChange,
  onFlowTypeChange,
  timeframeOptions = DEFAULT_REPORT_TIMEFRAMES,
  flowTypeOptions = DEFAULT_REPORT_FLOW_TYPES,
  dateRangeProps,
  enableDateRangeBadge = true,
  isCustomRangeActive = false,
  onRefresh,
  showExportButton = false,
  onExport,
  onCustomize,
  onDownloadPdf,
  hideFlowTimeframeFilters = false,
  className,
}) {
  const { t } = useLanguage();
  const tfOpts = useMemo(() => mapOptions(timeframeOptions, t), [timeframeOptions, t]);
  const flowOpts = useMemo(() => mapOptions(flowTypeOptions, t), [flowTypeOptions, t]);
  const { timeframeSelectValue, shouldShowTimeframePlaceholder } = useReportHeroTimeframeSelect(
    timeframe,
    timeframeOptions,
    isCustomRangeActive,
  );

  const filterFieldProps = {
    flowOpts,
    timeframeOpts: tfOpts,
    flowType,
    onFlowTypeChange,
    timeframeSelectValue,
    onTimeframeChange,
    shouldShowTimeframePlaceholder,
    flowPlaceholder: t("report.flowType"),
    timeframePlaceholder: t("report.timeframe"),
    selectOptionLabel: t("reports.selectTimeframe"),
  };

  const filterControls = hideFlowTimeframeFilters ? null : (
    <ExpenseReportHeaderFilters {...filterFieldProps} />
  );

  const filterControlsInline = hideFlowTimeframeFilters ? null : (
    <ExpenseReportHeaderFilters {...filterFieldProps} variant="inline" />
  );

  const titleSlot = (
    <ReportHeroTitleBlock
      title={title}
      subtitle={subtitle}
      icon={TitleIcon}
      iconShellClassName={iconShellClassName}
    />
  );

  const showDateRangeBlock = Boolean(enableDateRangeBadge && dateRangeProps);

  const centerSlot = showDateRangeBlock ? (
    <ReportHeroDateRangeSlot
      dateRangeProps={dateRangeProps}
      isCustomRangeActive={isCustomRangeActive}
      enableDateRangeBadge={enableDateRangeBadge}
      badgeClassName={REPORT_HERO_DATE_BADGE_CLASS}
      showCalendarIcon={false}
    />
  ) : null;

  const hasMenuActions = showExportButton || onCustomize || onDownloadPdf || onRefresh;
  const showToolbar = Boolean(filterControls || hasMenuActions);

  const menuNode = hasMenuActions ? (
    <ReportActionMenu
      onExport={showExportButton ? onExport : undefined}
      onCustomize={onCustomize}
      onRefresh={onRefresh}
      onDownloadPdf={onDownloadPdf}
    />
  ) : null;

  const desktopEndSlot = showToolbar ? (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 lg:w-auto">
      {filterControls}
      {menuNode}
    </div>
  ) : null;

  const mobileFooterSlot = filterControlsInline ? (
    <div className="flex min-w-0 flex-wrap items-center gap-2">{filterControlsInline}</div>
  ) : null;

  return (
    <ReportHeroHeader
      className={className}
      titleSlot={titleSlot}
      centerSlot={centerSlot}
      desktopEndSlot={desktopEndSlot}
      mobileTopEndSlot={menuNode}
      mobileFooterSlot={mobileFooterSlot}
    />
  );
}
