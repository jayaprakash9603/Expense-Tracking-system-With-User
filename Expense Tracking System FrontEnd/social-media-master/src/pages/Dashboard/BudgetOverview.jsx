import React from "react";
import BudgetOverviewSkeleton from "./BudgetOverviewSkeleton";

// Flexible BudgetOverview component
// Supports either a list of detailed budgets or a simple remaining/total view.
// Props:
//  budgets: array of { id, name, allocated, spent }
//  remainingBudget: number (for circle view)
//  totalLosses: number (for circle view)
//  loading: boolean
//  onManageBudgets: callback
//  maxItems: number (default 4)
//  mode: 'auto' | 'list' | 'summary' - auto chooses based on provided props
const BudgetOverview = ({
  budgets = [],
  remainingBudget,
  totalLosses,
  loading = false,
  onManageBudgets,
  maxItems = 4,
  mode = "auto",
}) => {
  if (loading) return <BudgetOverviewSkeleton count={maxItems} />;

  const hasList = Array.isArray(budgets) && budgets.length > 0;
  const useSummary =
    mode === "summary" ||
    (mode === "auto" &&
      !hasList &&
      (remainingBudget != null || totalLosses != null));

  if (useSummary) {
    const absRemain = Math.abs(remainingBudget || 0);
    const losses = Math.abs(totalLosses || 0);
    const denominator = losses + absRemain;
    const budgetUsed = denominator > 0 ? (absRemain / denominator) * 100 : 0;
    return (
      <div className="budget-overview summary">
        <div className="section-header">
          <h3>🎯 Budget Overview</h3>
        </div>
        <div className="budget-circle">
          <div
            className="budget-progress"
            style={{ "--progress": `${budgetUsed}%` }}
          >
            <div className="budget-center">
              <div className="budget-percentage">{budgetUsed.toFixed(0)}%</div>
              <div className="budget-label">Used</div>
            </div>
          </div>
        </div>
        <div className="budget-details">
          <div className="budget-item">
            <span>Remaining</span>
            <span className={remainingBudget >= 0 ? "positive" : "negative"}>
              ₹{Number(Math.abs(remainingBudget || 0)).toLocaleString()}
            </span>
          </div>
          <div className="budget-item">
            <span>Total Spent</span>
            <span>₹{Number(Math.abs(totalLosses || 0)).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  const list = budgets.slice(0, maxItems);
  return (
    <div className="budget-overview list">
      <div className="section-header">
        <h3>📊 Budget Overview</h3>
        {onManageBudgets && (
          <button className="manage-budgets-btn" onClick={onManageBudgets}>
            Manage
          </button>
        )}
      </div>
      <div className="budget-list">
        {list.map((b) => {
          const spentPercent = b.allocated ? (b.spent / b.allocated) * 100 : 0;
          const remaining = Math.max(0, (b.allocated || 0) - (b.spent || 0));
          return (
            <div key={b.id} className="budget-item">
              <div className="budget-header">
                <span className="budget-name" title={b.name}>
                  {b.name}
                </span>
                <span
                  className={`budget-status ${
                    spentPercent >= 100
                      ? "over"
                      : spentPercent >= 80
                      ? "warning"
                      : "ok"
                  }`}
                >
                  {Math.round(spentPercent)}%
                </span>
              </div>
              <div className="budget-bar-wrapper">
                <div className="budget-bar-bg">
                  <div
                    className="budget-bar-fill"
                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="budget-metrics">
                <span className="allocated">
                  Allocated: ₹{Number(b.allocated || 0).toLocaleString()}
                </span>
                <span className="spent">
                  Spent: ₹{Number(b.spent || 0).toLocaleString()}
                </span>
                <span className="remaining">
                  Remaining: ₹{Number(remaining).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
        {!list.length && (
          <div className="budget-empty">No budgets configured yet.</div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;
