import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  IconButton,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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
import {
  CategoryBreakdownChart,
  PaymentMethodChart,
  DailySpendingChart,
  DailySpendingSkeleton,
  RecentTransactions,
  BudgetOverview,
  BudgetOverviewSkeleton,
  DashboardDataRefetcher,
  RecentTransactionsSkeleton,
  MetricsGrid,
} from "../Dashboard";
import ChartSkeleton from "../Dashboard/ChartSkeleton";
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

// Metric skeleton kept local (small, dashboard-specific). ChartSkeleton now imported.
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

// Enhanced Header Component with MUI Menu popover
const DashboardHeader = ({ onRefresh, onExport, onFilter }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleAndClose = (cb) => () => {
    handleClose();
    cb && cb();
  };
  return (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="header-title">
          <h1>💰 Financial Dashboard</h1>
          <p>Real-time insights into your financial health</p>
        </div>
      </div>
      <div className="header-actions">
        <IconButton
          className="action-btn no-lift"
          aria-label="More actions"
          aria-controls={open ? "dashboard-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuOpen}
        >
          <MoreVert />
        </IconButton>
        <Menu
          id="dashboard-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ "aria-labelledby": "dashboard-menu" }}
          PaperProps={{
            sx: {
              backgroundColor: "#1e1e1e",
              color: "#fff",
              border: "1px solid #2a2a2a",
              minWidth: 220,
            },
          }}
        >
          <MenuItem onClick={handleAndClose(onRefresh)}>
            <ListItemIcon sx={{ color: "#14b8a6" }}>
              <Refresh fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Refresh" secondary="Reload dashboard data" />
          </MenuItem>
          <MenuItem onClick={handleAndClose(onExport)}>
            <ListItemIcon sx={{ color: "#14b8a6" }}>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Export Reports"
              secondary="Download Excel summaries"
            />
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

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
      <MetricsGrid
        analyticsSummary={analyticsSummary}
        loading={metricsLoading}
      />

      {/* Main Charts Grid */}
      <div className="charts-grid">
        <div className="chart-row">
          {dailyLoading ? (
            <DailySpendingSkeleton
              timeframe={timeframe}
              height={isMobile ? 200 : isTablet ? 240 : 100}
            />
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
            <CategoryBreakdownChart
              data={categoryDistribution}
              timeframe={categoryTimeframe}
              onTimeframeChange={(val) => setCategoryTimeframe(val)}
              flowType={categoryFlowType}
              onFlowTypeChange={(t) => setCategoryFlowType(t)}
              loading={categoryLoading}
              skeleton={
                <>
                  <ChartSkeleton
                    height={isMobile ? 380 : 560}
                    variant="pie"
                    noHeader
                  />
                </>
              }
            />
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
          <PaymentMethodChart
            data={paymentMethodsData}
            timeframe={paymentMethodsTimeframe}
            onTimeframeChange={(val) => setPaymentMethodsTimeframe(val)}
            flowType={paymentMethodsFlowType}
            onFlowTypeChange={(t) => setPaymentMethodsFlowType(t)}
            loading={paymentMethodsLoading}
            skeleton={<ChartSkeleton height={480} variant="pie" noHeader />}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {metricsLoading ? (
          <>
            <RecentTransactionsSkeleton count={8} />
            <BudgetOverviewSkeleton count={4} />
          </>
        ) : (
          <>
            <RecentTransactions
              transactions={analyticsSummary?.lastTenExpenses ?? []}
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
