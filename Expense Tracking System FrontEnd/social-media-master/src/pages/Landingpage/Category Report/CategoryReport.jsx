import React, { useState, useMemo } from "react";
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Sankey,
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";
import "./CategoryReport.css";

// Skeleton Components
const HeaderSkeleton = () => (
  <div className="category-report-header">
    <div className="header-left">
      <div className="skeleton-title"></div>
      <div className="skeleton-subtitle"></div>
    </div>
    <div className="header-controls">
      <div className="skeleton-control"></div>
      <div className="skeleton-control"></div>
      <div className="skeleton-control"></div>
    </div>
  </div>
);

const OverviewCardSkeleton = () => (
  <div className="overview-card skeleton">
    <div className="skeleton-icon"></div>
    <div className="card-content">
      <div className="skeleton-card-title"></div>
      <div className="skeleton-card-value"></div>
      <div className="skeleton-card-change"></div>
    </div>
  </div>
);

const ChartSkeleton = ({ height = 400 }) => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title"></div>
      <div className="skeleton-chart-subtitle"></div>
    </div>
    <div className="skeleton-chart-body" style={{ height }}>
      <div className="skeleton-chart-content">
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
  </div>
);

const TableSkeleton = () => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title"></div>
      <div className="skeleton-chart-subtitle"></div>
    </div>
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-table-header-cell"></div>
        ))}
      </div>
      {[...Array(9)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="skeleton-table-cell"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="category-report">
    <HeaderSkeleton />

    <div className="category-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>

    <div className="charts-grid">
      {/* Row 1: Distribution and Spending Analysis */}
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>

      {/* Row 2: Trends and Budget Comparison */}
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>

      {/* Row 3: Efficiency and Subcategory Analysis */}
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>

      {/* Row 4: Daily Patterns */}
      <div className="chart-row">
        <ChartSkeleton height={300} />
      </div>

      {/* Row 5: Performance Table */}
      <div className="chart-row full-width">
        <TableSkeleton />
      </div>
    </div>
  </div>
);

// Sample Data for Category Reports
const SAMPLE_DATA = {
  categorySpending: [
    {
      name: "Food & Dining",
      amount: 15420,
      percentage: 28.5,
      transactions: 45,
      avgPerTransaction: 342,
    },
    {
      name: "Transportation",
      amount: 8750,
      percentage: 16.2,
      transactions: 32,
      avgPerTransaction: 273,
    },
    {
      name: "Shopping",
      amount: 7890,
      percentage: 14.6,
      transactions: 18,
      avgPerTransaction: 438,
    },
    {
      name: "Entertainment",
      amount: 6540,
      percentage: 12.1,
      transactions: 22,
      avgPerTransaction: 297,
    },
    {
      name: "Utilities",
      amount: 4320,
      percentage: 8.0,
      transactions: 8,
      avgPerTransaction: 540,
    },
    {
      name: "Healthcare",
      amount: 3850,
      percentage: 7.1,
      transactions: 6,
      avgPerTransaction: 642,
    },
    {
      name: "Education",
      amount: 2900,
      percentage: 5.4,
      transactions: 4,
      avgPerTransaction: 725,
    },
    {
      name: "Investment",
      amount: 2100,
      percentage: 3.9,
      transactions: 3,
      avgPerTransaction: 700,
    },
    {
      name: "Others",
      amount: 2230,
      percentage: 4.1,
      transactions: 12,
      avgPerTransaction: 186,
    },
  ],
  monthlyTrends: [
    {
      month: "Jan",
      "Food & Dining": 12500,
      Transportation: 7200,
      Shopping: 5400,
      Entertainment: 4800,
      Utilities: 4200,
    },
    {
      month: "Feb",
      "Food & Dining": 13200,
      Transportation: 6800,
      Shopping: 6200,
      Entertainment: 5200,
      Utilities: 4100,
    },
    {
      month: "Mar",
      "Food & Dining": 14800,
      Transportation: 8200,
      Shopping: 7800,
      Entertainment: 6100,
      Utilities: 4300,
    },
    {
      month: "Apr",
      "Food & Dining": 15420,
      Transportation: 8750,
      Shopping: 7890,
      Entertainment: 6540,
      Utilities: 4320,
    },
  ],
  dailySpending: [
    {
      day: 1,
      "Food & Dining": 450,
      Transportation: 120,
      Shopping: 0,
      Entertainment: 200,
    },
    {
      day: 2,
      "Food & Dining": 320,
      Transportation: 250,
      Shopping: 1200,
      Entertainment: 0,
    },
    {
      day: 3,
      "Food & Dining": 680,
      Transportation: 180,
      Shopping: 0,
      Entertainment: 350,
    },
    {
      day: 4,
      "Food & Dining": 520,
      Transportation: 300,
      Shopping: 800,
      Entertainment: 150,
    },
    {
      day: 5,
      "Food & Dining": 750,
      Transportation: 200,
      Shopping: 0,
      Entertainment: 400,
    },
    {
      day: 6,
      "Food & Dining": 890,
      Transportation: 150,
      Shopping: 2100,
      Entertainment: 600,
    },
    {
      day: 7,
      "Food & Dining": 420,
      Transportation: 280,
      Shopping: 0,
      Entertainment: 250,
    },
  ],
  categoryComparison: [
    {
      category: "Food & Dining",
      thisMonth: 15420,
      lastMonth: 14800,
      budget: 16000,
      variance: 4.2,
    },
    {
      category: "Transportation",
      thisMonth: 8750,
      lastMonth: 8200,
      budget: 9000,
      variance: 6.7,
    },
    {
      category: "Shopping",
      thisMonth: 7890,
      lastMonth: 7800,
      budget: 8500,
      variance: 1.2,
    },
    {
      category: "Entertainment",
      thisMonth: 6540,
      lastMonth: 6100,
      budget: 7000,
      variance: 7.2,
    },
    {
      category: "Utilities",
      thisMonth: 4320,
      lastMonth: 4300,
      budget: 4500,
      variance: -0.5,
    },
  ],
  subcategoryBreakdown: [
    {
      category: "Food & Dining",
      subcategory: "Restaurants",
      amount: 8420,
      percentage: 54.6,
    },
    {
      category: "Food & Dining",
      subcategory: "Groceries",
      amount: 4200,
      percentage: 27.2,
    },
    {
      category: "Food & Dining",
      subcategory: "Coffee & Snacks",
      amount: 2800,
      percentage: 18.2,
    },
    {
      category: "Transportation",
      subcategory: "Fuel",
      amount: 4200,
      percentage: 48.0,
    },
    {
      category: "Transportation",
      subcategory: "Public Transport",
      amount: 2850,
      percentage: 32.6,
    },
    {
      category: "Transportation",
      subcategory: "Taxi/Uber",
      amount: 1700,
      percentage: 19.4,
    },
    {
      category: "Shopping",
      subcategory: "Clothing",
      amount: 4200,
      percentage: 53.2,
    },
    {
      category: "Shopping",
      subcategory: "Electronics",
      amount: 2890,
      percentage: 36.6,
    },
    {
      category: "Shopping",
      subcategory: "Home & Garden",
      amount: 800,
      percentage: 10.1,
    },
  ],
  categoryEfficiency: [
    {
      category: "Food & Dining",
      efficiency: 75,
      budgetUtilization: 96.4,
      avgTransactionSize: 342,
    },
    {
      category: "Transportation",
      efficiency: 85,
      budgetUtilization: 97.2,
      avgTransactionSize: 273,
    },
    {
      category: "Shopping",
      efficiency: 65,
      budgetUtilization: 92.8,
      avgTransactionSize: 438,
    },
    {
      category: "Entertainment",
      efficiency: 70,
      budgetUtilization: 93.4,
      avgTransactionSize: 297,
    },
    {
      category: "Utilities",
      efficiency: 95,
      budgetUtilization: 96.0,
      avgTransactionSize: 540,
    },
  ],
};

const COLORS = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#073b4c",
  "#ffd166",
  "#f77f00",
  "#fcbf49",
  "#f95738",
  "#e63946",
  "#a8dadc",
];

