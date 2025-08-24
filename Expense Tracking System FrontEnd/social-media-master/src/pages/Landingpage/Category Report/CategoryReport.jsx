import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  ComposedChart,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import "./CategoryReport.css";
import { fetchCategoriesSummary } from "../../../utils/Api";
import { CATEGORY_ICONS } from "../../../components/constants/categoryIcons";

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

// Pie chart specific skeleton (donut + right-side chips)
const PieChartSkeleton = ({ height = 360 }) => (
  <div className="chart-container skeleton">
    <div className="chart-header">
      <div className="skeleton-chart-title"></div>
      <div className="skeleton-chart-subtitle"></div>
    </div>
    <div className="distribution-content">
      <div className="distribution-left" style={{ height }}>
        <div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            margin: "0 auto",
            marginTop: 20,
          }}
        >
          <div
            className="skeleton"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: "#0e0e0e",
            }}
          />
        </div>
      </div>
      <div className="distribution-right" style={{ gap: 10 }}>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="category-chip"
            style={{ alignItems: "center" }}
          >
            <div
              className="chip-left"
              style={{ alignItems: "center", gap: 10 }}
            >
              <span
                className="skeleton"
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                }}
              />
              <span
                className="skeleton"
                style={{
                  display: "inline-block",
                  width: 120,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </div>
            <div className="chip-right">
              <span
                className="skeleton"
                style={{
                  display: "inline-block",
                  width: 40,
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        ))}
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

    {/* Top overview cards */}
    <div className="category-overview-cards">
      {[...Array(4)].map((_, i) => (
        <OverviewCardSkeleton key={i} />
      ))}
    </div>

    <div className="charts-grid">
      {/* 1) Bar chart (Pareto) */}
      <div className="chart-row full-width">
        <ChartSkeleton height={430} />
      </div>

      {/* 2) Pie chart (donut with chips) */}
      <div className="chart-row full-width">
        <PieChartSkeleton height={360} />
      </div>

      {/* 3) Performance Table */}
      <div className="chart-row full-width">
        <TableSkeleton />
      </div>
    </div>
  </div>
);

// Month formatter helper
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

