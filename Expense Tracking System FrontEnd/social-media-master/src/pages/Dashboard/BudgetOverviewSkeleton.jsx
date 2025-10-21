import React from "react";

// BudgetOverviewSkeleton supports two modes:
//  summary: circle progress + two metric lines (Remaining / Total Spent)
//  list: multiple budget rows with bar + metrics (count controls rows)
const BudgetOverviewSkeleton = ({ mode = "summary", count = 4 }) => {
  if (mode === "summary") {
    return (
      <div className="budget-overview skeleton summary">
        <div className="section-header">
          <h3
            className="skeleton-text"
            style={{
              width: 160,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
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
                style={{ width: 48, height: 22 }}
              />
              <div
                className="budget-label skeleton-text"
                style={{ width: 40, height: 14 }}
              />
              {/* Small round shape inside the center to mirror live UI accent */}
              <div
                className="skeleton-mini-circle"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  marginTop: 6,
                }}
              />
            </div>
          </div>
        </div>
        <div className="budget-details">
          <div className="budget-item">
            <span className="skeleton-text" style={{ width: 70, height: 14 }} />
            <span className="skeleton-pill" style={{ width: 90, height: 18 }} />
          </div>
          <div className="budget-item">
            <span className="skeleton-text" style={{ width: 80, height: 14 }} />
            <span className="skeleton-pill" style={{ width: 90, height: 18 }} />
          </div>
        </div>
      </div>
    );
  }

  // list mode skeleton
  return (
    <div className="budget-overview skeleton list">
      <div className="section-header">
        <h3
          className="skeleton-text"
          style={{
            width: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          📊 Budget Overview
        </h3>
        <div className="skeleton-pill" style={{ width: 70 }} />
      </div>
      <div className="budget-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="budget-item">
            <div className="budget-header">
              <div
                className="skeleton-text"
                style={{ width: 120, height: 14 }}
              />
              <div
                className="skeleton-pill"
                style={{ width: 42, height: 18 }}
              />
            </div>
            <div className="budget-bar-wrapper">
              <div className="budget-bar-bg skeleton-bar">
                <div className="budget-bar-fill" style={{ width: "0%" }} />
              </div>
            </div>
            <div className="budget-metrics">
              <div
                className="skeleton-text"
                style={{ width: 90, height: 12 }}
              />
              <div
                className="skeleton-text"
                style={{ width: 80, height: 12 }}
              />
              <div
                className="skeleton-text"
                style={{ width: 100, height: 12 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverviewSkeleton;
