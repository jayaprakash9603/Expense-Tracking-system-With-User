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
import SpendingChartTooltip from "../../components/charts/SpendingChartTooltip";
import { CHART_THEME, TOOLTIP_CONFIG } from "../../config/chartConfig";
import "./BillReport.css";
import { fetchAllBills } from "../../Redux/Bill/bill.action";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useParams } from "react-router";
import usePreserveNavigationState from "../../hooks/usePreserveNavigationState";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";
import { formatDate } from "../../utils/dateFormatter";
import ReportHeader from "../../components/ReportHeader";
import ReportFilterDrawer from "../../components/reportFilters/ReportFilterDrawer";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";
import useBillReportFilters, {
  BILL_TIMEFRAME_OPTIONS,
  BILL_FLOW_TYPE_OPTIONS,
} from "../../hooks/reportFilters/useBillReportFilters";

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

const formatISODate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildTimeframeRange = (timeframe) => {
  const now = new Date();
  const startOfMonth = (base) =>
    new Date(base.getFullYear(), base.getMonth(), 1);
  const endOfMonth = (base) =>
    new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const startOfYear = (year) => new Date(year, 0, 1);
  const endOfYear = (year) => new Date(year, 11, 31);

  switch (timeframe) {
    case "this_month": {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return { label: "This Month", start, end };
    }
    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return { label: "Last Month", start, end };
    }
    case "this_year": {
      const year = now.getFullYear();
      return {
        label: "This Year",
        start: startOfYear(year),
        end: endOfYear(year),
      };
    }
    case "last_year": {
      const year = now.getFullYear() - 1;
      return {
        label: "Last Year",
        start: startOfYear(year),
        end: endOfYear(year),
      };
    }
    default:
      return { label: "All Time", start: null, end: null };
  }
};

const NoDataMessage = () => (
  <div className="no-data-message">
    <div className="no-data-icon">📊</div>
    <h3>No bills found</h3>
    <p>Try adjusting your filters to see more data.</p>
  </div>
);

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

