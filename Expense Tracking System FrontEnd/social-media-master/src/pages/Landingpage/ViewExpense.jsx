import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CommentIcon from "@mui/icons-material/Comment";
import RepeatIcon from "@mui/icons-material/Repeat";
import PercentIcon from "@mui/icons-material/Percent";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../../components/PageHeader";
import {
  getExpenseDetailedView,
  clearExpenseDetailedView,
  deleteExpenseAction,
} from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";

// Payment method icon helper
const getPaymentMethodIcon = (methodName, color = "#f97316", size = 16) => {
  const name = (methodName || "").toLowerCase();
  if (name.includes("cash") || name.includes("atm")) {
    return <LocalAtmIcon sx={{ fontSize: size, color }} />;
  }
  if (name.includes("upi") || name.includes("phone")) {
    return <PhoneAndroidIcon sx={{ fontSize: size, color }} />;
  }
  if (name.includes("credit") || name.includes("debit")) {
    return <CreditCardIcon sx={{ fontSize: size, color }} />;
  }
  if (name.includes("bank") || name.includes("netbanking")) {
    return <AccountBalanceIcon sx={{ fontSize: size, color }} />;
  }
  return <PaymentIcon sx={{ fontSize: size, color }} />;
};

const ViewExpense = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, friendId } = useParams();

  const {
    expenseDetailedView,
    expenseDetailedViewLoading,
    expenseDetailedViewError,
  } = useSelector((state) => state.expenses || {});

  const { dateFormat } = useSelector((state) => state.userSettings || {});
  const displayDateFormat = dateFormat || "DD/MM/YYYY";

  useEffect(() => {
    if (id) {
      dispatch(getExpenseDetailedView(id, friendId));
    }
    return () => {
      dispatch(clearExpenseDetailedView());
    };
  }, [dispatch, id, friendId]);

  const handleOnClose = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    if (friendId) {
      navigate(`/expenses/edit/${id}/friend/${friendId}`);
    } else {
      navigate(`/expenses/edit/${id}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await dispatch(deleteExpenseAction(id, friendId));
        navigate(-1);
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
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

  // Budget table state for sorting, filtering, pagination
  const [budgetSearch, setBudgetSearch] = useState("");
  const [budgetStatusFilter, setBudgetStatusFilter] = useState("all");
  const [budgetSort, setBudgetSort] = useState({
    field: "name",
    direction: "asc",
  });
  const [budgetPage, setBudgetPage] = useState(0);
  const budgetRowsPerPage = 5;

  // Handle budget sort
  const handleBudgetSort = useCallback((field) => {
    setBudgetSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Get sort icon
  const getSortIcon = useCallback(
    (field) => {
      if (budgetSort.field !== field) {
        return <UnfoldMoreIcon sx={{ fontSize: 14, opacity: 0.4 }} />;
      }
      return budgetSort.direction === "asc" ? (
        <ExpandLessIcon sx={{ fontSize: 14, color: "#00dac6" }} />
      ) : (
        <ExpandMoreIcon sx={{ fontSize: 14, color: "#00dac6" }} />
      );
    },
    [budgetSort],
  );

  // Filtered and sorted budgets
  const processedBudgets = useMemo(() => {
    const budgets = expenseDetailedView?.linkedBudgets;
    if (!budgets || budgets.length === 0) return [];

    let filtered = [...budgets];

    // Apply search filter
    if (budgetSearch.trim()) {
      const searchLower = budgetSearch.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchLower) ||
          b.description?.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (budgetStatusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === budgetStatusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[budgetSort.field];
      let bVal = b[budgetSort.field];

      // Handle different types
      if (
        budgetSort.field === "amount" ||
        budgetSort.field === "usedAmount" ||
        budgetSort.field === "percentageUsed"
      ) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (
        budgetSort.field === "startDate" ||
        budgetSort.field === "endDate"
      ) {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (aVal < bVal) return budgetSort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return budgetSort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    expenseDetailedView?.linkedBudgets,
    budgetSearch,
    budgetStatusFilter,
    budgetSort,
  ]);

  // Paginated budgets
  const paginatedBudgets = useMemo(() => {
    const start = budgetPage * budgetRowsPerPage;
    return processedBudgets.slice(start, start + budgetRowsPerPage);
  }, [processedBudgets, budgetPage, budgetRowsPerPage]);

  // Total pages
  const totalBudgetPages = Math.ceil(
    processedBudgets.length / budgetRowsPerPage,
  );

  // Reset page when filters change
  useEffect(() => {
    setBudgetPage(0);
  }, [budgetSearch, budgetStatusFilter]);

  // Main container style
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

  // Budget status colors helper
  const getStatusStyle = (status) => {
    const statusColors = {
      ACTIVE: { bg: "#52c41a20", text: "#52c41a" },
      EXCEEDED: { bg: "#ff4d4f20", text: "#ff4d4f" },
      EXPIRED: { bg: "#8c8c8c20", text: "#8c8c8c" },
      CRITICAL: { bg: "#ff4d4f20", text: "#ff4d4f" },
      WARNING: { bg: "#faad1420", text: "#faad14" },
    };
    return statusColors[status] || statusColors.ACTIVE;
  };

  // Get percentage color
  const getPercentageColor = (value) => {
    if (value >= 90) return "#ff4d4f";
    if (value >= 70) return "#faad14";
    return "#52c41a";
  };

  // Budget table column definitions
  const budgetTableColumns = [
    { field: "name", label: "Budget", sortable: true, width: "18%" },
    {
      field: "description",
      label: "Description",
      sortable: true,
      width: "22%",
    },
    { field: "startDate", label: "Start", sortable: true, width: "12%" },
    { field: "endDate", label: "End", sortable: true, width: "12%" },
    { field: "amount", label: "Total", sortable: true, width: "12%" },
    { field: "usedAmount", label: "Used", sortable: true, width: "12%" },
    { field: "percentageUsed", label: "%", sortable: true, width: "6%" },
    { field: "status", label: "Status", sortable: true, width: "10%" },
  ];

  // Loading state with Skeleton
  if (expenseDetailedViewLoading) {
    return (
      <div className="flex flex-col relative" style={containerStyle}>
        <PageHeader title="View Expense" onClose={handleOnClose} />
        <div className="flex gap-4 flex-1" style={{ overflow: "hidden" }}>
          {/* Left Column Skeleton */}
          <div
            className="flex flex-col gap-3"
            style={{ width: "340px", flexShrink: 0 }}
          >
            {/* Hero Card Skeleton */}
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "12px",
                padding: "16px 18px",
                border: `1px solid ${colors.border_color}`,
                flex: 1,
              }}
            >
              <Skeleton
                variant="text"
                width="60%"
                height={32}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width="80%"
                height={48}
                sx={{ bgcolor: colors.secondary_bg, my: 2 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={24}
                sx={{ bgcolor: colors.secondary_bg }}
              />
              <Skeleton
                variant="rounded"
                width="100%"
                height={60}
                sx={{ bgcolor: colors.secondary_bg, mt: 2 }}
              />
            </div>

            {/* Category Card Skeleton */}
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "12px",
                padding: "14px 16px",
                border: `1px solid ${colors.border_color}`,
                flex: 1,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton
                  variant="rounded"
                  width={26}
                  height={26}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={20}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              </div>
              <Skeleton
                variant="text"
                width="50%"
                height={28}
                sx={{ bgcolor: colors.secondary_bg, mb: 2 }}
              />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={50}
                    sx={{ bgcolor: colors.secondary_bg }}
                  />
                ))}
              </div>
            </div>

            {/* Payment Card Skeleton */}
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "12px",
                padding: "14px 16px",
                border: `1px solid ${colors.border_color}`,
                flex: 1,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton
                  variant="rounded"
                  width={26}
                  height={26}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
                <Skeleton
                  variant="text"
                  width={100}
                  height={20}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              </div>
              <Skeleton
                variant="text"
                width="40%"
                height={28}
                sx={{ bgcolor: colors.secondary_bg, mb: 2 }}
              />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={50}
                    sx={{ bgcolor: colors.secondary_bg }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div
            className="flex flex-col gap-3 flex-1"
            style={{ overflow: "hidden" }}
          >
            {/* Occurrence Stats Skeleton */}
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "8px",
                padding: "14px 16px",
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton
                  variant="circular"
                  width={20}
                  height={20}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
                <Skeleton
                  variant="text"
                  width={150}
                  height={24}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={55}
                    sx={{ bgcolor: colors.secondary_bg }}
                  />
                ))}
              </div>
            </div>

            {/* Linked Budgets Skeleton */}
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "8px",
                padding: "14px 16px",
                border: `1px solid ${colors.border_color}`,
                flex: 1,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton
                  variant="circular"
                  width={20}
                  height={20}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
                <Skeleton
                  variant="text"
                  width={120}
                  height={24}
                  sx={{ bgcolor: colors.secondary_bg }}
                />
              </div>
              <Skeleton
                variant="rounded"
                width="100%"
                height={28}
                sx={{ bgcolor: colors.secondary_bg, mb: 1 }}
              />
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width="100%"
                  height={28}
                  sx={{ bgcolor: colors.secondary_bg, mb: 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (expenseDetailedViewError) {
    return (
      <div className="flex flex-col relative" style={containerStyle}>
        <PageHeader title="View Expense" onClose={handleOnClose} />
        <div
          className="flex flex-col items-center justify-center"
          style={{ flex: 1, color: colors.primary_text }}
        >
          <Typography variant="h6" color="error">
            {expenseDetailedViewError}
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
  if (!expenseDetailedView) {
    return (
      <div className="flex flex-col relative" style={containerStyle}>
        <PageHeader title="View Expense" onClose={handleOnClose} />
        <div
          className="flex flex-col items-center justify-center"
          style={{ flex: 1, color: colors.secondary_text }}
        >
          <Typography variant="h6">No expense data found</Typography>
        </div>
      </div>
    );
  }

  const {
    expenseName,
    amount,
    date,
    type,
    comments,
    category,
    paymentMethodInfo,
    linkedBudgets,
    occurrenceInfo,
  } = expenseDetailedView;
  const isCredit =
    type?.toLowerCase() === "credit" || type?.toLowerCase() === "gain";

  return (
    <div className="flex flex-col relative" style={containerStyle}>
      {/* Header */}
      <PageHeader
        title="View Expense"
        onClose={handleOnClose}
        rightContent={
          <div className="flex items-center gap-2">
            <Tooltip title="Edit Expense">
              <IconButton
                onClick={handleEdit}
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
            <Tooltip title="Delete Expense">
              <IconButton
                onClick={handleDelete}
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
          </div>
        }
      />

      {/* Main Content - Two Column Layout */}
      <div className="flex gap-4 flex-1" style={{ overflow: "hidden" }}>
        {/* Left Column - Hero Expense Card + Category + Payment (Equal Heights) */}
        <div
          className="flex flex-col gap-3"
          style={{ width: "340px", flexShrink: 0 }}
        >
          {/* Hero Expense Card */}
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.secondary_bg} 100%)`,
              borderRadius: "12px",
              padding: "18px 20px",
              border: `2px solid ${isCredit ? "#52c41a" : "#ff4d4f"}`,
              position: "relative",
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Accent stripe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: isCredit
                  ? "linear-gradient(90deg, #52c41a, #73d13d)"
                  : "linear-gradient(90deg, #ff4d4f, #ff7875)",
              }}
            />

            {/* Expense Name */}
            <Typography
              sx={{
                color: colors.primary_text,
                fontSize: "1.3rem",
                fontWeight: "700",
                marginBottom: "8px",
                letterSpacing: "-0.5px",
              }}
            >
              {expenseName || "Untitled Expense"}
            </Typography>

            {/* Amount - Large and Prominent */}
            <div className="flex items-center gap-3 mb-3">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "10px",
                  backgroundColor: isCredit ? "#52c41a15" : "#ff4d4f15",
                }}
              >
                {isCredit ? (
                  <TrendingUpIcon sx={{ fontSize: 24, color: "#52c41a" }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 24, color: "#ff4d4f" }} />
                )}
                <span
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "800",
                    color: isCredit ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {formatCurrency(amount)}
                </span>
              </div>
              <Chip
                label={isCredit ? "CREDIT" : "EXPENSE"}
                size="small"
                sx={{
                  backgroundColor: isCredit ? "#52c41a" : "#ff4d4f",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.65rem",
                  height: "24px",
                  letterSpacing: "0.5px",
                }}
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <CalendarTodayIcon sx={{ fontSize: 14, color: "#00dac6" }} />
              <span
                style={{
                  color: colors.primary_text,
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                {formatDate(date)}
              </span>
            </div>

            {/* Comments/Notes Section */}
            {comments && (
              <Tooltip
                title={comments.length > 80 ? comments : ""}
                placement="top"
                arrow
                slotProps={{
                  tooltip: {
                    sx: { maxWidth: 350, fontSize: "0.85rem", lineHeight: 1.5 },
                  },
                }}
              >
                <div
                  className="flex items-start gap-2"
                  style={{
                    backgroundColor: colors.secondary_bg,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border_color}`,
                    borderLeft: `3px solid ${isCredit ? "#52c41a" : "#ff4d4f"}`,
                    marginTop: "8px",
                    cursor: comments.length > 80 ? "pointer" : "default",
                  }}
                >
                  <CommentIcon
                    sx={{
                      fontSize: 16,
                      color: isCredit ? "#52c41a" : "#ff4d4f",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      color: colors.primary_text,
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                      margin: 0,
                      fontWeight: "500",
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {comments}
                  </p>
                </div>
              </Tooltip>
            )}
          </div>

          {/* Category Card - Dynamic Color from Category */}
          {(() => {
            const categoryColor = category?.color || "#a855f7";
            return (
              <div
                style={{
                  background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.secondary_bg} 100%)`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `2px solid ${categoryColor}`,
                  position: "relative",
                  overflow: "hidden",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Accent stripe */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}aa)`,
                  }}
                />

                <div className="flex items-center gap-2 mb-3">
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: `${categoryColor}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {category?.icon ? (
                      <span style={{ fontSize: "1.1rem" }}>
                        {category.icon}
                      </span>
                    ) : (
                      <CategoryIcon
                        sx={{ fontSize: 16, color: categoryColor }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.1rem",
                        color: colors.primary_text,
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {category?.name || "Uncategorized"}
                      {category?.color && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: categoryColor,
                            boxShadow: `0 0 6px ${categoryColor}`,
                          }}
                        />
                      )}
                    </span>
                  </div>
                  {category?.percentageOfTotalExpenses > 0 && (
                    <Chip
                      icon={
                        <PercentIcon
                          sx={{ fontSize: 10, color: categoryColor }}
                        />
                      }
                      label={`${category.percentageOfTotalExpenses}%`}
                      size="small"
                      sx={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                        fontWeight: "bold",
                        fontSize: "0.65rem",
                        height: "22px",
                        "& .MuiChip-icon": { marginLeft: "4px" },
                      }}
                    />
                  )}
                </div>

                {category && (
                  <div
                    className="grid grid-cols-2 gap-2"
                    style={{ marginTop: "auto" }}
                  >
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Total number of expenses in this category"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Count
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                        }}
                      >
                        {category.totalExpensesInCategory || 0}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Total amount spent in this category"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Total
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: categoryColor,
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(category.totalAmountInCategory)}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Average expense amount in this category"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Average
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(category.averageAmountInCategory)}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Number of expenses this month in this category"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          This Month
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: categoryColor,
                          fontWeight: "700",
                        }}
                      >
                        {category.expensesThisMonthInCategory || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Payment Method Card - Orange Theme with Dynamic Icon */}
          {(() => {
            const paymentColor = "#f97316";
            return (
              <div
                style={{
                  background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.secondary_bg} 100%)`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  border: `2px solid ${paymentColor}`,
                  position: "relative",
                  overflow: "hidden",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Accent stripe */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${paymentColor}, ${paymentColor}aa)`,
                  }}
                />

                <div className="flex items-center gap-2 mb-3">
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: `${paymentColor}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getPaymentMethodIcon(
                      paymentMethodInfo?.name,
                      paymentColor,
                      18,
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.1rem",
                        color: colors.primary_text,
                        fontWeight: "700",
                      }}
                    >
                      {paymentMethodInfo?.displayName || "Unknown"}
                    </span>
                  </div>
                  {paymentMethodInfo?.percentageOfTotalExpenses > 0 && (
                    <Chip
                      icon={
                        <PercentIcon
                          sx={{ fontSize: 10, color: paymentColor }}
                        />
                      }
                      label={`${paymentMethodInfo.percentageOfTotalExpenses}%`}
                      size="small"
                      sx={{
                        backgroundColor: `${paymentColor}15`,
                        color: paymentColor,
                        fontWeight: "bold",
                        fontSize: "0.65rem",
                        height: "22px",
                        "& .MuiChip-icon": { marginLeft: "4px" },
                      }}
                    />
                  )}
                </div>

                {paymentMethodInfo && (
                  <div
                    className="grid grid-cols-2 gap-2"
                    style={{ marginTop: "auto" }}
                  >
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Total number of expenses using this payment method"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Count
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                        }}
                      >
                        {paymentMethodInfo.totalExpensesWithMethod || 0}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Total amount spent using this payment method"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Total
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: paymentColor,
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(
                          paymentMethodInfo.totalAmountWithMethod,
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Average expense amount with this payment method"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          Average
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(
                          paymentMethodInfo.averageAmountWithMethod,
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: colors.secondary_bg,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Tooltip
                        title="Number of expenses this month with this payment method"
                        arrow
                        placement="top"
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "2px",
                            cursor: "help",
                          }}
                        >
                          This Month
                        </span>
                      </Tooltip>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: paymentColor,
                          fontWeight: "700",
                        }}
                      >
                        {paymentMethodInfo.expensesThisMonthWithMethod || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Column - Statistics & Budgets */}
        <div
          className="flex flex-col gap-3 flex-1"
          style={{ overflow: "hidden" }}
        >
          {/* Occurrence Statistics */}
          {occurrenceInfo && (
            <div
              style={{
                backgroundColor: colors.primary_bg,
                borderRadius: "10px",
                padding: "18px 20px",
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <RepeatIcon sx={{ fontSize: 20, color: "#00dac6" }} />
                <span
                  style={{
                    fontSize: "1rem",
                    color: colors.primary_text,
                    fontWeight: "700",
                  }}
                >
                  Occurrence Statistics
                </span>
                <Chip
                  label={`${occurrenceInfo.totalOccurrences || 0} times`}
                  size="small"
                  sx={{
                    backgroundColor: "#00dac620",
                    color: "#00dac6",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    marginLeft: "auto",
                    height: "26px",
                  }}
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "This Month",
                    value: occurrenceInfo.occurrencesThisMonth || 0,
                    type: "number",
                    icon: (
                      <ScheduleIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                    ),
                    accentColor: "#3b82f6",
                    tooltip: "Number of times this expense occurred this month",
                  },
                  {
                    label: "This Year",
                    value: occurrenceInfo.occurrencesThisYear || 0,
                    type: "number",
                    icon: (
                      <DateRangeIcon sx={{ fontSize: 18, color: "#8b5cf6" }} />
                    ),
                    accentColor: "#8b5cf6",
                    tooltip: "Number of times this expense occurred this year",
                  },
                  {
                    label: "Average",
                    value: occurrenceInfo.averageAmount,
                    type: "currency",
                    highlight: true,
                    icon: (
                      <ShowChartIcon sx={{ fontSize: 18, color: "#00dac6" }} />
                    ),
                    accentColor: "#00dac6",
                    tooltip: "Average amount spent on this expense",
                  },
                  {
                    label: "All Time",
                    value: occurrenceInfo.totalAmountAllTime,
                    type: "currency",
                    highlight: true,
                    icon: (
                      <AccountBalanceWalletIcon
                        sx={{ fontSize: 18, color: "#00dac6" }}
                      />
                    ),
                    accentColor: "#00dac6",
                    tooltip: "Total amount spent on this expense over all time",
                  },
                  {
                    label: "First",
                    value: occurrenceInfo.firstOccurrence,
                    type: "date",
                    icon: <EventIcon sx={{ fontSize: 18, color: "#f59e0b" }} />,
                    accentColor: "#f59e0b",
                    tooltip: "Date of the first occurrence of this expense",
                  },
                  {
                    label: "Last",
                    value: occurrenceInfo.lastOccurrence,
                    type: "date",
                    icon: (
                      <CalendarTodayIcon
                        sx={{ fontSize: 18, color: "#ec4899" }}
                      />
                    ),
                    accentColor: "#ec4899",
                    tooltip:
                      "Date of the most recent occurrence of this expense",
                  },
                  {
                    label: "Min",
                    value: occurrenceInfo.minAmount,
                    type: "currency",
                    icon: (
                      <ArrowDownwardIcon
                        sx={{ fontSize: 18, color: "#22c55e" }}
                      />
                    ),
                    accentColor: "#22c55e",
                    tooltip: "Minimum amount spent on this expense",
                  },
                  {
                    label: "Max",
                    value: occurrenceInfo.maxAmount,
                    type: "currency",
                    icon: (
                      <ArrowUpwardIcon
                        sx={{ fontSize: 18, color: "#ef4444" }}
                      />
                    ),
                    accentColor: "#ef4444",
                    tooltip: "Maximum amount spent on this expense",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: colors.secondary_bg,
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: `1px solid ${colors.border_color}`,
                      borderLeft: `3px solid ${stat.accentColor}`,
                      transition: "all 0.2s ease",
                    }}
                    className="hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {stat.icon}
                      <Tooltip title={stat.tooltip} arrow placement="top">
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: colors.secondary_text,
                            textTransform: "uppercase",
                            fontWeight: "500",
                            letterSpacing: "0.5px",
                            cursor: "help",
                          }}
                        >
                          {stat.label}
                        </span>
                      </Tooltip>
                    </div>
                    <div
                      style={{
                        fontSize: stat.highlight ? "1.15rem" : "1.05rem",
                        fontWeight: "700",
                        color: stat.highlight
                          ? stat.accentColor
                          : colors.primary_text,
                        marginTop: "4px",
                      }}
                    >
                      {stat.type === "currency"
                        ? formatCurrency(stat.value)
                        : stat.type === "date"
                          ? formatDate(stat.value)
                          : stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Budgets */}
          <div
            style={{
              backgroundColor: colors.primary_bg,
              borderRadius: "8px",
              padding: "14px 16px",
              border: `1px solid ${colors.border_color}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header with title and badge */}
            <div className="flex items-center gap-2 mb-3">
              <AccountBalanceWalletIcon
                sx={{ fontSize: 16, color: "#00dac6" }}
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: colors.primary_text,
                  fontWeight: "600",
                }}
              >
                Linked Budgets
              </span>
              {linkedBudgets?.length > 0 && (
                <Chip
                  label={linkedBudgets.length}
                  size="small"
                  sx={{
                    backgroundColor: "#00dac620",
                    color: "#00dac6",
                    fontWeight: "bold",
                    fontSize: "0.65rem",
                    marginLeft: "auto",
                    minWidth: "24px",
                  }}
                />
              )}
            </div>

            {linkedBudgets && linkedBudgets.length > 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Search and Filter Row */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Search Input */}
                  <TextField
                    size="small"
                    placeholder="Search budgets..."
                    value={budgetSearch}
                    onChange={(e) => setBudgetSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ fontSize: 16, color: colors.secondary_text }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      flex: 1,
                      maxWidth: "200px",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: colors.secondary_bg,
                        fontSize: "0.75rem",
                        height: "32px",
                        "& fieldset": { borderColor: colors.border_color },
                        "&:hover fieldset": { borderColor: "#00dac6" },
                        "&.Mui-focused fieldset": { borderColor: "#00dac6" },
                      },
                      "& .MuiInputBase-input": {
                        color: colors.primary_text,
                        padding: "6px 8px",
                        "&::placeholder": {
                          color: colors.secondary_text,
                          opacity: 0.7,
                        },
                      },
                    }}
                  />

                  {/* Status Filter */}
                  <div className="flex items-center gap-1">
                    <FilterListIcon
                      sx={{ fontSize: 14, color: colors.secondary_text }}
                    />
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={budgetStatusFilter}
                        onChange={(e) => setBudgetStatusFilter(e.target.value)}
                        displayEmpty
                        sx={{
                          backgroundColor: colors.secondary_bg,
                          fontSize: "0.7rem",
                          height: "32px",
                          color: colors.primary_text,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border_color,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#00dac6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#00dac6",
                          },
                          "& .MuiSelect-icon": { color: colors.secondary_text },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: colors.secondary_bg,
                              border: `1px solid ${colors.border_color}`,
                              "& .MuiMenuItem-root": {
                                fontSize: "0.7rem",
                                color: colors.primary_text,
                                "&:hover": {
                                  backgroundColor: colors.primary_bg,
                                },
                                "&.Mui-selected": {
                                  backgroundColor: "#00dac620",
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="WARNING">Warning</MenuItem>
                        <MenuItem value="EXCEEDED">Exceeded</MenuItem>
                        <MenuItem value="EXPIRED">Expired</MenuItem>
                        <MenuItem value="CRITICAL">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  {/* Results count */}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: colors.secondary_text,
                      marginLeft: "auto",
                    }}
                  >
                    {processedBudgets.length} of {linkedBudgets.length} budget
                    {linkedBudgets.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Custom Table */}
                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border_color}`,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    {/* Table Header */}
                    <thead>
                      <tr style={{ backgroundColor: colors.secondary_bg }}>
                        {budgetTableColumns.map((col) => (
                          <th
                            key={col.field}
                            onClick={() =>
                              col.sortable && handleBudgetSort(col.field)
                            }
                            style={{
                              width: col.width,
                              padding: "8px 10px",
                              textAlign: "left",
                              fontSize: "0.65rem",
                              fontWeight: "600",
                              color: colors.secondary_text,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              borderBottom: `1px solid ${colors.border_color}`,
                              cursor: col.sortable ? "pointer" : "default",
                              userSelect: "none",
                              whiteSpace: "nowrap",
                              position: "sticky",
                              top: 0,
                              backgroundColor: colors.secondary_bg,
                              zIndex: 1,
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>{col.label}</span>
                              {col.sortable && getSortIcon(col.field)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                      {paginatedBudgets.length > 0 ? (
                        paginatedBudgets.map((budget, idx) => {
                          const percentageValue = budget.percentageUsed || 0;
                          const statusStyle = getStatusStyle(budget.status);
                          return (
                            <tr
                              key={budget.id || idx}
                              style={{
                                backgroundColor:
                                  idx % 2 === 0
                                    ? colors.primary_bg
                                    : colors.secondary_bg + "40",
                                transition: "background-color 0.15s ease",
                              }}
                              className="hover:bg-opacity-80"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  colors.secondary_bg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  idx % 2 === 0
                                    ? colors.primary_bg
                                    : colors.secondary_bg + "40";
                              }}
                            >
                              {/* Budget Name */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: colors.primary_text,
                                  fontWeight: "500",
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Tooltip
                                  title={budget.name}
                                  arrow
                                  placement="top"
                                >
                                  <span style={{ cursor: "default" }}>
                                    {budget.name || "-"}
                                  </span>
                                </Tooltip>
                              </td>
                              {/* Description */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: colors.secondary_text,
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Tooltip
                                  title={budget.description || ""}
                                  arrow
                                  placement="top"
                                >
                                  <span
                                    style={{
                                      cursor: budget.description
                                        ? "default"
                                        : "text",
                                    }}
                                  >
                                    {budget.description || "-"}
                                  </span>
                                </Tooltip>
                              </td>
                              {/* Start Date */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: colors.primary_text,
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatDate(budget.startDate)}
                              </td>
                              {/* End Date */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: colors.primary_text,
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatDate(budget.endDate)}
                              </td>
                              {/* Total */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: colors.primary_text,
                                  fontWeight: "500",
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatCurrency(budget.amount)}
                              </td>
                              {/* Used */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  color: getPercentageColor(percentageValue),
                                  fontWeight: "500",
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatCurrency(budget.usedAmount)}
                              </td>
                              {/* Percentage */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                  color: getPercentageColor(percentageValue),
                                  borderBottom: `1px solid ${colors.border_color}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {percentageValue.toFixed(0)}%
                              </td>
                              {/* Status */}
                              <td
                                style={{
                                  padding: "8px 10px",
                                  borderBottom: `1px solid ${colors.border_color}`,
                                }}
                              >
                                <Chip
                                  label={budget.status || "ACTIVE"}
                                  size="small"
                                  sx={{
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.text,
                                    fontWeight: "bold",
                                    fontSize: "0.55rem",
                                    height: "18px",
                                    "& .MuiChip-label": { padding: "0 6px" },
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={budgetTableColumns.length}
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: colors.secondary_text,
                              fontSize: "0.75rem",
                            }}
                          >
                            No budgets match your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalBudgetPages > 1 && (
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: "8px 0 0 0",
                      borderTop: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: colors.secondary_text,
                      }}
                    >
                      Page {budgetPage + 1} of {totalBudgetPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconButton
                        size="small"
                        onClick={() => setBudgetPage((p) => Math.max(0, p - 1))}
                        disabled={budgetPage === 0}
                        sx={{
                          width: 26,
                          height: 26,
                          color:
                            budgetPage === 0
                              ? colors.secondary_text
                              : "#00dac6",
                          "&:hover": { backgroundColor: "#00dac620" },
                          "&.Mui-disabled": {
                            color: colors.secondary_text + "50",
                          },
                        }}
                      >
                        <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setBudgetPage((p) =>
                            Math.min(totalBudgetPages - 1, p + 1),
                          )
                        }
                        disabled={budgetPage >= totalBudgetPages - 1}
                        sx={{
                          width: 26,
                          height: 26,
                          color:
                            budgetPage >= totalBudgetPages - 1
                              ? colors.secondary_text
                              : "#00dac6",
                          "&:hover": { backgroundColor: "#00dac620" },
                          "&.Mui-disabled": {
                            color: colors.secondary_text + "50",
                          },
                        }}
                      >
                        <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  padding: "20px",
                  backgroundColor: colors.secondary_bg,
                  borderRadius: "6px",
                }}
              >
                <AccountBalanceWalletIcon
                  sx={{
                    fontSize: 32,
                    color: colors.secondary_text,
                    opacity: 0.5,
                    mb: 1,
                  }}
                />
                <Typography
                  sx={{ fontSize: "0.8rem", color: colors.secondary_text }}
                >
                  Not linked to any budget
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpense;
