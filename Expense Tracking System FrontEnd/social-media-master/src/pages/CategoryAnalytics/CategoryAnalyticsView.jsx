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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

  if (
    name.includes("food") ||
    name.includes("dining") ||
    name.includes("restaurant")
  ) {
    return <RestaurantIcon {...iconProps} />;
  }
  if (name.includes("shopping") || name.includes("retail")) {
    return <ShoppingCartIcon {...iconProps} />;
  }
  if (
    name.includes("transport") ||
    name.includes("car") ||
    name.includes("fuel")
  ) {
    return <DirectionsCarIcon {...iconProps} />;
  }
  if (
    name.includes("home") ||
    name.includes("rent") ||
    name.includes("utilities")
  ) {
    return <HomeIcon {...iconProps} />;
  }
  if (
    name.includes("health") ||
    name.includes("medical") ||
    name.includes("hospital")
  ) {
    return <LocalHospitalIcon {...iconProps} />;
  }
  if (
    name.includes("education") ||
    name.includes("school") ||
    name.includes("course")
  ) {
    return <SchoolIcon {...iconProps} />;
  }
  if (
    name.includes("travel") ||
    name.includes("flight") ||
    name.includes("vacation")
  ) {
    return <FlightIcon {...iconProps} />;
  }
  if (
    name.includes("entertainment") ||
    name.includes("game") ||
    name.includes("movie")
  ) {
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

const DEFAULT_ANALYTICS_KEYS = {
  data: "categoryAnalytics",
  loading: "categoryAnalyticsLoading",
  error: "categoryAnalyticsError",
};

const CategoryAnalyticsView = ({
  entityType = "category",
  entityIdParam = "categoryId",
  entityLabel = "Category",
  fetchAnalytics = fetchCategoryAnalytics,
  clearAnalytics = clearCategoryAnalytics,
  analyticsSelector = (state) => state.categories || {},
  analyticsKeys = DEFAULT_ANALYTICS_KEYS,
  editRouteBase = "/category-flow/edit",
}) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const { friendId } = params;
  const categoryId = params[entityIdParam] || params.categoryId;
  const [searchParams, setSearchParams] = useSearchParams();

  // Refs to prevent duplicate API calls
  const hasFetchedRef = useRef(false);
  const currentRequestRef = useRef(null); // Track current request params

  // Local state for filters
  const [trendType, setTrendType] = useState(
    searchParams.get("trendType") || "MONTHLY",
  );
  const [dateRangePreset, setDateRangePreset] = useState("6m");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Redux state
  const analyticsState = useSelector(analyticsSelector);
  const categoryAnalytics = analyticsState?.[analyticsKeys.data];
  const categoryAnalyticsLoading = analyticsState?.[analyticsKeys.loading];
  const categoryAnalyticsError = analyticsState?.[analyticsKeys.error];

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
        startDate = customStartDate
          ? dayjs(customStartDate)
          : now.subtract(6, "month");
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
        fetchAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType,
          targetId: friendId,
        }),
      );
    }

    // Cleanup on unmount
    return () => {
      hasFetchedRef.current = false;
      currentRequestRef.current = null;
      dispatch(clearAnalytics());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, friendId]);

  // Handle filter changes - explicit user action triggers
  const handleTrendTypeChange = (newTrendType) => {
    setTrendType(newTrendType);
    if (categoryId) {
      dispatch(
        fetchAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType: newTrendType,
          targetId: friendId,
        }),
      );
    }
  };

  const handleDateRangeChange = (newPreset) => {
    setDateRangePreset(newPreset);
    // For non-custom presets, trigger reload immediately
    if (newPreset !== "custom" && categoryId) {
      const now = dayjs();
      let startDate,
        endDate = now;
      switch (newPreset) {
        case "7d":
          startDate = now.subtract(7, "day");
          break;
        case "30d":
          startDate = now.subtract(30, "day");
          break;
        case "3m":
          startDate = now.subtract(3, "month");
          break;
        case "6m":
          startDate = now.subtract(6, "month");
          break;
        case "1y":
          startDate = now.subtract(1, "year");
          break;
        default:
          startDate = now.subtract(6, "month");
      }
      dispatch(
        fetchAnalytics(categoryId, {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
          trendType,
          targetId: friendId,
        }),
      );
    }
  };

  const handleCustomDateApply = () => {
    if (categoryId && customStartDate && customEndDate) {
      dispatch(
        fetchAnalytics(categoryId, {
          startDate: customStartDate,
          endDate: customEndDate,
          trendType,
          targetId: friendId,
        }),
      );
    }
  };

  // Fetch analytics data - called manually for refresh
  const handleRefresh = () => {
    if (categoryId) {
      dispatch(
        fetchAnalytics(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType,
          targetId: friendId,
        }),
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
    [colors, formatDate, formatCurrency],
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
  const kpiData = useMemo(
    () => [
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
        value:
          summaryStatistics?.totalTransactions ||
          summaryStatistics?.transactionCount ||
          0,
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
          (budgetAnalytics?.usagePercentage ||
            budgetAnalytics?.overallBudgetUsage ||
            0) >= 90
            ? "#ff4d4f"
            : (budgetAnalytics?.usagePercentage ||
                  budgetAnalytics?.overallBudgetUsage ||
                  0) >= 70
              ? "#faad14"
              : "#52c41a",
      },
    ],
    [summaryStatistics, budgetAnalytics, trendAnalytics, formatCurrency],
  );

  // Prepare chart data for Monthly Trend - fields must match MonthlyTrendChart expectations
  // MonthlyTrendChart expects: { month, amount, transactionCount } which maps internally to { name, amount, transactions }
  const trendChartData = useMemo(() => {
    if (!trendAnalytics) return [];

    // Use appropriate trend data based on selected trend type
    let rawData = [];
    switch (trendType) {
      case "DAILY":
        rawData =
          trendAnalytics.dailySpendingTrend ||
          trendAnalytics.dailySpending ||
          [];
        return rawData.map((item) => ({
          month: dayjs(item.date).format("DD MMM"),
          amount: item.amount || 0,
          transactionCount: item.transactionCount || 0,
          fullDate: item.date,
        }));
      case "WEEKLY":
        rawData =
          trendAnalytics.weeklySpendingTrend ||
          trendAnalytics.weeklySpending ||
          [];
        return rawData.map((item) => ({
          month: item.week || `W${item.weekNumber}`,
          amount: item.amount || 0,
          transactionCount: item.transactionCount || 0,
          weekNumber: item.weekNumber,
          year: item.year,
        }));
      case "MONTHLY":
        rawData =
          trendAnalytics.monthlySpendingTrend ||
          trendAnalytics.monthlySpending ||
          [];
        return rawData.map((item) => ({
          month:
            item.month ||
            dayjs()
              .month((item.monthNumber || 1) - 1)
              .format("MMM YYYY"),
          amount: item.amount || 0,
          transactionCount: item.transactionCount || 0,
          monthNumber: item.monthNumber,
          year: item.year,
        }));
      case "YEARLY":
        rawData =
          trendAnalytics.yearlySpendingTrend ||
          trendAnalytics.yearlySpending ||
          [];
        return rawData.map((item) => ({
          month: item.year?.toString() || "",
          amount: item.amount || 0,
          transactionCount: item.transactionCount || 0,
          year: item.year,
        }));
      default:
        return [];
    }
  }, [trendAnalytics, trendType]);

  // Helper function to format payment method names
  const formatPaymentMethodName = (method) => {
    if (!method) return "Unknown";
    // Convert camelCase to Title Case with spaces
    return method
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Prepare payment distribution data - fields must match PaymentDistributionChart expectations
  // PaymentDistributionChart expects: { displayName/paymentMethod, totalAmount, percentage, transactionCount, color }
  const paymentChartData = useMemo(() => {
    if (
      !paymentMethodDistribution ||
      !Array.isArray(paymentMethodDistribution)
    ) {
      return [];
    }
    return paymentMethodDistribution.map((item, index) => {
      // Assign distinct colors based on payment method
      const colorMap = {
        cash: "#22c55e",
        upi: "#6366f1",
        creditcard: "#ef4444",
        debitcard: "#3b82f6",
        netbanking: "#8b5cf6",
        creditneedtopaid: "#f97316",
        other: "#ec4899",
      };
      const methodKey = (item.paymentMethod || "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      const defaultColors = [
        "#6366f1",
        "#22c55e",
        "#f97316",
        "#ef4444",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
      ];
      const assignedColor =
        colorMap[methodKey] ||
        item.color ||
        defaultColors[index % defaultColors.length];

      return {
        displayName:
          item.displayName ||
          item.methodName ||
          formatPaymentMethodName(item.paymentMethod) ||
          "Unknown",
        paymentMethod: item.paymentMethod,
        totalAmount: item.totalAmount || item.amount || 0,
        percentage: item.percentage || 0,
        transactionCount: item.transactionCount || 0,
        color: assignedColor,
      };
    });
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
        accentColor={categoryMetadata?.color || "#00DAC6"}
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "10px",
                backgroundColor: `${categoryMetadata?.color || "#00DAC6"}20`,
                border: `2px solid ${categoryMetadata?.color || "#00DAC6"}`,
              }}
            >
              {getCategoryIcon(
                categoryMetadata?.categoryName,
                20,
                categoryMetadata?.color || "#00DAC6",
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: colors.primary_text,
                  lineHeight: 1.2,
                }}
              >
                {categoryMetadata?.categoryName || "Category"}
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

            {/* Edit Button */}
            <Tooltip title={`Edit ${entityLabel}`}>
              <IconButton
                onClick={() => {
                  if (friendId) {
                    navigate(
                      `${editRouteBase}/${categoryId}/friend/${friendId}`,
                    );
                  } else {
                    navigate(`${editRouteBase}/${categoryId}`);
                  }
                }}
                sx={{
                  backgroundColor: "#00DAC6",
                  color: "#000",
                  "&:hover": { backgroundColor: "#00b8a0" },
                  width: 36,
                  height: 36,
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Delete Button */}
            <Tooltip title={`Delete ${entityLabel}`}>
              <IconButton
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this category?",
                    )
                  ) {
                    // TODO: Add delete category action
                    navigate(-1);
                  }
                }}
                sx={{
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#d9363e" },
                  width: 36,
                  height: 36,
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
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

      {/* Main Content - Two Column Layout (Left Sidebar + Right Content) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          gap: 1.5,
          overflow: "hidden",
        }}
      >
        {/* LEFT COLUMN - Category Details, Payment Chart, Recent Transactions */}
        <Box
          sx={{
            width: "280px",
            minWidth: "280px",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Category Details Card - Hero Style */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.secondary_bg} 100%)`,
              border: `2px solid ${categoryMetadata?.type === "CREDIT" ? "#52c41a" : "#ff4d4f"}`,
              borderRadius: "12px",
              padding: "14px 16px",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent stripe at top */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  categoryMetadata?.type === "CREDIT"
                    ? "linear-gradient(90deg, #52c41a, #73d13d)"
                    : "linear-gradient(90deg, #ff4d4f, #ff7875)",
              }}
            />

            {/* Amount - Large and Prominent */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                marginBottom: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color:
                    categoryMetadata?.type === "CREDIT" ? "#52c41a" : "#ff4d4f",
                }}
              >
                {formatCurrency(summaryStatistics?.totalSpent || 0)}
              </Typography>
              <Chip
                label={categoryMetadata?.type === "CREDIT" ? "CREDIT" : "DEBIT"}
                size="small"
                sx={{
                  backgroundColor:
                    categoryMetadata?.type === "CREDIT" ? "#52c41a" : "#ff4d4f",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.6rem",
                  height: "22px",
                  letterSpacing: "0.5px",
                }}
              />
            </Box>

            {/* Percentage Progress Bar */}
            <Box sx={{ marginBottom: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    height: "8px",
                    backgroundColor: `${colors.border_color}50`,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(summaryStatistics?.categoryPercentageOfAllExpenses || 0, 100)}%`,
                      height: "100%",
                      backgroundColor:
                        (summaryStatistics?.categoryPercentageOfAllExpenses ||
                          0) >= 80
                          ? "#f59e0b"
                          : (summaryStatistics?.categoryPercentageOfAllExpenses ||
                                0) >= 50
                            ? "#eab308"
                            : "#22c55e",
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: colors.primary_text,
                    minWidth: "45px",
                  }}
                >
                  {summaryStatistics?.categoryPercentageOfAllExpenses?.toFixed(
                    0,
                  ) || 0}
                  %
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: colors.secondary_text,
                  marginTop: 0.5,
                }}
              >
                of all expenses
              </Typography>
            </Box>

            {/* Comments/Description Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.5,
                backgroundColor: colors.secondary_bg,
                padding: "8px 10px",
                borderRadius: "8px",
                border: `1px solid ${colors.border_color}`,
                borderLeft: `3px solid ${categoryMetadata?.type === "CREDIT" ? "#52c41a" : "#ff4d4f"}`,
              }}
            >
              <Typography sx={{ fontSize: "0.7rem", marginTop: "1px" }}>
                📝
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: colors.primary_text,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {categoryMetadata?.categoryName || "Category"} Expenses
              </Typography>
            </Box>
          </Box>

          {/* Payment Distribution Pie Chart */}
          <Box sx={{ flex: 1, minHeight: "200px" }}>
            <PaymentDistributionChart
              data={paymentChartData}
              title="Payment Methods"
              height={220}
              compact
              showHeader={false}
              pieInnerRadius={0}
            />
          </Box>

          {/* Recent Transactions */}
          <Box
            sx={{
              flex: 1,
              background: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: colors.primary_text,
                marginBottom: 1,
              }}
            >
              📋 Recent Transactions
            </Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {transactionData?.recentTransactions?.slice(0, 5).map((tx, i) => {
                const expenseId = tx.id || tx.expenseId;
                const viewPath = friendId
                  ? `/expenses/view/${expenseId}/friend/${friendId}`
                  : `/expenses/view/${expenseId}`;
                const viewUrl = `${window.location.origin}${viewPath}`;

                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      marginBottom: "4px",
                      backgroundColor: `${colors.secondary_bg}80`,
                      borderRadius: "6px",
                      borderLeft: `3px solid ${tx.type === "loss" ? "#ef4444" : "#22c55e"}`,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Tooltip
                        title={expenseId ? viewUrl : ""}
                        arrow
                        placement="top"
                      >
                        <Typography
                          onClick={(e) => {
                            if (expenseId) {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(viewPath);
                            }
                          }}
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: colors.primary_text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: expenseId ? "pointer" : "default",
                            "&:hover": expenseId
                              ? { textDecoration: "underline" }
                              : {},
                          }}
                        >
                          {tx.expenseName}
                        </Typography>
                      </Tooltip>
                      <Typography
                        sx={{
                          fontSize: "0.55rem",
                          color: colors.secondary_text,
                        }}
                      >
                        {formatDate(tx.date)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: tx.type === "loss" ? "#ef4444" : "#22c55e",
                        marginLeft: 1,
                      }}
                    >
                      {tx.type === "loss" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </Typography>
                  </Box>
                );
              })}
              {(!transactionData?.recentTransactions ||
                transactionData.recentTransactions.length === 0) && (
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: colors.secondary_text,
                    textAlign: "center",
                  }}
                >
                  No recent transactions
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* RIGHT CONTENT AREA */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          {/* Occurrence Statistics - Individual Cards Without Container */}
          <Grid container spacing={1.5} sx={{ marginBottom: 1.5 }}>
            {/* Row 1 */}
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>⏰</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: colors.secondary_text,
                      textTransform: "uppercase",
                    }}
                  >
                    This Month
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: colors.primary_text,
                  }}
                >
                  {trendAnalytics?.previousVsCurrentMonth
                    ?.currentMonthTransactions || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>📅</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: colors.secondary_text,
                      textTransform: "uppercase",
                    }}
                  >
                    This Year
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: colors.primary_text,
                  }}
                >
                  {summaryStatistics?.totalTransactions || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>📈</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: colors.secondary_text,
                      textTransform: "uppercase",
                    }}
                  >
                    Average
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#00DAC6",
                  }}
                >
                  {formatCurrency(summaryStatistics?.averageExpense || 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>💰</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: colors.secondary_text,
                      textTransform: "uppercase",
                    }}
                  >
                    All Time
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#00DAC6",
                  }}
                >
                  {formatCurrency(summaryStatistics?.totalSpent || 0)}
                </Typography>
              </Box>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>📆</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "#8b5cf6",
                      textTransform: "uppercase",
                    }}
                  >
                    First
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: colors.primary_text,
                  }}
                >
                  {formatDate(expenseHighlights?.oldestExpense?.date) || "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>📆</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "#f97316",
                      textTransform: "uppercase",
                    }}
                  >
                    Last
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: colors.primary_text,
                  }}
                >
                  {formatDate(expenseHighlights?.mostRecentExpense?.date) ||
                    "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>⬇️</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "#22c55e",
                      textTransform: "uppercase",
                    }}
                  >
                    Min
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: colors.primary_text,
                  }}
                >
                  {formatCurrency(summaryStatistics?.minExpense || 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                sx={{
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "10px",
                  padding: "12px",
                  backgroundColor: colors.primary_bg,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    marginBottom: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem" }}>⬆️</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "#ef4444",
                      textTransform: "uppercase",
                    }}
                  >
                    Max
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#ef4444",
                  }}
                >
                  {formatCurrency(summaryStatistics?.maxExpense || 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Monthly Spending Chart - Middle Section */}
          <Box sx={{ flex: 1, minHeight: "200px" }}>
            <MonthlyTrendChart
              data={trendChartData}
              title={`${trendType.charAt(0) + trendType.slice(1).toLowerCase()} Spending Trend`}
              comparison={trendAnalytics?.previousVsCurrentMonth}
              accentColor={categoryMetadata?.color || "#00DAC6"}
              height={200}
              compact
            />
          </Box>

          {/* Bottom Row: Linked Budgets | Insights | Budget Overview & Consistency */}
          <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
            {/* Linked Budgets Table */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  background: colors.primary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "12px",
                  padding: "12px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.8rem" }}>💰</Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: colors.primary_text,
                      }}
                    >
                      Linked Budgets
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: "0.6rem", color: colors.secondary_text }}
                  >
                    {budgetAnalytics?.linkedBudgets?.length || 0} items
                  </Typography>
                </Box>

                {/* Compact Budget List */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {budgetAnalytics?.linkedBudgets
                    ?.slice(0, 3)
                    .map((budget, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 10px",
                          backgroundColor: `${colors.secondary_bg}80`,
                          borderRadius: "8px",
                          borderLeft: `3px solid #00DAC6`,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: colors.primary_text,
                            }}
                          >
                            {budget.budgetName}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.55rem",
                              color: colors.secondary_text,
                            }}
                          >
                            {formatCurrency(budget.categorySpentAmount || 0)} /{" "}
                            {formatCurrency(budget.totalBudgetAmount || 0)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: "#f97316",
                            }}
                          >
                            {budget.categoryUsagePercentageInBudget?.toFixed(
                              0,
                            ) || 0}
                            %
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor:
                                budget.status === "ACTIVE"
                                  ? "#22c55e20"
                                  : "#ef444420",
                              color:
                                budget.status === "ACTIVE"
                                  ? "#22c55e"
                                  : "#ef4444",
                              fontSize: "0.55rem",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {budget.status || "ACTIVE"}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  {(!budgetAnalytics?.linkedBudgets ||
                    budgetAnalytics.linkedBudgets.length === 0) && (
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: colors.secondary_text,
                        textAlign: "center",
                        padding: 1,
                      }}
                    >
                      No linked budgets
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Insights Panel */}
            <Grid item xs={12} md={3.5}>
              <Box
                sx={{
                  background: colors.primary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "12px",
                  padding: "12px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: colors.primary_text,
                    marginBottom: 1,
                  }}
                >
                  💡 Insights
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {insights?.slice(0, 2).map((insight, i) => (
                    <Box
                      key={i}
                      sx={{
                        padding: "8px",
                        backgroundColor:
                          insight.type === "WARNING"
                            ? "#faad1410"
                            : insight.type === "SUGGESTION"
                              ? "#3b82f610"
                              : `${colors.secondary_bg}80`,
                        borderRadius: "8px",
                        borderLeft: `3px solid ${insight.type === "WARNING" ? "#faad14" : insight.type === "SUGGESTION" ? "#3b82f6" : "#00DAC6"}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: colors.primary_text,
                        }}
                      >
                        {insight.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.55rem",
                          color: colors.secondary_text,
                        }}
                      >
                        {insight.message}
                      </Typography>
                    </Box>
                  ))}
                  {(!insights || insights.length === 0) && (
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: colors.secondary_text,
                        textAlign: "center",
                      }}
                    >
                      No insights
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Budget Overview & Consistency */}
            <Grid item xs={12} md={3.5}>
              <Box
                sx={{
                  background: colors.primary_bg,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "12px",
                  padding: "12px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: colors.primary_text,
                    marginBottom: 1,
                  }}
                >
                  📊 Overview & Patterns
                </Typography>
                <Grid container spacing={0.75}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Active Days
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#f97316",
                        }}
                      >
                        {summaryStatistics?.activeDays || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Cost/Day
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#00DAC6",
                        }}
                      >
                        {formatCurrency(summaryStatistics?.costPerDay || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Consistency
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#ec4899",
                        }}
                      >
                        {summaryStatistics?.consistency || 0} mo
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Trend
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color:
                            (trendAnalytics?.previousVsCurrentMonth
                              ?.percentageChange || 0) >= 0
                              ? "#ef4444"
                              : "#22c55e",
                        }}
                      >
                        {(trendAnalytics?.previousVsCurrentMonth
                          ?.percentageChange || 0) >= 0
                          ? "+"
                          : ""}
                        {trendAnalytics?.previousVsCurrentMonth?.percentageChange?.toFixed(
                          1,
                        ) || 0}
                        %
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Usage
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color:
                            (budgetAnalytics?.usagePercentage || 0) >= 90
                              ? "#ef4444"
                              : "#00DAC6",
                        }}
                      >
                        {Math.round(budgetAnalytics?.usagePercentage || 0)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        padding: "6px",
                        backgroundColor: `${colors.secondary_bg}80`,
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.5rem",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        Remaining
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#22c55e",
                        }}
                      >
                        {formatCurrency(budgetAnalytics?.remaining || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
};

export default CategoryAnalyticsView;