// Header Component
const CategoryReportHeader = ({
  onFilter,
  onExport,
  onTimeframeChange,
  timeframe,
}) => (
  <div className="category-report-header">
    <div className="header-left">
      <h1>📊 Category Analytics</h1>
      <p>Comprehensive spending analysis by categories</p>
    </div>
    <div className="header-controls">
      <select
        value={timeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
        className="timeframe-selector"
      >
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
        <option value="year">This Year</option>
      </select>
      <button onClick={onFilter} className="control-btn">
        <Filter size={16} />
        Filter
      </button>
      <button onClick={onExport} className="control-btn">
        <Download size={16} />
        Export
      </button>
    </div>
  </div>
);

// Category Overview Cards
const CategoryOverviewCards = ({ data }) => {
  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);
  const topCategory = data[0];
  const avgTransaction =
    data.reduce((sum, item) => sum + item.avgPerTransaction, 0) / data.length;
  const totalTransactions = data.reduce(
    (sum, item) => sum + item.transactions,
    0
  );

  return (
    <div className="category-overview-cards">
      <div className="overview-card primary">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Total Spending</h3>
          <div className="card-value">₹{totalSpending.toLocaleString()}</div>
          <div className="card-change positive">+12.5% vs last month</div>
        </div>
      </div>

      <div className="overview-card secondary">
        <div className="card-icon">🏆</div>
        <div className="card-content">
          <h3>Top Category</h3>
          <div className="card-value">{topCategory.name}</div>
          <div className="card-change">
            ₹{topCategory.amount.toLocaleString()} ({topCategory.percentage}%)
          </div>
        </div>
      </div>

      <div className="overview-card tertiary">
        <div className="card-icon">📈</div>
        <div className="card-content">
          <h3>Avg Transaction</h3>
          <div className="card-value">₹{Math.round(avgTransaction)}</div>
          <div className="card-change negative">-5.2% vs last month</div>
        </div>
      </div>

      <div className="overview-card quaternary">
        <div className="card-icon">🔢</div>
        <div className="card-content">
          <h3>Total Transactions</h3>
          <div className="card-value">{totalTransactions}</div>
          <div className="card-change positive">+8.7% vs last month</div>
        </div>
      </div>
    </div>
  );
};

