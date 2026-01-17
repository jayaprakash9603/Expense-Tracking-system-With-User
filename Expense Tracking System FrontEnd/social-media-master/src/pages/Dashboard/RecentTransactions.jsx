import React from "react";
import ListSkeleton from "../../components/ListSkeleton";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMediaQuery } from "@mui/material";
import EmptyStateCard from "../../components/EmptyStateCard";

// Reusable Recent Transactions list
// Props:
//  transactions: array
//  loading: boolean (shows skeleton if true)
//  maxItems: number limit (default 10)
//  onViewAll: callback for View All button
//  skeletonCount: number of skeleton rows
//  sectionType: 'full' | 'half' | 'bottom' - layout type for responsive sizing
//  isCompact: boolean - if true, uses compact layout
const RecentTransactions = ({
  transactions = [],
  loading = false,
  maxItems = 10,
  onViewAll,
  skeletonCount = 5,
  sectionType = "bottom",
  isCompact = false,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const showEmpty =
    !loading && (!Array.isArray(transactions) || transactions.length === 0);
  const listStyle = showEmpty
    ? {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoRows: "auto",
      }
    : undefined;

  // Adjust maxItems based on layout type and screen size
  const getEffectiveMaxItems = () => {
    if (isMobile) return Math.min(maxItems, 6);
    if (sectionType === "half") return Math.min(maxItems, 6);
    return maxItems;
  };
  const effectiveMaxItems = getEffectiveMaxItems();

  return (
    <div
      className={`recent-transactions section-layout-${sectionType} ${
        isCompact ? "compact" : ""
      } ${isMobile ? "mobile" : ""} ${isTablet && !isMobile ? "tablet" : ""}`}
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
      <div className="transactions-list" style={listStyle}>
        {loading ? (
          <ListSkeleton count={skeletonCount} dense variant="user" />
        ) : showEmpty ? (
          <EmptyStateCard
            icon="🧾"
            title="No recent transactions"
            message="New transactions will appear here once recorded."
            height={400}
            bordered={false}
          />
        ) : (
          (Array.isArray(transactions)
            ? transactions.slice(0, effectiveMaxItems)
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
                {transaction.expense?.type === "loss" ? "-" : "+"}
                {currencySymbol}
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
