import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
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
import { ExpenseListTable } from "../../components/common/ExpenseListTable/ExpenseListTable";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import FlightIcon from "@mui/icons-material/Flight";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import dayjs from "dayjs";

import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../../components/PageHeader";
import CustomDataTable from "../../components/common/CustomDataTable";
import CategoryAnalyticsSkeleton from "../../components/skeletons/CategoryAnalyticsSkeleton";
import { getFunctionalIcon } from "../../utils/ui/iconMapping";
import {
  AnalyticsHeroCard,
  AnalyticsMetricGrid,
  MonthlyTrendChart,
  PaymentDistributionChart,
} from "../../components/analytics";
import {
  fetchCategoryAnalytics,
  clearCategoryAnalytics,
} from "../../Redux/Category/categoryActions";
import {
  canFetchEntityAnalytics,
  isBrowserTabActive,
} from "../../utils/feature/analyticsFeatureAccess";

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
  const { colors, mode } = useTheme();
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
  const featureFlags = useSelector((state) => state.featureFlags);

  const { dateFormat } = useSelector((state) => state.userSettings || {});
  const displayDateFormat = dateFormat || "DD/MM/YYYY";
  const analyticsAllowed = canFetchEntityAnalytics(featureFlags, entityType);
  const abortControllerRef = useRef(null);

  const dispatchAnalyticsFetch = (id, options = {}) => {
    if (!id || !analyticsAllowed || !isBrowserTabActive()) {
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    dispatch(
      fetchAnalytics(id, {
        ...options,
        signal: controller.signal,
      }),
    );
  };

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

  // Initial load — wait for dormancy flags; skip when feature dormant or tab hidden
  useEffect(() => {
    const requestKey = `${categoryId}-${friendId}-${dateRange.startDate}-${dateRange.endDate}-${trendType}`;

    if (
      categoryId &&
      analyticsAllowed &&
      isBrowserTabActive() &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      currentRequestRef.current = requestKey;
      dispatchAnalyticsFetch(categoryId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        trendType,
        targetId: friendId,
      });
    }

    const onVisibilityChange = () => {
      if (!isBrowserTabActive()) {
        abortControllerRef.current?.abort();
        // Allow a fresh fetch when the tab becomes active again
        hasFetchedRef.current = false;
        return;
      }
      if (categoryId && analyticsAllowed && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        dispatchAnalyticsFetch(categoryId, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          trendType,
          targetId: friendId,
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      hasFetchedRef.current = false;
      currentRequestRef.current = null;
      dispatch(clearAnalytics());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, friendId, analyticsAllowed]);

  // Handle filter changes - explicit user action triggers
  const handleTrendTypeChange = (newTrendType) => {
    setTrendType(newTrendType);
    if (categoryId) {
      dispatchAnalyticsFetch(categoryId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        trendType: newTrendType,
        targetId: friendId,
      });
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
      dispatchAnalyticsFetch(categoryId, {
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        trendType,
        targetId: friendId,
      });
    }
  };

  const handleCustomDateApply = () => {
    if (categoryId && customStartDate && customEndDate) {
      dispatchAnalyticsFetch(categoryId, {
        startDate: customStartDate,
        endDate: customEndDate,
        trendType,
        targetId: friendId,
      });
    }
  };

  // Fetch analytics data - called manually for refresh
  const handleRefresh = () => {
    if (categoryId) {
      dispatchAnalyticsFetch(categoryId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        trendType,
        targetId: friendId,
      });
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

  // Compact columns for the narrow Recent Transactions panel
  const recentTransactionColumns = useMemo(
    () => [
      {
        key: "date",
        label: "Date",
        width: "38%",
        value: (row) => formatDate(row.date),
      },
      {
        key: "expenseName",
        label: "Expense",
        width: "62%",
        value: (row) => row.expenseName || row.name || "Expense",
      },
    ],
    [formatDate],
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

  const occurrenceMetricItems = useMemo(
    () => [
      {
        id: "this-month",
        label: "This Month",
        value:
          trendAnalytics?.previousVsCurrentMonth?.currentMonthTransactions || 0,
        icon: getFunctionalIcon("schedule", {
          sx: { fontSize: 16, color: colors.primary_accent },
        }),
        accentColor: colors.primary_accent,
        tooltip: "Transactions in the current calendar month",
      },
      {
        id: "this-year",
        label: "This Year",
        value: summaryStatistics?.totalTransactions || 0,
        icon: (
          <CalendarTodayIcon
            sx={{ fontSize: 16, color: colors.primary_accent }}
          />
        ),
        accentColor: colors.primary_accent,
        tooltip: "Total transactions in the selected range / year",
      },
      {
        id: "average",
        label: "Average",
        value: formatCurrency(summaryStatistics?.averageExpense || 0),
        icon: getFunctionalIcon("trend", {
          sx: { fontSize: 16, color: "#00DAC6" },
        }),
        accentColor: "#00DAC6",
        highlight: true,
        tooltip: "Average amount per transaction",
      },
      {
        id: "all-time",
        label: "All Time",
        value: formatCurrency(summaryStatistics?.totalSpent || 0),
        icon: getFunctionalIcon("expense", {
          sx: { fontSize: 16, color: "#00DAC6" },
        }),
        accentColor: "#00DAC6",
        highlight: true,
        tooltip: "Total amount across all recorded transactions",
      },
      {
        id: "first",
        label: "First",
        value: formatDate(expenseHighlights?.oldestExpense?.date) || "N/A",
        icon: <EventIcon sx={{ fontSize: 16, color: "#f59e0b" }} />,
        accentColor: "#f59e0b",
        tooltip: "Date of the earliest transaction",
      },
      {
        id: "last",
        label: "Last",
        value: formatDate(expenseHighlights?.mostRecentExpense?.date) || "N/A",
        icon: <EventIcon sx={{ fontSize: 16, color: "#fb923c" }} />,
        accentColor: "#fb923c",
        tooltip: "Date of the most recent transaction",
      },
      {
        id: "min",
        label: "Min",
        value: formatCurrency(summaryStatistics?.minExpense || 0),
        icon: <ArrowDownwardIcon sx={{ fontSize: 16, color: "#22c55e" }} />,
        accentColor: "#22c55e",
        highlight: true,
        tooltip: "Smallest single transaction amount",
      },
      {
        id: "max",
        label: "Max",
        value: formatCurrency(summaryStatistics?.maxExpense || 0),
        icon: <ArrowUpwardIcon sx={{ fontSize: 16, color: "#ef4444" }} />,
        accentColor: "#ef4444",
        highlight: true,
        tooltip: "Largest single transaction amount",
      },
    ],
    [
      trendAnalytics,
      summaryStatistics,
      expenseHighlights,
      formatCurrency,
      formatDate,
      colors.primary_accent,
    ],
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
          overflow: "visible",
          minHeight: 0,
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
          <AnalyticsHeroCard
            amountLabel={formatCurrency(summaryStatistics?.totalSpent || 0)}
            flowType={categoryMetadata?.type === "CREDIT" ? "CREDIT" : "DEBIT"}
            sharePercent={
              summaryStatistics?.categoryPercentageOfAllExpenses || 0
            }
            shareCaption="of all expenses"
            footerLabel={`${categoryMetadata?.categoryName || entityLabel || "Item"} expenses`}
          />

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                marginBottom: 1,
              }}
            >
              <ReceiptLongIcon
                sx={{ fontSize: 16, color: colors.primary_accent }}
              />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: colors.primary_text,
                }}
              >
                Recent Transactions
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {(!categoryAnalyticsLoading &&
                (transactionData?.recentTransactions?.length || 0) === 0) ? (
                <Box
                  sx={{
                    height: "100%",
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "16px",
                    borderRadius: "10px",
                    border: `1px dashed ${colors.border_color}`,
                    backgroundColor: colors.tertiary_bg,
                    color: colors.primary_text,
                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.hover_bg,
                      color: colors.secondary_accent,
                    }}
                  >
                    <InboxOutlinedIcon fontSize="small" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: colors.primary_text,
                    }}
                  >
                    No recent transactions
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: colors.secondary_text,
                      lineHeight: 1.4,
                      maxWidth: 220,
                    }}
                  >
                    Transactions linked to this {entityLabel?.toLowerCase() || "item"} will appear here.
                  </Typography>
                </Box>
              ) : (
                <ExpenseListTable
                  rows={transactionData?.recentTransactions || []}
                  loading={categoryAnalyticsLoading}
                  columns={recentTransactionColumns}
                  showPagination={false}
                />
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
          <AnalyticsMetricGrid
            items={occurrenceMetricItems}
            sx={{ flexShrink: 0 }}
          />

          {/* Monthly Spending Chart - Middle Section */}
          <Box
            sx={{
              flex: 1,
              minHeight: "200px",
              overflow: "visible",
              position: "relative",
              zIndex: 20,
            }}
          >
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
                    {getFunctionalIcon("expense", {
                      sx: { fontSize: 15, color: colors.primary_accent },
                    })}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <LightbulbOutlinedIcon sx={{ fontSize: "1rem" }} />
                  Insights
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
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  {getFunctionalIcon("analytics", {
                    sx: { fontSize: 16, color: colors.primary_accent },
                  })}
                  Overview & Patterns
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.875,
                    flex: 1,
                  }}
                >
                  {[
                    {
                      label: "Active Days",
                      value: summaryStatistics?.activeDays || 0,
                      color: "#f97316",
                    },
                    {
                      label: "Daily Avg",
                      value: formatCurrency(summaryStatistics?.costPerDay || 0),
                      color: "#00DAC6",
                    },
                    {
                      label: "Consistency",
                      value: `${summaryStatistics?.consistency || 0} mo`,
                      color: "#fb7185",
                    },
                    {
                      label: "Trend",
                      value: `${
                        (trendAnalytics?.previousVsCurrentMonth
                          ?.percentageChange || 0) >= 0
                          ? "+"
                          : ""
                      }${
                        trendAnalytics?.previousVsCurrentMonth?.percentageChange?.toFixed(
                          1,
                        ) || 0
                      }%`,
                      color:
                        (trendAnalytics?.previousVsCurrentMonth
                          ?.percentageChange || 0) >= 0
                          ? "#ef4444"
                          : "#22c55e",
                    },
                    {
                      label: "Usage",
                      value: `${Math.round(budgetAnalytics?.usagePercentage || 0)}%`,
                      color:
                        (budgetAnalytics?.usagePercentage || 0) >= 90
                          ? "#ef4444"
                          : "#00DAC6",
                    },
                    {
                      label: "Remaining",
                      value: formatCurrency(budgetAnalytics?.remaining || 0),
                      color: "#22c55e",
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        px: 1,
                        py: 1,
                        borderRadius: "8px",
                        border: `1px solid ${colors.border_color}`,
                        backgroundColor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.02)"
                            : colors.secondary_bg,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.35,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          color: colors.secondary_text,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: item.color,
                          fontVariantNumeric: "tabular-nums",
                          lineHeight: 1.2,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
};

export default CategoryAnalyticsView;
