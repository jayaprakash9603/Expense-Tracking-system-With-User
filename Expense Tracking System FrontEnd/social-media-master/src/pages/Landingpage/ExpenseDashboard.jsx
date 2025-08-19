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
  Doughnut,
} from "recharts";
import { IconButton } from "@mui/material";
import "./ExpenseDashboard.css";
import {
  CreditCard,
  Download,
  Filter,
  MoreVert,
  Refresh,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "@mui/icons-material";
import { Target } from "lucide-react";
import QuickAccess from "./QuickAccess";

// Enhanced Skeleton Components
const MetricCardSkeleton = () => (
  <div className="metric-card-skeleton">
    <div className="skeleton-icon"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-value"></div>
      <div className="skeleton-change"></div>
    </div>
  </div>
);

const ChartSkeleton = ({ height = 300 }) => (
  <div className="chart-skeleton" style={{ height }}>
    <div className="skeleton-chart-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-actions"></div>
    </div>
    <div className="skeleton-chart-body">
      <div className="skeleton-bars">
        {[...Array(8)].map((_, i) => (
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

// Enhanced Header Component
const DashboardHeader = ({ onRefresh, onExport, onFilter }) => (
  <div className="dashboard-header">
    <div className="header-left">
      <div className="header-title">
        <h1>💰 Financial Dashboard</h1>
        <p>Real-time insights into your financial health</p>
      </div>
    </div>
    <div className="header-actions">
      <IconButton onClick={onFilter} className="action-btn">
        <Filter />
      </IconButton>
      <IconButton onClick={onRefresh} className="action-btn">
        <Refresh />
      </IconButton>
      <IconButton onClick={onExport} className="action-btn">
        <Download />
      </IconButton>
      <IconButton className="action-btn">
        <MoreVert />
      </IconButton>
    </div>
  </div>
);

// Enhanced Metric Cards
const MetricCard = ({ title, value, change, icon, type, trend }) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return val >= 1000
        ? `₹${(val / 1000).toFixed(1)}K`
        : `₹${val.toFixed(0)}`;
    }
    return val;
  };

  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className={`trend-indicator ${trend}`}>
          {trend === "up" ? <TrendingUp /> : <TrendingDown />}
        </div>
      </div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{formatValue(value)}</div>
        {change && (
          <div
            className={`metric-change ${change > 0 ? "positive" : "negative"}`}
          >
            {change > 0 ? "+" : ""}
            {change}% from last month
          </div>
        )}
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

// Enhanced Daily Spending Chart
const DailySpendingChart = ({ data }) => {
  const chartData = data.map((item) => ({
    day: new Date(item.day).getDate(),
    spending: item.spending,
    date: item.day,
  }));

  return (
    <div className="chart-container daily-spending-chart">
      <div className="chart-header">
        <h3>📊 Daily Spending Pattern</h3>
        <div className="chart-controls">
          <select className="time-selector">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `₹${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1b1b",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value) => [`₹${value}`, "Spending"]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#14b8a6"
            fillOpacity={1}
            fill="url(#spendingGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Category Breakdown
const CategoryBreakdownChart = ({ data }) => {
  const COLORS = [
    "#14b8a6",
    "#06d6a0",
    "#118ab2",
    "#073b4c",
    "#ffd166",
    "#f77f00",
    "#fcbf49",
    "#f95738",
  ];

  return (
    <div className="chart-container category-breakdown">
      <div className="chart-header">
        <h3>🏷️ Category Breakdown</h3>
        <div className="total-amount">
          Total: ₹
          {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={180}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* Custom tooltip to show category name + formatted amount */}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0];
              const name = p.payload.name ?? p.name;
              const value = p.payload.value ?? p.value ?? 0;
              return (
                <div
                  style={{
                    backgroundColor: "#1b1b1b",
                    border: "1px solid #14b8a6",
                    borderRadius: 8,
                    color: "#fff",
                    padding: 8,
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#cfd8dc" }}>{name}</div>
                  <div style={{ fontWeight: 700, color: "#14b8a6" }}>
                    ₹{Number(value).toLocaleString()}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: "#fff", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Summary / Overview Card (metrics + mini sparkline)
const SummaryOverview = ({ summary }) => {
  const s = {
    totalExpenses: summary?.totalExpenses ?? 30557,
    creditDue: summary?.creditDue ?? -4709,
    budgetsActive: summary?.budgetsActive ?? 4,
    friendsCount: summary?.friendsCount ?? 12,
    groupsCount: summary?.groupsCount ?? 3,
    monthlySpending: summary?.monthlySpending ?? [
      8000, 0, 469, 1200, 900, 1500, 2000, 1800,
    ],
    averageDaily: summary?.averageDaily ?? 1425,
    savingsRate: summary?.savingsRate ?? 18.6,
    upcomingBills: summary?.upcomingBills ?? 2,
    topCategories: summary?.topCategories ?? [
      { name: "Investment", value: 13000 },
      { name: "Pg Rent", value: 7000 },
      { name: "Mother Expenses", value: 8000 },
    ],
    topExpenses: summary?.topExpenses ?? [
      { name: "Grocery - Big Bazaar", amount: 4200, date: "2025-08-10" },
      { name: "Electricity Bill", amount: 2400, date: "2025-08-08" },
      { name: "Rent - PG", amount: 7000, date: "2025-08-01" },
      { name: "Investment - SIP", amount: 13000, date: "2025-08-03" },
    ],
    savingsGoals: summary?.savingsGoals ?? [
      { name: "Emergency Fund", current: 12000, target: 50000 },
      { name: "Vacation", current: 8000, target: 15000 },
    ],
    recommendations: summary?.recommendations ?? [
      { id: 1, text: "Reduce dining out to save ~₹1500/month" },
      { id: 2, text: "Move ₹2000 to high-yield savings" },
    ],
  };

  const chartData = s.monthlySpending.map((val, i) => ({
    month: `M${i + 1}`,
    value: val,
  }));

  return (
    <div className="chart-container summary-overview">
      <div className="chart-header">
        <h3>🔎 Application Overview</h3>
        <div className="total-amount">Live Summary</div>
      </div>

      <div className="overview-content">
        <div className="overview-metrics">
          <div className="overview-metric">
            <div className="metric-icon">💸</div>
            <div className="metric-body">
              <div className="metric-title">Total Expenses</div>
              <div className="metric-value">
                ₹{s.totalExpenses.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="overview-metric">
            <div className="metric-icon">🏦</div>
            <div className="metric-body">
              <div className="metric-title">Credit Due</div>
              <div className="metric-value">
                ₹{Math.abs(s.creditDue).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="overview-metric">
            <div className="metric-icon">📊</div>
            <div className="metric-body">
              <div className="metric-title">Active Budgets</div>
              <div className="metric-value">{s.budgetsActive}</div>
            </div>
          </div>

          <div className="overview-metric">
            <div className="metric-icon">👥</div>
            <div className="metric-body">
              <div className="metric-title">Friends</div>
              <div className="metric-value">{s.friendsCount}</div>
            </div>
          </div>

          <div className="overview-metric">
            <div className="metric-icon">🧑‍🤝‍🧑</div>
            <div className="metric-body">
              <div className="metric-title">Groups</div>
              <div className="metric-value">{s.groupsCount}</div>
            </div>
          </div>
        </div>

        <div className="overview-chart">
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1b1b",
                  border: "1px solid #14b8a6",
                  borderRadius: 8,
                  color: "#fff",
                }}
                formatter={(value) => [`₹${value}`, "Spending"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#ovGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional overview content to make the card feel full and informative */}
      <div className="overview-extra">
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-title">Avg Daily Spend</div>
            <div className="kpi-value">₹{s.averageDaily.toLocaleString()}</div>
            <div className="kpi-sub">Last 30 days</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Savings Rate</div>
            <div className="kpi-value">{s.savingsRate}%</div>
            <div className="kpi-sub">of income</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Upcoming Bills</div>
            <div className="kpi-value">{s.upcomingBills}</div>
            <div className="kpi-sub">due this week</div>
          </div>
        </div>

        <div className="overview-bottom">
          <div className="top-expenses full-width">
            <div className="small-header">Top Expenses</div>
            <ul>
              {s.topExpenses.map((e, i) => (
                <li key={i} className="top-expense-item">
                  <div className="expense-left">
                    <div className="cat-name" title={e.name}>
                      {e.name}
                    </div>
                    <div className="cat-sub">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="expense-right">
                    <span className="cat-value">
                      ₹{e.amount.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Monthly Trend Chart
const MonthlyTrendChart = ({ data }) => {
  return (
    <div className="chart-container monthly-trend">
      <div className="chart-header">
        <h3>📈 Monthly Expense Trend</h3>
        <div className="trend-stats">
          <span className="trend-up">↗ 12% vs last year</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data.datasets[0].data.map((value, index) => ({
            month: data.labels[index],
            expenses: value,
            target: 50000, // Example target line
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="month" stroke="#888" fontSize={12} />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => `₹${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1b1b",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Bar dataKey="expenses" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#ff6b6b"
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Payment Method Distribution
const PaymentMethodChart = ({ data }) => {
  const COLORS = ["#14b8a6", "#06d6a0", "#118ab2"];

  return (
    <div className="chart-container payment-methods">
      <div className="chart-header">
        <h3>💳 Payment Methods</h3>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="80%"
          data={data.datasets[0].data.map((value, index) => ({
            name: data.labels[index],
            value: value,
            fill: COLORS[index % COLORS.length],
          }))}
        >
          <RadialBar dataKey="value" cornerRadius={10} fill="#14b8a6" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1b1b",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Recent Transactions
const RecentTransactions = ({ transactions }) => (
  <div className="recent-transactions">
    <div className="section-header">
      <h3>🕒 Recent Transactions</h3>
      <button className="view-all-btn">View All</button>
    </div>
    <div className="transactions-list">
      {transactions.map((transaction, index) => (
        <div key={transaction.id} className="transaction-item">
          <div className="transaction-icon">
            {transaction.expense.type === "loss" ? "💸" : "💰"}
          </div>
          <div className="transaction-details">
            <div className="transaction-name">
              {transaction.expense.expenseName}
            </div>
            <div className="transaction-category">
              {transaction.categoryName}
            </div>
            <div className="transaction-date">
              {new Date(transaction.date).toLocaleDateString()}
            </div>
          </div>
          <div className={`transaction-amount ${transaction.expense.type}`}>
            {transaction.expense.type === "loss" ? "-" : "+"}₹
            {Math.abs(transaction.expense.amount)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Budget Overview
const BudgetOverview = ({ remainingBudget, totalLosses }) => {
  const budgetUsed =
    (Math.abs(remainingBudget) / (totalLosses + Math.abs(remainingBudget))) *
    100;

  return (
    <div className="budget-overview">
      <div className="section-header">
        <h3>🎯 Budget Overview</h3>
      </div>
      <div className="budget-circle">
        <div
          className="budget-progress"
          style={{ "--progress": `${budgetUsed}%` }}
        >
          <div className="budget-center">
            <div className="budget-percentage">{budgetUsed.toFixed(0)}%</div>
            <div className="budget-label">Used</div>
          </div>
        </div>
      </div>
      <div className="budget-details">
        <div className="budget-item">
          <span>Remaining</span>
          <span className={remainingBudget >= 0 ? "positive" : "negative"}>
            ₹{Math.abs(remainingBudget).toLocaleString()}
          </span>
        </div>
        <div className="budget-item">
          <span>Total Spent</span>
          <span>₹{totalLosses.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ExpenseDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("month");

  // Sample data - replace with your actual data fetching
  const dashboardData = {
    dailySpending: [
      { spending: 8000.0, day: "2025-08-01" },
      { spending: 0.0, day: "2025-08-02" },
      { spending: 469.0, day: "2025-08-03" },
      // ... rest of your daily spending data
    ],
    incomeVsSpending: [
      { name: "Spending", value: 30557.0 },
      { name: "Income", value: 8826.0 },
    ],
    categoryBreakdown: [
      { name: "Investment", value: 13000.0 },
      { name: "Mother Expenses", value: 8000.0 },
      { name: "Pg Rent", value: 7000.0 },
      // ... rest of category data
    ],
    analytics: {
      totalCreditPaid: 107333.0,
      remainingBudget: -5214.0,
      totalLosses: 706165.0,
      currentMonthLosses: 42676.0,
      totalGains: 808284.0,
      todayExpenses: 454.0,
      totalCreditDue: -4709.0,
      lastFiveExpenses: [
        {
          id: 1865,
          date: "2025-10-24",
          includeInBudget: false,
          budgetIds: [],
          categoryId: 151,
          categoryName: "Food",
          expense: {
            id: 1865,
            expenseName: "Weekend",
            amount: 275.0,
            type: "loss",
            paymentMethod: "creditPaid",
            netAmount: -275.0,
            comments: "desccription",
            creditDue: 0.0,
          },
          userId: 1,
          bill: true,
        },
        {
          id: 1866,
          date: "2025-10-24",
          includeInBudget: false,
          budgetIds: [],
          categoryId: 151,
          categoryName: "Food",
          expense: {
            id: 1866,
            expenseName: "Weekend",
            amount: 275.0,
            type: "loss",
            paymentMethod: "creditPaid",
            netAmount: -275.0,
            comments: "desccription",
            creditDue: 0.0,
          },
          userId: 1,
          bill: true,
        },
        {
          id: 1864,
          date: "2025-10-23",
          includeInBudget: false,
          budgetIds: [],
          categoryId: 151,
          categoryName: "Food",
          expense: {
            id: 1864,
            expenseName: "Weekend",
            amount: 275.0,
            type: "loss",
            paymentMethod: "creditPaid",
            netAmount: -275.0,
            comments: "desccription",
            creditDue: 0.0,
          },
          userId: 1,
          bill: true,
        },
        {
          id: 1863,
          date: "2025-10-22",
          includeInBudget: false,
          budgetIds: [],
          categoryId: 151,
          categoryName: "Food",
          expense: {
            id: 1863,
            expenseName: "Weekend",
            amount: 275.0,
            type: "loss",
            paymentMethod: "creditPaid",
            netAmount: -275.0,
            comments: "desccription",
            creditDue: 0.0,
          },
          userId: 1,
          bill: true,
        },
        {
          id: 1862,
          date: "2025-10-21",
          includeInBudget: false,
          budgetIds: [],
          categoryId: 151,
          categoryName: "Food",
          expense: {
            id: 1862,
            expenseName: "Weekend",
            amount: 275.0,
            type: "loss",
            paymentMethod: "creditPaid",
            netAmount: -275.0,
            comments: "desccription",
            creditDue: 0.0,
          },
          userId: 1,
          bill: true,
        },
      ],
    },
    chartData: {
      monthlyTrend: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            data: [
              48627.0, 40966.0, 77127.0, 56690.0, 79724.0, 35418.0, 57506.0,
              30557.0, 1375.0, 550.0, 0.0, 0.0,
            ],
          },
        ],
      },
      paymentMethods: {
        labels: ["cash", "creditNeedToPaid", "creditPaid"],
        datasets: [{ data: [747225.0, 81081.0, 89389.0] }],
      },
    },
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    console.log("Exporting dashboard data...");
  };

  const handleFilter = () => {
    console.log("Opening filter options...");
  };

  if (loading) {
    return (
      <div className="expense-dashboard loading">
        <DashboardHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          onFilter={handleFilter}
        />
        <div className="metrics-grid">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="charts-grid">
          <ChartSkeleton height={350} />
          <ChartSkeleton height={350} />
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="expense-dashboard">
      <DashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onFilter={handleFilter}
      />

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Balance"
          value={
            dashboardData.analytics.totalGains -
            dashboardData.analytics.totalLosses
          }
          change={12.5}
          icon={<Wallet />}
          type="primary"
          trend="up"
        />
        <MetricCard
          title="Monthly Spending"
          value={dashboardData.analytics.currentMonthLosses}
          change={-8.2}
          icon={<TrendingDown />}
          type="expense"
          trend="down"
        />
        <MetricCard
          title="Credit Due"
          value={Math.abs(dashboardData.analytics.totalCreditDue)}
          change={-15.3}
          icon={<CreditCard />}
          type="credit"
          trend="down"
        />
        <MetricCard
          title="Budget Remaining"
          value={Math.abs(dashboardData.analytics.remainingBudget)}
          change={5.7}
          icon={<Target />}
          type="budget"
          trend="up"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="charts-grid">
        <div className="chart-row">
          <DailySpendingChart data={dashboardData.dailySpending} />

          {/* Quick Access: placed right below the daily spending chart and spanning full width */}
          <div style={{ gridColumn: "1 / -1" }}>
            <QuickAccess />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              gridColumn: "1 / -1",
            }}
          >
            <SummaryOverview
              summary={{
                groupsCreated: 3,
                groupsMember: 5,
                pendingInvitations: 2,
                friendsCount: 12,
                pendingFriendRequests: 1,
              }}
            />
            <CategoryBreakdownChart data={dashboardData.categoryBreakdown} />
          </div>
        </div>

        <div className="chart-row">
          <MonthlyTrendChart data={dashboardData.chartData.monthlyTrend} />
          <PaymentMethodChart data={dashboardData.chartData.paymentMethods} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <RecentTransactions
          transactions={dashboardData.analytics.lastFiveExpenses}
        />
        <BudgetOverview
          remainingBudget={dashboardData.analytics.remainingBudget}
          totalLosses={dashboardData.analytics.totalLosses}
        />
      </div>
    </div>
  );
};

export default ExpenseDashboard;
