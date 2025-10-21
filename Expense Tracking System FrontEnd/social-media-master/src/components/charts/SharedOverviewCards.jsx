import React from "react";

/**
 * SharedOverviewCards
 * Modes: payment | category | expenses
 * For expenses mode we show: Total Spending, Top Expense Name, Avg Transaction, Total Transactions
 */
const SharedOverviewCards = ({
  data = [],
  mode = "payment",
  currencySymbol = "₹",
}) => {
  const safe = Array.isArray(data) ? data : [];
  const isPayment = mode === "payment";
  const isCategory = mode === "category";
  const isExpenses = mode === "expenses";

  const amountKey = isPayment || isExpenses ? "totalAmount" : "amount";
  const nameKey = isPayment ? "method" : isCategory ? "name" : "method"; // expenses receives payment-method style objects

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
        const name = exp?.details?.expenseName || "Unknown";
        const amt = Number(
          exp?.details?.amount ?? exp?.details?.netAmount ?? 0
        );
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

  return (
    <div className={`shared-overview-cards ${mode}-overview-cards`}>
      {/* Total Spending */}
      <div className="overview-card primary">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Total Spending</h3>
          <div className="card-value">
            {currencySymbol}
            {Number(totalAmount).toLocaleString()}
          </div>
          <div className="card-change positive">
            +{isPayment ? "15.2" : isCategory ? "12.5" : "10.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Top Item / Top Expense Name */}
      <div className="overview-card secondary">
        <div className="card-icon">🏆</div>
        <div className="card-content">
          <h3>
            {isExpenses
              ? "Top Expense Name"
              : isPayment
              ? "Top Payment Method"
              : "Top Category"}
          </h3>
          <div className="card-value">
            {isExpenses ? topExpenseName : topItem?.[nameKey]}
          </div>
          <div className="card-change">
            {currencySymbol}
            {(isExpenses
              ? Number(topExpenseAmount || 0)
              : Number(topItem?.[amountKey] || 0)
            ).toLocaleString()}{" "}
            ({topPercentage}%)
          </div>
        </div>
      </div>

      {/* Avg Transaction */}
      <div className="overview-card tertiary">
        <div className="card-icon">{isPayment || isExpenses ? "📊" : "📈"}</div>
        <div className="card-content">
          <h3>Avg Transaction</h3>
          <div className="card-value">
            {currencySymbol}
            {Math.round(avgTransactionValue)}
          </div>
          <div className="card-change negative">
            -{isPayment ? "3.1" : isCategory ? "5.2" : "4.0"}% vs last period
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="overview-card quaternary">
        <div className="card-icon">🔢</div>
        <div className="card-content">
          <h3>Total Transactions</h3>
          <div className="card-value">{totalTransactions}</div>
          <div className="card-change positive">
            +{isPayment ? "12.8" : isCategory ? "8.7" : "9.3"}% vs last period
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedOverviewCards;
