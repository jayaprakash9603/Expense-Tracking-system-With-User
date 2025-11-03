import React from "react";
import { useTheme } from "../../hooks/useTheme";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Percent,
} from "lucide-react";

/**
 * Budget Overview Grid Component
 * Displays budget information in a card grid format
 * Supports dark/light theme and follows DRY principles
 *
 * @param {Array} budgets - Array of budget objects with name, totalSpent, allocated, expenses, etc.
 */
const BudgetOverviewGrid = ({ budgets = [] }) => {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  /**
   * Calculate utilization percentage for a budget
   */
  const calculateUtilization = (spent, allocated) => {
    if (!allocated || allocated === 0) return 0;
    return Math.min((spent / allocated) * 100, 999.99);
  };

  /**
   * Get status color based on utilization percentage
   */
  const getStatusColor = (utilization) => {
    if (utilization >= 100) return "#ff6b6b"; // Over budget - Red
    if (utilization >= 80) return "#ffa94d"; // Warning - Orange
    if (utilization >= 50) return "#4ecdc4"; // Good - Cyan
    return "#51cf66"; // Excellent - Green
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Render individual budget card
   */
  const BudgetCard = ({ budget }) => {
    // Use correct field names from backend
    const spent = budget.totalLoss || budget.totalSpent || 0;
    const allocated = budget.allocatedAmount || 0;
    const transactionCount =
      budget.transactions || budget.totalTransactions || 0;
    const budgetName = budget.budgetName || budget.name || "Unknown Budget";
    const startDate = budget.startDate || "";
    const endDate = budget.endDate || "";
    const isExpired = budget.valid === false || budget.isExpired === true;

    const utilization = calculateUtilization(spent, allocated);
    const statusColor = getStatusColor(utilization);
    const remaining = allocated - spent;
    const isOverBudget = remaining < 0;

    return (
      <div
        className="budget-card"
        style={{
          background: isDark ? "#2a2a2a" : "#f5f5f5",
          border: `1px solid ${colors.border_color}`,
          borderRadius: "12px",
          padding: "20px",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = isDark
            ? "0 8px 24px rgba(0, 0, 0, 0.4)"
            : "0 8px 24px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = colors.primary_accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = colors.border_color;
        }}
      >
        {/* Color indicator bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: budget.color || statusColor,
          }}
        />

        {/* Budget Header */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h4
            style={{
              color: colors.primary_text,
              fontSize: "18px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.3px",
            }}
            title={budgetName}
          >
            {budgetName}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: colors.secondary_text,
                fontSize: "13px",
                background: isDark ? "#1a1a1a" : "#e8e8e8",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              <Calendar size={14} />
              <span style={{ fontWeight: 500 }}>
                {startDate} - {endDate}
              </span>
            </div>
            {isExpired && (
              <span
                style={{
                  background: "#ff6b6b",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                color: colors.secondary_text,
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Utilization
            </span>
            <span
              style={{
                color: statusColor,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: isDark ? "#1a1a1a" : "#f0f0f0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(utilization, 100)}%`,
                height: "100%",
                background: statusColor,
                borderRadius: "4px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* Spent */}
          <div
            style={{
              background: isDark ? "#1a1a1a" : "#f8f9fa",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: colors.secondary_text,
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              <TrendingUp size={14} />
              <span>Spent</span>
            </div>
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {formatCurrency(spent)}
            </div>
          </div>

          {/* Allocated */}
          <div
            style={{
              background: isDark ? "#1a1a1a" : "#f8f9fa",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: colors.secondary_text,
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              <Target size={14} />
              <span>Allocated</span>
            </div>
            <div
              style={{
                color: colors.primary_text,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {formatCurrency(allocated)}
            </div>
          </div>
        </div>

        {/* Remaining Amount */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px",
            background: isOverBudget
              ? isDark
                ? "rgba(255, 107, 107, 0.1)"
                : "rgba(255, 107, 107, 0.05)"
              : isDark
              ? "rgba(81, 207, 102, 0.1)"
              : "rgba(81, 207, 102, 0.05)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: colors.secondary_text,
              fontSize: "13px",
            }}
          >
            {isOverBudget ? (
              <TrendingDown size={16} />
            ) : (
              <DollarSign size={16} />
            )}
            <span>{isOverBudget ? "Over Budget" : "Remaining"}</span>
          </div>
          <span
            style={{
              color: isOverBudget ? "#ff6b6b" : "#51cf66",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>

        {/* Transaction Count */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: `1px solid ${colors.border_color}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: colors.secondary_text,
              fontSize: "13px",
            }}
          >
            Transactions
          </span>
          <span
            style={{
              color: colors.primary_text,
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {transactionCount}
          </span>
        </div>
      </div>
    );
  };

  if (!budgets || budgets.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: colors.secondary_text,
        }}
      >
        <Target size={48} style={{ opacity: 0.5, marginBottom: "16px" }} />
        <p>No budgets available</p>
      </div>
    );
  }

  // Determine if scrolling is needed and calculate appropriate height
  // Assuming 3 cards per row on desktop, 2 on tablet, 1 on mobile
  // Calculate rows needed for current budgets
  const cardsPerRow = 3; // Desktop default
  const rowsNeeded = Math.ceil(budgets.length / cardsPerRow);
  const needsScroll = rowsNeeded > 2;

  // Dynamic height based on actual content
  // Each card is ~350px height + 20px gap
  const maxHeight = needsScroll ? "750px" : "auto";

  return (
    <div
      className="budget-overview-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "20px",
        padding: "4px",
        maxHeight: maxHeight,
        minHeight: "auto",
        overflowY: needsScroll ? "auto" : "visible",
        overflowX: "hidden",
        // Custom scrollbar styling
        scrollbarWidth: "thin",
        scrollbarColor: `${colors.primary_accent} ${
          isDark ? "#1a1a1a" : "#f0f0f0"
        }`,
      }}
    >
      {budgets.map((budget, index) => (
        <BudgetCard
          key={budget.budgetId || budget.id || index}
          budget={budget}
        />
      ))}
      <style>
        {`
          .budget-overview-grid::-webkit-scrollbar {
            width: 8px;
          }
          .budget-overview-grid::-webkit-scrollbar-track {
            background: ${isDark ? "#1a1a1a" : "#f0f0f0"};
            border-radius: 4px;
          }
          .budget-overview-grid::-webkit-scrollbar-thumb {
            background: ${colors.primary_accent};
            border-radius: 4px;
          }
          .budget-overview-grid::-webkit-scrollbar-thumb:hover {
            background: ${colors.secondary_text};
          }
        `}
      </style>
    </div>
  );
};

export default BudgetOverviewGrid;
