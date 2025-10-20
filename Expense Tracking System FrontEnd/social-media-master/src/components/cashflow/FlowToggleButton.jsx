import React from "react";
import { flowTypeCycleDefault as flowTypeCycle } from "../../utils/flowDateUtils";
import { formatCurrencyCompact } from "../../utils/numberFormatters";

const FlowToggleButton = ({
  flowTab,
  setFlowTab,
  totals,
  isMobile,
  onResetSelections,
  shrinkFlowBtn,
  setShrinkFlowBtn,
}) => {
  const cycleFlow = () => {
    setShrinkFlowBtn(true);
    setTimeout(() => setShrinkFlowBtn(false), 220);
    const idx = flowTypeCycle.findIndex((t) => t.value === flowTab);
    const next = flowTypeCycle[(idx + 1) % flowTypeCycle.length];
    setFlowTab(next.value);
    onResetSelections && onResetSelections();
  };
  return (
    <button
      onClick={cycleFlow}
      aria-pressed={false}
      className="rounded-lg flex items-center gap-3 justify-center"
      style={{
        minWidth: isMobile ? 48 : 110,
        height: isMobile ? 36 : 40,
        padding: "4px 8px",
        border: "none",
        outline: "none",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        transition: "transform 200ms ease, width 200ms ease, background 300ms",
        transform: shrinkFlowBtn ? "scale(0.88)" : "scale(1)",
        background:
          flowTab === "inflow"
            ? "linear-gradient(180deg,#06D6A0,#05b890)"
            : flowTab === "outflow"
            ? "linear-gradient(180deg,#ff6b6b,#ff4d4f)"
            : "linear-gradient(180deg,#5b7fff,#4563ff)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center" }}>
          {flowTab === "inflow" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12l7-7 7 7"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {flowTab === "outflow" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 12l-7 7-7-7"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {flowTab === "all" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 6l3-3 3 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 21v-6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 18l3 3 3-3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {!isMobile && (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {flowTypeCycle.find((t) => t.value === flowTab)?.label}
            </div>
            <div style={{ fontSize: 12, opacity: 0.95 }}>
              {flowTab === "inflow"
                ? formatCurrencyCompact(totals.inflow)
                : flowTab === "outflow"
                ? formatCurrencyCompact(totals.outflow)
                : formatCurrencyCompact(totals.total)}
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default FlowToggleButton;
