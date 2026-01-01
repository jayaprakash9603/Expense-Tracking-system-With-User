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
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Line,
} from "recharts";
import "./ExpenseReport.css";
import { fetchAllBills } from "../../Redux/Bill/bill.action";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";

// Skeleton Components (type-specific)
const BarChartSkeletonInner = () => (
  <div className="skeleton-chart">
    <div className="skeleton-bars">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bar"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

const PieChartSkeletonInner = () => (
  <div className="skeleton-pie">
    <div className="skeleton-pie-ring" />
    <div className="skeleton-pie-center" />
  </div>
);

const LineAreaChartSkeletonInner = () => (
  <div className="skeleton-line-chart">
    <div className="skeleton-axis-y" />
    <div className="skeleton-axis-x" />
    <div className="skeleton-line-dots">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line-dot"
          style={{
            left: `${(i / 11) * 100}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
        />
      ))}
    </div>
  </div>
);

const RadialChartSkeletonInner = () => (
  <div className="skeleton-radial">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="skeleton-radial-bar"
        style={{ transform: `rotate(${i * 60}deg) translate(0, -10%)` }}
      />
    ))}
    <div className="skeleton-pie-center" />
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

// Header Component (aligned with Category/Payment headers, unique classes)
const ReportHeader = ({
  selectedTimeframe,
  setSelectedTimeframe,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  handleReportActionClick,
  reportActionAnchorEl,
  handleReportActionClose,
  handleReportMenuItemClick,
  onBack,
  colors,
}) => (
  <div className="expense-report-header">
    <div
      className="header-left"
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      <IconButton
        sx={{
          color: colors.primary_accent,
          backgroundColor: colors.secondary_bg,
          "&:hover": { backgroundColor: colors.hover_bg },
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
            stroke={colors.primary_accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <div>
        <h1 style={{ margin: 0, color: colors.primary_text }}>
          📊 Bill Report
        </h1>
        <p style={{ margin: "6px 0 0 0", color: colors.secondary_text }}>
          Spending overview and insights
        </p>
      </div>
    </div>
    <div className="expense-header-controls">
      <select
        value={selectedTimeframe}
        onChange={(e) => setSelectedTimeframe(e.target.value)}
        className="expense-timeframe-selector"
      >
        <option value="all">All Time</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">This Year</option>
        <option value="last_year">Last Year</option>
      </select>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="expense-timeframe-selector"
      >
        <option value="all">All Categories</option>
        {uniqueCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <IconButton
        onClick={handleReportActionClick}
        sx={{ color: colors.primary_accent, ml: 1 }}
        size="small"
        aria-label="More actions"
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
                reportActionAnchorEl?.getBoundingClientRect().bottom + 6 || 0,
              left:
                reportActionAnchorEl?.getBoundingClientRect().left - 100 || 0,
              backgroundColor: colors.secondary_bg,
              border: `1px solid ${colors.primary_accent}`,
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
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
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
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
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
                  color: colors.primary_text,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.hover_bg)
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
);

// Filter Info Component
const FilterInfo = ({
  filteredBills,
  allBills,
  selectedCategory,
  selectedTimeframe,
}) => (
  <div className="filter-info">
    <p>
      Showing {filteredBills.length} bills
      {selectedCategory !== "all" && ` in ${selectedCategory}`}
      {selectedTimeframe !== "all" &&
        ` for ${
          {
            week: "Last 7 days",
            month: "This month",
            year: "This year",
            last_year: "Last year",
          }[selectedTimeframe] || selectedTimeframe
        }`}
      {filteredBills.length !== allBills.length &&
        ` (filtered from ${allBills.length} total)`}
    </p>
  </div>
);

// Summary Cards Component
const SummaryCards = ({ analytics, currencySymbol = "₹" }) => (
  <div className="summary-cards">
    <div className="summary-card total">
      <div className="card-icon">💰</div>
      <div className="card-content">
        <h3>Total Expenses</h3>
        <p className="amount">
          {currencySymbol}
          {analytics.totalExpenses.toFixed(2)}
        </p>
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
        <p className="amount">
          {currencySymbol}
          {analytics.averageExpense.toFixed(2)}
        </p>
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
);

// No Data Message Component
const NoDataMessage = () => (
  <div className="no-data-message">
    <div className="no-data-icon">📊</div>
    <h3>No bills found</h3>
    <p>Try adjusting your filters to see more data.</p>
  </div>
);

// Category Bar Chart Component
const CategoryBarChart = ({ categoryChartData, currencySymbol = "₹" }) => (
  <div className="chart-container chart-half-width">
    <h3>💼 Expenses by Category</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={categoryChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${currencySymbol}${value}`, "Amount"]}
        />
        <Legend />
        <Bar dataKey="amount" fill="#14b8a6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Payment Method Pie Chart Component
const PaymentMethodPieChart = ({
  paymentMethodChartData,
  COLORS,
  currencySymbol = "₹",
}) => (
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
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${currencySymbol}${value}`, "Amount"]}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Daily/Periodic Trend Chart Component with navigation
const DailyTrendChart = ({
  dailyTrendData,
  timeframe,
  trendCursor,
  onPrev,
  onNext,
  currencySymbol = "₹",
  colors,
}) => (
  <div className="chart-container full-width">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <h3 style={{ margin: 0, color: colors.primary_text }}>Expense Trend</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="page-btn" onClick={onPrev}>
          Prev
        </button>
        <div
          style={{
            color: colors.secondary_text,
            fontSize: 14,
            width: 260,
            textAlign: "center",
          }}
        >
          {timeframe === "all" || timeframe === "year"
            ? trendCursor.getFullYear()
            : timeframe === "last_year"
            ? trendCursor.getFullYear() - 1
            : timeframe === "month"
            ? trendCursor.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })
            : timeframe === "week"
            ? (() => {
                const start = new Date(trendCursor);
                const end = new Date(trendCursor);
                end.setDate(end.getDate() + 6);
                return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
              })()
            : ""}
        </div>
        <button className="page-btn" onClick={onNext}>
          Next
        </button>
      </div>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={dailyTrendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            if (name === "average")
              return [
                `${currencySymbol}${Number(value).toFixed(2)}`,
                "Running Avg",
              ];
            return [`${currencySymbol}${value}`, "Amount"];
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="amount"
          name="Amount"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.3}
        />
        <Line
          type="monotone"
          dataKey="average"
          name="Running Avg"
          stroke="#ffb703"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

// Top Items Radial Chart Component
const TopItemsRadialChart = ({
  topItemsRadialData,
  renderRadialLabel,
  CustomRadialTooltip,
}) => (
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
);

// Top Items Bar Chart Component
const TopItemsBarChart = ({
  topItemsBarData,
  COLORS,
  currencySymbol = "₹",
}) => (
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
            `${currencySymbol}${value}`,
            "Amount",
            `Item: ${props.payload.fullName}`,
            `Quantity: ${props.payload.quantity}`,
          ]}
        />
        <Bar dataKey="amount" fill="#82ca9d" radius={[4, 4, 0, 0]}>
          {topItemsBarData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Bills Table Component
const BillsTable = ({ filteredBills, currencySymbol = "₹" }) => (
  <div className="bills-table-container mt-[30px]">
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
                  <strong title={bill.name}>{bill.name}</strong>
                  <small title={bill.description}>{bill.description}</small>
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
                {bill.type === "gain" ? "+" : "-"}
                {currencySymbol}
                {Math.abs(bill.amount).toFixed(2)}
              </td>
              <td>
                <span className={`payment-method ${bill.paymentMethod}`}>
                  {bill.paymentMethod === "creditNeedToPaid"
                    ? "Credit Due"
                    : bill.paymentMethod === "creditPaid"
                    ? "Credit Paid"
                    : bill.paymentMethod.toUpperCase()}
                </span>
              </td>
              <td>
                <div className="items-list">
                  {bill.expenses.map((expense, idx) => (
                    <div key={idx} className="expense-item">
                      {expense.itemName} ({currencySymbol}
                      {expense.totalPrice})
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
);

// Category Details Component
const CategoryDetails = ({ analytics, currencySymbol = "₹" }) => (
  <div className="category-details">
    <h3>📊 Category Breakdown</h3>
    <div className="category-grid">
      {Object.entries(analytics.categoryBreakdown).map(([category, data]) => {
        const stats = [
          {
            label: "Total Amount:",
            value: `${currencySymbol}${data.total.toFixed(2)}`,
          },
          { label: "Bills Count:", value: data.count },
          {
            label: "Avg per Bill:",
            value: `${currencySymbol}${
              data.count ? (data.total / data.count).toFixed(2) : "0.00"
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
      })}
    </div>
  </div>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="expense-report">
    <div className="expense-report-header">
      <div
        className="header-left"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <div
          className="skeleton-back-btn"
          style={{ transform: "translateY(-15px)" }}
        />
        <div>
          <div className="skeleton-title large" />
          <div
            className="skeleton-subtitle"
            style={{ marginTop: 6, width: 260 }}
          />
        </div>
      </div>
      <div className="expense-header-controls">
        <div className="skeleton-select" />
        <div className="skeleton-select" />
        <div className="skeleton-select" />
      </div>
    </div>

    <div className="summary-cards">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="summary-card-skeleton">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-text" />
            <div className="skeleton-number" />
          </div>
        </div>
      ))}
    </div>

    <div className="chart-report-grid">
      {/* Expenses by Category (Bar) */}
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner />
      </div>

      {/* Payment Methods (Pie/Donut) */}
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <PieChartSkeletonInner />
      </div>

      {/* Expense Trend (Line/Area) */}
      <div className="chart-container full-width">
        <div className="skeleton-title" />
        <LineAreaChartSkeletonInner />
      </div>

      {/* Top Expense Items (Radial) */}
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <RadialChartSkeletonInner />
      </div>

      {/* Top Expense Items (Bar) */}
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner />
      </div>
    </div>

    <TableSkeleton />
  </div>
);

