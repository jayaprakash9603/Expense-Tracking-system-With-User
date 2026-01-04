import React, { useMemo } from "react";
import { IconButton } from "@mui/material";
import { Filter, Download } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import DateRangeBadge from "./common/DateRangeBadge";
import { ReportHeaderSkeleton } from "./skeletons/CommonSkeletons";
import {
  DEFAULT_REPORT_TIMEFRAMES,
  DEFAULT_REPORT_FLOW_TYPES,
} from "../constants/reportFilters";

/**
 * ReportHeader - Generic header for analytics report pages (payment methods, categories, etc.)
 *
 * Props:
 * - title: Main heading text (string)
 * - subtitle: Secondary explanatory text (string)
 * - timeframe: Current timeframe value
 * - flowType: Current flow type value (inflow/outflow/all)
 * - onBack: Callback to navigate back
 * - onFilter: Callback to open filters UI
 * - onExport: Callback to trigger export
 * - onTimeframeChange: (newValue: string) => void
 * - onFlowTypeChange: (newValue: string) => void
 * - timeframeOptions: Optional override of timeframe options [{ value, label }]
 * - flowTypeOptions: Optional override of flow type options [{ value, label }]
 * - className: Extra class name to differentiate contexts
 * - enableDateRangeBadge: enable/disable built-in date range badge (default: true)
 * - dateRangeProps: props forwarded to DateRangeBadge (fromDate, toDate, onApply, onReset, etc.)
 * - isCustomRangeActive: indicates whether a custom date range is active
 * - extraSelects: optional array of additional select controls rendered alongside timeframe/flow selects
 * - rightActions: optional React node rendered at the end of the controls row (e.g., action menus)
 * - showExportButton: toggle export button visibility (default: true)
 */
const CUSTOM_TIMEFRAME_PLACEHOLDER = "__custom_timeframe__";

