import React, { useState } from "react";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8); // Default 8 cards

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
          borderRadius: "10px",
          padding: "14px",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = isDark
            ? "0 6px 16px rgba(0, 0, 0, 0.4)"
            : "0 6px 16px rgba(0, 0, 0, 0.1)";
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
            marginBottom: "12px",
          }}
        >
          <h4
            style={{
              color: colors.primary_text,
              fontSize: "15px",
              fontWeight: 600,
              margin: "0 0 8px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.2px",
            }}
            title={budgetName}
          >
            {budgetName}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: colors.secondary_text,
                fontSize: "11px",
                background: isDark ? "#1a1a1a" : "#e8e8e8",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              <Calendar size={12} />
              <span style={{ fontWeight: 500 }}>
                {startDate} - {endDate}
              </span>
            </div>
            {isExpired && (
              <span
                style={{
                  background: "#ff6b6b",
                  color: "white",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  fontSize: "10px",
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
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                color: colors.secondary_text,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Utilization
            </span>
            <span
              style={{
                color: statusColor,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: isDark ? "#1a1a1a" : "#f0f0f0",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(utilization, 100)}%`,
                height: "100%",
                background: statusColor,
                borderRadius: "3px",
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
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          {/* Spent */}
          <div
            style={{
              background: isDark ? "#1a1a1a" : "#f8f9fa",
              padding: "8px",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: colors.secondary_text,
                fontSize: "10px",
                marginBottom: "3px",
              }}
            >
              <TrendingUp size={11} />
              <span>Spent</span>
            </div>
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "13px",
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
              padding: "8px",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: colors.secondary_text,
                fontSize: "10px",
                marginBottom: "3px",
              }}
            >
              <Target size={11} />
              <span>Allocated</span>
            </div>
            <div
              style={{
                color: colors.primary_text,
                fontSize: "13px",
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
            padding: "8px",
            background: isOverBudget
              ? isDark
                ? "rgba(255, 107, 107, 0.1)"
                : "rgba(255, 107, 107, 0.05)"
              : isDark
              ? "rgba(81, 207, 102, 0.1)"
              : "rgba(81, 207, 102, 0.05)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: colors.secondary_text,
              fontSize: "11px",
            }}
          >
            {isOverBudget ? (
              <TrendingDown size={13} />
            ) : (
              <DollarSign size={13} />
            )}
            <span>{isOverBudget ? "Over Budget" : "Remaining"}</span>
          </div>
          <span
            style={{
              color: isOverBudget ? "#ff6b6b" : "#51cf66",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>

        {/* Transaction Count */}
        <div
          style={{
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: `1px solid ${colors.border_color}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: colors.secondary_text,
              fontSize: "11px",
            }}
          >
            Transactions
          </span>
          <span
            style={{
              color: colors.primary_text,
              fontSize: "12px",
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

  // Pagination logic
  const totalBudgets = budgets.length;
  const totalPages = Math.ceil(totalBudgets / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentBudgets = budgets.slice(startIndex, endIndex);

  // Show pagination only if more than 8 cards
  const showPagination = totalBudgets > 8;

  // Enable scroll when per page > 8 to keep container size fixed
  const enableScroll = cardsPerPage > 8;
  // Fixed height for approximately 2-3 rows (8 cards)
  const maxHeight = enableScroll ? "750px" : "auto";

  return (
    <>
      <div
        className="budget-overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          padding: "4px",
          maxHeight: maxHeight,
          minHeight: "auto",
          overflowY: enableScroll ? "auto" : "visible",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary_accent} ${
            isDark ? "#1a1a1a" : "#f0f0f0"
          }`,
        }}
      >
        {currentBudgets.map((budget, index) => (
          <BudgetCard
            key={budget.budgetId || budget.id || index}
            budget={budget}
          />
        ))}
      </div>

      {/* Custom Scrollbar Styles */}
      {enableScroll && (
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
      )}

      {/* Pagination Controls */}
      {showPagination && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            padding: "16px",
            background: isDark ? "#1a1a1a" : "#f8f9fa",
            borderRadius: "8px",
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              style={{
                padding: "8px 12px",
                background:
                  currentPage <= 1
                    ? isDark
                      ? "#2a2a2a"
                      : "#e0e0e0"
                    : colors.primary_accent,
                color: currentPage <= 1 ? colors.secondary_text : "white",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span
              style={{
                color: colors.primary_text,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Budgets {startIndex + 1}-{Math.min(endIndex, totalBudgets)} of{" "}
              {totalBudgets}
            </span>
            <button
              type="button"
              style={{
                padding: "8px 12px",
                background:
                  currentPage >= totalPages
                    ? isDark
                      ? "#2a2a2a"
                      : "#e0e0e0"
                    : colors.primary_accent,
                color:
                  currentPage >= totalPages ? colors.secondary_text : "white",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                color: colors.secondary_text,
                fontSize: "13px",
              }}
            >
              Budgets per page:
            </span>
            <select
              value={cardsPerPage}
              onChange={(e) => {
                setCardsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                background: colors.primary_bg,
                color: colors.primary_text,
                border: `1px solid ${colors.border_color}`,
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetOverviewGrid;
