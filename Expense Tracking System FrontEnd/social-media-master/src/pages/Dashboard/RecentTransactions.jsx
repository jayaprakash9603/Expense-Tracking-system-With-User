import React from "react";
import ListSkeleton from "../../components/ListSkeleton";
import { useTheme } from "../../hooks/useTheme";

// Reusable Recent Transactions list
// Props:
//  transactions: array
//  loading: boolean (shows skeleton if true)
//  maxItems: number limit (default 10)
//  onViewAll: callback for View All button
//  skeletonCount: number of skeleton rows
const RecentTransactions = ({
  transactions = [],
  loading = false,
  maxItems = 10,
  onViewAll,
  skeletonCount = 5,
}) => {
  const { colors } = useTheme();

  return (
    <div
      className="recent-transactions"
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="section-header">
        <h3 style={{ color: colors.primary_text }}>🕒 Recent Transactions</h3>
        <button
          className="view-all-btn"
          onClick={onViewAll}
          style={{
            backgroundColor: colors.primary_accent,
            color: colors.button_text,
          }}
        >
          View All
        </button>
      </div>
      <div className="transactions-list">
        {loading ? (
          <ListSkeleton count={skeletonCount} dense variant="user" />
        ) : (
          (Array.isArray(transactions)
            ? transactions.slice(0, maxItems)
            : []
          ).map((transaction) => (
            <div
              key={transaction.id}
              className="transaction-item"
              style={{
                backgroundColor:
                  transaction.expense?.type === "loss"
                    ? "rgba(255,0,0,0.08)"
                    : transaction.expense?.type === "gain"
                    ? "rgba(0,255,0,0.08)"
                    : colors.tertiary_bg,
                transition: "background-color 0.3s ease",
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div className="transaction-icon">
                {transaction.expense?.type === "loss" ? "💸" : "💰"}
              </div>
              <div className="transaction-details">
                <div
                  className="transaction-name"
                  title={transaction.expense?.expenseName}
                  style={{ color: colors.primary_text }}
                >
                  {transaction.expense?.expenseName}
                </div>
                <div
                  className="transaction-category"
                  style={{ color: colors.secondary_text }}
                >
                  {transaction.categoryName}
                </div>
                <div
                  className="transaction-date"
                  style={{ color: colors.secondary_text }}
                >
                  {transaction.date
                    ? new Date(transaction.date).toLocaleDateString()
                    : ""}
                </div>
              </div>
              <div
                className={`transaction-amount ${
                  transaction.expense?.type || ""
                }`}
                style={{
                  color:
                    transaction.expense?.type === "loss"
                      ? "#ef4444"
                      : "#10b981",
                }}
              >
                {transaction.expense?.type === "loss" ? "-" : "+"}₹
                {Number(
                  Math.abs(transaction.expense?.amount || 0)
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
