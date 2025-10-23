import React from "react";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Wallet,
  CreditCard,
  CurrencyExchange,
} from "@mui/icons-material";

// Zero-decimal formatter (duplicated minimal - can be imported from a shared util later)
const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

// Individual metric card (reusing the structure from ExpenseDashboard)
const MetricCard = ({
  title,
  value,
  change,
  changeText,
  changeDirection,
  icon,
  type,
  trend,
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") return `₹${formatNumber0(val)}`;
    return val;
  };
  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className={`trend-indicator ${trend}`}>
          {trend === "up" ? (
            <TrendingUp />
          ) : trend === "down" ? (
            <TrendingDown />
          ) : (
            <TrendingFlat />
          )}
        </div>
      </div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{formatValue(value)}</div>
        {changeText ? (
          <div className={`metric-change ${changeDirection || "neutral"}`}>
            {changeText}
          </div>
        ) : typeof change === "number" ? (
          <div
            className={`metric-change ${change > 0 ? "positive" : "negative"}`}
          >
            {change > 0 ? "+" : ""}
            {change}% from last month
          </div>
        ) : null}
      </div>
      <div className="metric-sparkline">
        <div className="sparkline-bar" style={{ height: "60%" }}></div>
        <div className="sparkline-bar" style={{ height: "80%" }}></div>
        <div className="sparkline-bar" style={{ height: "40%" }}></div>
        <div className="sparkline-bar" style={{ height: "90%" }}></div>
        <div className="sparkline-bar" style={{ height: "70%" }}></div>
      </div>
    </div>
  );
};

// Skeleton for metrics grid (same as previous inline use)
const MetricCardSkeleton = () => (
  <div className="metric-card-skeleton">
    <div className="skeleton-icon" />
    <div className="skeleton-content">
      <div className="skeleton-title" />
      <div className="skeleton-value" />
      <div className="skeleton-change" />
    </div>
  </div>
);

// Main MetricsGrid component
// Props:
//  analyticsSummary: object from API
//  loading: boolean
const MetricsGrid = ({ analyticsSummary, loading }) => {
  if (loading) {
    return (
      <div className="metrics-grid">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="metrics-grid">
      <MetricCard
        title="Total Balance"
        value={analyticsSummary?.remainingBudget ?? 0}
        change={null}
        changeText={
          analyticsSummary?.remainingBudgetComparison?.percentageChange || null
        }
        changeDirection={(() => {
          const t = (
            analyticsSummary?.remainingBudgetComparison?.trend || ""
          ).toLowerCase();
          if (t === "increase") return "positive";
          if (t === "decrease") return "negative";
          return "neutral";
        })()}
        icon={<Wallet />}
        type="primary"
        trend="up"
      />
      <MetricCard
        title="Monthly Spending"
        value={analyticsSummary?.currentMonthLosses ?? 0}
        change={null}
        changeText={
          analyticsSummary?.currentMonthLossesComparison?.percentageChange ||
          null
        }
        changeDirection={
          analyticsSummary?.currentMonthLossesComparison?.trend === "increase"
            ? "negative"
            : analyticsSummary?.currentMonthLossesComparison?.trend ===
              "decrease"
            ? "positive"
            : "neutral"
        }
        icon={<CurrencyExchange />}
        type="expense"
        trend="down"
      />
      <MetricCard
        title="Credit Due"
        value={Math.abs(analyticsSummary?.totalCreditDue ?? 0)}
        change={null}
        changeText={
          analyticsSummary?.totalCreditDueComparison?.percentageChange || null
        }
        changeDirection={(() => {
          const t = (
            analyticsSummary?.totalCreditDueComparison?.trend || ""
          ).toLowerCase();
          if (t === "decrease") return "positive";
          if (t === "increase") return "negative";
          return "neutral";
        })()}
        icon={<CreditCard />}
        type="credit"
        trend="down"
      />
      <MetricCard
        title="Credit Card Bill Paid"
        value={Math.abs(
          analyticsSummary?.creditBillPaymentComparison?.currentMonthBillPaid ??
            analyticsSummary?.creditBillPaymentComparison?.lastCreditBillPaid ??
            0
        )}
        change={null}
        changeText={
          analyticsSummary?.creditBillPaymentComparison?.percentageChange ||
          null
        }
        changeDirection={(() => {
          const t = (
            analyticsSummary?.creditBillPaymentComparison?.trend || ""
          ).toLowerCase();
          if (t === "increase") return "positive";
          if (t === "decrease") return "negative";
          return "neutral";
        })()}
        icon={<CreditCard />}
        type="budget"
        trend={(() => {
          const t = (
            analyticsSummary?.creditBillPaymentComparison?.trend || ""
          ).toLowerCase();
          if (t === "increase") return "up";
          if (t === "decrease") return "down";
          return "neutral";
        })()}
      />
    </div>
  );
};

export default MetricsGrid;
