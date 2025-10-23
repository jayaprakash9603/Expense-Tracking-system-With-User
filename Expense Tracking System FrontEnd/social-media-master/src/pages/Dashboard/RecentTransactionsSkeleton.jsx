import React from "react";

// Skeleton for Recent Transactions
// Renders a grid with 'rows' rows and 'perRow' cards each (default 5 x 2 = 10 cards)
// If a 'count' prop is provided it is ignored in favor of rows*perRow to keep layout consistent.
const RecentTransactionsSkeleton = ({ rows = 5, perRow = 2 }) => {
  const total = rows * perRow;
  const items = Array.from({ length: total });
  return (
    <div className="recent-transactions skeleton">
      <div className="section-header">
        <h3
          className="skeleton-text"
          style={{
            width: "auto",
            maxWidth: 240,
            whiteSpace: "normal",
            overflow: "visible",
          }}
        >
          🕒 Recent Transactions
        </h3>
        <div className="skeleton-pill" style={{ width: 70 }} />
      </div>
      <div className="transactions-list skeleton-grid">
        {items.map((_, i) => (
          <div key={i} className="transaction-item skeleton-card">
            <div className="transaction-icon skeleton-icon-circle" />
            <div className="transaction-details">
              <div
                className="transaction-name skeleton-text"
                style={{ width: "70%", height: 12 }}
              />
              <div
                className="transaction-category skeleton-text"
                style={{ width: "50%", height: 10 }}
              />
              <div
                className="transaction-date skeleton-text"
                style={{ width: "40%", height: 10 }}
              />
            </div>
            <div
              className="transaction-amount skeleton-pill"
              style={{ width: 48, height: 14 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsSkeleton;