const ReportHeader = ({
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
  className = "",
  centerContent = null,
  enableDateRangeBadge = true,
  dateRangeProps = null,
  isLoading = false,
  skeletonControls = 4,
  isCustomRangeActive = false,
  showFilterButton = true,
  filterButtonLabel = "Filter",
  isFilterActive = false,
  extraSelects = [],
  rightActions = null,
  showExportButton = true,
}) => {
  const { colors } = useTheme();
  const selectStyle = {
    background: colors.primary_bg,
    border: `1px solid ${colors.border_color}`,
    color: colors.primary_text,
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  };

  const hasMatchingTimeframe = useMemo(
    () => timeframeOptions.some((option) => option.value === timeframe),
    [timeframe, timeframeOptions]
  );
  const hasExplicitTimeframe =
    timeframe !== undefined && timeframe !== null && timeframe !== "";
  const shouldShowPlaceholderOption =
    (isCustomRangeActive || !hasMatchingTimeframe) &&
    (hasExplicitTimeframe || isCustomRangeActive);
  const timeframeSelectValue = shouldShowPlaceholderOption
    ? CUSTOM_TIMEFRAME_PLACEHOLDER
    : hasExplicitTimeframe
    ? timeframe
    : "";

  const derivedCenterContent = useMemo(() => {
    if (centerContent) {
      return centerContent;
    }

    if (!enableDateRangeBadge || !dateRangeProps) {
      return null;
    }

    const hasValidProps =
      typeof dateRangeProps.onApply === "function" &&
      dateRangeProps.fromDate &&
      dateRangeProps.toDate;

    if (hasValidProps) {
      const showInlineReset =
        isCustomRangeActive && typeof dateRangeProps.onReset === "function";

      return (
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <DateRangeBadge {...dateRangeProps} />
          {showInlineReset ? (
            <button
              type="button"
              aria-label="Clear custom date range"
              title="Clear custom date range"
              onClick={dateRangeProps.onReset}
              style={{
                border: "none",
                background: colors.primary_bg,
                color: colors.secondary_text,
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `0 0 0 1px ${colors.border_color}`,
                transition: "all 0.2s ease",
                position: "absolute",
                right: -32,
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hover_bg;
                e.currentTarget.style.color = colors.primary_accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primary_bg;
                e.currentTarget.style.color = colors.secondary_text;
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      );
    }

    return null;
  }, [
    centerContent,
    enableDateRangeBadge,
    dateRangeProps,
    isCustomRangeActive,
    colors.primary_bg,
    colors.secondary_text,
    colors.hover_bg,
    colors.primary_accent,
    colors.border_color,
  ]);

  if (isLoading) {
    return <ReportHeaderSkeleton controls={skeletonControls} />;
  }

  return (
    <div
      className={`report-header ${className}`.trim()}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        paddingBottom: "24px",
        borderBottom: `1px solid ${colors.border_color}`,
        paddingTop: "24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: colors.tertiary_bg,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div
          className="header-left"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: "1 1 280px",
            minWidth: 240,
          }}
        >
          <IconButton
            sx={{
              color: colors.secondary_accent,
              backgroundColor: colors.primary_bg,
              "&:hover": { backgroundColor: colors.hover_bg },
              zIndex: 10,
              transform: "translateY(-15px)",
            }}
            onClick={onBack}
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke={colors.secondary_accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: colors.primary_accent,
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                style={{
                  margin: "6px 0 0 0",
                  color: colors.secondary_text,
                  fontSize: "14px",
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {derivedCenterContent ? (
          <div
            className="header-center"
            style={{
              flex: "1 1 220px",
              minWidth: 220,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {derivedCenterContent}
          </div>
        ) : null}

        <div
          className="header-controls"
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flex: "1 1 320px",
            minWidth: 260,
          }}
        >
          <select
            value={flowType}
            onChange={(e) =>
              onFlowTypeChange && onFlowTypeChange(e.target.value)
            }
            className="timeframe-selector"
            style={selectStyle}
            aria-label="Flow type"
          >
            {flowTypeOptions.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={timeframeSelectValue}
            onChange={(e) =>
              onTimeframeChange && onTimeframeChange(e.target.value)
            }
            className="timeframe-selector"
            style={selectStyle}
            aria-label="Timeframe"
          >
            {shouldShowPlaceholderOption ? (
              <option value={CUSTOM_TIMEFRAME_PLACEHOLDER} disabled>
                Select option
              </option>
            ) : null}
            {timeframeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {extraSelects.map((selectConfig, index) => {
            const options = Array.isArray(selectConfig.options)
              ? selectConfig.options
              : [];
            const value =
              selectConfig.value === undefined || selectConfig.value === null
                ? ""
                : selectConfig.value;
            return (
              <select
                key={selectConfig.id || `extra-select-${index}`}
                value={value}
                onChange={(event) =>
                  selectConfig.onChange?.(event.target.value)
                }
                className="timeframe-selector"
                style={selectStyle}
                aria-label={selectConfig.ariaLabel || "Additional filter"}
              >
                {selectConfig.placeholderOption ? (
                  <option
                    value={selectConfig.placeholderOption.value}
                    disabled={selectConfig.placeholderOption.disabled !== false}
                  >
                    {selectConfig.placeholderOption.label}
                  </option>
                ) : null}
                {options.map((option) => (
                  <option
                    key={option.value ?? option.label}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            );
          })}
          {showFilterButton && typeof onFilter === "function" ? (
            <button
              onClick={onFilter}
              className="control-btn"
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isFilterActive
                  ? colors.secondary_accent
                  : colors.primary_bg,
                border: `1px solid ${
                  isFilterActive ? colors.secondary_accent : colors.border_color
                }`,
                color: isFilterActive
                  ? colors.tertiary_bg
                  : colors.primary_text,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: isFilterActive
                  ? `0 0 0 2px ${colors.secondary_accent}33`
                  : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isFilterActive
                  ? colors.secondary_accent
                  : colors.hover_bg;
                e.currentTarget.style.borderColor = colors.primary_accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isFilterActive
                  ? colors.secondary_accent
                  : colors.primary_bg;
                e.currentTarget.style.borderColor = isFilterActive
                  ? colors.secondary_accent
                  : colors.border_color;
              }}
            >
              <Filter size={16} />
              {filterButtonLabel}
              {isFilterActive ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: colors.tertiary_bg,
                  }}
                ></span>
              ) : null}
            </button>
          ) : null}
          {showExportButton ? (
            <button
              onClick={onExport}
              className="control-btn"
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: colors.primary_bg,
                border: `1px solid ${colors.border_color}`,
                color: colors.primary_text,
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hover_bg;
                e.currentTarget.style.borderColor = colors.primary_accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primary_bg;
                e.currentTarget.style.borderColor = colors.border_color;
              }}
            >
              <Download size={16} />
              Export
            </button>
          ) : null}
          {rightActions ? (
            <div
              className="header-extra-actions"
              style={{ display: "flex", alignItems: "center" }}
            >
              {rightActions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
