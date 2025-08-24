import React, { useState } from "react";
import "./InvestmentDashboard.css";

const InvestmentDashboard = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState("1M");
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    category: "",
    amount: "",
    description: "",
  });

  // Mock data - replace with real API data later
  const mockData = {
    totalInvestments: 250000,
    categories: [
      {
        id: 1,
        name: "Mutual Funds",
        amount: 125000,
        percentage: 50,
        color: "mutual-funds",
        icon: "📊",
        description: "Equity and Debt Mutual Funds",
      },
      {
        id: 2,
        name: "Stocks",
        amount: 75000,
        percentage: 30,
        color: "stocks",
        icon: "📈",
        description: "Direct Equity Investments",
      },
      {
        id: 3,
        name: "Fixed Deposits",
        amount: 30000,
        percentage: 12,
        color: "fixed-deposits",
        icon: "🏦",
        description: "Bank Fixed Deposits",
      },
      {
        id: 4,
        name: "Gold",
        amount: 15000,
        percentage: 6,
        color: "gold",
        icon: "🥇",
        description: "Physical and Digital Gold",
      },
      {
        id: 5,
        name: "Crypto",
        amount: 5000,
        percentage: 2,
        color: "crypto",
        icon: "₿",
        description: "Cryptocurrency Holdings",
      },
    ],
    monthlyGrowth: [
      { month: "Jan", value: 220000 },
      { month: "Feb", value: 225000 },
      { month: "Mar", value: 235000 },
      { month: "Apr", value: 240000 },
      { month: "May", value: 245000 },
      { month: "Jun", value: 250000 },
    ],
    recentActivities: [
      {
        id: 1,
        type: "Added",
        category: "Mutual Funds",
        amount: 10000,
        date: "2024-01-15",
        description: "SIP Investment",
      },
      {
        id: 2,
        type: "Added",
        category: "Stocks",
        amount: 5000,
        date: "2024-01-10",
        description: "Direct Stock Purchase",
      },
      {
        id: 3,
        type: "Updated",
        category: "Gold",
        amount: 2000,
        date: "2024-01-08",
        description: "Gold Price Appreciation",
      },
    ],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddInvestment = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to add the investment
    console.log("Adding investment:", newInvestment);
    setShowAddInvestment(false);
    setNewInvestment({ category: "", amount: "", description: "" });
  };

  return (
    <div className="investment-dashboard">
      {/* Dashboard Header */}
      <div className="investment-dashboard-header">
        <div className="investment-header-left">
          <h1>My Investments</h1>
          <p>Track your investment portfolio across different categories</p>
        </div>
        <div className="investment-header-actions">
          <button
            className="investment-add-btn"
            onClick={() => setShowAddInvestment(true)}
          >
            <span>+</span>
            Add Investment
          </button>
          <div className="investment-time-filter">
            {["1M", "3M", "6M", "1Y", "ALL"].map((period) => (
              <button
                key={period}
                className={`investment-time-btn ${
                  activeTimeFilter === period ? "active" : ""
                }`}
                onClick={() => setActiveTimeFilter(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total Investment Overview */}
      <div className="investment-total-overview">
        <div className="investment-total-card">
          <div className="investment-total-icon">💰</div>
          <div className="investment-total-content">
            <h2>Total Investments</h2>
            <div className="investment-total-value">
              {formatCurrency(mockData.totalInvestments)}
            </div>
            <div className="investment-total-subtitle">
              Across {mockData.categories.length} categories
            </div>
          </div>
          <div className="investment-total-chart">
            <div className="investment-growth-line"></div>
          </div>
        </div>
      </div>

      {/* Investment Categories Grid */}
      <div className="investment-categories-section">
        <div className="investment-section-header">
          <h3>Investment Categories</h3>
          <p>Your investments distributed across different asset classes</p>
        </div>

        <div className="investment-categories-grid">
          {mockData.categories.map((category) => (
            <div key={category.id} className="investment-category-card">
              <div className="investment-category-header">
                <div className={`investment-category-icon ${category.color}`}>
                  {category.icon}
                </div>
                <div className="investment-category-percentage">
                  {category.percentage}%
                </div>
              </div>
              <div className="investment-category-content">
                <h4>{category.name}</h4>
                <div className="investment-category-amount">
                  {formatCurrency(category.amount)}
                </div>
                <p className="investment-category-description">
                  {category.description}
                </p>
              </div>
              <div className="investment-category-bar">
                <div
                  className={`investment-category-progress ${category.color}`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="investment-charts-section">
        {/* Allocation Pie Chart */}
        <div className="investment-allocation-container">
          <div className="investment-chart-header">
            <h3>Asset Allocation</h3>
            <p>Distribution of your investments</p>
          </div>
          <div className="investment-pie-chart-container">
            <div className="investment-pie-chart">
              <div className="investment-pie-center">
                <div className="investment-pie-total">
                  {formatCurrency(mockData.totalInvestments)}
                </div>
                <div className="investment-pie-label">Total</div>
              </div>
            </div>
            <div className="investment-pie-legend">
              {mockData.categories.map((category, index) => (
                <div key={index} className="investment-legend-item">
                  <div className="investment-legend-left">
                    <div
                      className={`investment-legend-color ${category.color}`}
                    ></div>
                    <span className="investment-legend-name">
                      {category.name}
                    </span>
                  </div>
                  <div className="investment-legend-right">
                    <div className="investment-legend-value">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="investment-legend-percentage">
                      {category.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="investment-growth-container">
          <div className="investment-chart-header">
            <h3>Investment Growth</h3>
            <p>Your portfolio growth over time</p>
          </div>
          <div className="investment-growth-chart">
            <div className="investment-growth-grid"></div>
            <div className="investment-growth-line-chart">
              {mockData.monthlyGrowth.map((point, index) => (
                <div
                  key={index}
                  className="investment-growth-point"
                  style={{
                    left: `${
                      (index / (mockData.monthlyGrowth.length - 1)) * 100
                    }%`,
                    bottom: `${((point.value - 200000) / 50000) * 100}%`,
                  }}
                  title={`${point.month}: ${formatCurrency(point.value)}`}
                ></div>
              ))}
              <div className="investment-growth-path"></div>
            </div>
            <div className="investment-growth-labels">
              {mockData.monthlyGrowth.map((point, index) => (
                <div key={index} className="investment-growth-label">
                  {point.month}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="investment-activities-section">
        <div className="investment-section-header">
          <h3>Recent Activities</h3>
          <p>Your latest investment updates</p>
        </div>
        <div className="investment-activities-list">
          {mockData.recentActivities.map((activity) => (
            <div key={activity.id} className="investment-activity-item">
              <div
                className={`investment-activity-icon ${activity.type.toLowerCase()}`}
              >
                {activity.type === "Added" ? "+" : "↗"}
              </div>
              <div className="investment-activity-content">
                <div className="investment-activity-header">
                  <span className="investment-activity-type">
                    {activity.type}
                  </span>
                  <span className="investment-activity-category">
                    {activity.category}
                  </span>
                </div>
                <div className="investment-activity-amount">
                  {formatCurrency(activity.amount)}
                </div>
                <div className="investment-activity-description">
                  {activity.description}
                </div>
              </div>
              <div className="investment-activity-date">
                {new Date(activity.date).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Investment Modal */}
      {showAddInvestment && (
        <div className="investment-modal-overlay">
          <div className="investment-modal">
            <div className="investment-modal-header">
              <h3>Add Investment</h3>
              <button
                className="investment-modal-close"
                onClick={() => setShowAddInvestment(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleAddInvestment}
              className="investment-modal-form"
            >
              <div className="investment-form-group">
                <label>Investment Category</label>
                <select
                  value={newInvestment.category}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Fixed Deposits">Fixed Deposits</option>
                  <option value="Gold">Gold</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Bonds">Bonds</option>
                </select>
              </div>
              <div className="investment-form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={newInvestment.amount}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="investment-form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={newInvestment.description}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description"
                />
              </div>
              <div className="investment-modal-actions">
                <button
                  type="button"
                  className="investment-btn-secondary"
                  onClick={() => setShowAddInvestment(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="investment-btn-primary">
                  Add Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentDashboard;
