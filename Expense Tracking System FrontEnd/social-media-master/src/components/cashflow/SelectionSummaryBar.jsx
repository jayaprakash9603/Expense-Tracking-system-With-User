import React from "react";
import SummaryPill from "./SummaryPill";
import {
  formatNumberFull,
  formatCompactNumber,
} from "../../utils/numberFormatters";
import { useTheme } from "../../hooks/useTheme";

const SelectionSummaryBar = ({
  selectionStats,
  selectedBarsLength,
  isMobile,
  summaryExpanded,
  setSummaryExpanded,
  clearSelection,
}) => {
  const { colors } = useTheme();

  if (!selectionStats || selectionStats.count <= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: "50%",
        transform: "translateX(calc(-50% + 50px))",
        zIndex: 7,
        maxWidth: isMobile ? "94%" : 840,
        width: "max-content",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 8,
            background: colors.primary_bg,
            backdropFilter: "blur(10px) saturate(140%)",
            WebkitBackdropFilter: "blur(10px) saturate(140%)",
            border: `1px solid ${colors.border_color}`,
            boxShadow:
              "0 4px 18px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.6)",
            borderRadius: 14,
            padding: "10px 14px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingRight: summaryExpanded ? 8 : 0,
            }}
          >
            <button
              onClick={() => setSummaryExpanded((e) => !e)}
              aria-label={
                summaryExpanded
                  ? "Collapse selection stats"
                  : "Expand selection stats"
              }
              style={{
                background: colors.primary_bg,
                border: `1px solid ${colors.border_color}`,
                color: colors.active_text,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                boxShadow:
                  "0 2px 6px -2px #0009, inset 0 0 0 1px rgba(255,255,255,0.03)",
                transition: "all .35s cubic-bezier(.4,0,.2,1)",
              }}
              title={summaryExpanded ? "Hide stats" : "Show stats"}
            >
              {summaryExpanded ? "−" : "+"}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "nowrap",
              paddingLeft: 4,
              paddingRight: 4,
              maxWidth: summaryExpanded ? (isMobile ? "66vw" : "700px") : 0,
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "thin",
              msOverflowStyle: "none",
              transition: "max-width .45s cubic-bezier(.4,0,.2,1)",
            }}
            className="summary-pills-scroll"
          >
            {summaryExpanded && (
              <>
                <SummaryPill
                  icon=""
                  label="Expenses"
                  value={selectedBarsLength ? selectionStats.expenseCount : 0}
                />
                <SummaryPill
                  icon="💰"
                  label="Total"
                  value={
                    selectionStats.total >= 10000
                      ? formatCompactNumber(selectionStats.total)
                      : formatNumberFull(selectionStats.total)
                  }
                />
                <SummaryPill
                  icon="📊"
                  label="Avg"
                  value={
                    selectionStats.avg >= 10000
                      ? formatCompactNumber(selectionStats.avg)
                      : formatNumberFull(Math.trunc(selectionStats.avg))
                  }
                />
                <SummaryPill
                  icon="⬇"
                  label="Min"
                  value={
                    selectionStats.min >= 10000
                      ? formatCompactNumber(selectionStats.min)
                      : formatNumberFull(selectionStats.min)
                  }
                />
                <SummaryPill
                  icon="⬆"
                  label="Max"
                  value={
                    selectionStats.max >= 10000
                      ? formatCompactNumber(selectionStats.max)
                      : formatNumberFull(selectionStats.max)
                  }
                />
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginLeft: 4 }}>
            <button
              onClick={clearSelection}
              style={{
                background:
                  colors.mode === "dark"
                    ? "linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.08) 100%)"
                    : "linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.04) 100%)",
                border:
                  colors.mode === "dark"
                    ? "1px solid rgba(255, 77, 79, 0.25)"
                    : "1px solid rgba(255, 77, 79, 0.20)",
                color: colors.mode === "dark" ? "#ff8585" : "#ff4d4f",
                fontSize: 12,
                padding: "8px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow:
                  colors.mode === "dark"
                    ? "0 2px 8px -2px rgba(255, 77, 79, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 2px 6px -2px rgba(255, 77, 79, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  colors.mode === "dark"
                    ? "linear-gradient(135deg, rgba(255, 77, 79, 0.20) 0%, rgba(255, 77, 79, 0.15) 100%)"
                    : "linear-gradient(135deg, rgba(255, 77, 79, 0.15) 0%, rgba(255, 77, 79, 0.08) 100%)";
                e.currentTarget.style.borderColor =
                  colors.mode === "dark"
                    ? "rgba(255, 77, 79, 0.35)"
                    : "rgba(255, 77, 79, 0.30)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  colors.mode === "dark"
                    ? "0 4px 12px -2px rgba(255, 77, 79, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                    : "0 4px 10px -2px rgba(255, 77, 79, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  colors.mode === "dark"
                    ? "linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.08) 100%)"
                    : "linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.04) 100%)";
                e.currentTarget.style.borderColor =
                  colors.mode === "dark"
                    ? "rgba(255, 77, 79, 0.25)"
                    : "rgba(255, 77, 79, 0.20)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  colors.mode === "dark"
                    ? "0 2px 8px -2px rgba(255, 77, 79, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 2px 6px -2px rgba(255, 77, 79, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)";
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ✕
              </span>
              <span style={{ letterSpacing: 0.5 }}>Clear</span>
            </button>
          </div>
          {/* Expense list removed per request: only showing aggregated stats now */}
        </div>
      </div>
    </div>
  );
};

export default SelectionSummaryBar;
