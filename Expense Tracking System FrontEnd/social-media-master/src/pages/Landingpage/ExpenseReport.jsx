import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import "./ExpenseReport.css";
import { fetchAllBills } from "../../Redux/Bill/bill.action";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Skeleton Component
const ChartSkeleton = () => (
  <div className="chart-skeleton">
    <div className="skeleton-title"></div>
    <div className="skeleton-chart">
      <div className="skeleton-bars">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="skeleton-bar"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="table-skeleton">
    <div className="skeleton-title"></div>
    <div className="skeleton-table">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-row">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="skeleton-cell"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ExpenseReport = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  // Action menu for report (similar to Bill component)
  const [reportActionAnchorEl, setReportActionAnchorEl] = useState(null);
  const [selectedReportAction, setSelectedReportAction] = useState(null);

  const dispatch = useDispatch();
  const allBills = useSelector((state) => state.bill.bills) || [];
  const loading = useSelector((state) => state.bill.loading);

  useEffect(() => {
    dispatch(fetchAllBills());
  }, [dispatch]);

  const handleReportActionClick = (event) => {
    setReportActionAnchorEl(event.currentTarget);
  };

  const handleReportActionClose = () => {
    setReportActionAnchorEl(null);
    setSelectedReportAction(null);
  };

  const handleReportMenuItemClick = (action) => {
    setSelectedReportAction(action);
    // simple behaviors
    if (action === "refresh") {
      dispatch(fetchAllBills());
    } else if (action === "export") {
      // placeholder: implement CSV export
      console.log("Export CSV requested");
    } else if (action === "pdf") {
      console.log("Download PDF requested");
    }
    handleReportActionClose();
  };

  // Color palette for charts
  const COLORS = [
    "#14b8a6",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#ff6b6b",
  ];

  // loading is handled by Redux; local simulated loading removed

  // Filter bills based on selected criteria
  const filteredBills = useMemo(() => {
    let filtered = [...allBills];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((bill) => bill.category === selectedCategory);
    }

    // Filter by timeframe
    if (selectedTimeframe !== "all") {
      const now = new Date();
      const billDate = new Date();

      filtered = filtered.filter((bill) => {
        const billDateTime = new Date(bill.date);

        switch (selectedTimeframe) {
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return billDateTime >= weekAgo;
          case "month":
            const monthAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate()
            );
            return billDateTime >= monthAgo;
          case "year":
            const yearAgo = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate()
            );
            return billDateTime >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allBills, selectedCategory, selectedTimeframe]);

  // Calculate analytics based on filtered data
  const analytics = useMemo(() => {
    const totalExpenses = filteredBills.reduce(
      (sum, bill) => sum + Math.abs(bill.amount),
      0
    );
    const totalBills = filteredBills.length;
    const averageExpense = totalBills > 0 ? totalExpenses / totalBills : 0;

    // Category-wise breakdown
    const categoryBreakdown = filteredBills.reduce((acc, bill) => {
      const category = bill.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, items: [] };
      }
      acc[category].total += Math.abs(bill.amount);
      acc[category].count += 1;
      acc[category].items.push(...bill.expenses);
      return acc;
    }, {});

    // Payment method breakdown
    const paymentMethodBreakdown = filteredBills.reduce((acc, bill) => {
      const method = bill.paymentMethod;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += Math.abs(bill.amount);
      return acc;
    }, {});

    // Daily expenses for trend analysis
    const dailyExpenses = filteredBills.reduce((acc, bill) => {
      const date = bill.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Math.abs(bill.amount);
      return acc;
    }, {});

    // Top expense items
    const allItems = filteredBills.flatMap((bill) => bill.expenses);
    const itemBreakdown = allItems.reduce((acc, item) => {
      if (!acc[item.itemName]) {
        acc[item.itemName] = { total: 0, quantity: 0 };
      }
      acc[item.itemName].total += item.totalPrice;
      acc[item.itemName].quantity += item.quantity;
      return acc;
    }, {});

    return {
      totalExpenses,
      totalBills,
      averageExpense,
      categoryBreakdown,
      paymentMethodBreakdown,
      dailyExpenses,
      itemBreakdown,
    };
  }, [filteredBills]);

  // Prepare chart data
  const categoryChartData = Object.entries(analytics.categoryBreakdown).map(
    ([category, data]) => ({
      name: category,
      amount: data.total,
      count: data.count,
    })
  );

  const paymentMethodChartData = Object.entries(
    analytics.paymentMethodBreakdown
  ).map(([method, amount]) => ({
    name: method.toUpperCase(),
    value: amount,
  }));

  const dailyTrendData = Object.entries(analytics.dailyExpenses)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount,
    }));

  // Top items data for radial bar chart
  const topItemsRadialData = Object.entries(analytics.itemBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 6)
    .map(([item, data], index) => ({
      name: item.length > 12 ? item.substring(0, 12) + "..." : item,
      fullName: item,
      amount: data.total,
      quantity: data.quantity,
      fill: COLORS[index % COLORS.length],
      percentage:
        analytics.totalExpenses > 0
          ? Math.round((data.total / analytics.totalExpenses) * 100)
          : 0,
    }));

  // Top items data for vertical bar chart
  const topItemsBarData = Object.entries(analytics.itemBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 8)
    .map(([item, data]) => ({
      name: item.length > 15 ? item.substring(0, 15) + "..." : item,
      fullName: item,
      amount: data.total,
      quantity: data.quantity,
    }));

  // Custom label for radial chart
  const renderRadialLabel = (entry) => {
    return `₹${entry.amount}`;
  };

  // Custom tooltip for radial chart
  const CustomRadialTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.fullName}</p>
          <p className="tooltip-amount">Amount: ₹{data.amount}</p>
          <p className="tooltip-quantity">Quantity: {data.quantity}</p>
          <p className="tooltip-percentage">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(allBills.map((bill) => bill.category))];

  if (loading) {
    return (
      <div className="expense-report">
        <div className="report-header">
          <div className="skeleton-title large"></div>
          <div className="skeleton-filters">
            <div className="skeleton-select"></div>
            <div className="skeleton-select"></div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="summary-cards">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="summary-card-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-text"></div>
                <div className="skeleton-number"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="charts-grid">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Table Skeleton */}
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="expense-report">
      <div className="report-header">
        <h1>📊 Bill Report</h1>
        <div
          className="header-actions"
          style={{ display: "flex", alignItems: "center", marginLeft: 12 }}
        >
          <div className="filters">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <IconButton
            onClick={handleReportActionClick}
            sx={{ color: "#14b8a6", ml: 1 }}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>

          {Boolean(reportActionAnchorEl) && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                }}
                onClick={handleReportActionClose}
              />

              <div
                style={{
                  position: "fixed",
                  top:
                    reportActionAnchorEl?.getBoundingClientRect().bottom + 6 ||
                    0,
                  left:
                    reportActionAnchorEl?.getBoundingClientRect().left - 100 ||
                    0,
                  backgroundColor: "#1b1b1b",
                  border: "1px solid #14b8a6",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                  minWidth: "160px",
                }}
              >
                <div style={{ padding: "8px 0" }}>
                  <div
                    onClick={() => handleReportMenuItemClick("refresh")}
                    style={{
                      color: "#fff",
                      padding: "10px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#28282a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span style={{ marginRight: 10 }}>🔄</span>
                    <span style={{ fontSize: 14 }}>Refresh</span>
                  </div>

                  <div
                    onClick={() => handleReportMenuItemClick("export")}
                    style={{
                      color: "#fff",
                      padding: "10px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#28282a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span style={{ marginRight: 10 }}>📤</span>
                    <span style={{ fontSize: 14 }}>Export CSV</span>
                  </div>

                  <div
                    onClick={() => handleReportMenuItemClick("pdf")}
                    style={{
                      color: "#fff",
                      padding: "10px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#28282a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span style={{ marginRight: 10 }}>📥</span>
                    <span style={{ fontSize: 14 }}>Download PDF</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Results Info */}
      <div className="filter-info">
        <p>
          Showing {filteredBills.length} bills
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {selectedTimeframe !== "all" && ` for ${selectedTimeframe}`}
          {filteredBills.length !== allBills.length &&
            ` (filtered from ${allBills.length} total)`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="amount">₹{analytics.totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="summary-card bills">
          <div className="card-icon">📄</div>
          <div className="card-content">
            <h3>Total Bills</h3>
            <p className="count">{analytics.totalBills}</p>
          </div>
        </div>
        <div className="summary-card average">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Average per Bill</h3>
            <p className="amount">₹{analytics.averageExpense.toFixed(2)}</p>
          </div>
        </div>
        <div className="summary-card categories">
          <div className="card-icon">🏷️</div>
          <div className="card-content">
            <h3>Categories</h3>
            <p className="count">
              {Object.keys(analytics.categoryBreakdown).length}
            </p>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {filteredBills.length === 0 ? (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No bills found</h3>
          <p>Try adjusting your filters to see more data.</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Category Breakdown Bar Chart */}
            {categoryChartData.length > 0 && (
              <div className="chart-container chart-half-width">
                <h3>💼 Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#14b8a6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Method Pie Chart */}
            {paymentMethodChartData.length > 0 && (
              <div className="chart-container chart-half-width">
                <h3>💳 Payment Methods</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#14b8a6"
                      dataKey="value"
                    >
                      {paymentMethodChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Daily Trend Line Chart */}
            {dailyTrendData.length > 0 && (
              <div className="chart-container full-width">
                <h3>📅 Daily Expense Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Items Charts */}
            {topItemsRadialData.length > 0 && (
              <div className="chart-container chart-half-width">
                <h3>🛒 Top Expense Items </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    data={topItemsRadialData}
                  >
                    <RadialBar
                      dataKey="amount"
                      cornerRadius={10}
                      label={renderRadialLabel}
                    />
                    <Tooltip content={<CustomRadialTooltip />} />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topItemsBarData.length > 0 && (
              <div className="chart-container chart-half-width">
                <h3>📊 Top Expense Items</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topItemsBarData} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `₹${value}`,
                        "Amount",
                        `Item: ${props.payload.fullName}`,
                        `Quantity: ${props.payload.quantity}`,
                      ]}
                    />
                    <Bar dataKey="amount" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                      {topItemsBarData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Bills Table */}
          <div className="bills-table-container">
            <h3>📋 Recent Bills</h3>
            <div className="table-wrapper">
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bill Name</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{new Date(bill.date).toLocaleDateString()}</td>
                      <td>
                        <div className="bill-name">
                          <strong>{bill.name}</strong>
                          <small>{bill.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{bill.category}</span>
                      </td>
                      <td
                        className={`amount-cell ${
                          bill.type === "gain" ? "gain" : "loss"
                        }`}
                      >
                        {bill.type === "gain" ? "+" : "-"}₹
                        {Math.abs(bill.amount).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`payment-method ${bill.paymentMethod}`}
                        >
                          {bill.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="items-list">
                          {bill.expenses.map((expense, idx) => (
                            <div key={idx} className="expense-item">
                              {expense.itemName} (₹{expense.totalPrice})
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Details */}
          <div className="category-details">
            <h3>📊 Category Breakdown</h3>
            <div className="category-grid">
              {Object.entries(analytics.categoryBreakdown).map(
                ([category, data]) => {
                  const stats = [
                    {
                      label: "Total Amount:",
                      value: `₹${data.total.toFixed(2)}`,
                    },
                    { label: "Bills Count:", value: data.count },
                    {
                      label: "Avg per Bill:",
                      value: `₹${
                        data.count
                          ? (data.total / data.count).toFixed(2)
                          : "0.00"
                      }`,
                    },
                    { label: "Items:", value: data.items.length },
                  ];

                  return (
                    <div key={category} className="category-card">
                      <h4>{category}</h4>
                      <div className="category-stats">
                        {stats.map((s) => (
                          <div key={s.label} className="stat">
                            <span className="label">{s.label}</span>
                            <span className="value">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseReport;
