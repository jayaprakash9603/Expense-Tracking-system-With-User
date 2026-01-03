import React, { useMemo } from "react";
import { IconButton } from "@mui/material";
import { Filter, Download } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import DateRangeBadge from "./common/DateRangeBadge";
import { ReportHeaderSkeleton } from "./skeletons/CommonSkeletons";

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
 */
const DEFAULT_TIMEFRAMES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "all_time", label: "All Time" },
];

const DEFAULT_FLOW_TYPES = [
  { value: "all", label: "All" },
  { value: "outflow", label: "Outflow" },
  { value: "inflow", label: "Inflow" },
];

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
  timeframeOptions = DEFAULT_TIMEFRAMES,
  flowTypeOptions = DEFAULT_FLOW_TYPES,
  className = "",
  centerContent = null,
  enableDateRangeBadge = true,
  dateRangeProps = null,
  isLoading = false,
  skeletonControls = 4,
}) => {
  const { colors } = useTheme();

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
      return <DateRangeBadge {...dateRangeProps} />;
    }

    return null;
  }, [centerContent, enableDateRangeBadge, dateRangeProps, colors.primary_bg]);

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
            style={{
              background: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              color: colors.primary_text,
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
            aria-label="Flow type"
          >
            {flowTypeOptions.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={timeframe}
            onChange={(e) =>
              onTimeframeChange && onTimeframeChange(e.target.value)
            }
            className="timeframe-selector"
            style={{
              background: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              color: colors.primary_text,
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
            aria-label="Timeframe"
          >
            {timeframeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={onFilter}
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
            <Filter size={16} />
            Filter
          </button>
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
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
