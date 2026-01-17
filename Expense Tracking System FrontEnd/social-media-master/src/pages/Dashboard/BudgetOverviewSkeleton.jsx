import React from "react";
import { useTheme } from "../../hooks/useTheme";

// BudgetOverviewSkeleton supports two modes:
//  summary: circle progress + two metric lines (Remaining / Total Spent)
//  list: multiple budget rows with bar + metrics (count controls rows)
// isCompact: boolean - if true, uses compact sizing for smaller layouts
const BudgetOverviewSkeleton = ({
  mode = "summary",
  count = 4,
  isCompact = false,
}) => {
  const { colors } = useTheme();
  const effectiveCount = isCompact ? Math.min(count, 3) : count;

  if (mode === "summary") {
    return (
      <div
        className={`budget-overview skeleton summary ${
          isCompact ? "compact" : ""
        }`}
        style={{
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <div className="section-header">
          <h3
            className="skeleton-text"
            style={{
              width: "auto",
              maxWidth: 240,
              whiteSpace: "normal",
              overflow: "visible",
              backgroundColor: colors.hover_bg,
              color: colors.primary_text,
            }}
          >
            🎯 Budget Overview
          </h3>
        </div>
        <div className="budget-circle">
          <div className="budget-progress skeleton-circle">
            <div className="budget-center">
              <div
                className="budget-percentage skeleton-text"
                style={{
                  width: 48,
                  height: 22,
                  backgroundColor: colors.hover_bg,
                }}
              />
              <div
                className="budget-label skeleton-text"
                style={{
                  width: 40,
                  height: 14,
                  backgroundColor: colors.hover_bg,
                }}
              />
              {/* Small round shape inside the center to mirror live UI accent */}
              <div
                className="skeleton-mini-circle"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: colors.hover_bg,
                  marginTop: 6,
                }}
              />
            </div>
          </div>
        </div>
        <div className="budget-details">
          <div className="budget-item">
            <span
              className="skeleton-text"
              style={{
                width: 70,
                height: 14,
                backgroundColor: colors.hover_bg,
              }}
            />
            <span
              className="skeleton-pill"
              style={{
                width: 90,
                height: 18,
                backgroundColor: colors.hover_bg,
              }}
            />
          </div>
          <div className="budget-item">
            <span
              className="skeleton-text"
              style={{
                width: 80,
                height: 14,
                backgroundColor: colors.hover_bg,
              }}
            />
            <span
              className="skeleton-pill"
              style={{
                width: 90,
                height: 18,
                backgroundColor: colors.hover_bg,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // list mode skeleton
  return (
    <div
      className={`budget-overview skeleton list ${isCompact ? "compact" : ""}`}
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="section-header">
        <h3
          className="skeleton-text"
          style={{
            width: "auto",
            maxWidth: 240,
            whiteSpace: "normal",
            overflow: "visible",
            backgroundColor: colors.hover_bg,
            color: colors.primary_text,
          }}
        >
          📊 Budget Overview
        </h3>
        <div
          className="skeleton-pill"
          style={{
            width: 70,
            backgroundColor: colors.hover_bg,
          }}
        />
      </div>
      <div className="budget-list">
        {Array.from({ length: effectiveCount }).map((_, i) => (
          <div
            key={i}
            className="budget-item"
            style={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <div className="budget-header">
              <div
                className="skeleton-text"
                style={{
                  width: 120,
                  height: 14,
                  backgroundColor: colors.hover_bg,
                }}
              />
              <div
                className="skeleton-pill"
                style={{
                  width: 42,
                  height: 18,
                  backgroundColor: colors.hover_bg,
                }}
              />
            </div>
            <div className="budget-bar-wrapper">
              <div
                className="budget-bar-bg skeleton-bar"
                style={{
                  backgroundColor: colors.hover_bg,
                }}
              >
                <div className="budget-bar-fill" style={{ width: "0%" }} />
              </div>
            </div>
            <div className="budget-metrics">
              <div
                className="skeleton-text"
                style={{
                  width: 90,
                  height: 12,
                  backgroundColor: colors.hover_bg,
                }}
              />
              <div
                className="skeleton-text"
                style={{
                  width: 80,
                  height: 12,
                  backgroundColor: colors.hover_bg,
                }}
              />
              <div
                className="skeleton-text"
                style={{
                  width: 100,
                  height: 12,
                  backgroundColor: colors.hover_bg,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverviewSkeleton;
