import React from "react";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";

/**
 * SharedOverviewCards
 * Modes: payment | category | expenses | budget
 * For expenses mode we show: Total Spending, Top Expense Name, Avg Transaction, Total Transactions
 * For budget mode we show: Total Budgets, Active Budgets, Total Spent, Total Remaining
 */
const SharedOverviewCards = ({
  data = [],
  mode = "payment",
  currencySymbol,
}) => {
  const settings = useUserSettings();
  const { colors, mode: themeMode } = useTheme();
  const displayCurrency = currencySymbol || settings.getCurrency().symbol;
  const safe = Array.isArray(data) ? data : [];
  const isPayment = mode === "payment";
  const isCategory = mode === "category";
  const isExpenses = mode === "expenses";
  const isBudget = mode === "budget";

  const amountKey = isPayment || isExpenses ? "totalAmount" : "amount";
  const nameKey = isPayment ? "method" : isCategory ? "name" : "method"; // expenses receives payment-method style objects
  const getExpenseDetails = (expense) =>
    expense?.details || expense?.expense || {};

  // Total amount
  const totalAmount = safe.reduce(
    (sum, item) => sum + Number(item?.[amountKey] || 0),
    0
  );

  // Total transactions count (expenses & payment share logic)
  const totalTransactions = safe.reduce(
    (sum, item) => sum + Number(item?.transactions || item?.count || 0),
    0
  );

  // Build expense name aggregation only for expenses mode
  let topExpenseName = "-";
  let topExpenseAmount = 0;
  if (isExpenses) {
    const expenseMap = new Map();
    safe.forEach((method) => {
      (method.expenses || []).forEach((exp) => {
        const details = getExpenseDetails(exp);
        const name = details.expenseName || details.name || "Unknown";
        const amt = Number(details.amount ?? details.netAmount ?? 0);
        const prev = expenseMap.get(name) || 0;
        expenseMap.set(name, prev + amt);
      });
    });
    // Determine top expense by aggregated amount
    expenseMap.forEach((amt, name) => {
      if (amt > topExpenseAmount) {
        topExpenseAmount = amt;
        topExpenseName = name;
      }
    });
  }

  // Fallback top item for non-expenses modes (assume data already sorted)
  const topItem = !isExpenses
    ? safe[0] || { [nameKey]: "-", [amountKey]: 0, percentage: 0 }
    : null;

  const avgTransactionValue =
    totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  // Percentage for top item (payment/category) or top expense (expenses)
  const topPercentage = (() => {
    if (totalAmount <= 0) return 0;
    if (isExpenses) return ((topExpenseAmount || 0) / totalAmount) * 100;
    const amt = Number(topItem?.[amountKey] || 0);
    return (amt / totalAmount) * 100;
  })().toFixed(2);

  // Theme-aware styles
  const cardStyle = {
    background:
      themeMode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "transform 0.2s, box-shadow 0.2s",
    minHeight: "120px",
  };

  const cardIconStyle = {
    fontSize: "32px",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      themeMode === "dark"
        ? "rgba(20, 184, 166, 0.1)"
        : "rgba(20, 184, 166, 0.15)",
    borderRadius: "12px",
  };

  const cardTitleStyle = {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: themeMode === "dark" ? "#888" : "#666",
    fontWeight: 500,
  };

  const cardValueStyle = {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.primary_text,
    marginBottom: "4px",
  };

  const cardChangeStyle = {
    fontSize: "12px",
    fontWeight: 500,
  };

  const borderColors = {
    primary: "#14b8a6",
    secondary: "#06d6a0",
    tertiary: "#118ab2",
    quaternary: "#ffd166",
  };

  const getCardStyleWithBorder = (borderColor) => ({
    ...cardStyle,
    borderLeft: `4px solid ${borderColor}`,
  });

  const hoverEffect = (e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 8px 25px rgba(20, 184, 166, 0.15)";
  };

  const removeHoverEffect = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };

  // Budget mode renders different cards entirely
  if (isBudget) {
    // Extract budget stats from the parent component
    // Expecting data to contain budget statistics
    const budgetData = safe[0] || {};
    const totalBudgets = budgetData.totalBudgets || 0;
    const activeBudgets = budgetData.activeBudgets || 0;
    const totalSpent = budgetData.totalSpent || 0;
    const totalRemaining = budgetData.totalRemaining || 0;

    return (
      <div
        className="shared-overview-cards budget-overview-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* Total Budgets */}
        <div
          className="overview-card primary"
          style={getCardStyleWithBorder(borderColors.primary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            📊
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Budgets</h3>
            <div className="card-value" style={cardValueStyle}>
              {totalBudgets}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              All budgets created
            </div>
          </div>
        </div>

        {/* Active Budgets */}
        <div
          className="overview-card secondary"
          style={getCardStyleWithBorder(borderColors.secondary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            ✅
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Active Budgets</h3>
            <div className="card-value" style={cardValueStyle}>
              {activeBudgets}
            </div>
            <div
              className="card-change"
              style={{
                ...cardChangeStyle,
                color: themeMode === "dark" ? "#888" : "#666",
              }}
            >
              Currently active
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div
          className="overview-card tertiary"
          style={getCardStyleWithBorder(borderColors.tertiary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💸
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Spent</h3>
            <div className="card-value" style={cardValueStyle}>
              {displayCurrency}
              {Number(totalSpent).toLocaleString()}
            </div>
            <div
              className="card-change negative"
              style={{ ...cardChangeStyle, color: "#ef4444" }}
            >
              From all budgets
            </div>
          </div>
        </div>

        {/* Total Remaining */}
        <div
          className="overview-card quaternary"
          style={getCardStyleWithBorder(borderColors.quaternary)}
          onMouseEnter={hoverEffect}
          onMouseLeave={removeHoverEffect}
        >
          <div className="card-icon" style={cardIconStyle}>
            💰
          </div>
          <div className="card-content">
            <h3 style={cardTitleStyle}>Total Remaining</h3>
            <div className="card-value" style={cardValueStyle}>
              {displayCurrency}
              {Number(totalRemaining).toLocaleString()}
            </div>
            <div
              className="card-change positive"
              style={{ ...cardChangeStyle, color: "#10b981" }}
            >
              Available budget
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shared-overview-cards ${mode}-overview-cards`}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
      }}
    >
      {/* Total Spending */}
      <div
        className="overview-card primary"
        style={getCardStyleWithBorder(borderColors.primary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          💰
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Total Spending</h3>
          <div className="card-value" style={cardValueStyle}>
            {displayCurrency}
            {Number(totalAmount).toLocaleString()}
          </div>
          <div
            className="card-change positive"
            style={{ ...cardChangeStyle, color: "#10b981" }}
          >
            +{isPayment ? "15.2" : isCategory ? "12.5" : "10.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Top Item / Top Expense Name */}
      <div
        className="overview-card secondary"
        style={getCardStyleWithBorder(borderColors.secondary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          🏆
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>
            {isExpenses
              ? "Top Expense Name"
              : isPayment
              ? "Top Payment Method"
              : "Top Category"}
          </h3>
          <div
            className="card-value"
            title={isExpenses ? topExpenseName : topItem?.[nameKey]}
            style={{
              ...cardValueStyle,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
              cursor: "pointer",
            }}
          >
            {isExpenses ? topExpenseName : topItem?.[nameKey]}
          </div>
          <div
            className="card-change"
            style={{
              ...cardChangeStyle,
              color: themeMode === "dark" ? "#888" : "#666",
            }}
          >
            {displayCurrency}
            {(isExpenses
              ? Number(topExpenseAmount || 0)
              : Number(topItem?.[amountKey] || 0)
            ).toLocaleString()}{" "}
            ({topPercentage}%)
          </div>
        </div>
      </div>

      {/* Avg Transaction */}
      <div
        className="overview-card tertiary"
        style={getCardStyleWithBorder(borderColors.tertiary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          {isPayment || isExpenses ? "📊" : "📈"}
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Avg Transaction</h3>
          <div className="card-value" style={cardValueStyle}>
            {displayCurrency}
            {Math.round(avgTransactionValue)}
          </div>
          <div
            className="card-change negative"
            style={{ ...cardChangeStyle, color: "#ef4444" }}
          >
            -{isPayment ? "3.1" : isCategory ? "5.2" : "4.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div
        className="overview-card quaternary"
        style={getCardStyleWithBorder(borderColors.quaternary)}
        onMouseEnter={hoverEffect}
        onMouseLeave={removeHoverEffect}
      >
        <div className="card-icon" style={cardIconStyle}>
          🔢
        </div>
        <div className="card-content">
          <h3 style={cardTitleStyle}>Total Transactions</h3>
          <div className="card-value" style={cardValueStyle}>
            {totalTransactions}
          </div>
          <div
            className="card-change positive"
            style={{ ...cardChangeStyle, color: "#10b981" }}
          >
            +{isPayment ? "12.8" : isCategory ? "8.7" : "9.3"}% vs last period
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedOverviewCards;
