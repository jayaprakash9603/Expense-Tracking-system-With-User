import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import FlightIcon from "@mui/icons-material/Flight";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CategoryIcon from "@mui/icons-material/Category";
import dayjs from "dayjs";

import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../../components/PageHeader";
import CustomDataTable from "../../components/common/CustomDataTable";
import CategoryAnalyticsSkeleton from "../../components/skeletons/CategoryAnalyticsSkeleton";
import {
  AnalyticsKPICard,
  BudgetStatusCard,
  InsightsPanel,
  ExpenseHighlightCard,
  MonthlyTrendChart,
  PaymentDistributionChart,
} from "../../components/analytics";
import {
  fetchCategoryAnalytics,
  clearCategoryAnalytics,
} from "../../Redux/Category/categoryActions";

// Category icon mapping
const getCategoryIcon = (categoryName, size = 32, color = "#00DAC6") => {
  const name = (categoryName || "").toLowerCase();
  const iconProps = { sx: { fontSize: size, color } };

  if (name.includes("food") || name.includes("dining") || name.includes("restaurant")) {
    return <RestaurantIcon {...iconProps} />;
  }
  if (name.includes("shopping") || name.includes("retail")) {
    return <ShoppingCartIcon {...iconProps} />;
  }
  if (name.includes("transport") || name.includes("car") || name.includes("fuel")) {
    return <DirectionsCarIcon {...iconProps} />;
  }
  if (name.includes("home") || name.includes("rent") || name.includes("utilities")) {
    return <HomeIcon {...iconProps} />;
  }
  if (name.includes("health") || name.includes("medical") || name.includes("hospital")) {
    return <LocalHospitalIcon {...iconProps} />;
  }
  if (name.includes("education") || name.includes("school") || name.includes("course")) {
    return <SchoolIcon {...iconProps} />;
  }
  if (name.includes("travel") || name.includes("flight") || name.includes("vacation")) {
    return <FlightIcon {...iconProps} />;
  }
  if (name.includes("entertainment") || name.includes("game") || name.includes("movie")) {
    return <SportsEsportsIcon {...iconProps} />;
  }
  if (name.includes("bill") || name.includes("subscription")) {
    return <ReceiptIcon {...iconProps} />;
  }
  return <CategoryIcon {...iconProps} />;
};

// Trend type options
const TREND_TYPE_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

// Date range presets
const DATE_RANGE_PRESETS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

