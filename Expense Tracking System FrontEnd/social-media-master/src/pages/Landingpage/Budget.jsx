import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBudgetData,
  deleteBudgetData,
  getBudgetById,
  getBudgetReportById,
  getListOfBudgetsById,
  getDetailedBudgetReport,
} from "../../Redux/Budget/budget.action";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getExpensesAction,
  getExpensesByBudgetId,
} from "../../Redux/Expenses/expense.action";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Skeleton,
  Box,
  Divider,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  TextField,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Popover,
  MenuList,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Description as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Modal from "./Modal";
import ToastNotification from "./ToastNotification";
import useFriendAccess from "../../hooks/useFriendAccess";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import SharedOverviewCards from "../../components/charts/SharedOverviewCards";

const Budget = () => {
  const { colors, isDarkMode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  // View States
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Active, 2: Expired, 3: Reports

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortBy, setSortBy] = useState("name"); // 'name', 'amount', 'remaining', 'date'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // Table States
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortModel, setSortModel] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Menu & Modal States
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBudgetId, setMenuBudgetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "" });

  // Responsive
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");

  // Router
  const { friendId } = useParams();
  const location = useLocation();
  const hideBackButton = location?.state?.fromSidebar === true;
  const isFriendView = Boolean(friendId);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgets, loading, error } = useSelector((state) => state.budgets);
  const { hasWriteAccess } = useFriendAccess(friendId);

  useEffect(() => {
    dispatch(getBudgetData(friendId));
    dispatch(getExpensesAction("desc", friendId));
  }, [dispatch, friendId]);

  // Filter budgets by date when filterDate changes
  useEffect(() => {
    if (filterDate) {
      dispatch(getListOfBudgetsById(filterDate, friendId));
    } else {
      dispatch(getBudgetData(friendId));
    }
  }, [filterDate, dispatch, friendId]);

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        totalAmount: 0,
        totalSpent: 0,
        totalRemaining: 0,
      };
    }

    const today = new Date();
    const active = budgets.filter((b) => {
      const endDate = new Date(b.endDate);
      return endDate >= today;
    });
    const expired = budgets.filter((b) => {
      const endDate = new Date(b.endDate);
      return endDate < today;
    });

    const totalAmount = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalRemaining = budgets.reduce(
      (sum, b) => sum + (b.remainingAmount || 0),
      0
    );
    const totalSpent = totalAmount - totalRemaining;

    return {
      total: budgets.length,
      active: active.length,
      expired: expired.length,
      totalAmount,
      totalSpent,
      totalRemaining,
    };
  }, [budgets]);

  // Filter and sort budgets
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];

    let filtered = [...budgets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    const today = new Date();
    if (activeTab === 1) {
      // Active budgets
      filtered = filtered.filter((b) => {
        const endDate = new Date(b.endDate);
        return endDate >= today;
      });
    } else if (activeTab === 2) {
      // Expired budgets
      filtered = filtered.filter((b) => {
        const endDate = new Date(b.endDate);
        return endDate < today;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "amount":
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case "remaining":
          comparison = (a.remainingAmount || 0) - (b.remainingAmount || 0);
          break;
        case "date":
          comparison = new Date(a.startDate || 0) - new Date(b.startDate || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [budgets, searchQuery, activeTab, sortBy, sortOrder]);

  // Prepare data for SharedOverviewCards (budget mode)
  const overviewCardsData = useMemo(() => {
    return [
      {
        totalBudgets: budgetStats.total,
        activeBudgets: budgetStats.active,
        totalSpent: budgetStats.totalSpent,
        totalRemaining: budgetStats.totalRemaining,
      },
    ];
  }, [budgetStats]);

  const handleNewBudgetClick = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/create/${friendId}`);
    } else {
      navigate("/budget/create");
    }
  };

  const handleNavigateReports = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/reports/friend/${friendId}`);
    } else {
      navigate(`/reports`);
    }
  };

  const handleMenuClick = (event, budgetId) => {
    setMenuAnchor(event.currentTarget);
    setMenuBudgetId(budgetId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuBudgetId(null);
  };

  const handleEdit = () => {
    dispatch(getBudgetById(menuBudgetId, friendId || ""));
    if (friendId == "" || friendId == undefined) {
      navigate(`/budget/edit/${menuBudgetId}`);
    } else {
      navigate(`/budget/edit/${menuBudgetId}/friend/${friendId}`);
    }
    handleMenuClose();
  };

  const handleReport = async (budgetId) => {
    const id = budgetId || menuBudgetId;
    // Call the detailed budget report API
    await dispatch(getDetailedBudgetReport(id, friendId || ""));
    handleMenuClose();
    if (friendId && friendId !== "undefined") {
      navigate(`/budget-report/${id}/${friendId}`);
    } else {
      navigate(`/budget-report/${id}`);
    }
  };

  const handleDelete = () => {
    const budget = budgets.find((b) => b.id === menuBudgetId);
    if (budget) {
      setBudgetToDelete(budget);
      setIsDeleteModalOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      setIsDeleting(true);
      dispatch(deleteBudgetData(budgetToDelete.id, friendId || ""))
        .then(() => {
          dispatch(getBudgetData(friendId || ""));
          setToast({ open: true, message: "Budget deleted successfully." });
        })
        .catch((error) => {
          console.error("Error deleting budget:", error);
          setToast({
            open: true,
            message: "Error deleting budget. Please try again.",
          });
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setBudgetToDelete(null);
          setIsDeleting(false);
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleToastClose = () => {
    setToast({ open: false, message: "" });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getBudgetStatus = (budget) => {
    const endDate = new Date(budget.endDate);
    const today = new Date();
    const remaining = budget.remainingAmount || 0;
    const amount = budget.amount || 1;
    const percentage = (remaining / amount) * 100;

    if (endDate < today) {
      return { status: "expired", color: "#757575", label: "Expired" };
    } else if (percentage <= 10) {
      return { status: "critical", color: "#f44336", label: "Critical" };
    } else if (percentage <= 30) {
      return { status: "warning", color: "#ff9800", label: "Warning" };
    } else {
      return { status: "active", color: "#4caf50", label: "Active" };
    }
  };

  // Render Budget Card
  const renderBudgetCard = (budget) => {
    const statusInfo = getBudgetStatus(budget);
    const spent = (budget.amount || 0) - (budget.remainingAmount || 0);
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return (
      <Card
        key={budget.id}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.tertiary_bg} 100%)`,
          border: `1px solid ${colors.border_color}`,
          borderRadius: "12px",
          transition: "all 0.3s ease",
          position: "relative",
          zIndex: 1,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 24px rgba(20, 184, 166, 0.15)`,
            borderColor: colors.primary_accent,
            zIndex: 1000,
          },
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  mb: 0.5,
                }}
              >
                {budget.name}
              </Typography>
              <Chip
                label={statusInfo.label}
                size="small"
                sx={{
                  bgcolor: `${statusInfo.color}20`,
                  color: statusInfo.color,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "20px",
                }}
              />
            </Box>
            {hasWriteAccess && (
              <IconButton
                onClick={(e) => handleMenuClick(e, budget.id)}
                sx={{
                  color: colors.primary_accent,
                  "&:hover": { bgcolor: colors.hover_bg },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Description */}
          {budget.description && (
            <Typography
              variant="body2"
              sx={{
                color: colors.secondary_text,
                mb: 2,
                fontSize: "0.85rem",
                lineHeight: 1.4,
              }}
            >
              {budget.description}
            </Typography>
          )}

          {/* Amount Info */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: colors.secondary_text, fontSize: "0.8rem" }}
              >
                Spent: {currencySymbol}
                {spent.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.secondary_text, fontSize: "0.8rem" }}
              >
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: colors.tertiary_bg,
                "& .MuiLinearProgress-bar": {
                  bgcolor:
                    progress > 90
                      ? "#f44336"
                      : progress > 70
                      ? "#ff9800"
                      : colors.primary_accent,
                  borderRadius: 4,
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: colors.primary_text, fontSize: "0.9rem" }}
              >
                <strong>Budget:</strong> {currencySymbol}
                {budget.amount?.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color:
                    budget.remainingAmount < 0
                      ? "#f44336"
                      : colors.primary_accent,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                Remaining: {currencySymbol}
                {budget.remainingAmount?.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Date Range */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pt: 1,
              borderTop: `1px solid ${colors.border_color}`,
            }}
          >
            <CalendarIcon sx={{ color: colors.icon_muted, fontSize: "1rem" }} />
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
            >
              {budget.startDate} - {budget.endDate}
            </Typography>
          </Box>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "flex-end",
            px: 2,
            pb: 2,
            pt: 0,
          }}
        >
          <Button
            size="small"
            startIcon={<ReportIcon fontSize="small" />}
            onClick={() => handleReport(budget.id)}
            sx={{
              color: colors.primary_accent,
              textTransform: "none",
              fontSize: "0.8rem",
              "&:hover": { bgcolor: colors.hover_bg },
            }}
          >
            View Report
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Define columns based on screen size.
  // For small screens: only name, start date, end date and remaining (short headers)
  // For larger screens: include description, amount and action button.
  const columns = useMemo(() => {
    const baseSmall = [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        minWidth: 120,
        maxWidth: 200,
        sortable: true,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                color: colors.primary_text,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {params.value || "N/A"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "remainingAmount",
        headerName: "Remaining",
        flex: 1,
        minWidth: 100,
        maxWidth: 180,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: params.value < 0 ? "#f44336" : colors.primary_accent,
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {currencySymbol}
            {params.value ? params.value.toFixed(2) : "0.00"}
          </Typography>
        ),
      },
    ];
    const baseLarge = [
      {
        field: "name",
        headerName: "Name",
        flex: 1.5,
        minWidth: 140,
        maxWidth: 220,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {params.value || "N/A"}
          </Typography>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 150,
        maxWidth: 350,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.8rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value || "N/A"}
          </Typography>
        ),
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 0.8,
        minWidth: 90,
        maxWidth: 120,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: colors.primary_text,
              fontSize: "0.875rem",
            }}
          >
            {currencySymbol}
            {params.value ? params.value.toFixed(2) : "0.00"}
          </Typography>
        ),
      },
      {
        field: "startDate",
        headerName: "Start",
        flex: 0.7,
        minWidth: 85,
        maxWidth: 110,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.8rem",
            }}
          >
            {params.value || "N/A"}
          </Typography>
        ),
      },
      {
        field: "endDate",
        headerName: "End",
        flex: 0.7,
        minWidth: 85,
        maxWidth: 110,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: colors.secondary_text,
              fontSize: "0.8rem",
            }}
          >
            {params.value || "N/A"}
          </Typography>
        ),
      },
      {
        field: "remainingAmount",
        headerName: "Remaining",
        flex: 0.9,
        minWidth: 95,
        maxWidth: 140,
        sortable: true,
        renderCell: (params) => (
          <Typography
            sx={{
              color: params.value < 0 ? "#f44336" : colors.primary_accent,
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {currencySymbol}
            {params.value ? params.value.toFixed(2) : "0.00"}
          </Typography>
        ),
      },
      {
        field: "spentAmount",
        headerName: "Spent",
        flex: 0.8,
        minWidth: 90,
        maxWidth: 130,
        sortable: true,
        renderCell: (params) => {
          const spentAmount = params.row.amount - params.row.remainingAmount;
          return (
            <Typography
              sx={{
                color:
                  spentAmount > params.row.amount
                    ? "#f44336"
                    : colors.secondary_text,
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              {currencySymbol}
              {spentAmount ? spentAmount.toFixed(2) : "0.00"}
            </Typography>
          );
        },
      },
      {
        field: "percentageUsed",
        headerName: "% Used",
        flex: 0.7,
        minWidth: 75,
        maxWidth: 100,
        sortable: true,
        renderCell: (params) => {
          const spentAmount = params.row.amount - params.row.remainingAmount;
          const percentage =
            params.row.amount > 0
              ? Math.min((spentAmount / params.row.amount) * 100, 100)
              : 0;
          const getColor = () => {
            if (percentage >= 90) return "#f44336";
            if (percentage >= 70) return "#ff9800";
            return colors.primary_accent;
          };
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: "6px",
                  bgcolor: colors.tertiary_bg,
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${percentage}%`,
                    height: "100%",
                    bgcolor: getColor(),
                    transition: "width 0.3s",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  color: getColor(),
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  minWidth: "35px",
                }}
              >
                {percentage.toFixed(0)}%
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "daysRemaining",
        headerName: "Days Left",
        flex: 0.7,
        minWidth: 75,
        maxWidth: 100,
        sortable: true,
        renderCell: (params) => {
          const endDate = new Date(params.row.endDate);
          const today = new Date();
          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          const getColor = () => {
            if (daysLeft < 0) return "#9e9e9e";
            if (daysLeft <= 7) return "#f44336";
            if (daysLeft <= 30) return "#ff9800";
            return colors.primary_accent;
          };
          const getText = () => {
            if (daysLeft < 0) return "Expired";
            if (daysLeft === 0) return "Today";
            if (daysLeft === 1) return "1 day";
            return `${daysLeft} days`;
          };
          return (
            <Chip
              label={getText()}
              size="small"
              sx={{
                bgcolor: `${getColor()}20`,
                color: getColor(),
                height: "22px",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            />
          );
        },
      },
    ];

    const actionCol = [
      {
        field: "actions",
        headerName: "",
        width: 40,
        sortable: false,
        renderCell: (params) =>
          hasWriteAccess ? (
            <IconButton
              onClick={(e) => handleMenuClick(e, params.row.id)}
              sx={{
                color: colors.primary_accent,
                "&:hover": {
                  color: colors.primary_accent,
                  opacity: 0.8,
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => handleReport(params.row.id)}
              sx={{
                color: colors.primary_accent,
                "&:hover": {
                  color: colors.primary_accent,
                  opacity: 0.8,
                },
              }}
            >
              <ReportIcon fontSize="small" />
            </IconButton>
          ),
      },
    ];

    return isSmallScreen
      ? [...baseSmall, ...actionCol]
      : [...baseLarge, ...actionCol];
  }, [
    isSmallScreen,
    hasWriteAccess,
    friendId,
    navigate,
    colors,
    currencySymbol,
  ]);

  const rows = useMemo(
    () =>
      filteredBudgets?.map((budget) => ({
        id: budget.id,
        name: budget.name,
        description: budget.description,
        amount: budget.amount,
        startDate: budget.startDate,
        endDate: budget.endDate,
        remainingAmount: budget.remainingAmount,
      })) || [],
    [filteredBudgets]
  );

  const modalData = budgetToDelete
    ? {
        name: budgetToDelete.name || "N/A",
        amount: budgetToDelete.amount
          ? `${currencySymbol}${budgetToDelete.amount.toFixed(2)}`
          : "N/A",
        description: budgetToDelete.description || "N/A",
        startDate: budgetToDelete.startDate || "N/A",
        endDate: budgetToDelete.endDate || "N/A",
        remainingAmount: budgetToDelete.remainingAmount
          ? `${currencySymbol}${budgetToDelete.remainingAmount.toFixed(2)}`
          : "N/A",
      }
    : {};

  return (
    <>
      <Box
        sx={{
          bgcolor: colors.secondary_bg,
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          p: isSmallScreen ? 1.5 : 2,
          mr: isSmallScreen ? 0 : "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isSmallScreen ? "flex-start" : "center",
            mb: 1.5,
            gap: isSmallScreen ? 1 : 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {!hideBackButton && (
              <IconButton
                sx={{
                  color: colors.primary_accent,
                  backgroundColor: colors.primary_bg,
                  border: `1px solid ${colors.border_color}`,
                  "&:hover": {
                    backgroundColor: colors.hover_bg,
                    borderColor: colors.primary_accent,
                  },
                  width: 36,
                  height: 36,
                }}
                onClick={() =>
                  friendId && friendId !== "undefined"
                    ? navigate(`/friends/expenses/${friendId}`)
                    : navigate("/expenses")
                }
                aria-label="Back"
              >
                <svg
                  width="20"
                  height="20"
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
            )}
            <Typography
              variant="h3"
              sx={{
                color: colors.primary_text,
                fontWeight: "bold",
                fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
              }}
            >
              Budget Management
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {hasWriteAccess && (
              <Button
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={handleNewBudgetClick}
                sx={{
                  textTransform: "none",
                  bgcolor: colors.primary_accent,
                  color: colors.button_text,
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  fontSize: "0.875rem",
                  borderRadius: "6px",
                  "&:hover": {
                    bgcolor: colors.tertiary_accent,
                  },
                }}
              >
                New Budget
              </Button>
            )}
            <IconButton
              onClick={handleViewModeToggle}
              sx={{
                color: colors.primary_accent,
                bgcolor: colors.primary_bg,
                border: `1px solid ${colors.border_color}`,
                borderRadius: "6px",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                  borderColor: colors.primary_accent,
                },
              }}
            >
              {viewMode === "cards" ? (
                <ViewListIcon fontSize="small" />
              ) : (
                <ViewModuleIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ borderColor: colors.border_color, mb: 1.5 }} />

        {/* Statistics Cards */}
        <SharedOverviewCards
          data={overviewCardsData}
          mode="budget"
          currencySymbol={currencySymbol}
        />

        {/* Tabs */}
        <Box
          sx={{
            mb: 2,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            backgroundColor: colors.primary_bg,
            border: "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                py: 2,
                minHeight: 60,
                color: colors.secondary_text,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&.Mui-selected": {
                  color: colors.primary_accent,
                  transform: "scale(1.02)",
                },
                "&:hover": {
                  color: colors.primary_accent,
                  backgroundColor: `${colors.primary_accent}14`,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                backgroundColor: colors.primary_accent,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              "& .MuiTabs-flexContainer": {
                position: "relative",
              },
              transition: "background-color 0.3s ease",
            }}
          >
            <Tab label={`All (${budgets?.length || 0})`} />
            <Tab label={`Active (${budgetStats.active})`} />
            <Tab label={`Expired (${budgetStats.expired})`} />
          </Tabs>
        </Box>

        {/* Filters & Search Bar - Redesigned with MUI Components */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.tertiary_bg} 100%)`,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "12px",
            p: 2,
            mb: 2,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {/* Search Input - Takes Half Width */}
            <Box sx={{ flex: isSmallScreen ? 1 : 0.5 }}>
              <TextField
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        color: colors.primary_accent,
                        mr: 1,
                        fontSize: "1.2rem",
                      }}
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.secondary_bg,
                    color: colors.primary_text,
                    borderRadius: "8px",
                    height: "48px",
                    "& fieldset": {
                      borderColor: colors.border_color,
                      borderWidth: "1.5px",
                    },
                    "&:hover fieldset": {
                      borderColor: colors.primary_accent,
                      borderWidth: "1.5px",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary_accent,
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                    "&::placeholder": {
                      color: colors.icon_muted,
                      opacity: 0.8,
                    },
                  },
                }}
              />
            </Box>

            {/* Filter and Sort Controls - Takes Half Width */}
            <Box
              sx={{
                flex: isSmallScreen ? 1 : 0.5,
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: 2,
              }}
            >
              {/* Date Filter with MUI DatePicker */}
              <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Filter by Date"
                    value={filterDate ? dayjs(filterDate) : null}
                    onChange={(newValue) => {
                      setFilterDate(
                        newValue ? newValue.format("YYYY-MM-DD") : ""
                      );
                    }}
                    format={dateFormat}
                    sx={{
                      flex: 1,
                      "& .MuiInputBase-root": {
                        bgcolor: colors.secondary_bg,
                        color: colors.primary_text,
                        borderRadius: "8px",
                        height: "48px",
                        fontSize: "0.875rem",
                      },
                      "& .MuiInputBase-input": {
                        color: colors.primary_text,
                        fontSize: "0.875rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.secondary_text,
                        fontSize: "0.875rem",
                        "&.Mui-focused": {
                          color: colors.primary_accent,
                        },
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: colors.border_color,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "1.5px",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary_accent,
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiSvgIcon-root": {
                        color: colors.primary_accent,
                      },
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        variant: "outlined",
                        fullWidth: true,
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "48px",
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            bgcolor: colors.primary_bg,
                            color: colors.primary_text,
                            border: `1px solid ${colors.border_color}`,
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                          },
                          "& .MuiPickersDay-root": {
                            color: colors.primary_text,
                            "&:hover": {
                              bgcolor: colors.hover_bg,
                            },
                            "&.Mui-selected": {
                              bgcolor: `${colors.primary_accent} !important`,
                              color: colors.button_text,
                              "&:hover": {
                                bgcolor: `${colors.secondary_accent} !important`,
                              },
                            },
                          },
                          "& .MuiPickersCalendarHeader-root": {
                            color: colors.primary_text,
                          },
                          "& .MuiPickersCalendarHeader-label": {
                            color: colors.primary_text,
                          },
                          "& .MuiPickersArrowSwitcher-button": {
                            color: colors.primary_accent,
                          },
                          "& .MuiDayCalendar-weekDayLabel": {
                            color: colors.primary_accent,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                {filterDate && (
                  <IconButton
                    onClick={() => setFilterDate("")}
                    sx={{
                      color: colors.primary_text,
                      bgcolor: colors.secondary_bg,
                      border: `1.5px solid ${colors.border_color}`,
                      borderRadius: "8px",
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: colors.hover_bg,
                        borderColor: colors.primary_accent,
                        color: colors.primary_accent,
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 12px rgba(20, 184, 166, 0.3)`,
                      },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {/* Sort Controls with MUI Select */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flex: 1,
                }}
              >
                <FormControl size="small" fullWidth variant="outlined">
                  <InputLabel
                    sx={{
                      color: colors.secondary_text,
                      fontSize: "0.875rem",
                      backgroundColor: colors.secondary_bg,
                      px: 0.5,
                      "&.Mui-focused": {
                        color: colors.primary_accent,
                      },
                    }}
                  >
                    Sort By
                  </InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      bgcolor: colors.secondary_bg,
                      color: colors.primary_text,
                      borderRadius: "8px",
                      height: "48px",
                      fontSize: "0.875rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.border_color,
                        borderWidth: "1.5px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary_accent,
                        borderWidth: "1.5px",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary_accent,
                        borderWidth: "2px",
                      },
                      "& .MuiSvgIcon-root": {
                        color: colors.primary_accent,
                      },
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.5,
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: colors.primary_bg,
                          color: colors.primary_text,
                          border: `1px solid ${colors.border_color}`,
                          borderRadius: "8px",
                          mt: 0.5,
                          maxHeight: 300,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                          "& .MuiMenuItem-root": {
                            fontSize: "0.875rem",
                            py: 1.5,
                            px: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            "&:hover": {
                              bgcolor: colors.hover_bg,
                            },
                            "&.Mui-selected": {
                              bgcolor: colors.active_bg,
                              "&:hover": { bgcolor: colors.hover_bg },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="name">
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        📝 Name
                      </Typography>
                    </MenuItem>
                    <MenuItem value="amount">
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        💰 Amount
                      </Typography>
                    </MenuItem>
                    <MenuItem value="remaining">
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        💵 Remaining
                      </Typography>
                    </MenuItem>
                    <MenuItem value="date">
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        📆 Date
                      </Typography>
                    </MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  onClick={handleSortToggle}
                  sx={{
                    color: sortOrder === "asc" ? "#fff" : colors.primary_text,
                    bgcolor:
                      sortOrder === "asc"
                        ? colors.primary_accent
                        : colors.secondary_bg,
                    border: `1.5px solid ${colors.border_color}`,
                    borderRadius: "8px",
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: colors.primary_accent,
                      color: "#fff",
                      borderColor: colors.primary_accent,
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px rgba(20, 184, 166, 0.3)`,
                    },
                  }}
                >
                  <SortIcon
                    fontSize="small"
                    sx={{
                      transform:
                        sortOrder === "desc"
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content Section with Scroll */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: colors.tertiary_bg,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: colors.primary_accent,
              borderRadius: "4px",
              "&:hover": {
                background: colors.secondary_accent,
              },
            },
          }}
        >
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: 280,
                      borderRadius: "12px",
                      bgcolor: colors.tertiary_bg,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
              }}
            >
              <Typography color="error">
                Error: {error.message || "Failed to load budgets."}
              </Typography>
            </Box>
          ) : filteredBudgets.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                gap: 2,
              }}
            >
              <TrendingUpIcon
                sx={{ fontSize: "4rem", color: colors.icon_muted }}
              />
              <Typography
                sx={{ color: colors.secondary_text, fontSize: "1.1rem" }}
              >
                No budgets found. Create your first budget!
              </Typography>
              {hasWriteAccess && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewBudgetClick}
                  sx={{
                    textTransform: "none",
                    bgcolor: colors.primary_accent,
                    color: colors.button_text,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: "8px",
                    "&:hover": {
                      bgcolor: colors.tertiary_accent,
                    },
                  }}
                >
                  Create Budget
                </Button>
              )}
            </Box>
          ) : viewMode === "cards" ? (
            <Grid container spacing={2}>
              {filteredBudgets.map((budget) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={isMediumScreen ? 6 : 4}
                  key={budget.id}
                >
                  {renderBudgetCard(budget)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                paginationMode="client"
                sortingMode="client"
                checkboxSelection={hasWriteAccess}
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10, 15, 20]}
                paginationModel={{ page: pageIndex, pageSize }}
                onPaginationModelChange={(model) => {
                  setPageIndex(model.page);
                  setPageSize(model.pageSize);
                  setSelectedRows([]);
                }}
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={setSelectedRows}
                rowHeight={58}
                headerHeight={50}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary_bg} 0%, ${colors.tertiary_bg} 100%)`,
                  color: colors.primary_text,
                  border: `1px solid ${colors.border_color}`,
                  borderRadius: "12px",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: `0 4px 20px rgba(20, 184, 166, 0.1)`,
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      height: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: colors.tertiary_bg,
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: colors.primary_accent,
                      borderRadius: "4px",
                      "&:hover": {
                        background: colors.secondary_accent,
                      },
                    },
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: "0.875rem",
                    py: 0,
                    borderColor: colors.border_color,
                    color: colors.primary_text,
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    fontSize: "0.8rem",
                    background: colors.tertiary_bg,
                    color: colors.primary_text,
                    borderColor: colors.border_color,
                    fontWeight: 700,
                    minHeight: "50px !important",
                    maxHeight: "50px !important",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    padding: "0 8px",
                  },
                  "& .MuiDataGrid-row": {
                    minHeight: "55px !important",
                    maxHeight: "55px !important",
                    borderColor: colors.border_color,
                    "&:hover": {
                      background: colors.hover_bg,
                    },
                  },
                  "& .MuiCheckbox-root": {
                    color: `${colors.primary_accent} !important`,
                    padding: "4px",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    background: colors.primary_bg,
                    borderColor: colors.border_color,
                    color: colors.primary_text,
                    minHeight: "50px",
                  },
                  "& .MuiTablePagination-root": {
                    color: colors.primary_text,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      fontSize: "0.8rem",
                    },
                  "& .MuiDataGrid-toolbarContainer": {
                    color: colors.primary_text,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Action Menu */}
        {hasWriteAccess && (
          <Popover
            open={Boolean(menuAnchor)}
            anchorEl={menuAnchor}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                bgcolor: colors.primary_bg,
                border: `1px solid ${colors.primary_accent}`,
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                mt: 1,
                minWidth: "180px",
              },
            }}
          >
            <MenuList sx={{ py: 1 }}>
              <MenuItem
                onClick={handleEdit}
                sx={{
                  color: colors.primary_text,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: colors.hover_bg,
                  },
                }}
              >
                <EditIcon
                  sx={{ mr: 2, color: "#4caf50", fontSize: "1.1rem" }}
                />
                <Typography variant="body2">Edit Budget</Typography>
              </MenuItem>
              <MenuItem
                onClick={handleDelete}
                sx={{
                  color: colors.primary_text,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: colors.hover_bg,
                  },
                }}
              >
                <DeleteIcon
                  sx={{ mr: 2, color: "#f44336", fontSize: "1.1rem" }}
                />
                <Typography variant="body2">Delete Budget</Typography>
              </MenuItem>
            </MenuList>
          </Popover>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={isDeleting ? undefined : handleCancelDelete}
        title="Delete Budget Confirmation"
        data={modalData}
        headerNames={{
          name: "Name",
          amount: "Amount",
          description: "Description",
          startDate: "Start Date",
          endDate: "End Date",
          remainingAmount: "Remaining",
        }}
        onApprove={handleConfirmDelete}
        onDecline={isDeleting ? undefined : handleCancelDelete}
        approveText={
          isDeleting ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="loader"
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #fff",
                  borderTop: "2px solid #00DAC6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              ></span>
              Deleting...
            </span>
          ) : (
            "Yes, Delete"
          )
        }
        declineText="No, Cancel"
        confirmationText={`Are you sure you want to delete the budget "${budgetToDelete?.name}"? This action cannot be undone.`}
        approveDisabled={isDeleting}
        declineDisabled={isDeleting}
      />

      {/* Toast Notification */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Budget;
