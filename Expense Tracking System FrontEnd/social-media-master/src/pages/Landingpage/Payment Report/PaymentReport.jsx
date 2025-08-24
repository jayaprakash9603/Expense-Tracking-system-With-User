import React, { useState, useMemo } from "react";
import { IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
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
  ComposedChart,
  ScatterChart,
  Scatter,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  Activity,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Smartphone,
  Building2,
} from "lucide-react";
import "./PaymentReport.css";

// Skeleton Components
const HeaderSkeleton = () => (
  <div className="payment-methods-header">
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
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton-table-header-cell"></div>
        ))}
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {[...Array(7)].map((_, j) => (
            <div key={j} className="skeleton-table-cell"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="payment-methods-report">
    <HeaderSkeleton />

    <div className="payment-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>

    <div className="charts-grid">
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>
      <div className="chart-row">
        <ChartSkeleton height={400} />
        <ChartSkeleton height={400} />
      </div>
      <div className="chart-row">
        <ChartSkeleton height={300} />
      </div>
      <div className="chart-row full-width">
        <TableSkeleton />
      </div>
    </div>
  </div>
);

// Sample Data for Payment Methods Reports
const SAMPLE_DATA = {
  paymentMethodsOverview: [
    {
      method: "Credit Card",
      totalAmount: 45620,
      percentage: 42.3,
      transactions: 156,
      avgPerTransaction: 292,
      icon: "💳",
      color: "#14b8a6",
      trend: 8.5,
    },
    {
      method: "Debit Card",
      totalAmount: 28450,
      percentage: 26.4,
      transactions: 98,
      avgPerTransaction: 290,
      icon: "💰",
      color: "#06d6a0",
      trend: -2.1,
    },
    {
      method: "Digital Wallet",
      totalAmount: 18920,
      percentage: 17.5,
      transactions: 142,
      avgPerTransaction: 133,
      icon: "📱",
      color: "#118ab2",
      trend: 15.2,
    },
    {
      method: "Cash",
      totalAmount: 8750,
      percentage: 8.1,
      transactions: 67,
      avgPerTransaction: 131,
      icon: "💵",
      color: "#ffd166",
      trend: -12.3,
    },
    {
      method: "Bank Transfer",
      totalAmount: 4200,
      percentage: 3.9,
      transactions: 12,
      avgPerTransaction: 350,
      icon: "🏦",
      color: "#f77f00",
      trend: 5.7,
    },
    {
      method: "Cryptocurrency",
      totalAmount: 1980,
      percentage: 1.8,
      transactions: 8,
      avgPerTransaction: 248,
      icon: "₿",
      color: "#e63946",
      trend: 22.4,
    },
  ],
  monthlyTrends: [
    {
      month: "Jan",
      "Credit Card": 38500,
      "Debit Card": 25200,
      "Digital Wallet": 15800,
      Cash: 9200,
      "Bank Transfer": 3800,
      Cryptocurrency: 1200,
    },
    {
      month: "Feb",
      "Credit Card": 41200,
      "Debit Card": 26800,
      "Digital Wallet": 16500,
      Cash: 8900,
      "Bank Transfer": 3900,
      Cryptocurrency: 1500,
    },
    {
      month: "Mar",
      "Credit Card": 43800,
      "Debit Card": 27900,
      "Digital Wallet": 17800,
      Cash: 8600,
      "Bank Transfer": 4100,
      Cryptocurrency: 1800,
    },
    {
      month: "Apr",
      "Credit Card": 45620,
      "Debit Card": 28450,
      "Digital Wallet": 18920,
      Cash: 8750,
      "Bank Transfer": 4200,
      Cryptocurrency: 1980,
    },
  ],
  dailyUsage: [
    {
      day: "Mon",
      "Credit Card": 6500,
      "Debit Card": 4200,
      "Digital Wallet": 2800,
      Cash: 1200,
    },
    {
      day: "Tue",
      "Credit Card": 7200,
      "Debit Card": 3800,
      "Digital Wallet": 3200,
      Cash: 1100,
    },
    {
      day: "Wed",
      "Credit Card": 6800,
      "Debit Card": 4500,
      "Digital Wallet": 2600,
      Cash: 1300,
    },
    {
      day: "Thu",
      "Credit Card": 7500,
      "Debit Card": 4100,
      "Digital Wallet": 3400,
      Cash: 1000,
    },
    {
      day: "Fri",
      "Credit Card": 8200,
      "Debit Card": 4800,
      "Digital Wallet": 3800,
      Cash: 1400,
    },
    {
      day: "Sat",
      "Credit Card": 5400,
      "Debit Card": 3200,
      "Digital Wallet": 2100,
      Cash: 1800,
    },
    {
      day: "Sun",
      "Credit Card": 4000,
      "Debit Card": 2900,
      "Digital Wallet": 1900,
      Cash: 1900,
    },
  ],
  transactionSizes: [
    {
      range: "₹0-100",
      "Credit Card": 45,
      "Debit Card": 38,
      "Digital Wallet": 89,
      Cash: 52,
    },
    {
      range: "₹100-500",
      "Credit Card": 67,
      "Debit Card": 42,
      "Digital Wallet": 38,
      Cash: 12,
    },
    {
      range: "₹500-1000",
      "Credit Card": 28,
      "Debit Card": 12,
      "Digital Wallet": 12,
      Cash: 3,
    },
    {
      range: "₹1000-5000",
      "Credit Card": 12,
      "Debit Card": 5,
      "Digital Wallet": 3,
      Cash: 0,
    },
    {
      range: "₹5000+",
      "Credit Card": 4,
      "Debit Card": 1,
      "Digital Wallet": 0,
      Cash: 0,
    },
  ],
  categoryBreakdown: [
    {
      category: "Food & Dining",
      "Credit Card": 12500,
      "Debit Card": 8200,
      "Digital Wallet": 6800,
      Cash: 3200,
    },
    {
      category: "Shopping",
      "Credit Card": 15200,
      "Debit Card": 6800,
      "Digital Wallet": 4200,
      Cash: 1800,
    },
    {
      category: "Transportation",
      "Credit Card": 8900,
      "Debit Card": 7200,
      "Digital Wallet": 4800,
      Cash: 2100,
    },
    {
      category: "Entertainment",
      "Credit Card": 6200,
      "Debit Card": 3800,
      "Digital Wallet": 2400,
      Cash: 1200,
    },
    {
      category: "Utilities",
      "Credit Card": 2800,
      "Debit Card": 2450,
      "Digital Wallet": 720,
      Cash: 450,
    },
  ],
  securityMetrics: [
    { method: "Credit Card", security: 95, convenience: 85, acceptance: 98 },
    { method: "Debit Card", security: 90, convenience: 88, acceptance: 95 },
    { method: "Digital Wallet", security: 88, convenience: 95, acceptance: 75 },
    { method: "Cash", security: 60, convenience: 70, acceptance: 100 },
    { method: "Bank Transfer", security: 98, convenience: 65, acceptance: 80 },
    { method: "Cryptocurrency", security: 85, convenience: 45, acceptance: 25 },
  ],
  merchantAcceptance: [
    {
      merchant: "Online Stores",
      "Credit Card": 98,
      "Debit Card": 95,
      "Digital Wallet": 85,
      Cash: 0,
    },
    {
      merchant: "Restaurants",
      "Credit Card": 95,
      "Debit Card": 90,
      "Digital Wallet": 70,
      Cash: 100,
    },
    {
      merchant: "Gas Stations",
      "Credit Card": 100,
      "Debit Card": 98,
      "Digital Wallet": 60,
      Cash: 95,
    },
    {
      merchant: "Grocery Stores",
      "Credit Card": 98,
      "Debit Card": 95,
      "Digital Wallet": 80,
      Cash: 100,
    },
    {
      merchant: "Entertainment",
      "Credit Card": 90,
      "Debit Card": 85,
      "Digital Wallet": 75,
      Cash: 80,
    },
  ],
};

const COLORS = [
  "#14b8a6",
  "#06d6a0",
  "#118ab2",
  "#ffd166",
  "#f77f00",
  "#e63946",
  "#073b4c",
  "#fcbf49",
  "#f95738",
  "#a8dadc",
  "#457b9d",
  "#1d3557",
];

// Header Component
const PaymentMethodsHeader = ({
  onFilter,
  onExport,
  onTimeframeChange,
  timeframe,
  onBack,
}) => (
  <div className="payment-methods-header">
    <div
      className="header-left"
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      <IconButton
        sx={{
          color: "#00DAC6",
          backgroundColor: "#1b1b1b",
          "&:hover": { backgroundColor: "#28282a" },
          zIndex: 10,
        }}
        onClick={onBack}
        aria-label="Back"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="#00DAC6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <div>
        <h1 style={{ margin: 0 }}>💳 Payment Methods Analytics</h1>
        <p style={{ margin: "6px 0 0 0" }}>
          Comprehensive analysis of payment method usage and trends
        </p>
      </div>
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

// Payment Methods Overview Cards
const PaymentOverviewCards = ({ data }) => {
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTransactions = data.reduce(
    (sum, item) => sum + item.transactions,
    0
  );
  const topMethod = data[0];
  const avgTransactionValue = totalAmount / totalTransactions;

  return (
    <div className="payment-overview-cards">
      <div className="overview-card primary">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Total Spending</h3>
          <div className="card-value">₹{totalAmount.toLocaleString()}</div>
          <div className="card-change positive">+15.2% vs last month</div>
        </div>
      </div>

      <div className="overview-card secondary">
        <div className="card-icon">🏆</div>
        <div className="card-content">
          <h3>Top Payment Method</h3>
          <div className="card-value">{topMethod.method}</div>
          <div className="card-change">
            ₹{topMethod.totalAmount.toLocaleString()} ({topMethod.percentage}%)
          </div>
        </div>
      </div>

      <div className="overview-card tertiary">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <h3>Avg Transaction</h3>
          <div className="card-value">₹{Math.round(avgTransactionValue)}</div>
          <div className="card-change negative">-3.1% vs last month</div>
        </div>
      </div>

      <div className="overview-card quaternary">
        <div className="card-icon">🔢</div>
        <div className="card-content">
          <h3>Total Transactions</h3>
          <div className="card-value">{totalTransactions}</div>
          <div className="card-change positive">+12.8% vs last month</div>
        </div>
      </div>
    </div>
  );
};

// Payment Methods Distribution Chart
const PaymentDistributionChart = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <PieChartIcon size={20} /> Payment Methods Distribution
      </h3>
      <div className="chart-subtitle">
        Spending breakdown by payment methods
      </div>
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
          dataKey="totalAmount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
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
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {entry.payload.icon} {value} ({entry.payload.percentage}%)
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Payment Methods Usage Analysis
const PaymentUsageChart = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <BarChart3 size={20} /> Payment Methods Usage Analysis
      </h3>
      <div className="chart-subtitle">
        Amount and transaction count by payment method
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis
          dataKey="method"
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
          dataKey="totalAmount"
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

// Monthly Payment Trends
const MonthlyPaymentTrends = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <Activity size={20} /> Monthly Payment Trends
      </h3>
      <div className="chart-subtitle">
        Payment method usage trends over time
      </div>
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
          dataKey="Credit Card"
          stackId="1"
          stroke={COLORS[0]}
          fill={COLORS[0]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Debit Card"
          stackId="1"
          stroke={COLORS[1]}
          fill={COLORS[1]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Digital Wallet"
          stackId="1"
          stroke={COLORS[2]}
          fill={COLORS[2]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Cash"
          stackId="1"
          stroke={COLORS[3]}
          fill={COLORS[3]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Bank Transfer"
          stackId="1"
          stroke={COLORS[4]}
          fill={COLORS[4]}
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="Cryptocurrency"
          stackId="1"
          stroke={COLORS[5]}
          fill={COLORS[5]}
          fillOpacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Transaction Size Distribution
const TransactionSizeChart = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>
        <Target size={20} /> Transaction Size Distribution
      </h3>
      <div className="chart-subtitle">
        Payment method usage by transaction amount ranges
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis dataKey="range" stroke="#888" fontSize={12} />
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
        <Bar dataKey="Credit Card" fill={COLORS[0]} name="Credit Card" />
        <Bar dataKey="Debit Card" fill={COLORS[1]} name="Debit Card" />
        <Bar dataKey="Digital Wallet" fill={COLORS[2]} name="Digital Wallet" />
        <Bar dataKey="Cash" fill={COLORS[3]} name="Cash" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Payment Security & Convenience Radar
const PaymentSecurityRadar = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>🔒 Payment Security & Convenience Analysis</h3>
      <div className="chart-subtitle">
        Multi-dimensional payment method comparison
      </div>
    </div>
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#2a2a2a" />
        <PolarAngleAxis
          dataKey="method"
          tick={{ fontSize: 12, fill: "#888" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#888" }}
        />
        <Radar
          name="Security"
          dataKey="security"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="Convenience"
          dataKey="convenience"
          stroke="#ff6b6b"
          fill="#ff6b6b"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="Acceptance"
          dataKey="acceptance"
          stroke="#ffd166"
          fill="#ffd166"
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

// Category-wise Payment Breakdown
const CategoryPaymentBreakdown = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>🏷️ Category-wise Payment Breakdown</h3>
      <div className="chart-subtitle">
        Payment method preferences by spending category
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
        <Bar dataKey="Credit Card" stackId="a" fill={COLORS[0]} />
        <Bar dataKey="Debit Card" stackId="a" fill={COLORS[1]} />
        <Bar dataKey="Digital Wallet" stackId="a" fill={COLORS[2]} />
        <Bar dataKey="Cash" stackId="a" fill={COLORS[3]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Daily Usage Patterns
const DailyUsagePatterns = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>📅 Daily Usage Patterns</h3>
      <div className="chart-subtitle">
        Payment method usage throughout the week
      </div>
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
          dataKey="Credit Card"
          stroke={COLORS[0]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Debit Card"
          stroke={COLORS[1]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Digital Wallet"
          stroke={COLORS[2]}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Cash"
          stroke={COLORS[3]}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Payment Methods Performance Table
const PaymentPerformanceTable = ({ data }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3>📋 Payment Methods Performance Summary</h3>
      <div className="chart-subtitle">
        Detailed metrics for each payment method
      </div>
    </div>
    <div className="performance-table">
      <table>
        <thead>
          <tr>
            <th>Payment Method</th>
            <th>Total Amount</th>
            <th>% of Total</th>
            <th>Transactions</th>
            <th>Avg/Transaction</th>
            <th>Trend</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="payment-method-cell">
                  <span className="method-icon">{item.icon}</span>
                  <div
                    className="method-color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  {item.method}
                </div>
              </td>
              <td>₹{item.totalAmount.toLocaleString()}</td>
              <td>{item.percentage}%</td>
              <td>{item.transactions}</td>
              <td>₹{item.avgPerTransaction}</td>
              <td>
                <div className={`trend ${item.trend > 0 ? "up" : "down"}`}>
                  {item.trend > 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {Math.abs(item.trend)}%
                </div>
              </td>
              <td>
                <span
                  className={`status ${
                    item.trend > 0 ? "active" : "declining"
                  }`}
                >
                  {item.trend > 0 ? "Growing" : "Declining"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Main Payment Methods Report Component
const PaymentMethodsReport = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { friendId } = useParams();

  const handleFilter = () => {
    console.log("Opening payment methods filters...");
  };

  const handleExport = () => {
    console.log("Exporting payment methods report...");
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/expenses");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="payment-methods-report">
      <PaymentMethodsHeader
        onFilter={handleFilter}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
      />

      <PaymentOverviewCards data={SAMPLE_DATA.paymentMethodsOverview} />

      <div className="charts-grid">
        {/* Row 1: Distribution and Usage Analysis */}
        <div className="chart-row">
          <PaymentDistributionChart data={SAMPLE_DATA.paymentMethodsOverview} />
          <PaymentUsageChart data={SAMPLE_DATA.paymentMethodsOverview} />
        </div>

        {/* Row 2: Trends and Transaction Sizes */}
        <div className="chart-row">
          <MonthlyPaymentTrends data={SAMPLE_DATA.monthlyTrends} />
          <TransactionSizeChart data={SAMPLE_DATA.transactionSizes} />
        </div>

        {/* Row 3: Security Analysis and Category Breakdown */}
        <div className="chart-row">
          <PaymentSecurityRadar data={SAMPLE_DATA.securityMetrics} />
          <CategoryPaymentBreakdown data={SAMPLE_DATA.categoryBreakdown} />
        </div>

        {/* Row 4: Daily Patterns */}
        <div className="chart-row">
          <DailyUsagePatterns data={SAMPLE_DATA.dailyUsage} />
        </div>

        {/* Row 5: Performance Table */}
        <div className="chart-row full-width">
          <PaymentPerformanceTable data={SAMPLE_DATA.paymentMethodsOverview} />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsReport;
