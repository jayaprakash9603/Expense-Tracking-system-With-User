import React, { useState, useEffect, useMemo } from "react";
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
  RadialBarChart,
  RadialBar,
  ComposedChart,
  ScatterChart,
  Scatter,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Skeleton,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Assessment,
  MonetizationOn,
  Warning,
  CheckCircle,
  Error,
  Info,
  ArrowBack,
  Download,
  FilterList,
  Share,
  Refresh,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart,
  Analytics,
  Speed,
  Schedule,
  CompareArrows,
  Insights,
  TrendingFlat,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDetailedBudgetReport } from "../../../Redux/Budget/budget.action";
import { useTheme } from "../../../hooks/useTheme";
import useUserSettings from "../../../hooks/useUserSettings";
import dayjs from "dayjs";
import "./BudgetReport.css";
import { Target } from "lucide-react";

const BudgetReport = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const { budgetId, friendId } = useParams();

  // State management
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);
  const [expenseData, setExpenseData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [budgetHealth, setBudgetHealth] = useState({});
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("overview");
  const [timeframe, setTimeframe] = useState("month");
  const [comparisonData, setComparisonData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [spendingPatterns, setSpendingPatterns] = useState([]);
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [hourlySpending, setHourlySpending] = useState([]);
  const [categoryTrends, setCategoryTrends] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expensesByDate, setExpensesByDate] = useState([]);
  const [expensesByPayment, setExpensesByPayment] = useState([]);
  const [detailedCategoryBreakdown, setDetailedCategoryBreakdown] = useState(
    []
  );

  // Pagination for detailed transactions table
  const [txPage, setTxPage] = useState(0);
  const [txRowsPerPage, setTxRowsPerPage] = useState(5);

  // DataGrid columns for detailed transactions
  const txColumns = useMemo(
    () => [
      { field: "date", headerName: "Date", flex: 1 },
      { field: "categoryName", headerName: "Category", flex: 1 },
      { field: "expenseName", headerName: "Expense", flex: 1.5 },
      { field: "paymentMethod", headerName: "Payment Method", flex: 1 },
      {
        field: "amount",
        headerName: `Amount (${currencySymbol})`,
        type: "number",
        flex: 0.8,
        headerAlign: "right",
        align: "right",
        valueGetter: (params) => {
          // Defensive: params or params.row may be undefined during rendering lifecycle
          const raw = params?.row?.amount ?? params?.value ?? 0;
          try {
            return Math.abs(Number(raw) || 0);
          } catch (e) {
            return 0;
          }
        },
      },
      { field: "comments", headerName: "Comments", flex: 1.2 },
    ],
    []
  );

  // Grid sizing (adjust these to change visual row/header/footer heights)
  const txRowHeight = 64; // px per row
  const txHeaderHeight = 56; // header
  const txFooterHeight = 52; // pagination/footer
  const txGridHeight = 4 * txRowHeight + txHeaderHeight + txFooterHeight - 48; // fit 5 rows

  // Responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Color schemes
  const colorScheme = {
    primary: "#00DAC6",
    secondary: "#5b7fff",
    success: "#06d6a0",
    warning: "#ffd54f",
    error: "#ff5252",
    info: "#29b6f6",
    background: "#0b0b0b",
    surface: "#1b1b1b",
    text: "#ffffff",
    textSecondary: "#b0b6c3",
  };

  const expenseColors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
    "#10ac84",
    "#ee5a24",
    "#0984e3",
    "#6c5ce7",
    "#a29bfe",
  ];

  // Fetch real budget data from backend
  const budgetState = useSelector((state) => state.budgets || {});
  const {
    detailedReport,
    loading: reportLoading,
    error: reportError,
  } = budgetState;

  useEffect(() => {
    if (budgetId) {
      setLoading(true);
      dispatch(getDetailedBudgetReport(budgetId, friendId));
    }
  }, [budgetId, friendId, dispatch]);

  useEffect(() => {
    if (detailedReport) {
      try {
        // Map BasicInfo and FinancialSummary to budgetData
        const mappedBudgetData = {
          id: detailedReport.budgetId,
          name: detailedReport.budgetName,
          amount: detailedReport.allocatedAmount,
          remainingAmount: detailedReport.remainingAmount,
          spentAmount: detailedReport.totalSpent,
          startDate: detailedReport.startDate,
          endDate: detailedReport.endDate,
          description: detailedReport.description,
          isValid: detailedReport.isValid,
          progress: detailedReport.percentageUsed,
          daysRemaining: detailedReport.daysRemaining,
          totalDays: detailedReport.totalDays,
          currency: currencySymbol,
          budgetType: "custom",
        };

        setBudgetData(mappedBudgetData);

        // Map CategoryBreakdown to expenseData with colors
        const mappedExpenseData =
          detailedReport.categoryBreakdown?.map((cat, index) => ({
            name: cat.categoryName,
            amount: cat.amount,
            percentage: cat.percentage,
            color: expenseColors[index % expenseColors.length],
            count: cat.transactionCount,
            avgPerTransaction: cat.averagePerTransaction,
            trend: 0,
            subcategories:
              cat.subcategories?.map((sub) => ({
                name: sub.name,
                amount: sub.amount,
                count: sub.count,
              })) || [],
          })) || [];

        setExpenseData(mappedExpenseData);
        setCategoryBreakdown(mappedExpenseData);
        setDetailedCategoryBreakdown(
          mappedExpenseData.map((cat) => ({
            category: cat.name,
            amount: cat.amount,
            transactions: cat.count,
            color: cat.color,
          }))
        );

        // Map PaymentMethodBreakdown
        const mappedPaymentMethodData =
          detailedReport.paymentMethodBreakdown?.map((pm, index) => ({
            name: pm.paymentMethod,
            amount: pm.amount,
            percentage: pm.percentage,
            color: expenseColors[(index + 5) % expenseColors.length],
            transactions: pm.transactionCount,
            avgTransaction: pm.amount / (pm.transactionCount || 1),
          })) || [];

        setPaymentMethodData(mappedPaymentMethodData);
        setExpensesByPayment(mappedPaymentMethodData);

        // Map DailySpending to timelineData
        const mappedTimelineData =
          detailedReport.dailySpending?.map((day) => ({
            date: dayjs(day.date).format("MMM DD"),
            spent: day.amount,
            day: dayjs(day.date).date(),
            isWeekend:
              dayjs(day.date).day() === 0 || dayjs(day.date).day() === 6,
          })) || [];

        setTimelineData(mappedTimelineData);
        setExpensesByDate(
          detailedReport.dailySpending?.map((day) => ({
            date: day.date,
            amount: day.amount,
          })) || []
        );

        // Map WeeklySpending
        const mappedWeeklyData =
          detailedReport.weeklySpending?.map((week) => ({
            week: week.week,
            spent: week.amount,
            budget: detailedReport.allocatedAmount / 4,
            efficiency:
              (week.amount / (detailedReport.allocatedAmount / 4)) * 100,
          })) || [];

        setWeeklyData(mappedWeeklyData);

        // Map Transactions
        const mappedTransactions =
          detailedReport.transactions?.map((tx, index) => ({
            id: tx.expenseId || index + 1,
            date: tx.date,
            categoryName: tx.categoryName,
            expenseName: tx.expenseName,
            paymentMethod: tx.paymentMethod,
            amount: tx.amount,
            comments: tx.comments || "",
          })) || [];

        setTransactions(mappedTransactions);

        // Map BudgetHealth
        const healthMetrics = detailedReport.healthMetrics || {};
        const mappedBudgetHealth = {
          status: healthMetrics.status || detailedReport.budgetStatus,
          statusColor:
            detailedReport.budgetStatus === "on-track"
              ? colorScheme.success
              : detailedReport.budgetStatus === "over-budget"
              ? colorScheme.error
              : colorScheme.warning,
          statusText:
            detailedReport.budgetStatus === "on-track"
              ? "On Track"
              : detailedReport.budgetStatus === "over-budget"
              ? "Over Budget"
              : "At Risk",
          spentPercentage: detailedReport.percentageUsed,
          healthPercentage: healthMetrics.paceScore || 0,
          paceScore: healthMetrics.paceScore || 0,
          riskLevel: detailedReport.riskLevel,
          burnRate: healthMetrics.burnRate || 0,
          projectedEndBalance: healthMetrics.projectedEndBalance || 0,
          velocityScore: healthMetrics.paceScore || 0,
        };

        setBudgetHealth(mappedBudgetHealth);

        // Map insights
        const mappedInsights =
          detailedReport.insights?.map((insight, index) => {
            let icon = Info;
            let color = colorScheme.info;
            let type = "info";

            if (
              insight.toLowerCase().includes("alert") ||
              insight.toLowerCase().includes("critical")
            ) {
              icon = Warning;
              color = colorScheme.error;
              type = "warning";
            } else if (
              insight.toLowerCase().includes("success") ||
              insight.toLowerCase().includes("good")
            ) {
              icon = CheckCircle;
              color = colorScheme.success;
              type = "success";
            } else if (insight.toLowerCase().includes("trend")) {
              icon = TrendingUp;
              color = colorScheme.secondary;
              type = "trend";
            }

            return {
              type,
              title: `Insight ${index + 1}`,
              message: insight,
              icon,
              color,
              priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
              actionable: true,
            };
          }) || [];

        setInsights(mappedInsights);

        // Generate derived data for charts (hourly, patterns, goals, etc.)
        // These are calculated from the real data
        const hourlyMap = {};
        mappedTransactions.forEach((tx) => {
          const hour = new Date(tx.date).getHours();
          if (!hourlyMap[hour]) hourlyMap[hour] = { amount: 0, count: 0 };
          hourlyMap[hour].amount += tx.amount;
          hourlyMap[hour].count += 1;
        });

        const mappedHourlySpending = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          amount: hourlyMap[i]?.amount || 0,
          transactions: hourlyMap[i]?.count || 0,
        }));

        setHourlySpending(mappedHourlySpending);

        // Category trends (simplified - you could expand with historical data)
        const mappedCategoryTrends = mappedExpenseData.map((cat) => ({
          category: cat.name,
          data: [{ month: "Current", amount: cat.amount }],
        }));

        setCategoryTrends(mappedCategoryTrends);

        // Spending patterns (derived from real data)
        const weekendSpending = mappedTimelineData
          .filter((d) => d.isWeekend)
          .reduce((sum, d) => sum + d.spent, 0);
        const weekdaySpending = mappedTimelineData
          .filter((d) => !d.isWeekend)
          .reduce((sum, d) => sum + d.spent, 0);

        const patterns = [];
        if (weekendSpending > weekdaySpending * 0.4) {
          patterns.push({
            pattern: "Weekend Spike",
            description: "Higher spending detected on weekends",
            impact: "medium",
            recommendation: "Consider weekend spending limits",
          });
        }

        setSpendingPatterns(patterns);

        // Forecast data (simple projection based on current pace)
        const dailyAverage = detailedReport.averageDailySpending || 0;
        const mappedForecastData = Array.from({ length: 7 }, (_, i) => ({
          day: dayjs()
            .add(i + 1, "day")
            .format("MMM DD"),
          predicted: dailyAverage,
          confidence: 85,
        }));

        setForecastData(mappedForecastData);

        // Comparison data (simplified - could be enhanced with historical data)
        const mappedComparisonData = mappedExpenseData.map((cat) => ({
          category: cat.name,
          current: cat.amount,
          previous: cat.amount * 0.9, // Placeholder
          change: 10,
          status: "increased",
        }));

        setComparisonData(mappedComparisonData);

        // Budget goals (simplified)
        const goals = [];
        if (
          detailedReport.projectedTotalSpending > detailedReport.allocatedAmount
        ) {
          goals.push({
            goal: "Stay Within Budget",
            target: detailedReport.allocatedAmount,
            current: detailedReport.totalSpent,
            progress: detailedReport.percentageUsed,
            status: "behind",
            deadline: detailedReport.endDate,
          });
        }

        setBudgetGoals(goals);

        setLoading(false);
      } catch (error) {
        console.error("Error mapping budget data:", error);
        setLoading(false);
      }
    }
  }, [detailedReport, currencySymbol, dispatch]);

  useEffect(() => {
    if (reportError) {
      console.error("Error fetching detailed report:", reportError);
      setLoading(false);
    }
  }, [reportError]);

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="budget-report-custom-tooltip">
          <p className="budget-report-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ₹${entry.value?.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Enhanced Custom Tooltip for complex charts
  const EnhancedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="budget-report-enhanced-tooltip">
          <div className="tooltip-header">
            <strong>{label}</strong>
          </div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <div
                  className="tooltip-color-indicator"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="tooltip-label">{entry.dataKey}:</span>
                <span className="tooltip-value">
                  ₹{entry.value?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Tab panel component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>{value === index && children}</div>
  );

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="budget-report-container">
      <div className="budget-report-header">
        <Skeleton
          variant="text"
          width={300}
          height={40}
          className="budget-report-skeleton"
        />
        <Skeleton
          variant="text"
          width={500}
          height={20}
          className="budget-report-skeleton"
        />
      </div>

      <div className="budget-report-overview-cards">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="budget-report-overview-card budget-report-skeleton"
          >
            <CardContent>
              <Skeleton
                variant="circular"
                width={60}
                height={60}
                className="budget-report-skeleton-icon"
              />
              <Skeleton
                variant="text"
                width={120}
                height={20}
                className="budget-report-skeleton-card-title"
              />
              <Skeleton
                variant="text"
                width={140}
                height={32}
                className="budget-report-skeleton-card-value"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="budget-report-charts-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card
            key={index}
            className="budget-report-chart-container budget-report-skeleton"
          >
            <CardContent>
              <Skeleton
                variant="text"
                width={250}
                height={24}
                className="budget-report-skeleton-chart-title"
              />
              <div className="budget-report-skeleton-chart-body">
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={300}
                  className="budget-report-skeleton"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  return (
    <div className="budget-report-container">
      {/* Enhanced Header */}
      <div className="budget-report-header">
        <div className="budget-report-header-content">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            className="budget-report-back-button"
          >
            Back
          </Button>
          <div className="budget-report-title-section">
            <Typography variant="h4" className="budget-report-title">
              {budgetData?.name} Report
            </Typography>
            <Typography variant="subtitle1" className="budget-report-subtitle">
              {dayjs(budgetData?.startDate).format(dateFormat)} -{" "}
              {dayjs(budgetData?.endDate).format(dateFormat)}
              <Chip
                label={budgetData?.budgetType}
                size="small"
                style={{
                  marginLeft: 8,
                  backgroundColor: colorScheme.primary,
                  color: "#fff",
                }}
              />
            </Typography>
          </div>
        </div>

        <div className="budget-report-header-actions">
          <div className="header-controls">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="timeframe-selector"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={() => {
                // Basic filter action placeholder — replace with real filter modal if needed
                console.log("Filter clicked for timeframe:", timeframe);
              }}
              className="control-btn"
            >
              <FilterList fontSize="small" />
              Filter
            </button>
            <button
              onClick={() => {
                // Basic export placeholder — implement CSV/PDF export as needed
                console.log("Export clicked for timeframe:", timeframe);
              }}
              className="control-btn"
            >
              <Download fontSize="small" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Budget Health Status */}
      <Card className="budget-report-health-status-card">
        <CardContent>
          <div className="budget-report-health-header">
            <div className="budget-report-health-info">
              <Typography variant="h6" className="budget-report-health-title">
                Budget Health Dashboard
              </Typography>
              <div className="health-status-chips">
                <Chip
                  label={budgetHealth.statusText}
                  style={{
                    backgroundColor: budgetHealth.statusColor,
                    color: budgetHealth.status === "warning" ? "#000" : "#fff",
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  label={`Velocity: ${Math.round(budgetHealth.velocityScore)}%`}
                  variant="outlined"
                  style={{ marginLeft: 8, color: "#fff", borderColor: "#fff" }}
                />
              </div>
            </div>
            <div className="budget-report-health-metrics">
              <div className="budget-report-metric">
                <Typography
                  variant="body2"
                  className="budget-report-metric-label"
                >
                  Days Remaining
                </Typography>
                <Typography variant="h6" className="budget-report-metric-value">
                  {budgetData?.daysRemaining}
                </Typography>
              </div>
              <div className="budget-report-metric">
                <Typography
                  variant="body2"
                  className="budget-report-metric-label"
                >
                  Burn Rate
                </Typography>
                <Typography variant="h6" className="budget-report-metric-value">
                  ₹{Math.round(budgetHealth.burnRate)}/day
                </Typography>
              </div>
              <div className="budget-report-metric">
                <Typography
                  variant="body2"
                  className="budget-report-metric-label"
                >
                  Efficiency
                </Typography>
                <Typography variant="h6" className="budget-report-metric-value">
                  {Math.round(budgetHealth.efficiency)}%
                </Typography>
              </div>
            </div>
          </div>

          <div className="budget-report-progress-section">
            <div className="budget-report-progress-info">
              <Typography variant="body2">
                ₹{budgetData?.spentAmount.toLocaleString()} of ₹
                {budgetData?.amount.toLocaleString()} spent
              </Typography>
              <Typography
                variant="body2"
                style={{ color: budgetHealth.statusColor }}
              >
                {budgetData?.progress}%
              </Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={budgetData?.progress}
              className="budget-report-budget-progress"
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#2a2a2a",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: budgetHealth.statusColor,
                  borderRadius: 4,
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Overview Cards */}
      <div className="budget-report-overview-cards">
        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.primary }}
              >
                <AccountBalanceWallet />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Total Budget
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  ₹{budgetData?.amount.toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: colorScheme.textSecondary }}
                >
                  {budgetData?.currency} • {budgetData?.budgetType}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.error }}
              >
                <MonetizationOn />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Amount Spent
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  ₹{budgetData?.spentAmount.toLocaleString()}
                </Typography>
                <div className="budget-report-trend up">
                  <TrendingUp fontSize="small" />
                  <span>{budgetData?.progress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.success }}
              >
                <Assessment />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Remaining
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  ₹{budgetData?.remainingAmount.toLocaleString()}
                </Typography>
                <div className="budget-report-trend down">
                  <TrendingDown fontSize="small" />
                  <span>{100 - budgetData?.progress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.warning }}
              >
                <Warning />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Projected Spend
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  ₹{Math.round(budgetHealth.projectedSpend).toLocaleString()}
                </Typography>
                <div
                  className={`budget-report-trend ${
                    budgetHealth.projectedSpend > budgetData?.amount
                      ? "up"
                      : "down"
                  }`}
                >
                  {budgetHealth.projectedSpend > budgetData?.amount ? (
                    <TrendingUp fontSize="small" />
                  ) : (
                    <TrendingDown fontSize="small" />
                  )}
                  <span>
                    {Math.round(
                      (budgetHealth.projectedSpend / budgetData?.amount) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.info }}
              >
                <Speed />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Avg Daily Spend
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  ₹{Math.round(budgetHealth.burnRate).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: colorScheme.textSecondary }}
                >
                  Last {budgetData?.totalDays - budgetData?.daysRemaining} days
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="budget-report-overview-card">
          <CardContent>
            <div className="budget-report-card-header">
              <Avatar
                className="budget-report-card-icon"
                style={{ backgroundColor: colorScheme.secondary }}
              >
                <Target />
              </Avatar>
              <div className="budget-report-card-content">
                <Typography
                  variant="body2"
                  className="budget-report-card-title"
                >
                  Budget Efficiency
                </Typography>
                <Typography variant="h5" className="budget-report-card-value">
                  {Math.round(budgetHealth.efficiency)}%
                </Typography>
                <div
                  className={`budget-report-trend ${
                    budgetHealth.efficiency > 50 ? "up" : "down"
                  }`}
                >
                  {budgetHealth.efficiency > 50 ? (
                    <TrendingUp fontSize="small" />
                  ) : (
                    <TrendingDown fontSize="small" />
                  )}
                  <span>Efficiency Score</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card className="budget-report-tabs-container">
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          className="budget-report-tabs"
        >
          <Tab icon={<PieChartIcon />} label="Categories" />
          <Tab icon={<Timeline />} label="Timeline" />
          <Tab icon={<CompareArrows />} label="Comparison" />
          <Tab icon={<ShowChart />} label="Forecast" />
          <Tab icon={<Analytics />} label="Patterns" />
          <Tab icon={<MonetizationOn />} label="Expenses" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Categories Tab */}
        <div className="budget-report-charts-grid">
          {/* Expense Category Breakdown */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <PieChartIcon style={{ marginRight: 8 }} />
                Expense Categories
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Breakdown by category with spending amounts
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={140}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance with Budget Variance */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <BarChartIcon style={{ marginRight: 8 }} />
                Budget vs Actual by Category
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Compare budgeted amounts with actual spending
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                      dataKey="name"
                      stroke="#b0b6c3"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#b0b6c3" />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="budgetAllocated"
                      fill={colorScheme.primary}
                      name="Budget"
                      opacity={0.7}
                    />
                    <Bar
                      dataKey="amount"
                      fill={colorScheme.error}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke={colorScheme.warning}
                      name="Trend %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Detailed Breakdown Table */}
          <Card
            className="budget-report-breakdown-table"
            style={{ gridColumn: "span 2" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-section-title">
                Detailed Category Breakdown
              </Typography>
              <div className="budget-report-table-container">
                <div className="budget-report-table-header">
                  <div className="budget-report-table-cell">Category</div>
                  <div className="budget-report-table-cell">Amount</div>
                  <div className="budget-report-table-cell">Budget</div>
                  <div className="budget-report-table-cell">Variance</div>
                  <div className="budget-report-table-cell">Transactions</div>
                  <div className="budget-report-table-cell">
                    Avg/Transaction
                  </div>
                  <div className="budget-report-table-cell">Trend</div>
                </div>
                {expenseData.map((category, index) => (
                  <div key={index} className="budget-report-table-row">
                    <div className="budget-report-table-cell">
                      <div className="budget-report-category-info">
                        <div
                          className="budget-report-category-color"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </div>
                    <div className="budget-report-table-cell">
                      ₹{category.amount.toLocaleString()}
                    </div>
                    <div className="budget-report-table-cell">
                      ₹{category.budgetAllocated.toLocaleString()}
                    </div>
                    <div className="budget-report-table-cell">
                      <span
                        style={{
                          color:
                            category.variance > 0
                              ? colorScheme.error
                              : colorScheme.success,
                        }}
                      >
                        {category.variance > 0 ? "+" : ""}₹
                        {category.variance.toLocaleString()}
                      </span>
                    </div>
                    <div className="budget-report-table-cell">
                      {category.count}
                    </div>
                    <div className="budget-report-table-cell">
                      ₹{Math.round(category.avgPerTransaction).toLocaleString()}
                    </div>
                    <div className="budget-report-table-cell">
                      <div
                        className={`trend-indicator ${
                          category.trend > 0 ? "positive" : "negative"
                        }`}
                      >
                        {category.trend > 0 ? <TrendingUp /> : <TrendingDown />}
                        <span>{Math.abs(category.trend).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Timeline Tab */}
        <div className="budget-report-charts-grid">
          {/* Daily Spending Timeline */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 2" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Timeline style={{ marginRight: 8 }} />
                Daily Spending Timeline
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Daily expenses vs budget allocation with cumulative view
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" stroke="#b0b6c3" />
                    <YAxis stroke="#b0b6c3" />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      fill={colorScheme.primary}
                      fillOpacity={0.3}
                      stroke={colorScheme.primary}
                      name="Cumulative Spent"
                    />
                    <Bar
                      dataKey="spent"
                      fill={colorScheme.secondary}
                      name="Daily Spent"
                    />
                    <Line
                      type="monotone"
                      dataKey="budget"
                      stroke={colorScheme.warning}
                      strokeDasharray="5 5"
                      name="Daily Budget"
                    />
                    <ReferenceLine
                      y={budgetData?.amount}
                      stroke={colorScheme.error}
                      strokeDasharray="8 8"
                      label="Total Budget"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Spending Pattern */}
          <Card className="budget-report-chart-container">
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Schedule style={{ marginRight: 8 }} />
                Weekly Spending Pattern
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Weekly breakdown with efficiency metrics
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="week" stroke="#b0b6c3" />
                    <YAxis yAxisId="left" stroke="#b0b6c3" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#b0b6c3"
                    />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="spent"
                      fill={colorScheme.error}
                      name="Spent"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="budget"
                      fill={colorScheme.primary}
                      name="Budget"
                      opacity={0.7}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      stroke={colorScheme.warning}
                      name="Efficiency %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Spending Heatmap */}
          <Card className="budget-report-chart-container">
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Analytics style={{ marginRight: 8 }} />
                Hourly Spending Pattern
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                24-hour spending distribution
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={hourlySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                      dataKey="hour"
                      stroke="#b0b6c3"
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis stroke="#b0b6c3" />
                    <Tooltip
                      content={<EnhancedTooltip />}
                      labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={colorScheme.info}
                      fill={colorScheme.info}
                      fillOpacity={0.6}
                      name="Hourly Spending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Comparison Tab */}
        <div className="budget-report-charts-grid">
          {/* Period Comparison */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 2" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <CompareArrows style={{ marginRight: 8 }} />
                Current vs Previous Period
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Compare spending with previous month
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis type="number" stroke="#b0b6c3" />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="#b0b6c3"
                      width={120}
                    />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="previous"
                      fill={colorScheme.secondary}
                      name="Previous Period"
                      opacity={0.7}
                    />
                    <Bar
                      dataKey="current"
                      fill={colorScheme.primary}
                      name="Current Period"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Change Analysis */}
          <Card className="budget-report-chart-container">
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <TrendingUp style={{ marginRight: 8 }} />
                Change Analysis
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Percentage change by category
              </Typography>
              <div className="budget-report-chart-body">
                <div className="comparison-list">
                  {comparisonData.map((item, index) => (
                    <div key={index} className="comparison-item">
                      <div className="comparison-category">
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          {item.category}
                        </Typography>
                      </div>
                      <div className="comparison-change">
                        <Chip
                          label={`${
                            item.change > 0 ? "+" : ""
                          }${item.change.toFixed(1)}%`}
                          size="small"
                          style={{
                            backgroundColor:
                              item.change > 0
                                ? colorScheme.error
                                : colorScheme.success,
                            color: "#fff",
                            fontWeight: "bold",
                          }}
                          icon={
                            item.change > 0 ? <TrendingUp /> : <TrendingDown />
                          }
                        />
                      </div>
                      <div className="comparison-amounts">
                        <Typography
                          variant="caption"
                          style={{ color: colorScheme.textSecondary }}
                        >
                          ₹{item.previous.toLocaleString()} → ₹
                          {item.current.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Forecast Tab */}
        <div className="budget-report-charts-grid">
          {/* Spending Forecast */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 3" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <ShowChart style={{ marginRight: 8 }} />
                7-Day Spending Forecast
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Predicted spending based on historical patterns
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="day" stroke="#b0b6c3" />
                    <YAxis yAxisId="left" stroke="#b0b6c3" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#b0b6c3"
                    />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="predicted"
                      fill={colorScheme.info}
                      fillOpacity={0.4}
                      stroke={colorScheme.info}
                      name="Predicted Spending"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="confidence"
                      stroke={colorScheme.warning}
                      strokeDasharray="5 5"
                      name="Confidence %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget Projection */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Timeline style={{ marginRight: 8 }} />
                Budget Projection
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                End-of-period budget status prediction
              </Typography>
              <div className="budget-report-chart-body">
                <div className="forecast-metrics">
                  <div className="forecast-metric">
                    <Typography
                      variant="h4"
                      style={{ color: colorScheme.primary }}
                    >
                      ₹
                      {Math.round(budgetHealth.projectedSpend).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ color: colorScheme.textSecondary }}
                    >
                      Projected Total Spend
                    </Typography>
                  </div>
                  <div className="forecast-metric">
                    <Typography
                      variant="h4"
                      style={{
                        color:
                          budgetHealth.projectedSpend > budgetData?.amount
                            ? colorScheme.error
                            : colorScheme.success,
                      }}
                    >
                      ₹
                      {Math.abs(
                        budgetData?.amount - budgetHealth.projectedSpend
                      ).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ color: colorScheme.textSecondary }}
                    >
                      {budgetHealth.projectedSpend > budgetData?.amount
                        ? "Over Budget"
                        : "Under Budget"}
                    </Typography>
                  </div>
                  <div className="forecast-metric">
                    <Typography
                      variant="h4"
                      style={{ color: colorScheme.warning }}
                    >
                      {Math.round(
                        (budgetHealth.projectedSpend / budgetData?.amount) * 100
                      )}
                      %
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ color: colorScheme.textSecondary }}
                    >
                      Budget Utilization
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Analysis */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 2" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Analytics style={{ marginRight: 8 }} />
                Scenario Analysis
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                What-if scenarios for remaining period
              </Typography>
              <div className="budget-report-chart-body">
                <div className="scenario-list">
                  {[
                    {
                      scenario: "Conservative",
                      dailySpend: budgetHealth.burnRate * 0.8,
                      color: colorScheme.success,
                    },
                    {
                      scenario: "Current Pace",
                      dailySpend: budgetHealth.burnRate,
                      color: colorScheme.warning,
                    },
                    {
                      scenario: "Aggressive",
                      dailySpend: budgetHealth.burnRate * 1.2,
                      color: colorScheme.error,
                    },
                  ].map((item, index) => {
                    const projectedTotal =
                      budgetData?.spentAmount +
                      item.dailySpend * budgetData?.daysRemaining;
                    return (
                      <div key={index} className="scenario-item">
                        <div className="scenario-header">
                          <Typography
                            variant="subtitle2"
                            style={{ color: item.color }}
                          >
                            {item.scenario}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ color: colorScheme.textSecondary }}
                          >
                            ₹{Math.round(item.dailySpend)}/day
                          </Typography>
                        </div>
                        <div className="scenario-result">
                          <Typography variant="h6">
                            ₹{Math.round(projectedTotal).toLocaleString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{
                              color:
                                projectedTotal > budgetData?.amount
                                  ? colorScheme.error
                                  : colorScheme.success,
                            }}
                          >
                            {projectedTotal > budgetData?.amount
                              ? "Over"
                              : "Under"}{" "}
                            by ₹
                            {Math.abs(
                              budgetData?.amount - projectedTotal
                            ).toLocaleString()}
                          </Typography>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Insights Section */}
          <Card
            className="budget-report-insights-section"
            style={{ gridColumn: "span 3" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-section-title">
                <Insights style={{ marginRight: 8 }} />
                AI-Powered Insights & Recommendations
              </Typography>
              <div className="budget-report-insights-grid">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`budget-report-insight-card priority-${insight.priority}`}
                  >
                    <div className="budget-report-insight-header">
                      <Avatar
                        className="budget-report-insight-icon"
                        style={{ backgroundColor: insight.color }}
                      >
                        <insight.icon />
                      </Avatar>
                      <div className="insight-title-section">
                        <Typography
                          variant="subtitle1"
                          className="budget-report-insight-title"
                        >
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.priority}
                          size="small"
                          style={{
                            backgroundColor:
                              insight.priority === "high"
                                ? colorScheme.error
                                : insight.priority === "medium"
                                ? colorScheme.warning
                                : colorScheme.success,
                            color: "#fff",
                            fontSize: "10px",
                          }}
                        />
                      </div>
                    </div>
                    <Typography
                      variant="body2"
                      className="budget-report-insight-message"
                    >
                      {insight.message}
                    </Typography>
                    {insight.actionable && (
                      <div className="insight-suggestion">
                        <Typography
                          variant="caption"
                          style={{ color: colorScheme.info }}
                        >
                          💡 {insight.suggestion}
                        </Typography>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* Patterns Tab */}
        <div className="budget-report-charts-grid">
          {/* Spending Patterns */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 3" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Analytics style={{ marginRight: 8 }} />
                Spending Patterns Analysis
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Identified patterns in your spending behavior
              </Typography>
              <div className="budget-report-chart-body">
                <div className="patterns-grid">
                  {spendingPatterns.map((pattern, index) => (
                    <div key={index} className="pattern-card">
                      <div className="pattern-header">
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 600 }}
                        >
                          {pattern.pattern}
                        </Typography>
                        <Chip
                          label={pattern.impact}
                          size="small"
                          style={{
                            backgroundColor:
                              pattern.impact === "high"
                                ? colorScheme.error
                                : pattern.impact === "medium"
                                ? colorScheme.warning
                                : colorScheme.success,
                            color: "#fff",
                          }}
                        />
                      </div>
                      <Typography
                        variant="body2"
                        style={{
                          margin: "8px 0",
                          color: colorScheme.textSecondary,
                        }}
                      >
                        {pattern.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        style={{ color: colorScheme.info }}
                      >
                        💡 {pattern.recommendation}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Scatter Plot */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 2" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <ShowChart style={{ marginRight: 8 }} />
                Transaction Analysis
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Amount vs frequency by category
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                      dataKey="count"
                      stroke="#b0b6c3"
                      name="Transaction Count"
                      label={{
                        value: "Transaction Count",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      dataKey="amount"
                      stroke="#b0b6c3"
                      name="Amount"
                      label={{
                        value: "Amount (₹)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Scatter
                      data={expenseData}
                      fill={colorScheme.primary}
                      name="Categories"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Efficiency */}
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "span 1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Assessment style={{ marginRight: 8 }} />
                Payment Method Efficiency
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Cashback and fees analysis
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#b0b6c3" />
                    <YAxis stroke="#b0b6c3" />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="cashback"
                      fill={colorScheme.success}
                      name="Cashback Earned"
                    />
                    <Bar
                      dataKey="fees"
                      fill={colorScheme.error}
                      name="Fees Paid"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        {/* Expenses Tab */}
        <div className="budget-report-charts-grid">
          <Card
            className="budget-report-chart-container"
            style={{ gridColumn: "1 / -1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-chart-title">
                <Timeline style={{ marginRight: 8 }} />
                Expenses Over Time
              </Typography>
              <Typography
                variant="body2"
                className="budget-report-chart-subtitle"
              >
                Daily expense totals from transactions
              </Typography>
              <div className="budget-report-chart-body">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={expensesByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" stroke="#b0b6c3" />
                    <YAxis stroke="#b0b6c3" />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={colorScheme.error}
                      fill={colorScheme.error}
                      fillOpacity={0.3}
                      name="Daily Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Make these two charts share a full-width row and split it 50/50 */}
          <div className="two-column-split">
            <Card className="budget-report-chart-container">
              <CardContent>
                <Typography variant="h6" className="budget-report-chart-title">
                  <Assessment style={{ marginRight: 8 }} />
                  Expenses by Payment Method
                </Typography>
                <Typography
                  variant="body2"
                  className="budget-report-chart-subtitle"
                >
                  Distribution across payment methods
                </Typography>
                <div className="budget-report-chart-body">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={expensesByPayment}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill={colorScheme.primary}
                        label
                      >
                        {expensesByPayment.map((entry, i) => (
                          <Cell key={`cell-pm-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<EnhancedTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="budget-report-chart-container">
              <CardContent>
                <Typography variant="h6" className="budget-report-chart-title">
                  <BarChartIcon style={{ marginRight: 8 }} />
                  Category Breakdown (Detailed)
                </Typography>
                <Typography
                  variant="body2"
                  className="budget-report-chart-subtitle"
                >
                  Amount and transaction counts by category
                </Typography>
                <div className="budget-report-chart-body">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={detailedCategoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="category" stroke="#b0b6c3" />
                      <YAxis stroke="#b0b6c3" />
                      <Tooltip content={<EnhancedTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        fill={colorScheme.primary}
                        name="Amount"
                      />
                      <Bar
                        dataKey="transactions"
                        fill={colorScheme.secondary}
                        name="Transactions"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card
            className="budget-report-breakdown-table"
            style={{ gridColumn: "1 / -1" }}
          >
            <CardContent>
              <Typography variant="h6" className="budget-report-section-title">
                Detailed Transactions
              </Typography>
              <div className="budget-report-table-container">
                {/* DataGrid fixed to show 5 rows by default; height computed from constants */}
                <div style={{ height: txGridHeight, width: "100%" }}>
                  <DataGrid
                    rows={transactions.map((tx) => ({
                      id: tx.id,
                      date: tx.date,
                      categoryName: tx.categoryName,
                      expenseName: tx.expense?.expenseName,
                      paymentMethod: tx.expense?.paymentMethod,
                      amount: Math.abs(
                        tx.expense?.netAmount || tx.expense?.amount || 0
                      ),
                      comments: tx.expense?.comments,
                    }))}
                    columns={txColumns}
                    pageSizeOptions={[5, 10, 25, 50]}
                    paginationModel={{ page: txPage, pageSize: txRowsPerPage }}
                    onPaginationModelChange={(model) => {
                      if (model.pageSize !== txRowsPerPage) {
                        setTxRowsPerPage(model.pageSize);
                        setTxPage(0);
                      } else if (model.page !== txPage) {
                        setTxPage(model.page);
                      }
                    }}
                    disableRowSelectionOnClick
                    density="compact"
                    rowHeight={txRowHeight}
                    headerHeight={txHeaderHeight}
                    sx={{
                      backgroundColor: colors.secondary_bg,
                      color: colors.primary_text,
                      "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.secondary_bg,
                      },
                      "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.primary_bg,
                        color: colors.primary_text,
                      },
                      "& .MuiTablePagination-root": {
                        color: colors.primary_text,
                      },
                      "& .MuiSvgIcon-root": {
                        color: colors.primary_text,
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>
    </div>
  );
};

export default BudgetReport;