const DailyTrendChart = ({
  dailyTrendData,
  timeframe,
  dateBounds,
  selectedType,
  currencySymbol = "₹",
  isCustomRangeActive = false,
}) => {
  const theme = CHART_THEME[selectedType === "gain" ? "gain" : "loss"];

  return (
    <div className="chart-container full-width">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Expense Trend</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              color: "#cccccc",
              fontSize: 14,
              width: 260,
              textAlign: "center",
            }}
          >
            {(() => {
              if (dateBounds?.start && dateBounds?.end) {
                return `${dateBounds.start.toLocaleDateString()} - ${dateBounds.end.toLocaleDateString()}`;
              }
              if (timeframe === "all" && !isCustomRangeActive) {
                return "All time";
              }
              return "";
            })()}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dailyTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="xLabel" />
          <YAxis />
          <Tooltip
            cursor={{
              stroke: theme.color,
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            content={(props) => (
              <SpendingChartTooltip
                {...props}
                selectedType={selectedType === "gain" ? "gain" : "loss"}
                timeframe={timeframe}
                config={TOOLTIP_CONFIG}
                theme={theme}
              />
            )}
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
};

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

const BillsTable = ({
  filteredBills,
  currencySymbol = "₹",
  dateFormat = "DD/MM/YYYY",
  selectedTimeframe,
  selectedType,
  timeframeLabel,
}) => {
  const tableSummaryParts = [];
  if (timeframeLabel) {
    tableSummaryParts.push(timeframeLabel);
  }
  if (selectedType && selectedType !== "all") {
    tableSummaryParts.push(
      selectedType === "gain" ? "showing gains" : "showing losses"
    );
  }

  return (
    <div className="chart-container full-width bills-table-container">
      <div className="table-header">
        <div>
          <h3>📋 Detailed Bills</h3>
          <p>
            {filteredBills.length} bill{filteredBills.length === 1 ? "" : "s"}
            {tableSummaryParts.length > 0 &&
              ` · ${tableSummaryParts.join(" · ")}`}
          </p>
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <div className="empty-state">
          <p>No bills available for the selected filters.</p>
        </div>
      ) : (
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
                  <td>{formatDate(bill.date, dateFormat)}</td>
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
                      {(bill.expenses || []).map((expense, idx) => (
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
      )}
    </div>
  );
};

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

const LoadingSkeleton = () => (
  <div className="bill-report">
    <div className="bill-report-header">
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
      <div className="bill-header-controls">
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
      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner />
      </div>

      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <PieChartSkeletonInner />
      </div>

      <div className="chart-container full-width">
        <div className="skeleton-title" />
        <LineAreaChartSkeletonInner />
      </div>

      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <RadialChartSkeletonInner />
      </div>

      <div className="chart-container chart-half-width">
        <div className="skeleton-title" />
        <BarChartSkeletonInner />
      </div>
    </div>

    <TableSkeleton />
  </div>
);

const BillReport = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("this_month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [customRange, setCustomRange] = useState(null);
  const timeframeRange = useMemo(
    () => buildTimeframeRange(selectedTimeframe),
    [selectedTimeframe]
  );
  const customDateBounds = useMemo(() => {
    if (!customRange?.fromDate || !customRange?.toDate) {
      return null;
    }
    const start = new Date(customRange.fromDate);
    const end = new Date(customRange.toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    return {
      label: "Custom Range",
      start,
      end,
    };
  }, [customRange]);
  const activeDateBounds = customDateBounds || timeframeRange;
  const isCustomRangeActive = Boolean(customDateBounds);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [reportActionAnchorEl, setReportActionAnchorEl] = useState(null);
  const [selectedReportAction, setSelectedReportAction] = useState(null);

  const dispatch = useDispatch();
  const allBills = useSelector((state) => state.bill.bills) || [];
  const loading = useSelector((state) => state.bill.loading);
  const { friendId } = useParams();
  const { navigateWithState } = usePreserveNavigationState();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Theme hook must be called unconditionally at top-level (before any early returns)
  const { colors, mode } = useTheme();

  const billQueryParams = useMemo(() => {
    const params = {};
    if (selectedType !== "all") {
      params.type = selectedType;
    }
    if (isCustomRangeActive && customRange?.fromDate && customRange?.toDate) {
      params.fromDate = customRange.fromDate;
      params.toDate = customRange.toDate;
    } else if (timeframeRange.start && timeframeRange.end) {
      params.fromDate = formatISODate(timeframeRange.start);
      params.toDate = formatISODate(timeframeRange.end);
    }
    return params;
  }, [selectedType, timeframeRange, isCustomRangeActive, customRange]);

  const handleTimeframeChange = (nextTimeframe) => {
    setSelectedTimeframe(nextTimeframe);
    setCustomRange(null);
  };

  const handleCustomRangeApply = (range) => {
    if (!range?.fromDate || !range?.toDate) {
      return;
    }
    setCustomRange({
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
  };

  const handleResetRange = () => {
    setCustomRange(null);
  };

  const dateRangeProps = {
    fromDate:
      customRange?.fromDate ||
      (timeframeRange.start ? formatISODate(timeframeRange.start) : ""),
    toDate:
      customRange?.toDate ||
      (timeframeRange.end ? formatISODate(timeframeRange.end) : ""),
    onApply: handleCustomRangeApply,
    onReset: handleResetRange,
  };

  const handleBack = () => {
    if (friendId) {
      navigateWithState(`/bill/${friendId}`);
    } else {
      navigateWithState(`/bill`);
    }
  };

  useEffect(() => {
    dispatch(fetchAllBills(friendId ? friendId : null, billQueryParams));
  }, [dispatch, friendId, billQueryParams]);

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
      dispatch(fetchAllBills(friendId ? friendId : null, billQueryParams));
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

  const {
    filterDefaults,
    drawerValues,
    sections,
    isFilterOpen,
    openFilters,
    closeFilters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
    filteredBills,
    uniqueCategories,
  } = useBillReportFilters({
    bills: allBills,
    timeframe: selectedTimeframe,
    flowType: selectedType,
    selectedCategory,
    setTimeframe: handleTimeframeChange,
    setFlowType: setSelectedType,
    setSelectedCategory,
    dateRange: customRange,
    setCustomDateRange: handleCustomRangeApply,
    resetDateRange: handleResetRange,
    isCustomRange: isCustomRangeActive,
    activeRange: activeDateBounds,
    timeframeOptions: BILL_TIMEFRAME_OPTIONS,
  });

  const categorySelectOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...uniqueCategories.map((category) => ({
        value: category,
        label: category,
      })),
    ],
    [uniqueCategories]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBills.length / itemsPerPage)
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBills.length, selectedCategory, selectedTimeframe, selectedType]);

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

  const overviewCardsData = useMemo(() => {
    const entries = Object.entries(analytics.categoryBreakdown || {}).map(
      ([category, data]) => ({
        name: category,
        amount: data.total,
        transactions: data.count,
      })
    );
    return entries.sort((a, b) => b.amount - a.amount);
  }, [analytics]);

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

  const dailyTrendData = useMemo(() => {
    const map = analytics.dailyExpenses || {};
    const points = [];

    const addPoint = (dateObj) => {
      const iso = formatISODate(dateObj);
      const amount = map[iso] || 0;
      points.push({ dateObj: new Date(dateObj), iso, amount });
    };

    if (activeDateBounds?.start && activeDateBounds?.end) {
      const cursor = new Date(activeDateBounds.start);
      const end = new Date(activeDateBounds.end);
      while (cursor <= end) {
        addPoint(cursor);
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      Object.keys(map)
        .sort((a, b) => new Date(a) - new Date(b))
        .forEach((iso) => addPoint(new Date(iso)));
    }
    const isYearLike =
      !isCustomRangeActive &&
      (selectedTimeframe === "this_year" ||
        selectedTimeframe === "last_year" ||
        selectedTimeframe === "all");

    let series = [];

    if (isYearLike) {
      // Aggregate by month for year/all views
      const buckets = points.reduce((acc, p) => {
        const y = p.dateObj.getFullYear();
        const m = p.dateObj.getMonth();
        const key = `${y}-${m}`;
        if (!acc[key]) {
          acc[key] = {
            year: y,
            month: m,
            amount: 0,
            count: 0,
          };
        }
        acc[key].amount += Number(p.amount || 0);
        acc[key].count += 1;
        return acc;
      }, {});

      series = Object.values(buckets)
        .sort((a, b) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        )
        .map((b) => {
          const monthDate = new Date(b.year, b.month, 1);
          const label = monthDate.toLocaleString("default", {
            month: "short",
            year: selectedTimeframe === "all" ? "numeric" : undefined,
          });
          return {
            xLabel: label,
            rawDate: formatISODate(monthDate),
            date: formatISODate(monthDate),
            amount: b.amount,
          };
        });
    } else {
      const formatter = (() => {
        if (
          selectedTimeframe === "this_month" ||
          selectedTimeframe === "last_month"
        ) {
          return (d) => d.getDate().toString();
        }
        return (d) =>
          d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      })();

      series = points.map((p) => ({
        ...p,
        xLabel: formatter(p.dateObj),
        rawDate: p.iso,
        date: p.iso,
        amount: p.amount,
      }));
    }

    let running = 0;
    return series.map((p, idx) => {
      running += Number(p.amount || 0);
      const avgRaw = running / (idx + 1);
      const average = Math.round(avgRaw * 100) / 100;
      return { ...p, average };
    });
  }, [
    analytics.dailyExpenses,
    selectedTimeframe,
    activeDateBounds,
    isCustomRangeActive,
  ]);

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

  const renderRadialLabel = (entry) => `${currencySymbol}${entry.amount}`;

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

  if (loading) {
    // Keep skeleton lightweight; optionally we could pass theme classes here.
    return <LoadingSkeleton />;
  }

  const reportHeaderActions = (
    <>
      <IconButton
        onClick={handleReportActionClick}
        sx={{ color: colors.secondary_accent }}
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
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "8px",
              boxShadow: `0 4px 20px rgba(0,0,0,${
                mode === "dark" ? 0.3 : 0.15
              })`,
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
    </>
  );

  return (
    <div
      className={`bill-report ${mode}`}
      style={{
        position: "relative",
        background: colors.secondary_bg,
        color: colors.primary_text,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <ReportHeader
        title="📊 Bill Report"
        subtitle="Spending overview and insights"
        timeframe={selectedTimeframe}
        flowType={selectedType}
        timeframeOptions={BILL_TIMEFRAME_OPTIONS}
        flowTypeOptions={BILL_FLOW_TYPE_OPTIONS}
        onBack={handleBack}
        onFilter={sections.length ? openFilters : undefined}
        onTimeframeChange={handleTimeframeChange}
        onFlowTypeChange={setSelectedType}
        showFilterButton={sections.length > 0}
        isFilterActive={filtersActive}
        dateRangeProps={dateRangeProps}
        isCustomRangeActive={isCustomRangeActive}
        extraSelects={[
          {
            id: "bill-category",
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: categorySelectOptions,
            ariaLabel: "Category",
          },
        ]}
        rightActions={reportHeaderActions}
        filterButtonLabel="Filters"
        showExportButton={false}
      />

      <SharedOverviewCards
        data={overviewCardsData}
        mode="category"
        currencySymbol={currencySymbol}
      />

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
                dateBounds={activeDateBounds}
                selectedType={selectedType}
                currencySymbol={currencySymbol}
                isCustomRangeActive={isCustomRangeActive}
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
            dateFormat={settings.dateFormat}
          />

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
      <ReportFilterDrawer
        open={isFilterOpen}
        onClose={closeFilters}
        sections={sections}
        values={drawerValues}
        initialValues={filterDefaults}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default BillReport;
