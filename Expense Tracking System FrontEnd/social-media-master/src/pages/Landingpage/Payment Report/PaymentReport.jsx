import React, { useState, useMemo, useEffect } from "react";
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
import { fetchPaymentSummary } from "../../../utils/Api";
import PaymentMethodAccordionGroup from "../../../components/PaymentMethodAccordion";

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
  flowType,
  onFlowTypeChange,
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
        <h1 style={{ margin: 0 }}>💳 Payment Methods Analytics</h1>
        <p style={{ margin: "6px 0 0 0" }}>
          Comprehensive analysis of payment method usage and trends
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

// Payment Methods Overview Cards
const PaymentOverviewCards = ({ data = [] }) => {
  const safe = Array.isArray(data) ? data : [];
  const totalAmount = safe.reduce(
    (sum, item) => sum + Number(item?.totalAmount || 0),
    0
  );
  const totalTransactions = safe.reduce(
    (sum, item) => sum + Number(item?.transactions || 0),
    0
  );
  const topMethod = safe[0] || { method: "-", totalAmount: 0, percentage: 0 };
  const avgTransactionValue =
    totalTransactions > 0 ? totalAmount / totalTransactions : 0;

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
            ₹{Number(topMethod.totalAmount || 0).toLocaleString()} (
            {Number(topMethod.percentage || 0)}%)
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

// Payment Methods Distribution Chart (donut + right-side chips)
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
    <div className="distribution-content">
      <div className="distribution-left">
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={64}
              paddingAngle={2}
              dataKey="totalAmount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
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
        {data.map((item, idx) => (
          <div key={idx} className="category-chip">
            <div className="chip-left">
              <span
                className="chip-icon"
                aria-hidden="true"
                style={{ background: item.color }}
              >
                <span className="chip-icon-text">{item.icon}</span>
              </span>
              <span className="chip-name" title={item.method}>
                {item.method}
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

// Payment Methods Usage Analysis (Pareto-like: amount bars + cumulative % + transactions)
const PaymentUsageChart = ({ data }) => {
  const total = data.reduce((s, d) => s + (d.totalAmount || 0), 0) || 0;
  const sorted = [...data].sort(
    (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)
  );
  let running = 0;
  const composed = sorted.map((d) => {
    running += d.totalAmount || 0;
    return {
      ...d,
      cumulative: total ? +((running / total) * 100).toFixed(1) : 0,
    };
  });

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <BarChart3 size={20} /> Payment Methods Usage Analysis
        </h3>
        <div className="chart-subtitle">
          Bars: amount • Yellow line: cumulative % • Red line: transactions
        </div>
      </div>
      <ResponsiveContainer width="100%" height={430}>
        <ComposedChart
          data={composed}
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis yAxisId="rightTx" orientation="right" hide={true} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "cumulative") return [`${value}%`, "Cumulative %"];
              if (name === "transactions")
                return [
                  `${Number(value || 0).toLocaleString()}`,
                  "Transactions",
                ];
              if (name === "totalAmount")
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
            dataKey="totalAmount"
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

// Transaction Size Distribution
const TransactionSizeChart = ({ data, methodsColors = [] }) => {
  const keys = useMemo(() => {
    const first = data?.[0] || {};
    return Object.keys(first).filter((k) => k !== "range");
  }, [data]);
  const colorMap = useMemo(() => {
    const map = new Map();
    methodsColors.forEach((m, i) => map.set(m.method, m.color));
    return map;
  }, [methodsColors]);

  return (
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
          {keys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              fill={colorMap.get(k) || COLORS[i % COLORS.length]}
              name={k}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category-wise Payment Breakdown (dynamic by methods)
const CategoryPaymentBreakdown = ({ data, methodsColors = [] }) => {
  const methodKeys = useMemo(() => {
    const first = data?.[0] || {};
    return Object.keys(first).filter((k) => k !== "category");
  }, [data]);
  const colorMap = useMemo(() => {
    const m = new Map();
    methodsColors.forEach(({ method, color }) => m.set(method, color));
    return m;
  }, [methodsColors]);

  return (
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
          {methodKeys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              stackId="a"
              fill={colorMap.get(k) || COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// (Replaced performance summary table with generic PaymentMethodAccordionGroup)

// Main Payment Methods Report Component
const PaymentMethodsReport = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [flowType, setFlowType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodsData, setMethodsData] = useState([]); // [{method, totalAmount, percentage, transactions, avgPerTransaction, icon, color, expenses: []}]
  const [txSizeData, setTxSizeData] = useState([]); // [{range, [method]: count}]
  const [categoryBreakdown, setCategoryBreakdown] = useState([]); // [{category, [method]: amount}]
  const [categories, setCategories] = useState([]); // Unique categories extracted from expenses: [{ name, totalAmount, transactions }]
  const navigate = useNavigate();
  const { friendId } = useParams();

  // Compute date range from timeframe (same logic as Category)
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

  const buildTxSizeBins = (methods) => {
    const bins = [
      { label: "₹0-100", min: 0, max: 100 },
      { label: "₹100-500", min: 100, max: 500 },
      { label: "₹500-1000", min: 500, max: 1000 },
      { label: "₹1000-5000", min: 1000, max: 5000 },
      { label: "₹5000+", min: 5000, max: Infinity },
    ];
    const result = bins.map((b) => ({ range: b.label }));
    methods.forEach((m) => {
      const name = m.method;
      (m.expenses || []).forEach((e) => {
        const amt = Math.abs(
          Number(e?.details?.netAmount ?? e?.details?.amount ?? 0)
        );
        const bin = bins.find((b) => amt >= b.min && amt < b.max);
        if (!bin) return;
        const r = result.find((x) => x.range === bin.label);
        r[name] = (r[name] || 0) + 1;
      });
    });
    return result;
  };

  const buildCategoryBreakdown = (methods, flow = "all") => {
    const map = new Map(); // key: categoryName -> { category, [method]: amount }
    methods.forEach((m) => {
      const method = m.method;
      (m.expenses || []).forEach((e) => {
        // Respect flow type: outflow -> loss; inflow -> profit
        const t = (e?.details?.type || e?.type || "").toLowerCase();
        if (flow === "outflow" && t && t !== "loss") return;
        if (flow === "inflow" && t && t !== "profit") return;

        const cat =
          e?.details?.categoryName ||
          e?.categoryName ||
          e?.details?.expenseName ||
          "Uncategorized";
        const amt = Math.abs(
          Number(e?.details?.netAmount ?? e?.details?.amount ?? 0)
        );
        if (!map.has(cat)) map.set(cat, { category: cat });
        const obj = map.get(cat);
        obj[method] = (obj[method] || 0) + amt;
      });
    });
    // sort categories by total across methods desc
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const sum = (o) =>
        Object.entries(o).reduce(
          (s, [k, v]) => (k === "category" ? s : s + Number(v || 0)),
          0
        );
      return sum(b) - sum(a);
    });
    return arr;
  };

  // Extract unique categories directly from expenses for generic use (filters, chips, etc.)
  const extractCategoriesFromExpenses = (methods, flow = "all") => {
    const map = new Map(); // name -> { name, totalAmount, transactions }
    methods.forEach((m) => {
      (m.expenses || []).forEach((e) => {
        const t = (e?.details?.type || e?.type || "").toLowerCase();
        if (flow === "outflow" && t && t !== "loss") return;
        if (flow === "inflow" && t && t !== "profit") return;

        const name =
          e?.details?.categoryName ||
          e?.categoryName ||
          e?.details?.expenseName ||
          "Uncategorized";
        const amt = Math.abs(
          Number(e?.details?.netAmount ?? e?.details?.amount ?? 0)
        );
        const rec = map.get(name) || { name, totalAmount: 0, transactions: 0 };
        rec.totalAmount += amt;
        rec.transactions += 1;
        map.set(name, rec);
      });
    });
    return Array.from(map.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  };

  const fetchData = async (tf = timeframe, fl = flowType) => {
    try {
      setLoading(true);
      setError("");
      const { fromDate, toDate } = getRange(tf);
      const params = { fromDate, toDate };
      if (fl && fl !== "all") params.flowType = fl;
      if (friendId) params.targetId = friendId;

      const raw = await fetchPaymentSummary(params);
      const summary = raw?.summary ?? {
        totalAmount: 0,
        paymentMethodTotals: {},
      };
      const totalAmount = Number(summary.totalAmount || 0);

      const keys = Object.keys(raw || {}).filter((k) => k !== "summary");
      const methods = keys.map((key, idx) => {
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
          method: c.name || key,
          totalAmount: amount,
          percentage,
          transactions,
          avgPerTransaction,
          expenses: c.expenses || [],
          icon: c.icon || c.iconKey || null,
          color: c.color || COLORS[idx % COLORS.length],
          trend: 0,
        };
      });
      // sort desc by amount
      methods.sort((a, b) => b.totalAmount - a.totalAmount);
      setMethodsData(methods);

      const txBins = buildTxSizeBins(methods);
      setTxSizeData(txBins);

      const catBreak = buildCategoryBreakdown(methods, fl);
      setCategoryBreakdown(catBreak);

      // Also surface the raw categories list for other UI pieces
      const cats = extractCategoriesFromExpenses(methods, fl);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load payment report:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load data"
      );
      setMethodsData([]);
      setTxSizeData([]);
      setCategoryBreakdown([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [friendId]);

  const handleFilter = () => {
    console.log("Opening payment methods filters...");
  };

  const handleExport = () => {
    console.log("Exporting payment methods report...");
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
    <div className="payment-methods-report">
      <PaymentMethodsHeader
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

      <PaymentOverviewCards data={methodsData} />

      <div className="charts-grid">
        {/* Row 1: Distribution (full width) */}
        <div className="chart-row full-width">
          <PaymentDistributionChart data={methodsData} />
        </div>

        {/* Row 2: Usage Analysis (full width) */}
        <div className="chart-row full-width">
          <PaymentUsageChart data={methodsData} />
        </div>

        {/* Row 3: Transaction Sizes (computed) */}
        {txSizeData.length > 0 ? (
          <div className="chart-row">
            <TransactionSizeChart
              data={txSizeData}
              methodsColors={methodsData.map(({ method, color }) => ({
                method,
                color,
              }))}
            />
            {categoryBreakdown.length > 0 ? (
              <CategoryPaymentBreakdown
                data={categoryBreakdown}
                methodsColors={methodsData.map(({ method, color }) => ({
                  method,
                  color,
                }))}
              />
            ) : null}
          </div>
        ) : null}

        {/* Row 4: Payment Method Detailed Expenses (Accordion) */}
        <div className="chart-row full-width">
          <div className="chart-container">
            <div className="chart-header">
              <h3>📂 Payment Method Expenses</h3>
              <div className="chart-subtitle">
                Expand a method to view individual expenses (Loss / Gain tabs)
              </div>
            </div>
            <PaymentMethodAccordionGroup methods={methodsData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsReport;
