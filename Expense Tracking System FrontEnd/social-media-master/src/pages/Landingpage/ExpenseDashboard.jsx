import React, { useState, useMemo, useEffect } from "react";
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
  ComposedChart,
} from "recharts";
import { IconButton, useMediaQuery } from "@mui/material";
import "./ExpenseDashboard.css";
import {
  CreditCard,
  Download,
  Filter,
  MoreVert,
  Refresh,
  TrendingDown,
  TrendingUp,
  TrendingFlat,
  Wallet,
  CurrencyExchange,
} from "@mui/icons-material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Target } from "lucide-react";
import QuickAccess from "./QuickAccess";
import fetchDailySpending, {
  fetchExpenseSummary,
  fetchMonthlyExpenses,
  fetchPaymentMethods,
  fetchCategoriesSummary,
} from "../../utils/Api";
import { api } from "../../config/api";

// Add zero-decimal formatter
const formatNumber0 = (v) =>
  Number(v ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

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

const ChartSkeleton = ({ height = 300, variant = "bar" }) => (
  <div className="chart-skeleton" style={{ height }}>
    <div className="skeleton-chart-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-actions"></div>
    </div>
    <div className="skeleton-chart-body">
      {variant === "line" ? (
        <div className="skeleton-line-body">
          <svg
            className="skeleton-line-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="skGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
            </defs>
            <path
              className="skeleton-area-fill"
              d="M0,70 L10,65 L20,72 L30,50 L40,58 L50,42 L60,52 L70,38 L80,46 L90,35 L100,40 L100,100 L0,100 Z"
              fill="rgba(255,255,255,0.06)"
            />
            <polyline
              className="skeleton-line-path"
              points="0,70 10,65 20,72 30,50 40,58 50,42 60,52 70,38 80,46 90,35 100,40"
              stroke="url(#skGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : variant === "pie" ? (
        <div className="skeleton-pie-wrap">
          <svg
            className="skeleton-pie-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="skGradPie" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="32"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="18"
              fill="none"
            />
            <circle
              className="skeleton-pie-ring"
              cx="50"
              cy="50"
              r="32"
              stroke="url(#skGradPie)"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="157 50"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      ) : (
        <div className="skeleton-bars">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton-bar"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            ></div>
          ))}
        </div>
      )}
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
const MetricCard = ({
  title,
  value,
  change,
  changeText,
  changeDirection,
  icon,
  type,
  trend,
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return `₹${formatNumber0(val)}`;
    }
    return val;
  };

  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <div className={`trend-indicator ${trend}`}>
          {trend === "up" ? (
            <TrendingUp />
          ) : trend === "down" ? (
            <TrendingDown />
          ) : (
            <TrendingFlat />
          )}
        </div>
      </div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{formatValue(value)}</div>
        {changeText ? (
          <div className={`metric-change ${changeDirection || "neutral"}`}>
            {changeText}
          </div>
        ) : typeof change === "number" ? (
          <div
            className={`metric-change ${change > 0 ? "positive" : "negative"}`}
          >
            {change > 0 ? "+" : ""}
            {change}% from last month
          </div>
        ) : null}
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
const DailySpendingChart = ({
  data,
  timeframe,
  onTimeframeChange,
  selectedType,
  onTypeToggle,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const chartHeight = isMobile ? 220 : isTablet ? 260 : 300;
  const hideXAxis = timeframe === "last_3_months" || isMobile;
  // Protect against non-array `data` (e.g. a Promise or object) which causes
  // "data.map is not a function". Use an empty array fallback.
  const safeData = Array.isArray(data) ? data : [];
  // selectedType: 'loss' | 'gain' (default to 'loss' if not provided)
  const selType = selectedType || "loss";
  // filter by type when provided (backend should also accept a 'type' param)
  const filteredData = selType
    ? safeData.filter((item) => item.type === selType || !item.type)
    : safeData;
  const chartData = filteredData.map((item) => ({
    day: item.day ? new Date(item.day).getDate() : "",
    spending: item.spending ?? 0,
    date: item.day,
    type: item.type,
  }));

  // Color selection: red for loss, teal/green for gain
  const color = selType === "gain" ? "#14b8a6" : "#ff5252";
  const gradId = `spendingGradient-${selType}`;

  return (
    <div className="chart-container daily-spending-chart">
      <div className="chart-header">
        <h3>📊 Daily Spending Pattern</h3>
        <div className="chart-controls">
          <select
            className="time-selector"
            value={timeframe}
            onChange={(e) =>
              onTimeframeChange && onTimeframeChange(e.target.value)
            }
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
          {/* segmented toggle: Loss / Gain */}
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn loss ${
                selType === "loss" ? "active" : ""
              }`}
              onClick={() => onTypeToggle && onTypeToggle("loss")}
              aria-pressed={selType === "loss"}
            >
              Loss
            </button>
            <button
              type="button"
              className={`toggle-btn gain ${
                selType === "gain" ? "active" : ""
              }`}
              onClick={() => onTypeToggle && onTypeToggle("gain")}
              aria-pressed={selType === "gain"}
            >
              Gain
            </button>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="day"
            stroke="#888"
            fontSize={12}
            tickLine={false}
            // hide x-axis labels when showing last 3 months (we'll show date in tooltip)
            hide={hideXAxis}
          />
          <YAxis
            stroke="#888"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
          />
          {/* Custom tooltip shows Month Day and formatted amount */}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0];
              const rawDate = p.payload.date || p.payload.day || "";
              let label = "";
              if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d)) {
                  label = d.toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                  });
                } else {
                  // fallback to numeric day
                  label = `Day ${p.payload.day}`;
                }
              }

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
                  <div style={{ fontSize: 12, color: "#cfd8dc" }}>{label}</div>
                  <div style={{ fontWeight: 700, color: "#14b8a6" }}>
                    ₹{formatNumber0(p.value)}
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke={color}
            fillOpacity={0.3}
            fill={`url(#${gradId})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Category Breakdown (accepts array or API object shape)
const CategoryBreakdownChart = ({
  data,
  timeframe,
  onTimeframeChange,
  flowType,
  onFlowTypeChange,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  // Smaller footprint on small screens
  const chartHeight = isMobile ? 260 : isTablet ? 380 : 480;
  // Responsive pie radii
  const pieInner = isMobile ? 60 : isTablet ? 80 : 100;
  const pieOuter = isMobile ? 110 : isTablet ? 150 : 180;
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

  // Normalize input: supports
  // - Array: [{ name, value }, ...]
  // - Object: { summary: { totalAmount, categoryTotals: {Name: amount, ...} }, ... }
  let normalized = Array.isArray(data) ? data : [];
  let totalAmount = 0;
  if (!Array.isArray(data) && data && typeof data === "object") {
    const totals = data.summary?.categoryTotals ?? {};
    normalized = Object.keys(totals).map((name) => ({
      name,
      value: Number(totals[name] ?? 0),
    }));
    totalAmount = Number(data.summary?.totalAmount ?? 0);
  } else if (Array.isArray(data)) {
    totalAmount = data.reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0
    );
  }

  return (
    <div className="chart-container category-breakdown">
      <div className="chart-header">
        <h3>🏷️ Category Breakdown</h3>
        <div className="chart-controls">
          <select
            className="time-selector"
            value={timeframe}
            onChange={(e) =>
              onTimeframeChange && onTimeframeChange(e.target.value)
            }
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn loss ${
                flowType === "loss" ? "active" : ""
              }`}
              onClick={() => onFlowTypeChange && onFlowTypeChange("loss")}
              aria-pressed={flowType === "loss"}
            >
              Loss
            </button>
            <button
              type="button"
              className={`toggle-btn gain ${
                flowType === "gain" ? "active" : ""
              }`}
              onClick={() => onFlowTypeChange && onFlowTypeChange("gain")}
              aria-pressed={flowType === "gain"}
            >
              Gain
            </button>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={normalized}
            cx="50%"
            cy="50%"
            innerRadius={pieInner}
            outerRadius={pieOuter}
            paddingAngle={2}
            dataKey="value"
          >
            {normalized.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
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
                    ₹{formatNumber0(value)}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              color: "#fff",
              fontSize: isMobile ? "10px" : "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="total-amount total-amount-bottom">
        Total: ₹{formatNumber0(totalAmount)}
      </div>
    </div>
  );
};

// Enhanced Summary / Overview Card (metrics + mini sparkline)
const SummaryOverview = ({ summary }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
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
                ₹{formatNumber0(s.totalExpenses)}
              </div>
            </div>
          </div>

          <div className="overview-metric">
            <div className="metric-icon">🏦</div>
            <div className="metric-body">
              <div className="metric-title">Credit Due</div>
              <div className="metric-value">
                ₹{formatNumber0(Math.abs(s.creditDue))}
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
          <ResponsiveContainer width="100%" height={isMobile ? 90 : 120}>
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
                formatter={(value) => [`₹${formatNumber0(value)}`, "Spending"]}
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
            <div className="kpi-value">₹{formatNumber0(s.averageDaily)}</div>
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
                      ₹{formatNumber0(e.amount)}
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
const MonthlyTrendChart = ({ data, year, onPrevYear, onNextYear }) => {
  const currentYear = new Date().getFullYear();
  const isAtCurrentYear = year >= currentYear;
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  // Increase height to align with Payment Methods/Category charts
  const chartHeight = isMobile ? 260 : isTablet ? 380 : 480;
  return (
    <div className="chart-container monthly-trend">
      <div className="chart-header">
        <h3>📈 Monthly Expense Trend</h3>
        <div className="trend-stats">
          <span className="trend-up">↗ 12% vs last year</span>
        </div>
      </div>
      <div className="chart-nav-bar">
        <IconButton
          className="nav-btn nav-left"
          size="small"
          onClick={onPrevYear}
          aria-label="Previous year"
          title="Go to previous year"
        >
          <ChevronLeft />
        </IconButton>
        <span
          className={`year-chip ${isAtCurrentYear ? "current" : ""}`}
          title={isAtCurrentYear ? "Current year" : undefined}
        >
          {year}
        </span>
        <IconButton
          className={`nav-btn nav-right ${
            isAtCurrentYear ? "is-disabled" : ""
          }`}
          size="small"
          onClick={onNextYear}
          disabled={isAtCurrentYear}
          aria-label="Next year"
          title={
            isAtCurrentYear
              ? "You're viewing the current year"
              : "Go to next year"
          }
        >
          <ChevronRight />
        </IconButton>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        {(() => {
          const labels = Array.isArray(data?.labels) ? data.labels : [];
          const series = Array.isArray(data?.datasets?.[0]?.data)
            ? data.datasets[0].data
            : [];
          const presentValues = series.filter(
            (v) => Number.isFinite(v) && v > 0
          );
          const finiteValues = series.filter((v) => Number.isFinite(v));
          const base = presentValues.length ? presentValues : finiteValues;
          const avgValue = base.length
            ? base.reduce((a, b) => a + b, 0) / base.length
            : 0;
          const chartRows = series.map((value, index) => ({
            month: labels[index] ?? `M${index + 1}`,
            expenses: value,
            average: avgValue,
          }));
          return (
            <ComposedChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1b1b",
                  border: "1px solid #14b8a6",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => [`₹${formatNumber0(value)}`, name]}
              />
              <Bar dataKey="expenses" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#ffcc00"
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          );
        })()}
      </ResponsiveContainer>
    </div>
  );
};

// Payment Method Distribution (Pie chart, not donut)
const PaymentMethodChart = ({
  data,
  timeframe,
  onTimeframeChange,
  flowType,
  onFlowTypeChange,
}) => {
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
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  // Match Category Breakdown sizing for visual parity
  const chartHeight = isMobile ? 260 : isTablet ? 380 : 480;
  const outerRadius = isMobile ? 110 : isTablet ? 150 : 180;

  // compute total for display
  const totalAmount = (() => {
    const series = Array.isArray(data?.datasets?.[0]?.data)
      ? data.datasets[0].data
      : [];
    return series.reduce((a, b) => a + (Number(b) || 0), 0);
  })();

  return (
    <div className="chart-container payment-methods">
      <div className="chart-header">
        <h3>💳 Payment Methods</h3>
        <div className="chart-controls">
          <select
            className="time-selector"
            value={timeframe}
            onChange={(e) =>
              onTimeframeChange && onTimeframeChange(e.target.value)
            }
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn loss ${
                flowType === "loss" ? "active" : ""
              }`}
              onClick={() => onFlowTypeChange && onFlowTypeChange("loss")}
              aria-pressed={flowType === "loss"}
            >
              Loss
            </button>
            <button
              type="button"
              className={`toggle-btn gain ${
                flowType === "gain" ? "active" : ""
              }`}
              onClick={() => onFlowTypeChange && onFlowTypeChange("gain")}
              aria-pressed={flowType === "gain"}
            >
              Gain
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        {(() => {
          const labels = Array.isArray(data?.labels) ? data.labels : [];
          const series = Array.isArray(data?.datasets?.[0]?.data)
            ? data.datasets[0].data
            : [];
          const pieData = series.map((value, index) => ({
            name: labels[index] ?? `Item ${index + 1}`,
            value: Number(value) || 0,
          }));
          return (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
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
                      <div style={{ fontSize: 12, color: "#cfd8dc" }}>
                        {name}
                      </div>
                      <div style={{ fontWeight: 700, color: "#14b8a6" }}>
                        ₹{formatNumber0(value)}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  color: "#fff",
                  fontSize: isMobile ? "10px" : "12px",
                }}
              />
            </PieChart>
          );
        })()}
      </ResponsiveContainer>
      <div className="total-amount total-amount-bottom">
        Total: ₹{formatNumber0(totalAmount)}
      </div>
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
      {(Array.isArray(transactions) ? transactions.slice(0, 10) : []).map(
        (transaction, index) => (
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
              {formatNumber0(Math.abs(transaction.expense.amount))}
            </div>
          </div>
        )
      )}
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
            ₹{formatNumber0(Math.abs(remainingBudget))}
          </span>
        </div>
        <div className="budget-item">
          <span>Total Spent</span>
          <span>₹{formatNumber0(totalLosses)}</span>
        </div>
      </div>
    </div>
  );
};

// Non-visual component to refetch all dashboard data on demand
const DashboardDataRefetcher = ({
  trigger,
  timeframe,
  // removed selectedType to avoid global refetch on daily type toggle
  categoryTimeframe,
  categoryFlowType,
  trendYear,
  paymentMethodsTimeframe,
  paymentMethodsFlowType,
  // loading setters
  setDailyLoading,
  setCategoryLoading,
  setMetricsLoading,
  setMonthlyTrendLoading,
  setPaymentMethodsLoading,
  // data setters
  setDailySpendingData,
  setCategoryDistribution,
  setAnalyticsSummary,
  setMonthlyTrendData,
  setPaymentMethodsData,
}) => {
  useEffect(() => {
    if (!trigger) return;

    // Helper format
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    // Daily Spending
    (async () => {
      setDailyLoading(true);
      try {
        const now = new Date();
        const params = {};
        if (timeframe === "this_month" || timeframe === "month") {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeframe === "last_month") {
          const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          params.month = d.getMonth() + 1;
          params.year = d.getFullYear();
        } else if (timeframe === "last_3_months" || timeframe === "last_3") {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = start.toISOString().split("T")[0];
          params.toDate = end.toISOString().split("T")[0];
        }
  // daily type filtering handled by dedicated hook in main component
        const res = await fetchDailySpending(params);
        setDailySpendingData(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Refresh: daily spending failed", e);
        setDailySpendingData([]);
      } finally {
        setDailyLoading(false);
      }
    })();

    // Categories
    (async () => {
      setCategoryLoading(true);
      try {
        const now = new Date();
        const params = {};
        if (
          categoryTimeframe === "this_month" ||
          categoryTimeframe === "month"
        ) {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = now;
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (categoryTimeframe === "last_month") {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (
          categoryTimeframe === "last_3_months" ||
          categoryTimeframe === "last_3"
        ) {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        }
        if (categoryFlowType === "gain") {
          params.flowType = "inflow";
          params.type = "gain";
        } else {
          params.flowType = "outflow";
          params.type = "loss";
        }
        let res = await fetchCategoriesSummary(params);
        if (!res || !res.summary || !res.summary.categoryTotals) {
          res = await fetchExpenseSummary(params);
        }
        if (res && res.summary && res.summary.categoryTotals) {
          setCategoryDistribution(res);
        } else if (Array.isArray(res)) {
          setCategoryDistribution(res);
        } else {
          setCategoryDistribution([]);
        }
      } catch (e) {
        console.error("Refresh: categories failed", e);
        setCategoryDistribution([]);
      } finally {
        setCategoryLoading(false);
      }
    })();

    // Analytics Summary
    (async () => {
      setMetricsLoading(true);
      try {
        const now = new Date();
        const params = {};
        if (timeframe === "this_month" || timeframe === "month") {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeframe === "last_month") {
          const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          params.month = d.getMonth() + 1;
          params.year = d.getFullYear();
        } else if (timeframe === "last_3_months" || timeframe === "last_3") {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = start.toISOString().split("T")[0];
          params.toDate = end.toISOString().split("T")[0];
        }
  // omit type so summary isn't refetched on daily gain/loss toggle
        const res = await fetchExpenseSummary(params);
        setAnalyticsSummary(res && typeof res === "object" ? res : null);
      } catch (e) {
        console.error("Refresh: summary failed", e);
      } finally {
        setMetricsLoading(false);
      }
    })();

    // Monthly Trend
    (async () => {
      setMonthlyTrendLoading(true);
      try {
        const params = { year: trendYear };
  // omit type to decouple monthly trend from daily toggle
        const res = await fetchMonthlyExpenses(params);
        const MONTHS = [
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
        ];
        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const values = new Array(12).fill(0);
          res.forEach((item) => {
            const label = (item.label ?? item.name ?? "").toString();
            let idx = -1;
            const mNum = Number(
              item.month ?? item.monthNumber ?? item.m ?? item.index
            );
            if (!Number.isNaN(mNum)) {
              idx = Math.min(11, Math.max(0, mNum - 1));
            } else if (label) {
              const short = label.slice(0, 3).toLowerCase();
              idx = MONTHS.findIndex((m) => m.toLowerCase() === short);
              if (idx === -1)
                idx = MONTHS.findIndex((m) =>
                  m.toLowerCase().startsWith(short)
                );
            }
            if (idx >= 0 && idx < 12) {
              const v = Number(
                item.amount ??
                  item.total ??
                  item.value ??
                  item.expenses ??
                  item.sum ??
                  0
              );
              values[idx] = Number.isFinite(v) ? v : 0;
            }
          });
          normalized = { labels: MONTHS, datasets: [{ data: values }] };
        }
        setMonthlyTrendData(normalized || null);
      } catch (e) {
        console.error("Refresh: monthly trend failed", e);
        setMonthlyTrendData(null);
      } finally {
        setMonthlyTrendLoading(false);
      }
    })();

    // Payment Methods
    (async () => {
      setPaymentMethodsLoading(true);
      try {
        const now = new Date();
        const fmt = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };
        const params = {};
        // timeframe specific for payment methods
        if (
          paymentMethodsTimeframe === "this_month" ||
          paymentMethodsTimeframe === "month"
        ) {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = now;
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (paymentMethodsTimeframe === "last_month") {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (
          paymentMethodsTimeframe === "last_3_months" ||
          paymentMethodsTimeframe === "last_3"
        ) {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        }
        // flow type mapping for payment methods
        if (paymentMethodsFlowType === "gain") {
          params.flowType = "inflow";
          params.type = "gain";
        } else {
          params.flowType = "outflow";
          params.type = "loss";
        }
        const res = await fetchPaymentMethods(params);
        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const labels = [];
          const values = [];
          res.forEach((item) => {
            const label = (
              item.label ??
              item.name ??
              item.method ??
              ""
            ).toString();
            const value = Number(
              item.amount ?? item.total ?? item.value ?? item.count ?? 0
            );
            if (label) {
              labels.push(label);
              values.push(Number.isFinite(value) ? value : 0);
            }
          });
          if (labels.length)
            normalized = { labels, datasets: [{ data: values }] };
        } else if (res && typeof res === "object") {
          const labels = Object.keys(res);
          const values = labels.map((k) => Number(res[k] ?? 0));
          if (labels.length)
            normalized = { labels, datasets: [{ data: values }] };
        }
        setPaymentMethodsData(normalized || null);
      } catch (e) {
        console.error("Refresh: payment methods failed", e);
        setPaymentMethodsData(null);
      } finally {
        setPaymentMethodsLoading(false);
      }
    })();
  }, [trigger]);

  return null;
};

// Main Dashboard Component
const ExpenseDashboard = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // granular loading flags for skeletons during fetch
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [monthlyTrendLoading, setMonthlyTrendLoading] = useState(true);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsTimeframe, setPaymentMethodsTimeframe] =
    useState("this_month");
  const [paymentMethodsFlowType, setPaymentMethodsFlowType] = useState("loss");
  const [timeframe, setTimeframe] = useState("this_month"); // daily spending timeframe
  const [categoryTimeframe, setCategoryTimeframe] = useState("this_month"); // category breakdown timeframe
  const [categoryFlowType, setCategoryFlowType] = useState("loss"); // category breakdown gain/loss
  // Separate type state for daily spending to avoid triggering other API calls
  const [dailyType, setDailyType] = useState("loss");
  // hold fetched daily spending; initialize with sample so chart shows something
  const [dailySpendingData, setDailySpendingData] = useState(
    // dashboardData is declared below; for now we'll set to an empty array and
    // populate after dashboardData is created in this scope
    []
  );

  const [monthlyTrendData, setMonthlyTrendData] = useState(null);
  // payment methods (radial bars) data; start with sample and replace via API
  const [paymentMethodsData, setPaymentMethodsData] = useState(null);

  const currentYear = new Date().getFullYear();
  const [trendYear, setTrendYear] = useState(currentYear);
  // category distribution data; can be array or API object shape
  // initialize null and populate from API or fallback later to avoid referencing dashboardData before it's defined
  const [categoryDistribution, setCategoryDistribution] = useState(null);

  // Sample data - replace with your actual data fetching
  const dashboardData = {
    // dailySpending: [
    //   { spending: 8000.0, day: "2025-08-01" },
    //   { spending: 0.0, day: "2025-08-02" },
    //   { spending: 469.0, day: "2025-08-03" },
    //   // ... rest of your daily spending data
    // ],
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
  };

  // Analytics summary state (replaced by API). Initialize null to avoid pre-init reference errors.
  const [analyticsSummary, setAnalyticsSummary] = useState(null);

  // Remove initial default injection; we'll show skeletons until data loads

  const handleRefresh = () => {
    // trigger a full refetch without switching to global skeleton
    setRefreshKey((k) => k + 1);
  };

  const handleExport = async () => {
    const response = await api.get("/api/expenses/generate-excel-report");
    const response1 = await api.get("/api/bills/export/excel");
    window.alert("Excel report generated");
  };

  const handleFilter = () => {
    console.log("Opening filter options...");
  };

  // Daily spending effect reacts to timeframe or its own type only
  useEffect(() => {
    // indicate loading while fetching daily spending
    setDailyLoading(true);

    let mounted = true;
    (async () => {
      try {
        // build API params according to timeframe
        const params = {};
        const now = new Date();
        if (timeframe === "this_month" || timeframe === "month") {
          params.month = now.getMonth() + 1; // 1-based
          params.year = now.getFullYear();
        } else if (timeframe === "last_month") {
          const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          params.month = d.getMonth() + 1;
          params.year = d.getFullYear();
        } else if (timeframe === "last_3_months" || timeframe === "last_3") {
          // last 90 days: from (today - 90 days) to today
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = start.toISOString().split("T")[0];
          params.toDate = end.toISOString().split("T")[0];
        }
        // include transaction type (loss/gain) if provided
  if (dailyType) params.type = dailyType;

        const res = await fetchDailySpending(params);
        if (mounted) {
          if (Array.isArray(res)) {
            setDailySpendingData(res);
          } else {
            setDailySpendingData([]);
          }
        }
      } catch (err) {
        console.error("Failed to load daily spending:", err);
        if (mounted) setDailySpendingData([]);
      } finally {
        if (mounted) setDailyLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [timeframe, dailyType]);

  // Load category distribution from backend in the new shape (uses independent categoryTimeframe and flow type)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setCategoryLoading(true);
      try {
        // Prefer dedicated categories summary endpoint
        const params = {};
        const now = new Date();
        const fmt = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };
        // Always compute fromDate/toDate for this endpoint using categoryTimeframe
        if (
          categoryTimeframe === "this_month" ||
          categoryTimeframe === "month"
        ) {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = now; // current day (not end of month)
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (categoryTimeframe === "last_month") {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (
          categoryTimeframe === "last_3_months" ||
          categoryTimeframe === "last_3"
        ) {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else {
          // default: this month
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = now;
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        }
        // Map category gain/loss to API flowType
        if (categoryFlowType === "gain") {
          params.flowType = "inflow";
          params.type = "gain"; // optional, for fallback endpoints
        } else if (categoryFlowType === "loss") {
          params.flowType = "outflow";
          params.type = "loss"; // optional, for fallback endpoints
        }

        let res = await fetchCategoriesSummary(params);
        // fallback: some backends might return this via expense summary
        if (!res || !res.summary || !res.summary.categoryTotals) {
          res = await fetchExpenseSummary(params);
        }
        if (mounted && res) {
          // If the response contains the described shape, prefer it;
          // otherwise keep previous value.
          if (res.summary && res.summary.categoryTotals) {
            setCategoryDistribution(res);
          } else if (Array.isArray(res)) {
            setCategoryDistribution(res);
          } else {
            setCategoryDistribution([]);
          }
        }
      } catch (e) {
        // On failure, keep existing categoryDistribution
        console.error("Failed to load category distribution:", e);
        if (mounted) setCategoryDistribution([]);
      } finally {
        if (mounted) setCategoryLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categoryTimeframe, categoryFlowType]);

  // Load analytics summary from backend (replaces hardcoded analytics)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMetricsLoading(true);
      try {
        const params = {};
        const now = new Date();
        if (timeframe === "this_month" || timeframe === "month") {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeframe === "last_month") {
          const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          params.month = d.getMonth() + 1;
          params.year = d.getFullYear();
        } else if (timeframe === "last_3_months" || timeframe === "last_3") {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = start.toISOString().split("T")[0];
          params.toDate = end.toISOString().split("T")[0];
        }

        const res = await fetchExpenseSummary(params);
        if (mounted) {
          if (res && typeof res === "object") {
            setAnalyticsSummary(res);
          } else {
            setAnalyticsSummary(null);
          }
        }
      } catch (e) {
        // keep sample analytics on error
        console.error("Failed to load expense summary:", e);
      } finally {
        if (mounted) setMetricsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [timeframe]);

  // Load monthly expenses from backend to replace static monthlyTrend
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMonthlyTrendLoading(true);
      try {
        const params = { year: trendYear };

        const res = await fetchMonthlyExpenses(params);

        // Normalize various possible response shapes into { labels, datasets: [{ data }] }
        const MONTHS = [
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
        ];

        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const values = new Array(12).fill(0);
          res.forEach((item) => {
            // month can be 1-12, or 0-11 (rare), or label string
            const label = (item.label ?? item.name ?? "").toString();
            let idx = -1;
            const mNum = Number(
              item.month ?? item.monthNumber ?? item.m ?? item.index
            );
            if (!Number.isNaN(mNum)) {
              // Assume 1-based
              idx = Math.min(11, Math.max(0, mNum - 1));
            } else if (label) {
              const short = label.slice(0, 3).toLowerCase();
              idx = MONTHS.findIndex((m) => m.toLowerCase() === short);
              if (idx === -1) {
                idx = MONTHS.findIndex((m) =>
                  m.toLowerCase().startsWith(short)
                );
              }
            }
            if (idx >= 0 && idx < 12) {
              const v = Number(
                item.amount ??
                  item.total ??
                  item.value ??
                  item.expenses ??
                  item.sum ??
                  0
              );
              values[idx] = Number.isFinite(v) ? v : 0;
            }
          });
          normalized = { labels: MONTHS, datasets: [{ data: values }] };
        }

        if (mounted) {
          if (normalized) {
            setMonthlyTrendData(normalized);
          } else {
            setMonthlyTrendData(null);
          }
        }
      } catch (e) {
        console.error("Failed to load monthly expenses:", e);
        // keep existing monthlyTrendData (sample) on error
      } finally {
        if (mounted) setMonthlyTrendLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // Re-fetch when type or year changes
  }, [trendYear]);

  // Load payment methods distribution from backend (replaces static sample)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setPaymentMethodsLoading(true);
      try {
        const now = new Date();
        const fmt = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };
        const params = {};
        if (
          paymentMethodsTimeframe === "this_month" ||
          paymentMethodsTimeframe === "month"
        ) {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = now;
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (paymentMethodsTimeframe === "last_month") {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        } else if (
          paymentMethodsTimeframe === "last_3_months" ||
          paymentMethodsTimeframe === "last_3"
        ) {
          const end = now;
          const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          params.fromDate = fmt(start);
          params.toDate = fmt(end);
        }
        if (paymentMethodsFlowType === "gain") {
          params.flowType = "inflow";
          params.type = "gain";
        } else {
          params.flowType = "outflow";
          params.type = "loss";
        }

        const res = await fetchPaymentMethods(params);

        // Normalize various possible response shapes into { labels, datasets: [{ data }] }
        let normalized = null;
        if (
          res &&
          typeof res === "object" &&
          Array.isArray(res.labels) &&
          res.datasets &&
          res.datasets[0] &&
          Array.isArray(res.datasets[0].data)
        ) {
          normalized = {
            labels: res.labels,
            datasets: [{ data: res.datasets[0].data }],
          };
        } else if (Array.isArray(res)) {
          const labels = [];
          const values = [];
          res.forEach((item) => {
            const label = (
              item.label ??
              item.name ??
              item.method ??
              ""
            ).toString();
            const value = Number(
              item.amount ?? item.total ?? item.value ?? item.count ?? 0
            );
            if (label) {
              labels.push(label);
              values.push(Number.isFinite(value) ? value : 0);
            }
          });
          if (labels.length) {
            normalized = { labels, datasets: [{ data: values }] };
          }
        } else if (res && typeof res === "object") {
          // Map/dictionary form: { cash: 100, creditPaid: 200, ... }
          const labels = Object.keys(res);
          const values = labels.map((k) => Number(res[k] ?? 0));
          if (labels.length) {
            normalized = { labels, datasets: [{ data: values }] };
          }
        }

        if (mounted) {
          if (normalized) {
            setPaymentMethodsData(normalized);
          } else {
            setPaymentMethodsData(null);
          }
        }
      } catch (e) {
        console.error("Failed to load payment methods:", e);
        // keep existing paymentMethodsData (sample) on error
      } finally {
        if (mounted) setPaymentMethodsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [paymentMethodsTimeframe, paymentMethodsFlowType]);

  // removed global skeleton; per-section skeletons handle loading visuals

  return (
    <div className="expense-dashboard">
      <DashboardDataRefetcher
        trigger={refreshKey}
        timeframe={timeframe}
        categoryTimeframe={categoryTimeframe}
        categoryFlowType={categoryFlowType}
        trendYear={trendYear}
        paymentMethodsTimeframe={paymentMethodsTimeframe}
        paymentMethodsFlowType={paymentMethodsFlowType}
        setDailyLoading={setDailyLoading}
        setCategoryLoading={setCategoryLoading}
        setMetricsLoading={setMetricsLoading}
        setMonthlyTrendLoading={setMonthlyTrendLoading}
        setPaymentMethodsLoading={setPaymentMethodsLoading}
        setDailySpendingData={setDailySpendingData}
        setCategoryDistribution={setCategoryDistribution}
        setAnalyticsSummary={setAnalyticsSummary}
        setMonthlyTrendData={setMonthlyTrendData}
        setPaymentMethodsData={setPaymentMethodsData}
      />
      <DashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onFilter={handleFilter}
      />

      {/* Key Metrics */}
      <div className="metrics-grid">
        {metricsLoading ? (
          [...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              title="Total Balance"
              value={analyticsSummary?.remainingBudget ?? 0}
              change={null}
              changeText={
                analyticsSummary?.remainingBudgetComparison?.percentageChange ||
                null
              }
              changeDirection={(() => {
                const t = (
                  analyticsSummary?.remainingBudgetComparison?.trend || ""
                ).toLowerCase();
                if (t === "increase") return "positive"; // more remaining budget is good
                if (t === "decrease") return "negative"; // less remaining budget is bad
                return "neutral";
              })()}
              icon={<Wallet />}
              type="primary"
              trend="up"
            />
            <MetricCard
              title="Monthly Spending"
              value={analyticsSummary?.currentMonthLosses ?? 0}
              change={null}
              changeText={
                analyticsSummary?.currentMonthLossesComparison
                  ?.percentageChange || null
              }
              changeDirection={
                analyticsSummary?.currentMonthLossesComparison?.trend ===
                "increase"
                  ? "negative" // spending increased is a negative trend
                  : analyticsSummary?.currentMonthLossesComparison?.trend ===
                    "decrease"
                  ? "positive"
                  : "neutral"
              }
              icon={<CurrencyExchange />}
              type="expense"
              trend="down"
            />
            <MetricCard
              title="Credit Due"
              value={Math.abs(analyticsSummary?.totalCreditDue ?? 0)}
              change={null}
              changeText={
                analyticsSummary?.totalCreditDueComparison?.percentageChange ||
                null
              }
              changeDirection={(() => {
                const t = (
                  analyticsSummary?.totalCreditDueComparison?.trend || ""
                ).toLowerCase();
                if (t === "decrease") return "positive"; // less due is good
                if (t === "increase") return "negative"; // more due is bad
                return "neutral";
              })()}
              icon={<CreditCard />}
              type="credit"
              trend="down"
            />
            <MetricCard
              title="Credit Card Bill Paid"
              value={Math.abs(
                analyticsSummary?.creditBillPaymentComparison
                  ?.currentMonthBillPaid ??
                  analyticsSummary?.creditBillPaymentComparison
                    ?.lastCreditBillPaid ??
                  0
              )}
              change={null}
              changeText={
                analyticsSummary?.creditBillPaymentComparison
                  ?.percentageChange || null
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
            />
          </>
        )}
      </div>

      {/* Main Charts Grid */}
      <div className="charts-grid">
        <div className="chart-row">
          {dailyLoading ? (
            <div className="chart-container daily-spending-chart">
              <div className="chart-header">
                <h3>📊 Daily Spending Pattern</h3>
                <div className="chart-controls">
                  <div className="time-selector skeleton-pill" />
                  <div className="type-toggle">
                    <div className="toggle-btn loss skeleton-pill" />
                    <div className="toggle-btn gain skeleton-pill" />
                  </div>
                </div>
              </div>
              <ChartSkeleton height={300} variant="line" />
            </div>
          ) : (
            <DailySpendingChart
              data={dailySpendingData}
              timeframe={timeframe}
              onTimeframeChange={(val) => setTimeframe(val)}
              selectedType={dailyType}
              onTypeToggle={(type) => setDailyType(type)}
            />
          )}

          {/* Quick Access: placed right below the daily spending chart and spanning full width */}
          <div style={{ gridColumn: "1 / -1" }}>
            <QuickAccess />
          </div>

          {/* Overview + Category grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: !isMobile ? "1fr 1fr" : "1fr",
              gap: !isMobile ? 24 : 16,
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
            {categoryLoading ? (
              <div className="chart-container category-breakdown">
                <div className="chart-header">
                  <h3>🏷️ Category Breakdown</h3>
                  <div className="chart-controls">
                    <div className="time-selector skeleton-pill" />
                    <div className="type-toggle">
                      <div className="toggle-btn loss skeleton-pill" />
                      <div className="toggle-btn gain skeleton-pill" />
                    </div>
                  </div>
                </div>
                <ChartSkeleton height={isMobile ? 320 : 500} variant="pie" />
                <div
                  className="total-amount total-amount-bottom skeleton-pill"
                  style={{ width: 140 }}
                />
              </div>
            ) : (
              <CategoryBreakdownChart
                data={categoryDistribution}
                timeframe={categoryTimeframe}
                onTimeframeChange={(val) => setCategoryTimeframe(val)}
                flowType={categoryFlowType}
                onFlowTypeChange={(t) => setCategoryFlowType(t)}
              />
            )}
          </div>
        </div>

        <div className="chart-row">
          {monthlyTrendLoading ? (
            <ChartSkeleton height={isMobile ? 260 : isTablet ? 380 : 480} />
          ) : (
            <MonthlyTrendChart
              data={monthlyTrendData}
              year={trendYear}
              onPrevYear={() => setTrendYear((y) => y - 1)}
              onNextYear={() =>
                setTrendYear((y) => Math.min(currentYear, y + 1))
              }
            />
          )}
          {paymentMethodsLoading ? (
            <div className="chart-container payment-methods">
              <div className="chart-header">
                <h3>💳 Payment Methods</h3>
                <div className="chart-controls">
                  <div className="time-selector skeleton-pill" />
                  <div className="type-toggle">
                    <div className="toggle-btn loss skeleton-pill" />
                    <div className="toggle-btn gain skeleton-pill" />
                  </div>
                </div>
              </div>
              <ChartSkeleton height={480} variant="pie" />
              <div
                className="total-amount total-amount-bottom skeleton-pill"
                style={{ width: 140 }}
              />
            </div>
          ) : (
            <PaymentMethodChart
              data={paymentMethodsData}
              timeframe={paymentMethodsTimeframe}
              onTimeframeChange={(val) => setPaymentMethodsTimeframe(val)}
              flowType={paymentMethodsFlowType}
              onFlowTypeChange={(t) => setPaymentMethodsFlowType(t)}
            />
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {metricsLoading ? (
          <>
            <ChartSkeleton height={320} />
            <ChartSkeleton height={260} />
          </>
        ) : (
          <>
            <RecentTransactions
              transactions={analyticsSummary?.lastFiveExpenses ?? []}
            />
            <BudgetOverview
              remainingBudget={analyticsSummary?.remainingBudget ?? 0}
              totalLosses={analyticsSummary?.totalLosses ?? 0}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseDashboard;
