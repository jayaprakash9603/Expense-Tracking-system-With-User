import React from "react";

// Generic Overview Cards component
// Props:
// - data: array of items (for payments: {method,totalAmount,percentage,transactions}; for categories: {name,amount,percentage,transactions})
// - mode: 'payment' | 'category'
// - currencySymbol: default '₹'
// Maps fields depending on mode
const SharedOverviewCards = ({
  data = [],
  mode = "payment",
  currencySymbol = "₹",
}) => {
  const safe = Array.isArray(data) ? data : [];
  const amountKey = mode === "payment" ? "totalAmount" : "amount";
  const nameKey = mode === "payment" ? "method" : "name";

  const totalAmount = safe.reduce(
    (sum, item) => sum + Number(item?.[amountKey] || 0),
    0
  );
  const totalTransactions = safe.reduce(
    (sum, item) => sum + Number(item?.transactions || 0),
    0
  );
  const topItem = safe[0] || { [nameKey]: "-", [amountKey]: 0, percentage: 0 };
  const avgTransactionValue =
    totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  return (
    <div className={`shared-overview-cards ${mode}-overview-cards`}>
      <div className="overview-card primary">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Total Spending</h3>
          <div className="card-value">
            {currencySymbol}
            {totalAmount.toLocaleString()}
          </div>
          <div className="card-change positive">
            +{mode === "payment" ? "15.2" : "12.5"}% vs last month
          </div>
        </div>
      </div>

      <div className="overview-card secondary">
        <div className="card-icon">🏆</div>
        <div className="card-content">
          <h3>{mode === "payment" ? "Top Payment Method" : "Top Category"}</h3>
          <div className="card-value">{topItem[nameKey]}</div>
          <div className="card-change">
            {currencySymbol}
            {Number(topItem[amountKey] || 0).toLocaleString()} (
            {Number(topItem.percentage || 0)}%)
          </div>
        </div>
      </div>

      <div className="overview-card tertiary">
        <div className="card-icon">{mode === "payment" ? "📊" : "📈"}</div>
        <div className="card-content">
          <h3>Avg Transaction</h3>
          <div className="card-value">
            {currencySymbol}
            {Math.round(avgTransactionValue)}
          </div>
          <div className="card-change negative">
            -{mode === "payment" ? "3.1" : "5.2"}% vs last month
          </div>
        </div>
      </div>

      <div className="overview-card quaternary">
        <div className="card-icon">🔢</div>
        <div className="card-content">
          <h3>Total Transactions</h3>
          <div className="card-value">{totalTransactions}</div>
          <div className="card-change positive">
            +{mode === "payment" ? "12.8" : "8.7"}% vs last month
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedOverviewCards;
