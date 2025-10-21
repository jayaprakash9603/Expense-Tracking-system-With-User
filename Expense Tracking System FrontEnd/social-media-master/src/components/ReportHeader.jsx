import React from "react";
import { IconButton } from "@mui/material";
import { Filter, Download } from "lucide-react";

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
 */
const DEFAULT_TIMEFRAMES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
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
}) => {
  return (
    <div className={`report-header ${className}`.trim()}>
      <div
        className="header-left"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <IconButton
          sx={{
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            "&:hover": { backgroundColor: "#28282a" },
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
              stroke="#00DAC6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          {subtitle ? <p style={{ margin: "6px 0 0 0" }}>{subtitle}</p> : null}
        </div>
      </div>
      <div className="header-controls">
        <select
          value={flowType}
          onChange={(e) => onFlowTypeChange && onFlowTypeChange(e.target.value)}
          className="timeframe-selector"
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
          aria-label="Timeframe"
        >
          {timeframeOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button onClick={onFilter} className="control-btn" type="button">
          <Filter size={16} />
          Filter
        </button>
        <button onClick={onExport} className="control-btn" type="button">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
};

export default ReportHeader;
