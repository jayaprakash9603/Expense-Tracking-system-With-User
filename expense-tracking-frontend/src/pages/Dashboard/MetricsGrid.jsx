import React from "react";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
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
  currencySymbol = "₹",
}) => {
  const { colors } = useTheme();

  const formatValue = (val) => {
    if (typeof val === "number")
      return `${currencySymbol}${formatNumber0(val)}`;
    return val;
  };

  return (
    <div
      className={`metric-card ${type}`}
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="metric-header">
        <div className="metric-icon" style={{ color: colors.primary_accent }}>
          {icon}
        </div>
        <div className={`trend-indicator ${trend}`}>
          {trend === "up" ? (
            <TrendingUp style={{ color: "#10b981" }} />
          ) : trend === "down" ? (
            <TrendingDown style={{ color: "#ef4444" }} />
          ) : (
            <TrendingFlat style={{ color: colors.secondary_text }} />
          )}
        </div>
      </div>
      <div className="metric-content">
        <h3 style={{ color: colors.secondary_text }}>{title}</h3>
        <div className="metric-value" style={{ color: colors.primary_text }}>
          {formatValue(value)}
        </div>
        {changeText ? (
          <div
            className={`metric-change ${changeDirection || "neutral"}`}
            style={{
              color:
                changeDirection === "positive"
                  ? "#10b981"
                  : changeDirection === "negative"
                  ? "#ef4444"
                  : colors.secondary_text,
            }}
          >
            {changeText}
          </div>
        ) : typeof change === "number" ? (
          <div
            className={`metric-change ${change > 0 ? "positive" : "negative"}`}
            style={{
              color: change > 0 ? "#10b981" : "#ef4444",
            }}
          >
            {change > 0 ? "+" : ""}
            {change}% from last month
          </div>
        ) : null}
      </div>
      <div className="metric-sparkline">
        <div
          className="sparkline-bar"
          style={{
            height: "60%",
            backgroundColor: colors.hover_bg,
          }}
        />
        <div
          className="sparkline-bar"
          style={{
            height: "80%",
            backgroundColor: colors.hover_bg,
          }}
        />
        <div
          className="sparkline-bar"
          style={{
            height: "40%",
            backgroundColor: colors.hover_bg,
          }}
        />
        <div
          className="sparkline-bar"
          style={{
            height: "90%",
            backgroundColor: colors.hover_bg,
          }}
        />
        <div
          className="sparkline-bar"
          style={{
            height: "70%",
            backgroundColor: colors.hover_bg,
          }}
        />
      </div>
    </div>
  );
};

// Skeleton for metrics grid (same as previous inline use)
const MetricCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="metric-card-skeleton"
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div
        className="skeleton-icon"
        style={{ backgroundColor: colors.hover_bg }}
      />
      <div className="skeleton-content">
        <div
          className="skeleton-title"
          style={{ backgroundColor: colors.hover_bg }}
        />
        <div
          className="skeleton-value"
          style={{ backgroundColor: colors.hover_bg }}
        />
        <div
          className="skeleton-change"
          style={{ backgroundColor: colors.hover_bg }}
        />
      </div>
    </div>
  );
};

// Main MetricsGrid component
// Props:
//  analyticsSummary: object from API
//  loading: boolean
//  currencySymbol: string (optional, will use user settings if not provided)
const MetricsGrid = ({
  analyticsSummary,
  loading,
  currencySymbol: propCurrencySymbol,
}) => {
  const settings = useUserSettings();
  const currencySymbol = propCurrencySymbol || settings.getCurrency().symbol;

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
        currencySymbol={currencySymbol}
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
        currencySymbol={currencySymbol}
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
        currencySymbol={currencySymbol}
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
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default MetricsGrid;