// Main ExpenseReport Component
const ExpenseReport = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  // pagination for recent bills
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [reportActionAnchorEl, setReportActionAnchorEl] = useState(null);
  const [selectedReportAction, setSelectedReportAction] = useState(null);

  const dispatch = useDispatch();
  const allBills = useSelector((state) => state.bill.bills) || [];
  const loading = useSelector((state) => state.bill.loading);
  const { friendId } = useParams();
  const navigate = useNavigate();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const { colors, mode } = useTheme();

  const handleBack = () => {
    // Always go to bill root of current context
    if (friendId) {
      navigate(`/bill/${friendId}`);
    } else {
      navigate(`/bill`);
    }
  };

  useEffect(() => {
    dispatch(fetchAllBills(friendId ? friendId : null));
  }, [dispatch, friendId]);

  const handleReportActionClick = (event) => {
    setReportActionAnchorEl(event.currentTarget);
  };

  const handleReportActionClose = () => {
    setReportActionAnchorEl(null);
    setSelectedReportAction(null);
  };

  const handleReportMenuItemClick = (action) => {
    setSelectedReportAction(action);
    if (action === "refresh") {
      dispatch(fetchAllBills(friendId || ""));
    } else if (action === "export") {
      console.log("Export CSV requested");
    } else if (action === "pdf") {
      console.log("Download PDF requested");
    }
    handleReportActionClose();
  };

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

  const filteredBills = useMemo(() => {
    let filtered = [...allBills];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((bill) => bill.category === selectedCategory);
    }

    if (selectedTimeframe !== "all") {
      const now = new Date();

      filtered = filtered.filter((bill) => {
        const billDateTime = new Date(bill.date);

        switch (selectedTimeframe) {
          case "week": {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return billDateTime >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate()
            );
            return billDateTime >= monthAgo;
          }
          case "year": {
            // Current calendar year
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return billDateTime >= startOfYear;
          }
          case "last_year": {
            const lastYear = now.getFullYear() - 1;
            const startOfLastYear = new Date(lastYear, 0, 1);
            const endOfLastYear = new Date(lastYear, 11, 31, 23, 59, 59, 999);
            return (
              billDateTime >= startOfLastYear && billDateTime <= endOfLastYear
            );
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allBills, selectedCategory, selectedTimeframe]);

  // pagination logic for recent bills
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBills.length / itemsPerPage)
  );
  useEffect(() => {
    // reset to first page when filters change
    setCurrentPage(1);
  }, [filteredBills.length, selectedCategory, selectedTimeframe]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pagedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  const analytics = useMemo(() => {
    const totalExpenses = filteredBills.reduce(
      (sum, bill) => sum + Math.abs(bill.amount),
      0
    );
    const totalBills = filteredBills.length;
    const averageExpense = totalBills > 0 ? totalExpenses / totalBills : 0;

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

    const paymentMethodBreakdown = filteredBills.reduce((acc, bill) => {
      const method = bill.paymentMethod;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += Math.abs(bill.amount);
      return acc;
    }, {});

    const dailyExpenses = filteredBills.reduce((acc, bill) => {
      const date = bill.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Math.abs(bill.amount);
      return acc;
    }, {});

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

  // Trend navigation cursor - used for year/month/week navigation
  const [trendCursor, setTrendCursor] = useState(() => new Date());

  // helper: sample dates for a year -> pick 2-3 dates per month
  const pad = (n) => String(n).padStart(2, "0");
  const isoLocal = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const sampleYearly = (year) => {
    const samples = [];
    for (let m = 0; m < 12; m++) {
      // pick 2 dates per month: 1st and 15th (local dates, not UTC)
      samples.push(isoLocal(year, m, 1));
      samples.push(isoLocal(year, m, 15));
    }
    return samples;
  };

  // helper: for a month return every date in that month
  const sampleMonthly = (year, month) => {
    const s = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      s.push(isoLocal(year, month, d));
    }
    return s;
  };

  // helper: week starting at provided date -> 7 consecutive days
  const sampleWeekly = (startDate) => {
    const s = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      s.push(isoLocal(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return s;
  };

  // compute trend series depending on timeframe and trendCursor
  const dailyTrendData = useMemo(() => {
    const mapDateKey = (isoDate) => isoDate; // keys in analytics.dailyExpenses

    let points = [];

    if (selectedTimeframe === "all") {
      // year-wise sampling based on the year of trendCursor
      const y = trendCursor.getFullYear();
      const samples = sampleYearly(y);
      points = samples.map((iso) => {
        const amt = analytics.dailyExpenses[iso] || 0;
        return {
          date: new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount: amt,
        };
      });
    } else if (selectedTimeframe === "year") {
      const y = trendCursor.getFullYear();
      const samples = sampleYearly(y);
      points = samples.map((iso) => ({
        date: new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: analytics.dailyExpenses[iso] || 0,
      }));
    } else if (selectedTimeframe === "month") {
      const y = trendCursor.getFullYear();
      const m = trendCursor.getMonth();
      const samples = sampleMonthly(y, m);
      // show day numbers only for month view (user already knows the month)
      points = samples.map((iso) => ({
        date: new Date(iso).toLocaleDateString("en-US", { day: "numeric" }),
        amount: analytics.dailyExpenses[iso] || 0,
      }));
    } else if (selectedTimeframe === "week") {
      const start = new Date(trendCursor);
      start.setHours(0, 0, 0, 0);
      const samples = sampleWeekly(start);
      points = samples.map((iso) => ({
        date: new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: analytics.dailyExpenses[iso] || 0,
      }));
    } else {
      // fallback: use all points sorted (small set)
      points = Object.entries(analytics.dailyExpenses)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, amount]) => ({
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount,
        }));
    }

    // compute running average: at index i -> avg of amounts[0..i]
    let running = 0;
    return points.map((p, idx) => {
      running += Number(p.amount || 0);
      const avgRaw = running / (idx + 1);
      const average = Math.round(avgRaw * 100) / 100; // keep only 2 decimals
      return { ...p, average };
    });
  }, [analytics.dailyExpenses, selectedTimeframe, trendCursor]);

  // navigation handlers for trend cursor
  const handleTrendPrev = () => {
    const c = new Date(trendCursor);
    if (selectedTimeframe === "all" || selectedTimeframe === "year") {
      c.setFullYear(c.getFullYear() - 1);
    } else if (selectedTimeframe === "month") {
      c.setMonth(c.getMonth() - 1);
    } else if (selectedTimeframe === "week") {
      c.setDate(c.getDate() - 7);
    }
    setTrendCursor(c);
  };

  const handleTrendNext = () => {
    const c = new Date(trendCursor);
    if (selectedTimeframe === "all" || selectedTimeframe === "year") {
      c.setFullYear(c.getFullYear() + 1);
    } else if (selectedTimeframe === "month") {
      c.setMonth(c.getMonth() + 1);
    } else if (selectedTimeframe === "week") {
      c.setDate(c.getDate() + 7);
    }
    setTrendCursor(c);
  };

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

  const topItemsBarData = Object.entries(analytics.itemBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 8)
    .map(([item, data]) => ({
      name: item.length > 15 ? item.substring(0, 15) + "..." : item,
      fullName: item,
      amount: data.total,
      quantity: data.quantity,
    }));

  const renderRadialLabel = (entry) => {
    return `${currencySymbol}${entry.amount}`;
  };

  const CustomRadialTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.fullName}</p>
          <p className="tooltip-amount">
            Amount: {currencySymbol}
            {data.amount}
          </p>
          <p className="tooltip-quantity">Quantity: {data.quantity}</p>
          <p className="tooltip-percentage">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const uniqueCategories = [...new Set(allBills.map((bill) => bill.category))];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={`expense-report ${mode}`} style={{ position: "relative" }}>
      <ReportHeader
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        uniqueCategories={uniqueCategories}
        handleReportActionClick={handleReportActionClick}
        reportActionAnchorEl={reportActionAnchorEl}
        handleReportActionClose={handleReportActionClose}
        handleReportMenuItemClick={handleReportMenuItemClick}
        onBack={handleBack}
        colors={colors}
      />

      <FilterInfo
        filteredBills={filteredBills}
        allBills={allBills}
        selectedCategory={selectedCategory}
        selectedTimeframe={selectedTimeframe}
      />

      <SummaryCards analytics={analytics} />

      {filteredBills.length === 0 ? (
        <NoDataMessage />
      ) : (
        <>
          <div className="chart-report-grid">
            {categoryChartData.length > 0 && (
              <CategoryBarChart
                categoryChartData={categoryChartData}
                currencySymbol={currencySymbol}
              />
            )}

            {paymentMethodChartData.length > 0 && (
              <PaymentMethodPieChart
                paymentMethodChartData={paymentMethodChartData}
                COLORS={COLORS}
                currencySymbol={currencySymbol}
              />
            )}

            {dailyTrendData.length > 0 && (
              <DailyTrendChart
                dailyTrendData={dailyTrendData}
                timeframe={selectedTimeframe}
                trendCursor={trendCursor}
                onPrev={handleTrendPrev}
                onNext={handleTrendNext}
                currencySymbol={currencySymbol}
                colors={colors}
              />
            )}

            {topItemsRadialData.length > 0 && (
              <TopItemsRadialChart
                topItemsRadialData={topItemsRadialData}
                renderRadialLabel={renderRadialLabel}
                CustomRadialTooltip={CustomRadialTooltip}
              />
            )}

            {topItemsBarData.length > 0 && (
              <TopItemsBarChart
                topItemsBarData={topItemsBarData}
                COLORS={COLORS}
                currencySymbol={currencySymbol}
              />
            )}
          </div>

          <BillsTable
            filteredBills={pagedBills}
            currencySymbol={currencySymbol}
          />

          {/* pagination controls for recent bills */}
          {filteredBills.length > itemsPerPage && (
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>

              <div className="pages-list">
                {(() => {
                  const maxWindow = 2; // pages each side
                  const elems = [];

                  const push = (n) =>
                    elems.push(
                      <button
                        key={n}
                        className={`page-number ${
                          currentPage === n ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(n)}
                      >
                        {n}
                      </button>
                    );

                  push(1);

                  const left = Math.max(2, currentPage - maxWindow);
                  const right = Math.min(
                    totalPages - 1,
                    currentPage + maxWindow
                  );

                  if (left > 2)
                    elems.push(
                      <span key="l-ell" className="page-ellipsis">
                        ...
                      </span>
                    );

                  for (let p = left; p <= right; p++) push(p);

                  if (right < totalPages - 1)
                    elems.push(
                      <span key="r-ell" className="page-ellipsis">
                        ...
                      </span>
                    );

                  if (totalPages > 1) push(totalPages);

                  return elems;
                })()}
              </div>

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </button>
            </div>
          )}

          <CategoryDetails
            analytics={analytics}
            currencySymbol={currencySymbol}
          />
        </>
      )}
    </div>
  );
};

export default ExpenseReport;
