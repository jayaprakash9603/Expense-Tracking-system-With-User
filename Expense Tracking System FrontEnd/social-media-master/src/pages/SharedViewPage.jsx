import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CardActions,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Receipt as ReceiptIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon,
  Payment as PaymentIcon,
  CalendarToday as DateIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Notifications as NotificationsIcon,
  CreditCard as CreditCardIcon,
  ReceiptLong as BillIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";
import { useMasking } from "../hooks/useMasking";
import { accessShare, clearShareError } from "../Redux/Shares/shares.actions";
import { createExpenseAction } from "../Redux/Expenses/expense.action";
import { toggleTheme } from "../Redux/Theme/theme.actions";
import { updateUserSettings } from "../Redux/UserSettings/userSettings.action";
import { BRAND_GRADIENT_COLORS } from "../config/themeConfig";
import Modal from "./Landingpage/Modal";
import {
  InlineSearchBar,
  UniversalSearchModal,
} from "../components/common/UniversalSearch";
import NotificationsPanelRedux from "../components/common/NotificationsPanelRedux";
import ProfileDropdown from "../components/common/ProfileDropdown";

// LocalStorage key for tracking added items per share token
const getAddedItemsKey = (token) => `shared_added_items_${token}`;

// Page size for pagination
const PAGE_SIZE = 50;

// Resource type icons mapping
const RESOURCE_ICONS = {
  EXPENSE: <ReceiptIcon />,
  CATEGORY: <CategoryIcon />,
  BUDGET: <BudgetIcon />,
  BILL: <BillIcon />,
  PAYMENT_METHOD: <PaymentIcon />,
};

// Resource type colors mapping
const RESOURCE_COLORS = {
  EXPENSE: "#10b981",
  CATEGORY: "#8b5cf6",
  BUDGET: "#f59e0b",
  BILL: "#ef4444",
  PAYMENT_METHOD: "#3b82f6",
};

/**
 * Brand Logo Component
 */
const BrandLogo = ({ size = "medium" }) => {
  const fontSize =
    size === "small" ? "16px" : size === "large" ? "24px" : "20px";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[0].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        Ex
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[1].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        p
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[2].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        en
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[3].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        s
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[4].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        i
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[5].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
        }}
      >
        o
      </span>
      <span
        style={{
          color: BRAND_GRADIENT_COLORS[6].color,
          fontSize,
          fontWeight: 700,
          fontFamily: "Syncopate, sans-serif",
          ml: 0.5,
        }}
      >
        {" "}
        Finance
      </span>
    </Box>
  );
};

/**
 * Page to display shared data when accessing a share link.
 * Validates the token and displays data based on permission level.
 */
const SharedViewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Masking hook for hiding amounts
  const { isMasking, toggleMasking } = useMasking();
  const maskingEnabled = isMasking();

  const {
    sharedData: accessedShare,
    sharedDataLoading: accessLoading,
    sharedDataError: accessError,
  } = useSelector((state) => state.shares);
  const currentUser = useSelector((state) => state.auth?.user);
  const isLoggedIn = Boolean(currentUser && localStorage.getItem("jwt"));

  const [hasAttemptedAccess, setHasAttemptedAccess] = useState(false);
  const [addedExpenses, setAddedExpenses] = useState(new Set());
  const [addingExpense, setAddingExpense] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Header dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Pagination state
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState(0);

  // Load previously added items from localStorage on mount
  useEffect(() => {
    if (token) {
      try {
        const savedItems = localStorage.getItem(getAddedItemsKey(token));
        if (savedItems) {
          const parsed = JSON.parse(savedItems);
          setAddedExpenses(new Set(parsed));
        }
      } catch (e) {
        console.error("Error loading saved added items:", e);
      }
    }
  }, [token]);

  // Save added items to localStorage whenever they change
  useEffect(() => {
    if (token && addedExpenses.size > 0) {
      try {
        localStorage.setItem(
          getAddedItemsKey(token),
          JSON.stringify([...addedExpenses]),
        );
      } catch (e) {
        console.error("Error saving added items:", e);
      }
    }
  }, [token, addedExpenses]);

  // Access the share on mount
  useEffect(() => {
    if (token && !hasAttemptedAccess) {
      setHasAttemptedAccess(true);
      dispatch(accessShare(token));
    }

    return () => {
      dispatch(clearShareError());
    };
  }, [token, dispatch, hasAttemptedAccess]);

  // Handle adding expense to user's account
  const handleAddToMyAccount = async (expenseData) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    const expense = expenseData.expense || {};
    const expenseId = expenseData.id;

    if (addedExpenses.has(expenseId)) {
      toast.info("This expense has already been added to your account");
      return;
    }

    setAddingExpense(expenseId);

    try {
      // Create a new expense based on the shared data
      const newExpense = {
        date: expenseData.date || new Date().toISOString().split("T")[0],
        categoryId: null, // User will need to assign their own category
        categoryName: expenseData.categoryName || "Uncategorized",
        includeInBudget: false,
        expense: {
          expenseName: expense.expenseName || "Shared Expense",
          amount: expense.amount || 0,
          type: expense.type || "DEBIT",
          paymentMethod: expense.paymentMethod || "CASH",
          netAmount: expense.netAmount || expense.amount || 0,
          comments: `Copied from shared data. Original notes: ${expense.comments || "None"}`,
          creditDue: expense.creditDue || 0,
        },
      };

      await dispatch(createExpenseAction(newExpense));
      setAddedExpenses((prev) => new Set([...prev, expenseId]));
      toast.success(
        `"${expense.expenseName || "Expense"}" added to your account!`,
      );
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setAddingExpense(null);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Save current URL to redirect back after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    setShowLoginDialog(false);
    navigate("/login");
  };

  // Handle signup redirect
  const handleSignupRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/register");
  };

  // Helper to navigate to login with redirect
  const navigateToLogin = () => {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Update user settings in backend if logged in
    if (isLoggedIn) {
      const newMode = isDark ? "light" : "dark";
      dispatch(updateUserSettings({ themeMode: newMode })).catch((error) => {
        console.error("Failed to update theme setting:", error);
      });
    }
  };

  // Handle load more
  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // ==========================================
  // DATA PROCESSING - Must be before early returns to avoid conditional hook calls
  // ==========================================

  // Map response to expected format - backend returns flat structure
  const shareInfo = accessedShare
    ? {
        shareName: accessedShare.shareName,
        permission: accessedShare.permission,
        resourceType: accessedShare.resourceType,
        expiresAt: accessedShare.expiresAt,
        owner: accessedShare.owner,
        originalCount: accessedShare.originalCount,
        returnedCount: accessedShare.returnedCount,
      }
    : null;

  // Extract actual data from SharedItem wrapper - items have { type, externalRef, data, found }
  const rawItems = accessedShare?.items || [];
  const allData = rawItems
    .filter((item) => item.found && item.data) // Only show items that were found
    .map((item) => item.data); // Extract the actual data
  const warnings = accessedShare?.warnings || [];

  // Filter and search data - useMemo must be called unconditionally
  const filteredData = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    let result = [...allData];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const expense = item.expense || {};
        return (
          expense.expenseName?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term) ||
          item.name?.toLowerCase().includes(term) ||
          expense.comments?.toLowerCase().includes(term)
        );
      });
    }

    // Apply sorting
    if (sortBy === "amount-high") {
      result.sort(
        (a, b) =>
          (b.expense?.amount || b.amount || 0) -
          (a.expense?.amount || a.amount || 0),
      );
    } else if (sortBy === "amount-low") {
      result.sort(
        (a, b) =>
          (a.expense?.amount || a.amount || 0) -
          (b.expense?.amount || b.amount || 0),
      );
    } else if (sortBy === "date-new") {
      result.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0),
      );
    } else if (sortBy === "date-old") {
      result.sort(
        (a, b) =>
          new Date(a.date || a.createdAt || 0) -
          new Date(b.date || b.createdAt || 0),
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => {
        const nameA = a.expense?.expenseName || a.name || "";
        const nameB = b.expense?.expenseName || b.name || "";
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [allData, searchTerm, sortBy]);

  // Paginated data - useMemo must be called unconditionally
  const paginatedData = useMemo(() => {
    return filteredData.slice(0, displayCount);
  }, [filteredData, displayCount]);

  const hasMore = displayCount < filteredData.length;
  const totalItems = filteredData.length;
  const displayedItems = paginatedData.length;

  // Stats summary - useMemo must be called unconditionally
  const stats = useMemo(() => {
    if (shareInfo?.resourceType === "EXPENSE" && allData.length > 0) {
      const totalAmount = allData.reduce(
        (sum, item) => sum + (item.expense?.amount || 0),
        0,
      );
      const creditCount = allData.filter(
        (item) => item.expense?.type === "CREDIT",
      ).length;
      const debitCount = allData.filter(
        (item) => item.expense?.type === "DEBIT",
      ).length;
      return { totalAmount, creditCount, debitCount };
    }
    return {};
  }, [allData, shareInfo?.resourceType]);

  // ==========================================
  // EARLY RETURNS - After all hooks
  // ==========================================

  // Loading state
  if (accessLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: colors.accent, mb: 2 }} />
          <Typography sx={{ color: colors.secondary_text }}>
            Loading shared content...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (accessError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            textAlign: "center",
            backgroundColor: colors.card_bg,
            p: 4,
          }}
        >
          <WarningIcon sx={{ fontSize: 64, color: colors.error, mb: 2 }} />
          <Typography variant="h5" sx={{ color: colors.primary_text, mb: 2 }}>
            Share Not Available
          </Typography>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: colors.error + "15",
              color: colors.error,
              "& .MuiAlert-icon": { color: colors.error },
            }}
          >
            {accessError}
          </Alert>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, mb: 3 }}
          >
            The share link you're trying to access may have expired, been
            revoked, or does not exist.
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: colors.accent,
              "&:hover": { backgroundColor: colors.accent_hover },
            }}
          >
            Go to Home
          </Button>
        </Card>
      </Box>
    );
  }

  // No data state
  if (!accessedShare) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Typography sx={{ color: colors.secondary_text }}>
          No shared content found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.secondary_bg,
      }}
    >
      {/* Universal Search Modal - Opens with Ctrl/Cmd + K */}
      {isLoggedIn && <UniversalSearchModal />}

      {/* Fixed Header - Matching dashboard header height (50px) */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          height: 50,
          backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            px: isMobile ? 2 : 3,
            maxWidth: "1536px",
            mx: "auto",
          }}
        >
          {/* Left Section: Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Logo */}
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => navigate("/")}
            >
              <BrandLogo size={isMobile ? "small" : "medium"} />
            </Box>

            {/* Back to Dashboard - Only for logged in users on desktop */}
            {isLoggedIn && !isMobile && (
              <Button
                variant="text"
                startIcon={<HomeIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  color: colors.primary_text,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* Right Section: Auth buttons or Full Header Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 1 : 1.5,
            }}
          >
            {isLoggedIn ? (
              <>
                {/* Inline Search Bar - Desktop only */}
                {!isMobile && <InlineSearchBar />}

                {/* Masking Toggle Button */}
                <Tooltip
                  title={maskingEnabled ? "Show Amounts" : "Hide Amounts"}
                >
                  <IconButton
                    onClick={toggleMasking}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#2d2d2d" : "#f3f4f6",
                      "&:hover": {
                        backgroundColor: isDark ? "#3d3d3d" : "#e5e7eb",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    {maskingEnabled ? (
                      <VisibilityOffIcon
                        sx={{
                          fontSize: 20,
                          color: isDark ? "#d1d5db" : "#374151",
                        }}
                      />
                    ) : (
                      <ViewIcon
                        sx={{
                          fontSize: 20,
                          color: isDark ? "#d1d5db" : "#374151",
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Theme Toggle Button */}
                <Tooltip
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  <IconButton
                    onClick={handleThemeToggle}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#2d2d2d" : "#f3f4f6",
                      "&:hover": {
                        backgroundColor: isDark ? "#3d3d3d" : "#e5e7eb",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    {isDark ? (
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: "#facc15" }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Box>
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: "#374151" }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </Box>
                    )}
                  </IconButton>
                </Tooltip>

                {/* Notifications Button */}
                <Box sx={{ position: "relative" }}>
                  <Tooltip title="Notifications">
                    <IconButton
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: isDark ? "#2d2d2d" : "#f3f4f6",
                        "&:hover": {
                          backgroundColor: isDark ? "#3d3d3d" : "#e5e7eb",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      <Badge badgeContent={0} color="error" max={99}>
                        <NotificationsIcon
                          sx={{
                            fontSize: 20,
                            color: isDark ? "#d1d5db" : "#374151",
                          }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  {/* Notifications Panel */}
                  {isNotificationsOpen && (
                    <NotificationsPanelRedux
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  )}
                </Box>

                {/* Profile Dropdown */}
                <ProfileDropdown showModeSwitch={true} />
              </>
            ) : (
              <>
                {/* Login / Signup buttons for non-logged in users */}
                <Button
                  variant="outlined"
                  onClick={navigateToLogin}
                  sx={{
                    borderColor: colors.accent,
                    color: colors.accent,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    py: 0.5,
                    px: 2,
                    minHeight: 32,
                    "&:hover": {
                      borderColor: colors.accent,
                      backgroundColor: colors.accent + "10",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSignupRedirect}
                  sx={{
                    backgroundColor: colors.accent,
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    py: 0.5,
                    px: 2,
                    minHeight: 32,
                    "&:hover": {
                      backgroundColor: colors.accent_hover || colors.accent,
                    },
                    display: isMobile ? "none" : "flex",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Share Info Header Card */}
        <Paper
          sx={{
            background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            p: 3,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left: Share Title and Info */}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor:
                      RESOURCE_COLORS[shareInfo?.resourceType] || colors.accent,
                  }}
                >
                  {RESOURCE_ICONS[shareInfo?.resourceType] || <ReceiptIcon />}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.primary_text,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {shareInfo?.shareName || "Shared Content"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      icon={<ValidIcon sx={{ fontSize: 16 }} />}
                      label="Valid Share"
                      size="small"
                      sx={{
                        backgroundColor: "#10b98120",
                        color: "#10b981",
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                    <Chip
                      icon={
                        shareInfo?.permission === "VIEW" ? (
                          <ViewIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <EditIcon sx={{ fontSize: 16 }} />
                        )
                      }
                      label={
                        shareInfo?.permission === "VIEW"
                          ? "View Only"
                          : "Edit Access"
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          shareInfo?.permission === "VIEW"
                            ? "#3b82f620"
                            : "#f59e0b20",
                        color:
                          shareInfo?.permission === "VIEW"
                            ? "#3b82f6"
                            : "#f59e0b",
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                    <Chip
                      label={shareInfo?.resourceType}
                      size="small"
                      sx={{
                        backgroundColor:
                          (RESOURCE_COLORS[shareInfo?.resourceType] ||
                            colors.accent) + "20",
                        color:
                          RESOURCE_COLORS[shareInfo?.resourceType] ||
                          colors.accent,
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Owner and Expiry Info */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon
                    sx={{ fontSize: 18, color: colors.secondary_text }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.secondary_text }}
                  >
                    Shared by{" "}
                    <strong style={{ color: colors.primary_text }}>
                      {shareInfo?.owner?.firstName || "User"}{" "}
                      {shareInfo?.owner?.lastName || ""}
                    </strong>
                  </Typography>
                </Box>
                {shareInfo?.expiresAt && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TimeIcon
                      sx={{ fontSize: 18, color: colors.secondary_text }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: colors.secondary_text }}
                    >
                      Expires:{" "}
                      <strong style={{ color: colors.primary_text }}>
                        {formatDate(shareInfo.expiresAt)}
                      </strong>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Right: Stats Summary */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Total Items Card */}
              <Paper
                sx={{
                  p: 2,
                  minWidth: 120,
                  textAlign: "center",
                  backgroundColor: colors.hover_bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ color: colors.accent, fontWeight: 700 }}
                >
                  {totalItems}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary_text }}
                >
                  Total Items
                </Typography>
              </Paper>

              {/* Resource-specific stats */}
              {shareInfo?.resourceType === "EXPENSE" &&
                stats.totalAmount > 0 && (
                  <Paper
                    sx={{
                      p: 2,
                      minWidth: 140,
                      textAlign: "center",
                      backgroundColor: colors.hover_bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "#10b981", fontWeight: 700 }}
                    >
                      {formatCurrency(stats.totalAmount)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.secondary_text }}
                    >
                      Total Amount
                    </Typography>
                  </Paper>
                )}
            </Box>
          </Box>
        </Paper>

        {/* Filter and Search Bar */}
        <Paper
          sx={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Search Field */}
            <TextField
              placeholder="Search items..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: colors.secondary_bg,
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.accent },
                  "&.Mui-focused fieldset": { borderColor: colors.accent },
                },
                "& .MuiInputBase-input": { color: colors.primary_text },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.secondary_text }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Sort Dropdown */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: colors.secondary_bg,
                  color: colors.primary_text,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.accent,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.accent,
                  },
                  "& .MuiSvgIcon-root": { color: colors.primary_text },
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon sx={{ color: colors.secondary_text, mr: 0.5 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="default">Default Order</MenuItem>
                <MenuItem value="name">Sort by Name</MenuItem>
                <MenuItem value="amount-high">Amount: High to Low</MenuItem>
                <MenuItem value="amount-low">Amount: Low to High</MenuItem>
                <MenuItem value="date-new">Date: Newest First</MenuItem>
                <MenuItem value="date-old">Date: Oldest First</MenuItem>
              </Select>
            </FormControl>

            {/* Items Count Badge */}
            <Chip
              label={`Showing ${displayedItems} of ${totalItems}`}
              sx={{
                backgroundColor: colors.accent + "20",
                color: colors.accent,
                fontWeight: 500,
              }}
            />
          </Box>
        </Paper>

        {/* Warnings Alert */}
        {warnings && warnings.length > 0 && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "#f59e0b15",
              color: "#f59e0b",
              border: `1px solid #f59e0b40`,
              "& .MuiAlert-icon": { color: "#f59e0b" },
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Some items are no longer available:
            </Typography>
            {warnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                • {warning}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Shared Data Display */}
        <Paper
          sx={{
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            p: 3,
          }}
        >
          {/* Add to account info for expenses */}
          {shareInfo?.resourceType === "EXPENSE" &&
            paginatedData?.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                  p: 2,
                  backgroundColor: colors.accent + "10",
                  borderRadius: 2,
                  border: `1px solid ${colors.accent}30`,
                }}
              >
                <Typography variant="body2" sx={{ color: colors.primary_text }}>
                  💡 Click <strong>"Add to My Account"</strong> to copy any
                  expense to your records
                </Typography>
                {!isLoggedIn && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={navigateToLogin}
                    sx={{
                      borderColor: colors.accent,
                      color: colors.accent,
                      textTransform: "none",
                      "&:hover": { backgroundColor: colors.accent + "10" },
                    }}
                  >
                    Login to Add
                  </Button>
                )}
              </Box>
            )}

          {/* Expenses Grid */}
          {shareInfo?.resourceType === "EXPENSE" && (
            <Grid container spacing={3}>
              {paginatedData?.map((expenseData, index) => {
                // ExpenseDTO structure: { id, date, categoryName, expense: { expenseName, amount, ... } }
                const expense = expenseData.expense || {};
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={expenseData.id || index}
                  >
                    <Card
                      sx={{
                        background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 24px rgba(20, 184, 166, 0.15)`,
                          borderColor: colors.accent,
                        },
                      }}
                    >
                      <CardContent sx={{ flex: 1, p: 2 }}>
                        {/* Header with amount and type badge */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h5"
                              sx={{
                                color:
                                  expense.type === "CREDIT"
                                    ? "#f59e0b"
                                    : "#10b981",
                                fontWeight: 700,
                              }}
                            >
                              {expense.type === "CREDIT" ? "-" : "+"}
                              {formatCurrency(
                                expense.amount || expense.netAmount || 0,
                              )}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: colors.primary_text,
                                fontWeight: 500,
                                mt: 0.5,
                              }}
                            >
                              {expense.expenseName || "Unnamed Expense"}
                            </Typography>
                          </Box>
                          <Chip
                            label={expense.type || "DEBIT"}
                            size="small"
                            sx={{
                              backgroundColor:
                                expense.type === "CREDIT"
                                  ? "#f59e0b20"
                                  : "#10b98120",
                              color:
                                expense.type === "CREDIT"
                                  ? "#f59e0b"
                                  : "#10b981",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>

                        {/* Category Badge */}
                        <Chip
                          icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                          label={expenseData.categoryName || "Uncategorized"}
                          size="small"
                          sx={{
                            backgroundColor: colors.accent + "15",
                            color: colors.accent,
                            mb: 2,
                            height: 24,
                            "& .MuiChip-icon": { color: colors.accent },
                          }}
                        />

                        {/* Details */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {/* Date */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DateIcon
                              sx={{
                                fontSize: 16,
                                color: colors.secondary_text,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: colors.secondary_text }}
                            >
                              {expenseData.date || "N/A"}
                            </Typography>
                          </Box>

                          {/* Payment Method */}
                          {expense.paymentMethod && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PaymentIcon
                                sx={{
                                  fontSize: 16,
                                  color: colors.secondary_text,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: colors.secondary_text }}
                              >
                                {expense.paymentMethod}
                              </Typography>
                            </Box>
                          )}

                          {/* Comments Preview */}
                          {expense.comments && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.secondary_text,
                                mt: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontStyle: "italic",
                              }}
                            >
                              "{expense.comments}"
                            </Typography>
                          )}
                        </Box>
                      </CardContent>

                      {/* Action Button */}
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        {addedExpenses.has(expenseData.id) ? (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ValidIcon />}
                            disabled
                            sx={{
                              backgroundColor: "#10b981",
                              color: "#fff",
                              "&.Mui-disabled": {
                                backgroundColor: "#10b981",
                                color: "#fff",
                                opacity: 0.9,
                              },
                            }}
                          >
                            Added ✓
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              addingExpense === expenseData.id ? (
                                <CircularProgress size={18} />
                              ) : (
                                <AddIcon />
                              )
                            }
                            onClick={() => handleAddToMyAccount(expenseData)}
                            disabled={addingExpense === expenseData.id}
                            sx={{
                              borderColor: colors.accent,
                              color: colors.accent,
                              textTransform: "none",
                              fontWeight: 500,
                              "&:hover": {
                                borderColor: colors.accent,
                                backgroundColor: colors.accent + "10",
                              },
                            }}
                          >
                            {addingExpense === expenseData.id
                              ? "Adding..."
                              : "Add to My Account"}
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Categories Grid */}
          {shareInfo?.resourceType === "CATEGORY" && (
            <Grid container spacing={3}>
              {paginatedData?.map((category, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={category.id || index}
                >
                  <Card
                    sx={{
                      background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(139, 92, 246, 0.15)`,
                        borderColor: "#8b5cf6",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: category.color || "#8b5cf6",
                          }}
                        >
                          <CategoryIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: colors.primary_text, fontWeight: 600 }}
                          >
                            {category.name}
                          </Typography>
                          {category.type && (
                            <Chip
                              label={category.type}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                backgroundColor: "#8b5cf620",
                                color: "#8b5cf6",
                                mt: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      {category.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.secondary_text,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {category.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Budgets Grid */}
          {shareInfo?.resourceType === "BUDGET" && (
            <Grid container spacing={3}>
              {paginatedData?.map((budget, index) => (
                <Grid item xs={12} sm={6} md={4} key={budget.id || index}>
                  <Card
                    sx={{
                      background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(245, 158, 11, 0.15)`,
                        borderColor: "#f59e0b",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Avatar sx={{ bgcolor: "#f59e0b" }}>
                          <BudgetIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: colors.primary_text, fontWeight: 600 }}
                          >
                            {budget.name || "Budget"}
                          </Typography>
                          <Chip
                            label={budget.period || "Monthly"}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              backgroundColor: "#f59e0b20",
                              color: "#f59e0b",
                              mt: 0.5,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Budget Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: colors.secondary_text }}
                          >
                            Spent
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.primary_text, fontWeight: 500 }}
                          >
                            {formatCurrency(budget.spentAmount)} /{" "}
                            {formatCurrency(budget.amount)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 8,
                            backgroundColor: colors.border,
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${Math.min(((budget.spentAmount || 0) / (budget.amount || 1)) * 100, 100)}%`,
                              backgroundColor:
                                budget.spentAmount > budget.amount
                                  ? "#ef4444"
                                  : "#f59e0b",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: colors.secondary_text }}
                        >
                          {formatDate(budget.startDate)?.split(",")[0]}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.secondary_text }}
                        >
                          {formatDate(budget.endDate)?.split(",")[0]}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Bills Grid */}
          {shareInfo?.resourceType === "BILL" && (
            <Grid container spacing={3}>
              {paginatedData?.map((bill, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={bill.id || index}>
                  <Card
                    sx={{
                      background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(239, 68, 68, 0.15)`,
                        borderColor: "#ef4444",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Avatar sx={{ bgcolor: "#ef4444" }}>
                          <BillIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: colors.primary_text, fontWeight: 600 }}
                          >
                            {bill.name || bill.billName || "Bill"}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ color: "#ef4444", fontWeight: 700 }}
                          >
                            {formatCurrency(bill.amount)}
                          </Typography>
                        </Box>
                      </Box>
                      {bill.dueDate && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <DateIcon
                            sx={{ fontSize: 16, color: colors.secondary_text }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: colors.secondary_text }}
                          >
                            Due: {formatDate(bill.dueDate)?.split(",")[0]}
                          </Typography>
                        </Box>
                      )}
                      {bill.frequency && (
                        <Chip
                          label={bill.frequency}
                          size="small"
                          sx={{
                            mt: 1,
                            height: 22,
                            backgroundColor: "#ef444420",
                            color: "#ef4444",
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Payment Methods Grid */}
          {shareInfo?.resourceType === "PAYMENT_METHOD" && (
            <Grid container spacing={3}>
              {paginatedData?.map((paymentMethod, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={paymentMethod.id || index}
                >
                  <Card
                    sx={{
                      background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(59, 130, 246, 0.15)`,
                        borderColor: "#3b82f6",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "#3b82f6" }}>
                          <CreditCardIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ color: colors.primary_text, fontWeight: 600 }}
                          >
                            {paymentMethod.name ||
                              paymentMethod.methodName ||
                              "Payment Method"}
                          </Typography>
                          {paymentMethod.type && (
                            <Chip
                              label={paymentMethod.type}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                backgroundColor: "#3b82f620",
                                color: "#3b82f6",
                                mt: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      {paymentMethod.description && (
                        <Typography
                          variant="body2"
                          sx={{ color: colors.secondary_text, mt: 2 }}
                        >
                          {paymentMethod.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Empty state */}
          {(!paginatedData || paginatedData.length === 0) && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <LockIcon
                sx={{ fontSize: 64, color: colors.secondary_text, mb: 2 }}
              />
              <Typography
                variant="h6"
                sx={{ color: colors.primary_text, mb: 1 }}
              >
                No Items Found
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No data available in this share."}
              </Typography>
            </Box>
          )}

          {/* Load More Button */}
          {hasMore && paginatedData.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
                startIcon={
                  loadingMore ? (
                    <CircularProgress size={18} />
                  ) : (
                    <ExpandMoreIcon />
                  )
                }
                sx={{
                  minWidth: 200,
                  borderColor: colors.accent,
                  color: colors.accent,
                  textTransform: "none",
                  fontWeight: 500,
                  py: 1.5,
                  "&:hover": {
                    borderColor: colors.accent,
                    backgroundColor: colors.accent + "10",
                  },
                }}
              >
                {loadingMore
                  ? "Loading..."
                  : `Load More (${filteredData.length - displayCount} remaining)`}
              </Button>
            </Box>
          )}

          {/* Summary Footer */}
          {paginatedData.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Showing{" "}
                <strong style={{ color: colors.primary_text }}>
                  {displayedItems}
                </strong>{" "}
                of{" "}
                <strong style={{ color: colors.primary_text }}>
                  {totalItems}
                </strong>{" "}
                items
              </Typography>
              {!hasMore && totalItems > PAGE_SIZE && (
                <Chip
                  label="All items loaded"
                  size="small"
                  sx={{
                    backgroundColor: "#10b98120",
                    color: "#10b981",
                  }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4, pb: 4 }}>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, mb: 2 }}
          >
            This content was shared using <strong>Expensio Finance</strong>{" "}
            secure sharing feature.
          </Typography>
          {isLoggedIn ? (
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{
                borderColor: colors.accent,
                color: colors.accent,
                textTransform: "none",
                "&:hover": {
                  borderColor: colors.accent,
                  backgroundColor: colors.accent + "10",
                },
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={navigateToLogin}
                sx={{
                  borderColor: colors.accent,
                  color: colors.accent,
                  textTransform: "none",
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={handleSignupRedirect}
                sx={{
                  backgroundColor: colors.accent,
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: colors.accent_hover || colors.accent,
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        title="Login Required"
        confirmationText="To add this expense to your account, you need to be logged in. Don't have an account? You can create one during the login process."
        approveText="Go to Login"
        declineText="Cancel"
        approveIcon={<LoginIcon sx={{ fontSize: 18 }} />}
        declineIcon={<BackIcon sx={{ fontSize: 18 }} />}
        onApprove={handleLoginRedirect}
        onDecline={() => setShowLoginDialog(false)}
      />
    </Box>
  );
};

export default SharedViewPage;