// Validate if a string is a usable CSS color; avoids accidentally using URLs as colors
// Supports: named colors (via CSS.supports/DOM), #RGB/#RGBA/#RRGGBB/#RRGGBBAA, rgb/rgba, hsl/hsla, transparent/currentColor
const __cssColorCache = new Map();
const isValidCssColor = (value) => {
  if (value == null) return false;
  if (typeof value !== "string") return false;
  const v = value.trim().replace(/^['"]|['"]$/g, "");
  if (!v) return false;

  // Cached result
  if (__cssColorCache.has(v)) return __cssColorCache.get(v);

  // Quick reject: URLs, data URIs, blob, file, or url() functions
  if (/^(https?:|data:|blob:|file:)/i.test(v) || /url\s*\(/i.test(v)) {
    __cssColorCache.set(v, false);
    return false;
  }

  // Explicitly allow a couple of well-known keywords
  if (/^(transparent|currentColor)$/i.test(v)) {
    __cssColorCache.set(v, true);
    return true;
  }

  // Best: CSS.supports in modern browsers
  try {
    if (
      typeof window !== "undefined" &&
      window.CSS &&
      typeof window.CSS.supports === "function"
    ) {
      const ok = window.CSS.supports("color", v);
      __cssColorCache.set(v, !!ok);
      if (ok) return true;
    }
  } catch (_) {
    // ignore
  }

  // Fallback: DOM style parsing when document is available
  try {
    if (typeof document !== "undefined") {
      const el = document.createElement("span");
      el.style.color = "";
      el.style.color = v;
      const ok = !!el.style.color; // non-empty means the value parsed
      __cssColorCache.set(v, ok);
      if (ok) return true;
    }
  } catch (_) {
    // ignore
  }

  // Final fallback heuristics: hex/rgb(a)/hsl(a) including 4/8 digit hex
  const hexOk =
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
      v
    );
  const rgbOk =
    /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(
      v
    );
  const hslOk =
    /^hsla?\(\s*\d+(?:\.\d+)?(?:deg|rad|turn)?\s*,\s*\d+%\s*,\s*\d+%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(
      v
    );
  const ok = hexOk || rgbOk || hslOk;
  __cssColorCache.set(v, ok);
  return ok;
};

// Header Component
const CategoryReportHeader = ({
  onFilter,
  onExport,
  onTimeframeChange,
  timeframe,
  onBack,
  flowType,
  onFlowTypeChange,
}) => (
  <div className="category-report-header">
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
          transform: "translateY(-15px)",
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
        <h1 style={{ margin: 0 }}>📊 Category Analytics</h1>
        <p style={{ margin: "6px 0 0 0" }}>
          Comprehensive spending analysis by categories
        </p>
      </div>
    </div>
    <div className="header-controls">
      <select
        value={flowType}
        onChange={(e) => onFlowTypeChange(e.target.value)}
        className="timeframe-selector"
        aria-label="Flow type"
      >
        <option value="all">All</option>
        <option value="outflow">Outflow</option>
        <option value="inflow">Inflow</option>
      </select>
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
  const safe = Array.isArray(data) ? data : [];
  const totalSpending = safe.reduce((sum, item) => sum + (item.amount || 0), 0);
  const topCategory = safe[0] || { name: "-", amount: 0, percentage: 0 };
  const totalTransactions = safe.reduce(
    (sum, item) => sum + (item.transactions || 0),
    0
  );
  const avgTransaction =
    totalTransactions > 0 ? Math.round(totalSpending / totalTransactions) : 0;

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
            ₹{Number(topCategory.amount || 0).toLocaleString()} (
            {Number(topCategory.percentage || 0)}%)
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

// Category Distribution Pie Chart with right-side percentage cards
const CategoryDistributionChart = ({ data }) => {
  const safe = Array.isArray(data) ? data : [];
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <PieChartIcon size={20} /> Category Distribution
        </h3>
        <div className="chart-subtitle">Spending breakdown by categories</div>
      </div>
      <div className="distribution-content">
        <div className="distribution-left">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={safe}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={64}
                paddingAngle={2}
                dataKey="amount"
              >
                {safe.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `₹${Number(value).toLocaleString()}`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #14b8a6",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="distribution-right">
          {safe.map((item, idx) => (
            <div key={idx} className="category-chip">
              <div className="chip-left">
                {item.icon ? (
                  <span
                    className="chip-icon"
                    aria-hidden="true"
                    style={{
                      background: isValidCssColor(item.color)
                        ? item.color
                        : COLORS[idx % COLORS.length],
                    }}
                  >
                    {typeof item.icon === "string" &&
                    CATEGORY_ICONS[item.icon] ? (
                      CATEGORY_ICONS[item.icon]
                    ) : /^https?:\/\//.test(item.icon) ||
                      (typeof item.icon === "string" &&
                        item.icon.startsWith("data:")) ? (
                      <img src={item.icon} alt="" />
                    ) : (
                      <span className="chip-icon-text">{item.icon}</span>
                    )}
                  </span>
                ) : null}
                <span className="chip-name" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="chip-right">
                <span className="chip-pct">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pareto Chart: highlights the cumulative contribution of top categories
const CategoryParetoChart = ({ data, topN = 12 }) => {
  const safe = Array.isArray(data) ? data : [];
  // already sorted desc by amount in fetchData, but sort defensively
  const sorted = [...safe].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const total = sorted.reduce((s, d) => s + (d.amount || 0), 0) || 0;

  let display = sorted;
  if (sorted.length > topN) {
    const head = sorted.slice(0, topN);
    const tailItems = sorted.slice(topN);
    const tailSum = tailItems.reduce((s, d) => s + (d.amount || 0), 0);
    const tailTx = tailItems.reduce((s, d) => s + (d.transactions || 0), 0);
    display = [
      ...head,
      {
        name: "Others",
        amount: tailSum,
        transactions: tailTx,
        percentage: total ? +((tailSum / total) * 100).toFixed(1) : 0,
      },
    ];
  }

  let running = 0;
  const paretoData = display.map((d) => {
    running += d.amount || 0;
    const cumPct = total ? +((running / total) * 100).toFixed(1) : 0;
    return { ...d, cumulative: cumPct };
  });

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <TrendingUp size={20} /> Pareto: Top Categories Contribution
        </h3>
        <div className="chart-subtitle">
          Bars: amount • Yellow line: cumulative % • Red line: transactions
        </div>
      </div>
      <ResponsiveContainer width="100%" height={430}>
        <ComposedChart
          data={paretoData}
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          {/* Hidden axis to scale transactions line separately */}
          <YAxis yAxisId="rightTx" orientation="right" hide={true} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "cumulative") return [`${value}%`, "Cumulative %"];
              if (name === "transactions")
                return [
                  `${Number(value || 0).toLocaleString()}`,
                  "Transactions",
                ];
              if (name === "amount")
                return [
                  `₹${Number(value || 0).toLocaleString()}`,
                  "Amount (₹)",
                ];
              return [value, name];
            }}
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
            fill="#06d6a0"
            name="Amount (₹)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="rightTx"
            type="monotone"
            dataKey="transactions"
            stroke="#ff6b6b"
            strokeWidth={2}
            name="Transactions"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#ffb703"
            strokeWidth={2}
            name="Cumulative %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// NOTE: Budget comparison requires budget data, which isn't provided by this API.
// The section is intentionally omitted until backend supplies budgets.

// NOTE: Efficiency and subcategory breakdown are omitted without explicit data.

// NOTE: Subcategory treemap omitted as API doesn't provide subcategory fields.

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

// Main Category Report Component
const CategoryReport = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [flowType, setFlowType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // normalized shapes for charts
  const [categorySpending, setCategorySpending] = useState([]); // [{name, amount, percentage, transactions, avgPerTransaction}]
  const [monthlyTrends, setMonthlyTrends] = useState([]); // [{month, [category]: amount}]
  const [dailySpending, setDailySpending] = useState([]); // [{day, [category]: amount}]

  const navigate = useNavigate();
  const { friendId } = useParams();

  // Compute date range from timeframe
  const getRange = (tf) => {
    const now = new Date();
    const to = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );
    let from;
    switch (tf) {
      case "week": {
        const d = new Date(to);
        d.setUTCDate(d.getUTCDate() - 6);
        from = d;
        break;
      }
      case "quarter": {
        const d = new Date(to);
        d.setUTCMonth(d.getUTCMonth() - 2, 1);
        from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
        break;
      }
      case "year": {
        from = new Date(Date.UTC(to.getUTCFullYear(), 0, 1));
        break;
      }
      case "month":
      default: {
        from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
        break;
      }
    }
    const fmt = (dt) => dt.toISOString().slice(0, 10);
    return { fromDate: fmt(from), toDate: fmt(to) };
  };

  const fetchData = async (tf = timeframe, fl = flowType) => {
    try {
      setLoading(true);
      setError("");
      const { fromDate, toDate } = getRange(tf);
      const params = { fromDate, toDate };
      if (fl && fl !== "all") params.flowType = fl;
      if (friendId) params.targetId = friendId;

      const raw = await fetchCategoriesSummary(params);

      const summary = raw?.summary ?? { totalAmount: 0, categoryTotals: {} };
      const totalAmount = Number(summary.totalAmount || 0);

      // Build per-category rollup
      const categoryKeys = Object.keys(raw || {}).filter(
        (k) => k !== "summary"
      );
      const cats = categoryKeys.map((key) => {
        const c = raw[key] || {};
        const amount = Number(c.totalAmount || 0);
        const transactions = Number(
          c.expenseCount || (c.expenses?.length ?? 0) || 0
        );
        const percentage =
          totalAmount > 0
            ? Number(((amount / totalAmount) * 100).toFixed(1))
            : 0;
        const avgPerTransaction =
          transactions > 0 ? Math.round(amount / transactions) : 0;
        return {
          name: c.name || key,
          amount,
          percentage,
          transactions,
          avgPerTransaction,
          expenses: c.expenses || [],
          icon: c.icon || c.iconKey || c.categoryIcon || null,
          color: c.color || c.categoryColor || null,
        };
      });
      // Sort by amount desc
      cats.sort((a, b) => b.amount - a.amount);
      setCategorySpending(cats);

      // Build daily spending per category across date range
      const dailyMap = new Map(); // key: YYYY-MM-DD -> obj
      cats.forEach((cat) => {
        (cat.expenses || []).forEach((e) => {
          const day = e.date;
          const amt = Number(e?.details?.netAmount ?? e?.details?.amount ?? 0);
          if (!day) return;
          if (!dailyMap.has(day)) dailyMap.set(day, { day });
          dailyMap.get(day)[cat.name] =
            (dailyMap.get(day)[cat.name] || 0) + amt;
        });
      });
      const dailyArr = Array.from(dailyMap.values()).sort((a, b) =>
        a.day > b.day ? 1 : -1
      );
      setDailySpending(dailyArr);

      // Build monthly trends by month label per category
      const monthMap = new Map(); // key: YYYY-MM -> { month: 'Mon YYYY', [cat]: amt }
      cats.forEach((cat) => {
        (cat.expenses || []).forEach((e) => {
          const dStr = e.date;
          if (!dStr) return;
          const d = new Date(dStr + "T00:00:00Z");
          const ym = `${d.getUTCFullYear()}-${String(
            d.getUTCMonth() + 1
          ).padStart(2, "0")}`;
          const label = `${MONTHS[d.getUTCMonth()]} ${String(
            d.getUTCFullYear()
          ).slice(2)}`;
          const amt = Number(e?.details?.netAmount ?? e?.details?.amount ?? 0);
          if (!monthMap.has(ym)) monthMap.set(ym, { month: label });
          monthMap.get(ym)[cat.name] = (monthMap.get(ym)[cat.name] || 0) + amt;
        });
      });
      const monthArr = Array.from(monthMap.entries())
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([, v]) => v);
      setMonthlyTrends(monthArr);
    } catch (err) {
      console.error("Failed to load category report:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load data"
      );
      setCategorySpending([]);
      setDailySpending([]);
      setMonthlyTrends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    console.log("Opening category filters...");
  };

  const handleExport = () => {
    console.log("Exporting category report...");
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchData(newTimeframe, flowType);
  };

  const handleFlowTypeChange = (newFlow) => {
    setFlowType(newFlow);
    fetchData(timeframe, newFlow);
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
    <div className="category-report">
      <CategoryReportHeader
        onFilter={handleFilter}
        onExport={handleExport}
        onTimeframeChange={handleTimeframeChange}
        timeframe={timeframe}
        onBack={handleBack}
        flowType={flowType}
        onFlowTypeChange={handleFlowTypeChange}
      />

      {error ? (
        <div style={{ padding: 16, color: "#ff6b6b" }}>Error: {error}</div>
      ) : null}

      <CategoryOverviewCards data={categorySpending} />

      <div className="charts-grid">
        {/* Row 2: Pareto (always visible) */}
        <div className="chart-row full-width">
          <CategoryParetoChart data={categorySpending} />
        </div>
        {/* Row 1: Distribution and Spending Analysis */}
        <div className="chart-row full-width">
          <CategoryDistributionChart data={categorySpending} />
        </div>

        {/* Row 4: Full Width Performance Table */}
        <div className="chart-row full-width">
          <CategoryPerformanceTable data={categorySpending} />
        </div>
      </div>
    </div>
  );
};

export default CategoryReport;
