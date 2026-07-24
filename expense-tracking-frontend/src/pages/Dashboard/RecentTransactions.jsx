import React from "react";
import { useNavigate } from "react-router-dom";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaidIcon from "@mui/icons-material/Paid";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMediaQuery } from "@mui/material";
import EmptyStateCard from "../../components/EmptyStateCard";
import RecentTransactionsSkeleton from "./RecentTransactionsSkeleton";

const RecentTransactions = ({
  transactions = [],
  loading = false,
  maxItems = 10,
  onViewAll,
  skeletonCount = 10,
  sectionType = "bottom",
  isCompact = false,
}) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const handleNameClick = (e, transactionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (transactionId) {
      navigate(`/expenses/view/${transactionId}`);
    }
  };

  const getViewExpenseUrl = (transactionId) => {
    return `${window.location.origin}/expenses/view/${transactionId}`;
  };

  const handleCategoryClick = (e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();
    if (categoryId) {
      navigate(`/category-flow/view/${categoryId}`);
    }
  };

  const getCategoryUrl = (categoryId) => {
    if (!categoryId) return "";
    return `${window.location.origin}/category-flow/view/${categoryId}`;
  };

  const getEffectiveMaxItems = () => {
    if (isMobile) return Math.min(maxItems, 6);
    if (sectionType === "half") return Math.min(maxItems, 6);
    return maxItems;
  };
  const effectiveMaxItems = getEffectiveMaxItems();

  const gridColumns = isMobile || isCompact || sectionType === "half" ? 1 : 2;

  if (loading) {
    return (
      <RecentTransactionsSkeleton
        rows={5}
        perRow={2}
        count={skeletonCount}
        isCompact={isCompact}
        gridColumns={gridColumns}
      />
    );
  }

  const showEmpty =
    !loading && (!Array.isArray(transactions) || transactions.length === 0);
  const listStyle = showEmpty
    ? {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoRows: "auto",
      }
    : {
        display: "grid",
        gridTemplateColumns: gridColumns === 1 ? "1fr" : "repeat(2, 1fr)",
        gap: "10px 12px",
      };

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
        <h3
          style={{
            color: colors.primary_text,
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: 0,
          }}
        >
          <ScheduleIcon sx={{ fontSize: 22, color: colors.primary_accent }} />
          Recent Transactions
        </h3>
        <button
          type="button"
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
        {showEmpty ? (
          <EmptyStateCard
            icon="receipt"
            title="No recent transactions"
            message="New transactions will appear here once recorded."
            height={400}
            bordered={false}
          />
        ) : (
          (Array.isArray(transactions)
            ? transactions.slice(0, effectiveMaxItems)
            : []
          ).map((transaction) => {
            const isLoss = transaction.expense?.type === "loss";
            const isGain = transaction.expense?.type === "gain";
            const rowClass =
              isLoss === true ? "loss" : isGain === true ? "gain" : "neutral";
            return (
              <div
                key={transaction.id}
                className={`transaction-item transaction-item--${rowClass}`}
                style={{
                  backgroundColor: isLoss
                    ? "rgba(239, 68, 68, 0.1)"
                    : isGain
                      ? "rgba(34, 197, 94, 0.12)"
                      : colors.tertiary_bg,
                  transition: "background-color 0.3s ease",
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                <div
                  className={`transaction-icon transaction-icon--${rowClass}`}
                  aria-hidden
                >
                  {isLoss ? (
                    <PaidIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <MonetizationOnIcon sx={{ fontSize: 18 }} />
                  )}
                </div>
                <div className="transaction-details">
                  <div
                    className="transaction-name"
                    title={getViewExpenseUrl(transaction.id)}
                    onClick={(e) => handleNameClick(e, transaction.id)}
                    style={{
                      color: colors.primary_text,
                      cursor: "pointer",
                      transition: "text-decoration 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    {transaction.expense?.expenseName}
                  </div>
                  <div
                    className="transaction-category"
                    title={getCategoryUrl(transaction.categoryId)}
                    onClick={(e) =>
                      handleCategoryClick(e, transaction.categoryId)
                    }
                    style={{
                      color: colors.secondary_text,
                      cursor: transaction.categoryId ? "pointer" : "default",
                      transition: "text-decoration 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (transaction.categoryId) {
                        e.currentTarget.style.textDecoration = "underline";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
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
                    Math.abs(transaction.expense?.amount || 0),
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
