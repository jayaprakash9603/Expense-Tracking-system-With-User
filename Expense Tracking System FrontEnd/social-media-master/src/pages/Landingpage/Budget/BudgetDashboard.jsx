import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBudgetData,
  deleteBudgetData,
  getBudgetById,
  getBudgetReportById,
} from "../../../Redux/Budget/budget.action";
import { getExpensesByBudgetId } from "../../../Redux/Expenses/expense.action";

// Material UI imports
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  useMediaQuery,
  Tabs,
  Tab,
  Skeleton,
  Tooltip,
  Paper,
  Fade,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

// Icons
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Description as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  DateRange as DateRangeIcon,
  Sort as SortIcon,
} from "@mui/icons-material";

// Charts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

// Toast notification component
import ToastNotification from "../ToastNotification";

const BudgetDashboard = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tabValue, setTabValue] = useState(0);
  const [sortOption, setSortOption] = useState("endDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterOptions, setFilterOptions] = useState({
    showActive: true,
    showCompleted: true,
    showExceeded: true,
  });
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetDetailsOpen, setBudgetDetailsOpen] = useState(false);

  // Responsive design
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");

  // Router and Redux
  const { friendId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { budgets, budget, loading, error } = useSelector(
    (state) => state.budgets
  );
  const { budgetExpenses } = useSelector((state) => state.expenses);

  // Color palette for charts and status indicators
  const COLORS = ["#00DAC6", "#BB86FC", "#03DAC5", "#CF6679", "#FFAB40"];
  const STATUS_COLORS = {
    ACTIVE: "#00DAC6",
    WARNING: "#FFAB40",
    EXCEEDED: "#CF6679",
    COMPLETED: "#BB86FC",
  };

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getBudgetData(friendId || ""));
  }, [dispatch, friendId]);

  // Handle budget selection for details view
  const handleBudgetSelect = (budget) => {
    setSelectedBudget(budget);
    dispatch(getExpensesByBudgetId(budget.id, friendId || ""));
    dispatch(getBudgetReportById(budget.id, friendId || ""));
    setBudgetDetailsOpen(true);
  };

  // Filter and sort budgets
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];

    return budgets
      .filter((budget) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (budget.description &&
            budget.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

        // Status filters
        const today = new Date();
        const endDate = new Date(budget.endDate);
        const isCompleted = endDate < today;
        const isExceeded = budget.remainingAmount < 0;
        const isActive = !isCompleted && !isExceeded;

        const matchesStatusFilter =
          (isActive && filterOptions.showActive) ||
          (isCompleted && filterOptions.showCompleted) ||
          (isExceeded && filterOptions.showExceeded);

        return matchesSearch && matchesStatusFilter;
      })
      .sort((a, b) => {
        // Sort logic
        let comparison = 0;

        switch (sortOption) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "amount":
            comparison = a.amount - b.amount;
            break;
          case "remainingAmount":
            comparison = a.remainingAmount - b.remainingAmount;
            break;
          case "startDate":
            comparison = new Date(a.startDate) - new Date(b.startDate);
            break;
          case "endDate":
            comparison = new Date(a.endDate) - new Date(b.endDate);
            break;
          case "percentUsed":
            const percentA =
              a.amount > 0
                ? ((a.amount - a.remainingAmount) / a.amount) * 100
                : 0;
            const percentB =
              b.amount > 0
                ? ((b.amount - b.remainingAmount) / b.amount) * 100
                : 0;
            comparison = percentA - percentB;
            break;
          default:
            comparison = new Date(a.endDate) - new Date(b.startDate);
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [budgets, searchQuery, filterOptions, sortOption, sortDirection]);

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        exceededBudgets: 0,
        completedBudgets: 0,
        totalAllocated: 0,
        totalRemaining: 0,
        percentUsed: 0,
      };
    }

    const today = new Date();
    let activeBudgets = 0;
    let exceededBudgets = 0;
    let completedBudgets = 0;
    let totalAllocated = 0;
    let totalRemaining = 0;

    budgets.forEach((budget) => {
      const endDate = new Date(budget.endDate);
      if (endDate < today) {
        completedBudgets++;
      } else if (budget.remainingAmount < 0) {
        exceededBudgets++;
      } else {
        activeBudgets++;
      }

      totalAllocated += budget.amount || 0;
      totalRemaining += budget.remainingAmount || 0;
    });

    const percentUsed =
      totalAllocated > 0
        ? ((totalAllocated - totalRemaining) / totalAllocated) * 100
        : 0;

    return {
      totalBudgets: budgets.length,
      activeBudgets,
      exceededBudgets,
      completedBudgets,
      totalAllocated,
      totalRemaining,
      percentUsed,
    };
  }, [budgets]);

  // Get budget status
  const getBudgetStatus = (budget) => {
    const today = new Date();
    const endDate = new Date(budget.endDate);

    if (endDate < today) {
      return "COMPLETED";
    } else if (budget.remainingAmount < 0) {
      return "EXCEEDED";
    } else {
      // Calculate percentage used
      const percentUsed =
        budget.amount > 0
          ? ((budget.amount - budget.remainingAmount) / budget.amount) * 100
          : 0;

      return percentUsed > 80 ? "WARNING" : "ACTIVE";
    }
  };

  // Calculate days remaining for a budget
  const getDaysRemaining = (endDateStr) => {
    const today = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate percentage used for a budget
  const getPercentageUsed = (budget) => {
    if (!budget || budget.amount <= 0) return 0;
    return ((budget.amount - budget.remainingAmount) / budget.amount) * 100;
  };

  // Menu handlers
  const handleMenuOpen = (event, budgetId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedBudgetId(budgetId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedBudgetId(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Action handlers
  const handleNewBudget = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/create/${friendId}`);
    } else {
      navigate("/budget/create");
    }
  };

  const handleEditBudget = () => {
    dispatch(getBudgetById(selectedBudgetId, friendId || ""));
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/edit/${selectedBudgetId}/friend/${friendId}`);
    } else {
      navigate(`/budget/edit/${selectedBudgetId}`);
    }
    handleMenuClose();
  };

  const handleViewReport = () => {
    dispatch(getExpensesByBudgetId(selectedBudgetId, friendId || ""));
    dispatch(getBudgetReportById(selectedBudgetId, friendId || ""));
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/report/${selectedBudgetId}/friend/${friendId}`);
    } else {
      navigate(`/budget/report/${selectedBudgetId}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    const budget = budgets.find((b) => b.id === selectedBudgetId);
    if (budget) {
      setBudgetToDelete(budget);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (budgetToDelete) {
      setIsDeleting(true);
      dispatch(deleteBudgetData(budgetToDelete.id, friendId || ""))
        .then(() => {
          dispatch(getBudgetData(friendId || ""));
          setToast({
            open: true,
            message: "Budget deleted successfully",
            severity: "success",
          });
        })
        .catch((error) => {
          setToast({
            open: true,
            message:
              "Error deleting budget: " + (error.message || "Unknown error"),
            severity: "error",
          });
        })
        .finally(() => {
          setDeleteDialogOpen(false);
          setBudgetToDelete(null);
          setIsDeleting(false);
        });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBudgetToDelete(null);
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    dispatch(getBudgetData(friendId || ""));
    setToast({
      open: true,
      message: "Budgets refreshed",
      severity: "info",
    });
  };

  const handleSortOptionSelect = (option) => {
    if (sortOption === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortOption(option);
      setSortDirection("asc");
    }
    handleSortClose();
  };

  const handleFilterOptionToggle = (option) => {
    setFilterOptions({
      ...filterOptions,
      [option]: !filterOptions[option],
    });
  };

  const handleBudgetDetailsClose = () => {
    setBudgetDetailsOpen(false);
    setSelectedBudget(null);
  };

  // Prepare data for charts
  const pieChartData = useMemo(() => {
    if (!budgetStats) return [];

    return [
      {
        name: "Active",
        value: budgetStats.activeBudgets,
        color: STATUS_COLORS.ACTIVE,
      },
      {
        name: "Warning",
        value: budgetStats.warningBudgets,
        color: STATUS_COLORS.WARNING,
      },
      {
        name: "Exceeded",
        value: budgetStats.exceededBudgets,
        color: STATUS_COLORS.EXCEEDED,
      },
      {
        name: "Completed",
        value: budgetStats.completedBudgets,
        color: STATUS_COLORS.COMPLETED,
      },
    ].filter((item) => item.value > 0);
  }, [budgetStats]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            bgcolor: "#1b1b1b",
            color: "#fff",
            p: 1,
            border: "1px solid #333",
          }}
        >
          <Typography variant="body2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color || "#fff" }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render budget cards based on tab selection
  const renderBudgetCards = () => {
    if (loading) {
      return Array(4)
        .fill(0)
        .map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
            <Skeleton
              variant="rectangular"
              height={220}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ));
    }

    if (error) {
      return (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "#1b1b1b",
              color: "#CF6679",
              border: "1px solid #CF6679",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WarningIcon /> Error Loading Budgets
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error.message ||
                "An unknown error occurred. Please try refreshing."}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2 }}
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Paper>
        </Grid>
      );
    }

    if (filteredBudgets.length === 0) {
      return (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "#1b1b1b",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              No budgets found
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "#aaa" }}>
              {searchQuery
                ? "No budgets match your search criteria. Try adjusting your filters."
                : "You don't have any budgets yet. Create your first budget to start tracking expenses."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewBudget}
              startIcon={<AddIcon />}
            >
              Create Budget
            </Button>
          </Paper>
        </Grid>
      );
    }

    return filteredBudgets.map((budget) => {
      const status = getBudgetStatus(budget);
      const daysRemaining = getDaysRemaining(budget.endDate);
      const percentUsed = getPercentageUsed(budget);

      return (
        <Grid item xs={12} sm={6} md={4} lg={4} key={budget.id}>
          <Card
            sx={{
              bgcolor: "#1b1b1b",
              color: "#fff",
              borderRadius: 2,
              border: `1px solid ${STATUS_COLORS[status]}30`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 6px 12px ${STATUS_COLORS[status]}30`,
              },
              position: "relative",
              overflow: "visible",
            }}
          >
            <Chip
              label={status}
              size="small"
              sx={{
                position: "absolute",
                top: -10,
                right: 16,
                bgcolor: STATUS_COLORS[status],
                color: "#000",
                fontWeight: "bold",
              }}
            />

            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: "bold", maxWidth: "70%" }}
                  noWrap
                >
                  {budget.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, budget.id)}
                  sx={{ color: "#fff" }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography
                variant="body2"
                sx={{ mb: 2, color: "#aaa", height: 40, overflow: "hidden" }}
              >
                {budget.description || "No description"}
              </Typography>

              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Budget Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    ${budget.amount?.toFixed(2) || "0.00"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Remaining
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color:
                        budget.remainingAmount < 0
                          ? STATUS_COLORS.EXCEEDED
                          : "#fff",
                    }}
                  >
                    ${budget.remainingAmount?.toFixed(2) || "0.00"}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption">
                    {percentUsed.toFixed(0)}% Used
                  </Typography>
                  <Typography variant="caption">
                    {status === "COMPLETED"
                      ? "Completed"
                      : `${daysRemaining} days left`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(percentUsed, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "#333",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        percentUsed > 100
                          ? STATUS_COLORS.EXCEEDED
                          : percentUsed > 80
                          ? STATUS_COLORS.WARNING
                          : STATUS_COLORS.ACTIVE,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBudgetSelect(budget)}
                  sx={{
                    borderColor: STATUS_COLORS[status],
                    color: STATUS_COLORS[status],
                    "&:hover": {
                      borderColor: STATUS_COLORS[status],
                      bgcolor: `${STATUS_COLORS[status]}10`,
                    },
                  }}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setSelectedBudgetId(budget.id);
                    handleViewReport();
                  }}
                  sx={{
                    bgcolor: STATUS_COLORS[status],
                    color: "#000",
                    "&:hover": {
                      bgcolor: STATUS_COLORS[status],
                      opacity: 0.9,
                    },
                  }}
                >
                  View Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  return (
    <Box sx={{ bgcolor: "#0b0b0b", minHeight: "100vh" }}>
      <Box
        sx={{
          p: isSmallScreen ? 2 : 3,
          width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
          mr: isSmallScreen ? 0 : "20px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              sx={{ color: "#00DAC6", mr: 1 }}
              onClick={() =>
                friendId
                  ? navigate(`/friends/expenses/${friendId}`)
                  : navigate("/expenses")
              }
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" }}>
              Budget Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton sx={{ color: "#00DAC6" }} onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewBudget}
              sx={{ display: isSmallScreen ? "none" : "flex" }}
            >
              New Budget
            </Button>
            <IconButton
              sx={{
                color: "#fff",
                bgcolor: "#00DAC6",
                display: isSmallScreen ? "flex" : "none",
                "&:hover": { bgcolor: "#00b8a0" },
              }}
              onClick={handleNewBudget}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
                  Total Budgets
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
                  {loading ? <Skeleton width={60} /> : budgetStats.totalBudgets}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${budgetStats.activeBudgets} Active`}
                    sx={{ bgcolor: STATUS_COLORS.ACTIVE, color: "#000" }}
                  />
                  <Chip
                    size="small"
                    label={`${budgetStats.exceededBudgets} Exceeded`}
                    sx={{ bgcolor: STATUS_COLORS.EXCEEDED, color: "#000" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
                  Total Allocated
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
                  {loading ? (
                    <Skeleton width={100} />
                  ) : (
                    `$${budgetStats.totalAllocated.toFixed(2)}`
                  )}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MoneyIcon sx={{ color: "#00DAC6", fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Across all budgets
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
                  Total Remaining
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
                  {loading ? (
                    <Skeleton width={100} />
                  ) : (
                    `$${budgetStats.totalRemaining.toFixed(2)}`
                  )}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(budgetStats.percentUsed, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: "#333",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        budgetStats.percentUsed > 90
                          ? STATUS_COLORS.EXCEEDED
                          : budgetStats.percentUsed > 75
                          ? STATUS_COLORS.WARNING
                          : STATUS_COLORS.ACTIVE,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#aaa", mt: 0.5, display: "block" }}
                >
                  {budgetStats.percentUsed.toFixed(0)}% of total budget used
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "#1b1b1b",
                color: "#fff",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
                  Budget Status
                </Typography>
                {loading ? (
                  <Skeleton
                    variant="rectangular"
                    height={100}
                    sx={{ borderRadius: 1 }}
                  />
                ) : (
                  <Box sx={{ flex: 1, minHeight: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={25}
                          paddingAngle={2}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isSmallScreen ? "stretch" : "center",
            mb: 2,
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
            <TextField
              placeholder="Search budgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "#1b1b1b",
                  color: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#555",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00DAC6",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
              sx={{
                color: "#fff",
                borderColor: "#333",
                "&:hover": { borderColor: "#555", bgcolor: "#1b1b1b" },
              }}
            >
              Filter
            </Button>

            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              sx={{
                color: "#fff",
                borderColor: "#333",
                "&:hover": { borderColor: "#555", bgcolor: "#1b1b1b" },
              }}
            >
              Sort
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": { bgcolor: "#00DAC6" },
            "& .MuiTab-root": { color: "#aaa" },
            "& .Mui-selected": { color: "#00DAC6" },
          }}
        >
          <Tab label="All Budgets" />
          <Tab label="Active" />
          <Tab label="Exceeded" />
          <Tab label="Completed" />
        </Tabs>

        {/* Budget Cards */}
        <Grid container spacing={2}>
          {renderBudgetCards()}
        </Grid>
      </Box>

      {/* Budget Details Dialog */}
      <Dialog
        open={budgetDetailsOpen}
        onClose={handleBudgetDetailsClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { bgcolor: "#0b0b0b", color: "#fff", borderRadius: 2 },
        }}
      >
        {selectedBudget && (
          <>
            <DialogTitle sx={{ borderBottom: "1px solid #333", pb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">{selectedBudget.name}</Typography>
                <Chip
                  label={getBudgetStatus(selectedBudget)}
                  size="small"
                  sx={{
                    bgcolor: STATUS_COLORS[getBudgetStatus(selectedBudget)],
                    color: "#000",
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: "#1b1b1b" }}>
              <Grid container spacing={2}>
                {/* Budget Details */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    Budget Details
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      {selectedBudget.description || "No description provided"}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Budget Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        ${selectedBudget.amount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Remaining
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                          color:
                            selectedBudget.remainingAmount < 0
                              ? STATUS_COLORS.EXCEEDED
                              : "#fff",
                        }}
                      >
                        ${selectedBudget.remainingAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedBudget.startDate || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        End Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedBudget.endDate || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        {getPercentageUsed(selectedBudget).toFixed(0)}% Used
                      </Typography>
                      <Typography variant="caption">
                        {getDaysRemaining(selectedBudget.endDate)} days
                        remaining
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(getPercentageUsed(selectedBudget), 100)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: "#333",
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            getPercentageUsed(selectedBudget) > 100
                              ? STATUS_COLORS.EXCEEDED
                              : getPercentageUsed(selectedBudget) > 80
                              ? STATUS_COLORS.WARNING
                              : STATUS_COLORS.ACTIVE,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedBudgetId(selectedBudget.id);
                        handleBudgetDetailsClose();
                        handleEditBudget();
                      }}
                      sx={{
                        color: "#fff",
                        borderColor: "#555",
                        "&:hover": {
                          borderColor: "#00DAC6",
                          bgcolor: "#1b1b1b",
                        },
                      }}
                    >
                      Edit Budget
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<ReportIcon />}
                      onClick={() => {
                        setSelectedBudgetId(selectedBudget.id);
                        handleBudgetDetailsClose();
                        handleViewReport();
                      }}
                      sx={{
                        bgcolor: "#00DAC6",
                        color: "#000",
                        "&:hover": { bgcolor: "#00b8a0" },
                      }}
                    >
                      View Report
                    </Button>
                  </Box>
                </Grid>

                {/* Expenses Summary */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    Expenses Summary
                  </Typography>

                  {budgetExpenses && budgetExpenses.length > 0 ? (
                    <>
                      <Box sx={{ height: 200, mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={budgetExpenses
                                .filter(
                                  (exp) => exp.includeInBudget && exp.expense
                                )
                                .reduce((acc, curr) => {
                                  const name =
                                    curr.expense?.expenseName || "Unknown";
                                  const existingItem = acc.find(
                                    (item) => item.name === name
                                  );
                                  if (existingItem) {
                                    existingItem.value +=
                                      curr.expense?.amount || 0;
                                  } else {
                                    acc.push({
                                      name,
                                      value: curr.expense?.amount || 0,
                                    });
                                  }
                                  return acc;
                                }, [])
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 5)}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              innerRadius={40}
                              paddingAngle={2}
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                              labelLine={false}
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>

                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Recent Expenses
                      </Typography>

                      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                        {budgetExpenses
                          .filter((exp) => exp.includeInBudget && exp.expense)
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5)
                          .map((expense, index) => (
                            <Box
                              key={index}
                              sx={{
                                p: 1,
                                mb: 1,
                                bgcolor: "#29282b",
                                borderRadius: 1,
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <Typography variant="body2">
                                  {expense.expense?.expenseName ||
                                    "Unnamed Expense"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#aaa" }}
                                >
                                  {expense.date || "No date"} •{" "}
                                  {expense.expense?.paymentMethod ||
                                    "Unknown method"}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                ${expense.expense?.amount?.toFixed(2) || "0.00"}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "#29282b",
                        borderRadius: 2,
                        textAlign: "center",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        No expenses linked to this budget
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                        Add expenses and mark them to be included in this budget
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleBudgetDetailsClose();
                          navigate("/expenses/create");
                        }}
                        sx={{
                          color: "#00DAC6",
                          borderColor: "#00DAC6",
                          "&:hover": {
                            borderColor: "#00b8a0",
                            bgcolor: "#1b1b1b",
                          },
                        }}
                      >
                        Add Expense
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleBudgetDetailsClose} sx={{ color: "#aaa" }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedBudgetId(selectedBudget.id);
                  handleBudgetDetailsClose();
                  handleViewReport();
                }}
                sx={{
                  bgcolor: "#00DAC6",
                  color: "#000",
                  "&:hover": { bgcolor: "#00b8a0" },
                }}
              >
                View Full Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ color: "#CF6679" }}>Delete Budget</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the budget "{budgetToDelete?.name}"?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#aaa" }}>
            This action cannot be undone. All budget data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: "#aaa" }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ bgcolor: "#CF6679", "&:hover": { bgcolor: "#b55a69" } }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 },
        }}
      >
        <MenuItem
          onClick={() => handleFilterOptionToggle("showActive")}
          sx={{
            color: filterOptions.showActive ? "#00DAC6" : "#aaa",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              checked={filterOptions.showActive}
              sx={{
                color: "#aaa",
                "&.Mui-checked": { color: "#00DAC6" },
              }}
            />
            <Typography>Active Budgets</Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleFilterOptionToggle("showExceeded")}
          sx={{
            color: filterOptions.showExceeded ? "#CF6679" : "#aaa",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              checked={filterOptions.showExceeded}
              sx={{
                color: "#aaa",
                "&.Mui-checked": { color: "#CF6679" },
              }}
            />
            <Typography>Exceeded Budgets</Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleFilterOptionToggle("showCompleted")}
          sx={{
            color: filterOptions.showCompleted ? "#BB86FC" : "#aaa",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              checked={filterOptions.showCompleted}
              sx={{
                color: "#aaa",
                "&.Mui-checked": { color: "#BB86FC" },
              }}
            />
            <Typography>Completed Budgets</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
        PaperProps={{
          sx: { bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 },
        }}
      >
        <MenuItem
          onClick={() => handleSortOptionSelect("name")}
          sx={{
            color: sortOption === "name" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>Name</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "name" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "A-Z" : "Z-A"}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleSortOptionSelect("amount")}
          sx={{
            color: sortOption === "amount" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>Budget Amount</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "amount" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "Low-High" : "High-Low"}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleSortOptionSelect("remainingAmount")}
          sx={{
            color: sortOption === "remainingAmount" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>Remaining Amount</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "remainingAmount" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "Low-High" : "High-Low"}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleSortOptionSelect("startDate")}
          sx={{
            color: sortOption === "startDate" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>Start Date</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "startDate" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "Oldest" : "Newest"}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleSortOptionSelect("endDate")}
          sx={{
            color: sortOption === "endDate" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>End Date</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "endDate" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "Earliest" : "Latest"}
              </Typography>
            )}
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleSortOptionSelect("percentUsed")}
          sx={{
            color: sortOption === "percentUsed" ? "#00DAC6" : "#fff",
            "&:hover": { bgcolor: "#29282b" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography>Percentage Used</Typography>
            <Box sx={{ flex: 1 }} />
            {sortOption === "percentUsed" && (
              <Typography variant="caption">
                {sortDirection === "asc" ? "Low-High" : "High-Low"}
              </Typography>
            )}
          </Box>
        </MenuItem>
      </Menu>

      {/* Budget Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { bgcolor: "#1b1b1b", color: "#fff", borderRadius: 2 },
        }}
      >
        <MenuItem
          onClick={handleViewReport}
          sx={{ "&:hover": { bgcolor: "#29282b" } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReportIcon fontSize="small" sx={{ color: "#00DAC6" }} />
            <Typography>View Report</Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={handleEditBudget}
          sx={{ "&:hover": { bgcolor: "#29282b" } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon fontSize="small" sx={{ color: "#BB86FC" }} />
            <Typography>Edit Budget</Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ bgcolor: "#333" }} />

        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: "#CF6679", "&:hover": { bgcolor: "#29282b" } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon fontSize="small" />
            <Typography>Delete Budget</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Toast Notification */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleToastClose}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1b1b1b;
        }

        ::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #00dac6;
        }
      `}</style>
    </Box>
  );
};

export default BudgetDashboard;
