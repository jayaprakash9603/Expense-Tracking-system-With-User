import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Chip, IconButton, Tooltip } from "@mui/material";
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
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../../components/PageHeader";
import GroupedDataTable from "../../components/common/GroupedDataTable/GroupedDataTable";
import FilterPopover from "../../components/ui/FilterPopover";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewExpenseSkeleton from "../../components/skeletons/ViewExpenseSkeleton";
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

  // --- Filtering State ---
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [filterPopover, setFilterPopover] = useState(null);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleFilterClick = (event, column) => {
    setFilterPopover({
      anchorEl: event.currentTarget,
      column,
    });
  };

  const handleFilterClose = () => setFilterPopover(null);

  const handleFilterApply = (columnKey, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    handleFilterClose();
  };

  const handleFilterClear = (columnKey) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
    handleFilterClose();
  };

  const detectColumnType = (column, rows) => {
    if (column.filterType) return column.filterType;
    if (column.key?.toLowerCase().includes("date")) return "date";
    if (
      column.key === "amount" ||
      column.key === "usedAmount" ||
      column.key === "percentageUsed"
    )
      return "number";
    return "text";
  };

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

  // Navigate to category analytics page
  const handleCategoryClick = (categoryId) => {
    if (categoryId) {
      const categoryPath = friendId
        ? `/category-flow/view/${categoryId}/friend/${friendId}`
        : `/category-flow/view/${categoryId}`;
      navigate(categoryPath);
    }
  };

  // Generate full URL for category tooltip
  const getCategoryUrl = (categoryId) => {
    if (!categoryId) return "";
    const routePath = friendId
      ? `/category-flow/view/${categoryId}/friend/${friendId}`
      : `/category-flow/view/${categoryId}`;
    return `${window.location.origin}${routePath}`;
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

  // Budget table column definitions for GroupedDataTable
  const budgetTableColumns = useMemo(
    () => [
      {
        key: "name",
        label: "Budget",
        sortable: true,
        filterable: true,
        width: "18%",
        render: (val) => (
          <span style={{ fontWeight: "bold" }} title={val}>
            {val}
          </span>
        ),
      },
      {
        key: "description",
        label: "Description",
        sortable: true,
        filterable: true,
        width: "22%",
        render: (val) => (
          <span
            style={{ color: colors?.secondary_text || "#888888" }}
            title={val}
          >
            {val}
          </span>
        ),
      },
      {
        key: "startDate",
        label: "Start",
        sortable: true,
        filterable: true,
        sortType: "date",
        width: "12%",
        render: (val) => formatDate(val),
      },
      {
        key: "endDate",
        label: "End",
        sortable: true,
        filterable: true,
        sortType: "date",
        width: "12%",
        render: (val) => formatDate(val),
      },
      {
        key: "amount",
        label: "Total",
        sortable: true,
        filterable: true,
        width: "12%",
        render: (val) => (
          <span style={{ fontWeight: "bold" }}>{formatCurrency(val)}</span>
        ),
      },
      {
        key: "usedAmount",
        label: "Used",
        sortable: true,
        filterable: true,
        width: "12%",
        render: (val, row) => (
          <span
            style={{
              fontWeight: "bold",
              color: getPercentageColor(row.percentageUsed || 0),
            }}
          >
            {formatCurrency(val)}
          </span>
        ),
      },
      {
        key: "percentageUsed",
        label: "%",
        sortable: true,
        filterable: true,
        width: "6%",
        render: (val) => (
          <span
            style={{ fontWeight: "bold", color: getPercentageColor(val || 0) }}
          >
            {(val || 0).toFixed(0)}%
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        filterable: true,
        width: "10%",
        filterType: "select",
        filterOptions: [
          { value: "ACTIVE", label: "Active" },
          { value: "WARNING", label: "Warning" },
          { value: "EXCEEDED", label: "Exceeded" },
          { value: "EXPIRED", label: "Expired" },
        ],
        render: (val, row) => {
          const statusStyle = getStatusStyle(val);
          return (
            <Chip
              label={val || "ACTIVE"}
              size="small"
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
                fontWeight: "bold",
                fontSize: "0.65rem",
                height: "20px",
                "& .MuiChip-label": { padding: "0 8px" },
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, displayDateFormat, formatDate, formatCurrency],
  );

  const filteredRows = useMemo(() => {
    let rows = expenseDetailedView?.linkedBudgets || [];
    rows = rows.map((b, i) => ({ ...b, id: b.id || `budget-${i}` }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      rows = rows.filter(
        (row) =>
          (row.name && row.name.toLowerCase().includes(lowerSearch)) ||
          (row.description &&
            row.description.toLowerCase().includes(lowerSearch)),
      );
    }

    if (Object.keys(columnFilters).length > 0) {
      rows = rows.filter((row) => {
        return Object.entries(columnFilters).every(([key, filterVal]) => {
          if (!filterVal && filterVal !== 0 && filterVal !== false) return true;
          const colDef = budgetTableColumns.find((c) => c.key === key);
          const val = colDef?.value ? colDef.value(row) : row[key];

          if (val == null) return false;

          if (filterVal.start || filterVal.end) {
            const dateVal = dayjs(val);
            if (!dateVal.isValid()) return false;
            if (
              filterVal.start &&
              dateVal.isBefore(dayjs(filterVal.start), "day")
            )
              return false;
            if (filterVal.end && dateVal.isAfter(dayjs(filterVal.end), "day"))
              return false;
            return true;
          }

          if (Array.isArray(filterVal)) {
            if (filterVal.length === 0) return true;
            return filterVal.includes(val);
          }

          return String(val)
            .toLowerCase()
            .includes(String(filterVal).toLowerCase());
        });
      });
    }
    return rows;
  }, [
    expenseDetailedView?.linkedBudgets,
    search,
    columnFilters,
    budgetTableColumns,
  ]);

  // Loading state with Skeleton
  if (expenseDetailedViewLoading) {
    return (
      <ViewExpenseSkeleton
        onClose={handleOnClose}
        containerStyle={containerStyle}
      />
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
                lineHeight: 1.3,
                wordBreak: "break-word",
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
            <div className="flex items-center gap-2 mb-1">
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
                      overflow: "hidden",
                    }}
                  >
                    <Tooltip
                      title={
                        category?.id
                          ? getCategoryUrl(category.id)
                          : category?.name || "Uncategorized"
                      }
                      arrow
                      placement="top"
                    >
                      <span
                        onClick={() =>
                          category?.id && handleCategoryClick(category.id)
                        }
                        onMouseEnter={(e) => {
                          if (category?.id) {
                            e.currentTarget.style.textDecoration = "underline";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: category?.id ? "pointer" : "default",
                          maxWidth: "180px",
                          transition: "text-decoration 0.2s ease",
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
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </span>
                    </Tooltip>
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
                      overflow: "hidden",
                    }}
                  >
                    <Tooltip
                      title={paymentMethodInfo?.displayName || "Unknown"}
                      arrow
                      placement="top"
                    >
                      <span
                        style={{
                          fontSize: "1.1rem",
                          color: colors.primary_text,
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "default",
                        }}
                      >
                        {paymentMethodInfo?.displayName || "Unknown"}
                      </span>
                    </Tooltip>
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
              // CSS Variables for GroupedDataTable themes
              "--pm-text-primary": colors.primary_text,
              "--pm-text-secondary": colors.secondary_text,
              "--pm-text-tertiary": colors.secondary_text,
              "--pm-bg-primary": colors.primary_bg,
              "--pm-bg-secondary": colors.secondary_bg,
              "--pm-border-color": colors.border_color,
              "--pm-accent-color": "#00dac6",
              "--pm-scrollbar-thumb": "#00dac6",
              "--pm-scrollbar-track": colors.secondary_bg,
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

            {/* Toolbar for GroupedDataTable */}
            <div className="flex items-center justify-between mb-3 px-1">
              <TextField
                placeholder="Search budgets..."
                size="small"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: colors.secondary_text }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "8px",
                    backgroundColor: colors.secondary_bg,
                    fontSize: "0.85rem",
                    height: "36px",
                    "& fieldset": { borderColor: colors.border_color },
                  },
                }}
                sx={{ width: 220 }}
              />
            </div>

            {/* GroupedDataTable for Linked Budgets */}
            <GroupedDataTable
              rows={filteredRows}
              columns={budgetTableColumns}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              onFilterClick={handleFilterClick}
              columnFilters={columnFilters}
              className="pm-table-container"
            />

            {/* Filter Popover Helper */}
            <FilterPopover
              open={Boolean(filterPopover)}
              anchorEl={filterPopover?.anchorEl}
              onClose={handleFilterClose}
              column={filterPopover?.column}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
              currentValue={columnFilters[filterPopover?.column?.key]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpense;