// Category Distribution Pie Chart
const CategoryDistributionChart = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <PieChartIcon size={20} /> Category Distribution
      </h3>
      <div className="chart-subtitle">Spending breakdown by categories</div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          paddingAngle={2}
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) =>
            `${value} (${entry.payload.percentage}%)`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Category Spending Bar Chart
const CategorySpendingChart = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <BarChart3 size={20} /> Category Spending Analysis
      </h3>
      <div className="chart-subtitle">
        Amount spent per category with transaction count
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis
          dataKey="name"
          stroke="#888"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis yAxisId="left" stroke="#888" fontSize={12} />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="amount"
          fill="#14b8a6"
          name="Amount (₹)"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="transactions"
          stroke="#ff6b6b"
          name="Transactions"
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

// Monthly Category Trends
const MonthlyCategoryTrends = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <Activity size={20} /> Monthly Category Trends
      </h3>
      <div className="chart-subtitle">Category spending trends over time</div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis dataKey="month" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="Food & Dining"
          stackId="1"
          stroke={COLORS[0]}
          fill={COLORS[0]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Transportation"
          stackId="1"
          stroke={COLORS[1]}
          fill={COLORS[1]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Shopping"
          stackId="1"
          stroke={COLORS[2]}
          fill={COLORS[2]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Entertainment"
          stackId="1"
          stroke={COLORS[3]}
          fill={COLORS[3]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Utilities"
          stackId="1"
          stroke={COLORS[4]}
          fill={COLORS[4]}
          fillOpacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Category vs Budget Comparison
const CategoryBudgetComparison = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <Target size={20} /> Budget vs Actual Spending
      </h3>
      <div className="chart-subtitle">
        Compare actual spending against budgets
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis
          dataKey="category"
          stroke="#888"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend />
        <Bar
          dataKey="budget"
          fill="#4a5568"
          name="Budget"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="thisMonth"
          fill="#14b8a6"
          name="Actual Spending"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="lastMonth"
          fill="#06d6a0"
          name="Last Month"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Category Efficiency Radar Chart
const CategoryEfficiencyRadar = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>🎯 Category Efficiency Analysis</h3>
      <div className="chart-subtitle">
        Multi-dimensional category performance
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#2a2a2a" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 12, fill: "#888" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#888" }}
        />
        <Radar
          name="Efficiency"
          dataKey="efficiency"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="Budget Utilization"
          dataKey="budgetUtilization"
          stroke="#ff6b6b"
          fill="#ff6b6b"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// Subcategory Breakdown TreeMap
const SubcategoryTreeMap = ({ data }) => {
  const treeMapData = data.map((item, index) => ({
    ...item,
    size: item.amount,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>🌳 Subcategory Breakdown</h3>
        <div className="chart-subtitle">
          Hierarchical view of spending by subcategories
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treeMapData}
          dataKey="size"
          ratio={4 / 3}
          stroke="#1a1a1a"
          strokeWidth={2}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #14b8a6",
                      borderRadius: "8px",
                      color: "#fff",
                      padding: "8px",
                    }}
                  >
                    <p>{`${data.category} - ${data.subcategory}`}</p>
                    <p>{`Amount: ₹${data.amount.toLocaleString()}`}</p>
                    <p>{`Percentage: ${data.percentage}%`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

// Category Performance Table
const CategoryPerformanceTable = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>📋 Category Performance Summary</h3>
      <div className="chart-subtitle">Detailed metrics for each category</div>
    </div>
    <div className="performance-table">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>% of Total</th>
            <th>Transactions</th>
            <th>Avg/Transaction</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="category-cell">
                  <div
                    className="category-color"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {item.name}
                </div>
              </td>
              <td>₹{item.amount.toLocaleString()}</td>
              <td>{item.percentage}%</td>
              <td>{item.transactions}</td>
              <td>₹{item.avgPerTransaction}</td>
              <td>
                <div
                  className={`trend ${item.percentage > 15 ? "up" : "down"}`}
                >
                  {item.percentage > 15 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Daily Category Spending Heatmap
const DailyCategoryHeatmap = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>🔥 Daily Category Spending</h3>
      <div className="chart-subtitle">Daily spending patterns by category</div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis dataKey="day" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #14b8a6",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Food & Dining"
          stroke={COLORS[0]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Transportation"
          stroke={COLORS[1]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Shopping"
          stroke={COLORS[2]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Entertainment"
          stroke={COLORS[3]}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Main Category Report Component
const CategoryReport = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(false);

  const handleFilter = () => {
    console.log("Opening category filters...");
  };

  const handleExport = () => {
    console.log("Exporting category report...");
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 2000);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="category-report">
      <CategoryReportHeader
        onFilter={handleFilter}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
      />

      <CategoryOverviewCards data={SAMPLE_DATA.categorySpending} />

      <div className="charts-grid">
        {/* Row 1: Distribution and Spending Analysis */}
        <div className="chart-row">
          <CategoryDistributionChart data={SAMPLE_DATA.categorySpending} />
          <CategorySpendingChart data={SAMPLE_DATA.categorySpending} />
        </div>

        {/* Row 2: Trends and Budget Comparison */}
        <div className="chart-row">
          <MonthlyCategoryTrends data={SAMPLE_DATA.monthlyTrends} />
          <CategoryBudgetComparison data={SAMPLE_DATA.categoryComparison} />
        </div>

        {/* Row 3: Efficiency and Subcategory Analysis */}
        <div className="chart-row">
          <CategoryEfficiencyRadar data={SAMPLE_DATA.categoryEfficiency} />
          <SubcategoryTreeMap data={SAMPLE_DATA.subcategoryBreakdown} />
        </div>

        {/* Row 4: Daily Patterns and Performance Table */}
        <div className="chart-row">
          <DailyCategoryHeatmap data={SAMPLE_DATA.dailySpending} />
        </div>

        {/* Row 5: Full Width Performance Table */}
        <div className="chart-row full-width">
          <CategoryPerformanceTable data={SAMPLE_DATA.categorySpending} />
        </div>
      </div>
    </div>
  );
};

export default CategoryReport;
