import React from "react";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import ModernOverviewCard from "../../components/common/ModernOverviewCard";
import WalletIcon from "@mui/icons-material/Wallet";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// Zero-decimal formatter
const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

const MetricCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="metric-card-skeleton"
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "16px",
        height: "130px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div
        className="skeleton-icon"
        style={{ backgroundColor: colors.hover_bg, width: "36px", height: "36px", borderRadius: "50%" }}
      />
      <div className="skeleton-content" style={{ marginTop: "16px" }}>
        <div
          className="skeleton-title"
          style={{ backgroundColor: colors.hover_bg, height: "16px", width: "50%", marginBottom: "8px", borderRadius: "4px" }}
        />
        <div
          className="skeleton-value"
          style={{ backgroundColor: colors.hover_bg, height: "24px", width: "70%", borderRadius: "4px" }}
        />
      </div>
    </div>
  );
};

// Main MetricsGrid component
const MetricsGrid = ({
  analyticsSummary,
  loading,
  currencySymbol: propCurrencySymbol,
}) => {
  const settings = useUserSettings();
  const currencySymbol = propCurrencySymbol || settings.getCurrency().symbol;

  if (loading) {
    return (
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Parse total balance trend
  const tbChangeText = analyticsSummary?.remainingBudgetComparison?.percentageChange || null;
  const tbTrendDirection = (analyticsSummary?.remainingBudgetComparison?.trend || "").toLowerCase();
  
  // Parse monthly spending trend
  const msChangeText = analyticsSummary?.currentMonthLossesComparison?.percentageChange || null;
  const msTrendDirection = (analyticsSummary?.currentMonthLossesComparison?.trend || "").toLowerCase();
  
  // Parse credit due trend
  const cdChangeText = analyticsSummary?.totalCreditDueComparison?.percentageChange || null;
  const cdTrendDirection = (analyticsSummary?.totalCreditDueComparison?.trend || "").toLowerCase();
  
  // Parse credit card bill trend
  const ccChangeText = analyticsSummary?.creditBillPaymentComparison?.percentageChange || null;
  const ccTrendDirection = (analyticsSummary?.creditBillPaymentComparison?.trend || "").toLowerCase();

  return (
    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <ModernOverviewCard
        title="Total Balance"
        value={`${currencySymbol}${formatNumber0(analyticsSummary?.remainingBudget ?? 0)}`}
        icon={<WalletIcon />}
        percentage={tbChangeText}
        trend={tbTrendDirection === "decrease" ? "down" : "up"}
        variant="blue"
        sparklineData={[5, 6, 8, 9, 12, 11, 15]}
      />
      <ModernOverviewCard
        title="Monthly Spending"
        value={`${currencySymbol}${formatNumber0(analyticsSummary?.currentMonthLosses ?? 0)}`}
        icon={<CurrencyExchangeIcon />}
        percentage={msChangeText}
        trend={msTrendDirection === "decrease" ? "down" : "up"}
        variant="purple"
        sparklineData={[10, 8, 12, 10, 15, 14, 18]}
      />
      <ModernOverviewCard
        title="Credit Due"
        value={`${currencySymbol}${formatNumber0(Math.abs(analyticsSummary?.totalCreditDue ?? 0))}`}
        icon={<CreditCardIcon />}
        percentage={cdChangeText}
        trend={cdTrendDirection === "decrease" ? "down" : "up"}
        variant="yellow"
        sparklineData={[4, 5, 4, 3, 5, 6, 7]}
      />
      <ModernOverviewCard
        title="Credit Card Bill Paid"
        value={`${currencySymbol}${formatNumber0(Math.abs(
          analyticsSummary?.creditBillPaymentComparison?.currentMonthBillPaid ??
            analyticsSummary?.creditBillPaymentComparison?.lastCreditBillPaid ??
            0
        ))}`}
        icon={<ReceiptLongIcon />}
        percentage={ccChangeText}
        trend={ccTrendDirection === "decrease" ? "down" : "up"}
        variant="red"
        sparklineData={[8, 9, 11, 10, 13, 14, 16]}
      />
    </div>
  );
};

export default MetricsGrid;