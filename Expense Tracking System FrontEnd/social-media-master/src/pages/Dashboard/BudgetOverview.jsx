import React from "react";
import BudgetOverviewSkeleton from "./BudgetOverviewSkeleton";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import EmptyStateCard from "../../components/EmptyStateCard";

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
//  sectionType: 'full' | 'half' | 'bottom' - layout type for responsive sizing
//  isCompact: boolean - if true, uses compact layout
const BudgetOverview = ({
  budgets = [],
  remainingBudget,
  totalLosses,
  loading = false,
  onManageBudgets,
  maxItems = 4,
  mode = "auto",
  sectionType = "bottom",
  isCompact = false,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Adjust maxItems based on layout type - only reduce for truly compact (half) layouts
  const effectiveMaxItems =
    sectionType === "half" ? Math.min(maxItems, 3) : maxItems;
  // Only apply compact styling for half-width layout
  const useCompactStyle = sectionType === "half";

  if (loading)
    return (
      <BudgetOverviewSkeleton
        count={effectiveMaxItems}
        isCompact={useCompactStyle}
      />
    );

  const hasList = Array.isArray(budgets) && budgets.length > 0;
  const hasSummaryValues = remainingBudget != null || totalLosses != null;
  const showEmpty = !hasList && !hasSummaryValues;

  if (showEmpty) {
    return (
      <EmptyStateCard
        icon="📊"
        title="No budget data yet"
        message="Add budgets to track allocations and spending insightfully."
      />
    );
  }

  const useSummary =
    mode === "summary" || (mode === "auto" && !hasList && hasSummaryValues);

  if (useSummary) {
    const absRemain = Math.abs(remainingBudget || 0);
    const losses = Math.abs(totalLosses || 0);
    const denominator = losses + absRemain;
    const budgetUsed = denominator > 0 ? (absRemain / denominator) * 100 : 0;
    return (
      <div
        className={`budget-overview summary section-layout-${sectionType} ${
          useCompactStyle ? "compact" : ""
        }`}
        style={{
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <div className="section-header">
          <h3 style={{ color: colors.primary_text }}>🎯 Budget Overview</h3>
        </div>
        <div className="budget-circle">
          <div
            className="budget-progress"
            style={{
              "--progress": `${budgetUsed}%`,
              "--progress-color": colors.primary_accent,
              background: `conic-gradient(
                ${colors.primary_accent} 0deg,
                ${colors.primary_accent} calc(${budgetUsed} * 3.6deg),
                ${colors.hover_bg} calc(${budgetUsed} * 3.6deg),
                ${colors.hover_bg} 360deg
              )`,
            }}
          >
            <div
              className="budget-center"
              style={{
                background: colors.tertiary_bg,
                border: `2px solid ${colors.border_color}`,
              }}
            >
              <div
                className="budget-percentage"
                style={{
                  color: colors.primary_accent,
                  textShadow: `0 0 20px ${colors.primary_accent}40`,
                }}
              >
                {budgetUsed.toFixed(0)}%
              </div>
              <div
                className="budget-label"
                style={{ color: colors.secondary_text }}
              >
                Used
              </div>
            </div>
          </div>
        </div>
        <div className="budget-details">
          <div
            className="budget-item budget-card"
            style={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <div className="budget-card-content">
              <span
                className="budget-card-icon"
                style={{
                  backgroundColor:
                    remainingBudget >= 0 ? "#10b98115" : "#ef444415",
                  color: remainingBudget >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {remainingBudget >= 0 ? "💰" : "⚠️"}
              </span>
              <div className="budget-card-info">
                <span
                  className="budget-card-label"
                  style={{ color: colors.secondary_text }}
                >
                  Remaining Budget
                </span>
                <span
                  className={`budget-card-value ${
                    remainingBudget >= 0 ? "positive" : "negative"
                  }`}
                  style={{
                    color: remainingBudget >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {currencySymbol}
                  {Number(Math.abs(remainingBudget || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div
            className="budget-item budget-card"
            style={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <div className="budget-card-content">
              <span
                className="budget-card-icon"
                style={{
                  backgroundColor: `${colors.primary_accent}15`,
                  color: colors.primary_accent,
                }}
              >
                📊
              </span>
              <div className="budget-card-info">
                <span
                  className="budget-card-label"
                  style={{ color: colors.secondary_text }}
                >
                  Total Spent
                </span>
                <span
                  className="budget-card-value"
                  style={{ color: colors.primary_text }}
                >
                  {currencySymbol}
                  {Number(Math.abs(totalLosses || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  const list = budgets.slice(0, effectiveMaxItems);
  return (
    <div
      className={`budget-overview list section-layout-${sectionType} ${
        useCompactStyle ? "compact" : ""
      }`}
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="section-header">
        <h3 style={{ color: colors.primary_text }}>📊 Budget Overview</h3>
        {onManageBudgets && (
          <button
            className="manage-budgets-btn"
            onClick={onManageBudgets}
            style={{
              backgroundColor: colors.primary_accent,
              color: colors.button_text,
            }}
          >
            Manage
          </button>
        )}
      </div>
      <div className="budget-list">
        {list.map((b) => {
          const spentPercent = b.allocated ? (b.spent / b.allocated) * 100 : 0;
          const remaining = Math.max(0, (b.allocated || 0) - (b.spent || 0));
          return (
            <div
              key={b.id}
              className="budget-item"
              style={{
                backgroundColor: colors.tertiary_bg,
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div className="budget-header">
                <span
                  className="budget-name"
                  title={b.name}
                  style={{ color: colors.primary_text }}
                >
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
                  style={{
                    color:
                      spentPercent >= 100
                        ? "#ef4444"
                        : spentPercent >= 80
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  {Math.round(spentPercent)}%
                </span>
              </div>
              <div className="budget-bar-wrapper">
                <div
                  className="budget-bar-bg"
                  style={{ backgroundColor: colors.hover_bg }}
                >
                  <div
                    className="budget-bar-fill"
                    style={{
                      width: `${Math.min(spentPercent, 100)}%`,
                      backgroundColor: colors.primary_accent,
                    }}
                  />
                </div>
              </div>
              <div className="budget-metrics">
                <span
                  className="allocated"
                  style={{ color: colors.secondary_text }}
                >
                  Allocated: {currencySymbol}
                  {Number(b.allocated || 0).toLocaleString()}
                </span>
                <span
                  className="spent"
                  style={{ color: colors.secondary_text }}
                >
                  Spent: {currencySymbol}
                  {Number(b.spent || 0).toLocaleString()}
                </span>
                <span
                  className="remaining"
                  style={{ color: colors.secondary_text }}
                >
                  Remaining: {currencySymbol}
                  {Number(remaining).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
        {!list.length && (
          <EmptyStateCard
            icon="📋"
            title="No budgets configured"
            message="Create a budget to monitor allocations and spending."
            height={180}
            bordered={false}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;