const CategoryAnalyticsView = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categoryId, friendId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Refs to prevent duplicate API calls
  const hasFetchedRef = useRef(false);
  const currentRequestRef = useRef(null); // Track current request params

  // Local state for filters
  const [trendType, setTrendType] = useState(searchParams.get("trendType") || "MONTHLY");
  const [dateRangePreset, setDateRangePreset] = useState("6m");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Redux state
  const {
    categoryAnalytics,
    categoryAnalyticsLoading,
    categoryAnalyticsError,
  } = useSelector((state) => state.categories || {});

  const { dateFormat } = useSelector((state) => state.userSettings || {});
  const displayDateFormat = dateFormat || "DD/MM/YYYY";

  // Calculate date range based on preset - memoized to prevent recalculation
  const dateRange = useMemo(() => {
    const now = dayjs();
    let startDate, endDate;

    switch (dateRangePreset) {
      case "7d":
        startDate = now.subtract(7, "day");
        endDate = now;
        break;
      case "30d":
        startDate = now.subtract(30, "day");
        endDate = now;
        break;
      case "3m":
        startDate = now.subtract(3, "month");
        endDate = now;
        break;
      case "6m":
        startDate = now.subtract(6, "month");
        endDate = now;
        break;
      case "1y":
        startDate = now.subtract(1, "year");
        endDate = now;
        break;
      case "custom":
        startDate = customStartDate ? dayjs(customStartDate) : now.subtract(6, "month");
        endDate = customEndDate ? dayjs(customEndDate) : now;
        break;
      default:
        startDate = now.subtract(6, "month");
        endDate = now;
    }

    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Initial load - runs only once when component mounts
  useEffect(() => {
    // Create a unique key for this request
    const requestKey = `${categoryId}-${friendId}-${dateRange.startDate}-${dateRange.endDate}-${trendType}`;
    
    // Only fetch if we haven't fetched yet OR if the categoryId changed
    if (categoryId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      currentRequestRef.current = requestKey;
      
      dispatch(
        fetchCategoryAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType,
          targetId: friendId,
        })
      );
    }

    // Cleanup on unmount
    return () => {
      hasFetchedRef.current = false;
      currentRequestRef.current = null;
      dispatch(clearCategoryAnalytics());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, friendId]);

  // Handle filter changes - explicit user action triggers
  const handleTrendTypeChange = (newTrendType) => {
    setTrendType(newTrendType);
    if (categoryId) {
      dispatch(
        fetchCategoryAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType: newTrendType,
          targetId: friendId,
        })
      );
    }
  };

  const handleDateRangeChange = (newPreset) => {
    setDateRangePreset(newPreset);
    // For non-custom presets, trigger reload immediately
    if (newPreset !== "custom" && categoryId) {
      const now = dayjs();
      let startDate, endDate = now;
      switch (newPreset) {
        case "7d": startDate = now.subtract(7, "day"); break;
        case "30d": startDate = now.subtract(30, "day"); break;
        case "3m": startDate = now.subtract(3, "month"); break;
        case "6m": startDate = now.subtract(6, "month"); break;
        case "1y": startDate = now.subtract(1, "year"); break;
        default: startDate = now.subtract(6, "month");
      }
      dispatch(
        fetchCategoryAnalytics(categoryId, {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
          trendType,
          targetId: friendId,
        })
      );
    }
  };

  const handleCustomDateApply = () => {
    if (categoryId && customStartDate && customEndDate) {
      dispatch(
        fetchCategoryAnalytics(categoryId, {
          startDate: customStartDate,
          endDate: customEndDate,
          trendType,
          targetId: friendId,
        })
      );
    }
  };

  // Fetch analytics data - called manually for refresh
  const handleRefresh = () => {
    if (categoryId) {
      dispatch(
        fetchCategoryAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType,
          targetId: friendId,
        })
      );
    }
  };

  // Update URL params when trendType changes - use replace to avoid history issues
  useEffect(() => {
    const currentTrendType = searchParams.get("trendType");
    if (trendType !== "MONTHLY" && currentTrendType !== trendType) {
      setSearchParams({ trendType }, { replace: true });
    } else if (trendType === "MONTHLY" && currentTrendType) {
      setSearchParams({}, { replace: true });
    }
  }, [trendType, searchParams, setSearchParams]);

  const handleOnClose = () => {
    navigate(-1);
  };

  const formatCurrency = (amount) => {
    if (amount == null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format(displayDateFormat);
  };

  // Container styles
  const containerStyle = {
    width: "calc(100vw - 370px)",
    height: "calc(100vh - 100px)",
    backgroundColor: colors.secondary_bg,
    borderRadius: "8px",
    marginRight: "20px",
    border: `1px solid ${colors.border_color}`,
    padding: "16px 24px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  // Transaction table columns
  const transactionColumns = useMemo(
    () => [
      {
        field: "expenseName",
        label: "Expense",
        sortable: true,
        width: "25%",
        tooltip: true,
        bold: true,
      },
      {
        field: "amount",
        label: "Amount",
        sortable: true,
        width: "15%",
        sortType: "number",
        bold: true,
        getColor: (row) => (row.type === "CREDIT" ? "#52c41a" : "#ff4d4f"),
        render: (row) => formatCurrency(row.amount),
      },
      {
        field: "date",
        label: "Date",
        sortable: true,
        width: "15%",
        sortType: "date",
        render: (row) => formatDate(row.date),
      },
      {
        field: "paymentMethodName",
        label: "Payment Method",
        sortable: true,
        width: "20%",
      },
      {
        field: "description",
        label: "Description",
        sortable: false,
        width: "25%",
        tooltip: true,
        getColor: () => colors.secondary_text,
      },
    ],
    [colors, formatDate, formatCurrency]
  );

  // Extract data from analytics response (with defaults for when data is not available)
  const {
    categoryMetadata = null,
    summaryStatistics = null,
    trendAnalytics = null,
    paymentMethodDistribution = null,
    budgetAnalytics = null,
    expenseHighlights = null,
    transactionData = null,
    insights = null,
  } = categoryAnalytics || {};

  // Prepare KPI data
  const kpiData = useMemo(() => [
    {
      title: "Total Spend",
      value: formatCurrency(summaryStatistics?.totalSpent || 0),
      trend: trendAnalytics?.previousVsCurrentMonth?.percentageChange || 0,
      trendLabel: "vs last month",
      accentColor: "#00DAC6",
      icon: <TrendingDownIcon />,
    },
    {
      title: "Transactions",
      value: summaryStatistics?.totalTransactions || summaryStatistics?.transactionCount || 0,
      trend: null,
      accentColor: "#f97316",
    },
    {
      title: "Avg. Expense",
      value: formatCurrency(summaryStatistics?.averageExpense || 0),
      trend: null,
      accentColor: "#8b5cf6",
    },
    {
      title: "Budget Status",
      value: `${Math.round(budgetAnalytics?.usagePercentage || budgetAnalytics?.overallBudgetUsage || 0)}%`,
      trend: null,
      accentColor:
        (budgetAnalytics?.usagePercentage || budgetAnalytics?.overallBudgetUsage || 0) >= 90
          ? "#ff4d4f"
          : (budgetAnalytics?.usagePercentage || budgetAnalytics?.overallBudgetUsage || 0) >= 70
          ? "#faad14"
          : "#52c41a",
    },
  ], [summaryStatistics, budgetAnalytics, trendAnalytics, formatCurrency]);

  // Prepare chart data for Monthly Trend
  const trendChartData = useMemo(() => {
    if (!trendAnalytics) return [];

    // Use appropriate trend data based on selected trend type
    let rawData = [];
    switch (trendType) {
      case "DAILY":
        rawData = trendAnalytics.dailySpendingTrend || trendAnalytics.dailySpending || [];
        return rawData.map((item) => ({
          label: dayjs(item.date).format("DD MMM"),
          value: item.amount || 0,
          fullDate: item.date,
        }));
      case "WEEKLY":
        rawData = trendAnalytics.weeklySpendingTrend || trendAnalytics.weeklySpending || [];
        return rawData.map((item) => ({
          label: item.week || `W${item.weekNumber}`,
          value: item.amount || 0,
          weekNumber: item.weekNumber,
          year: item.year,
        }));
      case "MONTHLY":
        rawData = trendAnalytics.monthlySpendingTrend || trendAnalytics.monthlySpending || [];
        return rawData.map((item) => ({
          label: item.month || dayjs().month((item.monthNumber || item.month) - 1).format("MMM"),
          value: item.amount || 0,
          month: item.monthNumber || item.month,
          year: item.year,
        }));
      case "YEARLY":
        rawData = trendAnalytics.yearlySpendingTrend || trendAnalytics.yearlySpending || [];
        return rawData.map((item) => ({
          label: item.year?.toString() || "",
          value: item.amount || 0,
          year: item.year,
        }));
      default:
        return [];
    }
  }, [trendAnalytics, trendType]);

  // Prepare payment distribution data
  const paymentChartData = useMemo(() => {
    if (!paymentMethodDistribution || !Array.isArray(paymentMethodDistribution)) {
      return [];
    }
    return paymentMethodDistribution.map((item) => ({
      name: item.displayName || item.methodName || item.paymentMethod || "Unknown",
      value: item.totalAmount || item.amount || 0,
      percentage: item.percentage || 0,
      count: item.transactionCount || 0,
      color: item.color,
    }));
  }, [paymentMethodDistribution]);

  // Loading state - use skeleton
  if (categoryAnalyticsLoading) {
    return (
      <CategoryAnalyticsSkeleton
        onClose={handleOnClose}
        containerStyle={containerStyle}
      />
    );
  }

  // Error state
  if (categoryAnalyticsError) {
    return (
      <div className="flex flex-col relative" style={containerStyle}>
        <PageHeader title="Category Analytics" onClose={handleOnClose} />
        <div
          className="flex flex-col items-center justify-center"
          style={{ flex: 1, color: colors.primary_text }}
        >
          <Typography variant="h6" color="error">
            {categoryAnalyticsError}
          </Typography>
          <button
            onClick={handleOnClose}
            className="mt-4 px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!categoryAnalytics) {
    return (
      <div className="flex flex-col relative" style={containerStyle}>
        <PageHeader title="Category Analytics" onClose={handleOnClose} />
        <div
          className="flex flex-col items-center justify-center"
          style={{ flex: 1, color: colors.secondary_text }}
        >
          <Typography variant="h6">No analytics data found</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      {/* Header with Category Info */}
      <PageHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: `${categoryMetadata?.color || "#00DAC6"}20`,
                border: `2px solid ${categoryMetadata?.color || "#00DAC6"}`,
              }}
            >
              {getCategoryIcon(
                categoryMetadata?.name,
                28,
                categoryMetadata?.color || "#00DAC6"
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: colors.primary_text,
                }}
              >
                {categoryMetadata?.name || "Category"} Analytics
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: colors.secondary_text,
                }}
              >
                {categoryMetadata?.description || "Detailed spending insights"}
              </Typography>
            </Box>
          </Box>
        }
        onClose={handleOnClose}
        rightContent={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Date Range Preset */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={dateRangePreset}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                sx={{
                  color: colors.primary_text,
                  backgroundColor: colors.primary_bg,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border_color,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00DAC6",
                  },
                  fontSize: "0.85rem",
                  height: 36,
                }}
              >
                {DATE_RANGE_PRESETS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Trend Type */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={trendType}
                onChange={(e) => handleTrendTypeChange(e.target.value)}
                sx={{
                  color: colors.primary_text,
                  backgroundColor: colors.primary_bg,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border_color,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00DAC6",
                  },
                  fontSize: "0.85rem",
                  height: 36,
                }}
              >
                {TREND_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: colors.primary_bg,
                  color: "#00DAC6",
                  border: `1px solid ${colors.border_color}`,
                  "&:hover": {
                    backgroundColor: "#00DAC620",
                    borderColor: "#00DAC6",
                  },
                  width: 36,
                  height: 36,
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* Custom Date Range (shown when custom is selected) */}
      {dateRangePreset === "custom" && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            padding: "12px 0",
            borderBottom: `1px solid ${colors.border_color}`,
            marginBottom: 2,
          }}
        >
          <TextField
            type="date"
            label="Start Date"
            size="small"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.primary_text,
                backgroundColor: colors.primary_bg,
              },
              "& .MuiInputLabel-root": {
                color: colors.secondary_text,
              },
            }}
          />
          <TextField
            type="date"
            label="End Date"
            size="small"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.primary_text,
                backgroundColor: colors.primary_bg,
              },
              "& .MuiInputLabel-root": {
                color: colors.secondary_text,
              },
            }}
          />
          <button
            onClick={handleRefresh}
            className="px-4 py-1 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] text-sm"
          >
            Apply
          </button>
        </Box>
      )}

      {/* Main Content - Scrollable Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          paddingRight: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.border_color,
            borderRadius: "3px",
          },
        }}
      >
        {/* KPI Cards Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnalyticsKPICard
                title={kpi.title}
                value={kpi.value}
                trend={kpi.trend}
                trendLabel={kpi.trendLabel}
                accentColor={kpi.accentColor}
                icon={kpi.icon}
              />
            </Grid>
          ))}
        </Grid>

        {/* Charts Row - Trend & Payment Distribution */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Monthly Trend Chart */}
          <Grid item xs={12} md={8}>
            <MonthlyTrendChart
              data={trendChartData}
              title={`${trendType.charAt(0) + trendType.slice(1).toLowerCase()} Spending Trend`}
              height={280}
              accentColor={categoryMetadata?.color || "#00DAC6"}
            />
          </Grid>

          {/* Payment Distribution Chart */}
          <Grid item xs={12} md={4}>
            <PaymentDistributionChart
              data={paymentChartData}
              title="Payment Methods"
              height={280}
            />
          </Grid>
        </Grid>

        {/* Budget & Insights Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Budget Status Card */}
          <Grid item xs={12} md={6}>
            <BudgetStatusCard
              budgetData={{
                allocatedAmount: budgetAnalytics?.totalAllocatedBudget || 0,
                usedAmount: budgetAnalytics?.totalSpentFromBudgets || 0,
                remainingAmount: budgetAnalytics?.remainingBudget || 0,
                percentageUsed: budgetAnalytics?.overallBudgetUsage || 0,
                projectedAmount: budgetAnalytics?.projectedMonthEndSpending || 0,
                linkedBudgetsCount: budgetAnalytics?.linkedBudgets?.length || 0,
                activeBudgetsCount: budgetAnalytics?.activeBudgetsCount || 0,
              }}
              formatCurrency={formatCurrency}
            />
          </Grid>

          {/* Insights Panel */}
          <Grid item xs={12} md={6}>
            <InsightsPanel insights={insights || []} maxItems={4} />
          </Grid>
        </Grid>

        {/* Expense Highlights Row */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} md={4}>
            <ExpenseHighlightCard
              type="highest"
              expense={expenseHighlights?.highestExpense}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ExpenseHighlightCard
              type="lowest"
              expense={expenseHighlights?.lowestExpense}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ExpenseHighlightCard
              type="recent"
              expense={expenseHighlights?.mostRecent}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </Grid>
        </Grid>

        {/* Recent Transactions Table */}
        {transactionData?.recentTransactions?.length > 0 && (
          <Box
            sx={{
              backgroundColor: colors.primary_bg,
              borderRadius: "12px",
              border: `1px solid ${colors.border_color}`,
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: colors.primary_text,
                marginBottom: 2,
              }}
            >
              Recent Transactions
            </Typography>
            <CustomDataTable
              columns={transactionColumns}
              data={transactionData.recentTransactions || []}
              rowsPerPage={5}
              compact
              emptyMessage="No recent transactions found"
            />
          </Box>
        )}

        {/* Month Comparison Section */}
        {trendAnalytics?.monthComparison && (
          <Box
            sx={{
              backgroundColor: colors.primary_bg,
              borderRadius: "12px",
              border: `1px solid ${colors.border_color}`,
              padding: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: colors.primary_text,
                marginBottom: 2,
              }}
            >
              Month Comparison
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
                  >
                    Current Month
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#00DAC6",
                    }}
                  >
                    {formatCurrency(trendAnalytics.monthComparison.currentMonthTotal)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
                  >
                    Previous Month
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: colors.primary_text,
                    }}
                  >
                    {formatCurrency(trendAnalytics.monthComparison.previousMonthTotal)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
                  >
                    Change
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    {trendAnalytics.monthComparison.percentageChange >= 0 ? (
                      <TrendingUpIcon
                        sx={{
                          fontSize: 18,
                          color:
                            trendAnalytics.monthComparison.percentageChange > 10
                              ? "#ff4d4f"
                              : "#faad14",
                        }}
                      />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 18, color: "#52c41a" }} />
                    )}
                    <Typography
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color:
                          trendAnalytics.monthComparison.percentageChange >= 0
                            ? trendAnalytics.monthComparison.percentageChange > 10
                              ? "#ff4d4f"
                              : "#faad14"
                            : "#52c41a",
                      }}
                    >
                      {Math.abs(trendAnalytics.monthComparison.percentageChange).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
                  >
                    Trend
                  </Typography>
                  <Chip
                    label={trendAnalytics.monthComparison.trend || "STABLE"}
                    size="small"
                    sx={{
                      backgroundColor:
                        trendAnalytics.monthComparison.trend === "INCREASING"
                          ? "#ff4d4f20"
                          : trendAnalytics.monthComparison.trend === "DECREASING"
                          ? "#52c41a20"
                          : "#faad1420",
                      color:
                        trendAnalytics.monthComparison.trend === "INCREASING"
                          ? "#ff4d4f"
                          : trendAnalytics.monthComparison.trend === "DECREASING"
                          ? "#52c41a"
                          : "#faad14",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default CategoryAnalyticsView;
