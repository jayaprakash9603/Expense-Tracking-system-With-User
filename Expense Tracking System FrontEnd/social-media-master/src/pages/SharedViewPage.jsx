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
  Button,
  IconButton,
  Tooltip,
  Grid,
  Avatar,
  CardActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  Skeleton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
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
  Login as LoginIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Notifications as NotificationsIcon,
  CreditCard as CreditCardIcon,
  ReceiptLong as BillIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useTheme } from "../hooks/useTheme";
import { useMasking } from "../hooks/useMasking";
import useUserSettings from "../hooks/useUserSettings";
import {
  clearShareError,
  accessSharePaginated,
  loadMoreSharedItems,
  setActiveResourceTab,
  fetchAddedItems,
  trackAddedItem,
} from "../Redux/Shares/shares.actions";
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

// Page size for pagination
const PAGE_SIZE = 50;

// Resource type configuration for tabs
const RESOURCE_TYPES = [
  "EXPENSE",
  "CATEGORY",
  "BUDGET",
  "BILL",
  "PAYMENT_METHOD",
];

// Resource type icons mapping (component references, not JSX elements)
const RESOURCE_ICONS = {
  EXPENSE: ReceiptIcon,
  CATEGORY: CategoryIcon,
  BUDGET: BudgetIcon,
  BILL: BillIcon,
  PAYMENT_METHOD: PaymentIcon,
};

// Resource type colors mapping
const RESOURCE_COLORS = {
  EXPENSE: "#10b981",
  CATEGORY: "#8b5cf6",
  BUDGET: "#f59e0b",
  BILL: "#ef4444",
  PAYMENT_METHOD: "#3b82f6",
};

// Resource type labels for display
const RESOURCE_LABELS = {
  EXPENSE: "Expenses",
  CATEGORY: "Categories",
  BUDGET: "Budgets",
  BILL: "Bills",
  PAYMENT_METHOD: "Payment Methods",
};

/**
 * Skeleton Loading Component for shared items grid
 */
const SharedItemsSkeleton = ({ colors, count = 8 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card
            sx={{
              background: `linear-gradient(145deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              height: "100%",
              p: 2,
            }}
          >
            {/* Amount and Type Skeleton */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box>
                <Skeleton
                  variant="text"
                  width={100}
                  height={32}
                  sx={{ bgcolor: colors.hover_bg }}
                />
                <Skeleton
                  variant="text"
                  width={140}
                  height={20}
                  sx={{ bgcolor: colors.hover_bg }}
                />
              </Box>
              <Skeleton
                variant="rectangular"
                width={50}
                height={24}
                sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
              />
            </Box>

            {/* Category Badge Skeleton */}
            <Skeleton
              variant="rectangular"
              width={100}
              height={24}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1, mb: 2 }}
            />

            {/* Details Skeleton */}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton
                  variant="circular"
                  width={16}
                  height={16}
                  sx={{ bgcolor: colors.hover_bg }}
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={16}
                  sx={{ bgcolor: colors.hover_bg }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton
                  variant="circular"
                  width={16}
                  height={16}
                  sx={{ bgcolor: colors.hover_bg }}
                />
                <Skeleton
                  variant="text"
                  width={100}
                  height={16}
                  sx={{ bgcolor: colors.hover_bg }}
                />
              </Box>
            </Box>

            {/* Description Skeleton */}
            <Skeleton
              variant="text"
              width="100%"
              height={40}
              sx={{ bgcolor: colors.hover_bg, mb: 2 }}
            />

            {/* Button Skeleton */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={36}
              sx={{ bgcolor: colors.hover_bg, borderRadius: 1 }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
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
  const settings = useUserSettings();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  // Masking hook for hiding amounts
  const { isMasking, toggleMasking, formatMaskedAmount } = useMasking();
  const maskingEnabled = isMasking();

  // Redux state - paginated data
  const {
    // New paginated data
    paginatedData,
    paginatedDataLoading,
    paginatedDataError,
    loadMoreLoading,
    // Added items tracking
    addedItems,
  } = useSelector((state) => state.shares);
  const currentUser = useSelector((state) => state.auth?.user);
  const isLoggedIn = Boolean(currentUser && localStorage.getItem("jwt"));

  // Local state
  const [hasAttemptedAccess, setHasAttemptedAccess] = useState(false);
  const [addingExpense, setAddingExpense] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Header dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Separate input state for typing
  const [sortBy, setSortBy] = useState("default");

  // Get the current active tab from Redux
  const activeResourceType = paginatedData?.activeResourceType || "EXPENSE";

  // Get added items set for current token from Redux
  const addedItemsSet = useMemo(() => {
    if (!token || !addedItems?.byToken?.[token]) return new Set();
    return addedItems.byToken[token];
  }, [token, addedItems]);

  // Access the share on mount - first get overview, then load first tab data
  useEffect(() => {
    if (token && !hasAttemptedAccess) {
      setHasAttemptedAccess(true);
      // First, get the overview with counts per type
      dispatch(accessSharePaginated(token, "ALL", 0, PAGE_SIZE)).then(
        (result) => {
          if (result.success && result.data?.countsByType) {
            // Find the first type that has items
            const counts = result.data.countsByType;
            const firstTypeWithItems =
              RESOURCE_TYPES.find((type) => counts[type] > 0) || "EXPENSE";
            // Load the first page of that type
            dispatch(
              accessSharePaginated(token, firstTypeWithItems, 0, PAGE_SIZE),
            );
          }
        },
      );
      // Also fetch added items if logged in
      if (isLoggedIn) {
        dispatch(fetchAddedItems(token));
      }
    }

    return () => {
      dispatch(clearShareError());
    };
  }, [token, dispatch, hasAttemptedAccess, isLoggedIn]);

  // Fetch added items when user logs in
  useEffect(() => {
    if (token && isLoggedIn && hasAttemptedAccess) {
      dispatch(fetchAddedItems(token));
    }
  }, [token, isLoggedIn, hasAttemptedAccess, dispatch]);

  // Handle tab change - load data for new resource type
  const handleTabChange = useCallback(
    (resourceType) => {
      dispatch(setActiveResourceTab(resourceType));

      // Reset search when changing tabs
      setSearchInput("");
      setSearchTerm("");

      // Check if we already have data for this type (without search)
      const typeData = paginatedData?.itemsByType?.[resourceType];
      if (!typeData || typeData.items.length === 0) {
        // Load first page for this type
        dispatch(accessSharePaginated(token, resourceType, 0, PAGE_SIZE, ""));
      }
    },
    [dispatch, token, paginatedData?.itemsByType],
  );

  // Handle search - only triggers on icon click or Enter key
  const handleSearch = useCallback(() => {
    const query = searchInput.trim();
    setSearchTerm(query);
    // Reload data with search filter
    dispatch(
      accessSharePaginated(token, activeResourceType, 0, PAGE_SIZE, query),
    );
  }, [dispatch, token, activeResourceType, searchInput]);

  // Handle search input key press (search on Enter)
  const handleSearchKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    dispatch(accessSharePaginated(token, activeResourceType, 0, PAGE_SIZE, ""));
  }, [dispatch, token, activeResourceType]);

  // Handle load more for current tab
  const handleLoadMore = useCallback(() => {
    const typeData = paginatedData?.itemsByType?.[activeResourceType];
    if (typeData && typeData.hasMore) {
      const nextPage = typeData.page + 1;
      dispatch(
        loadMoreSharedItems(
          token,
          activeResourceType,
          nextPage,
          PAGE_SIZE,
          searchTerm,
        ),
      );
    }
  }, [
    dispatch,
    token,
    activeResourceType,
    paginatedData?.itemsByType,
    searchTerm,
  ]);

  // Handle adding expense to user's account with persistent tracking
  const handleAddToMyAccount = async (expenseData, externalRef) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    const expense = expenseData.expense || {};
    const expenseId = expenseData.id;

    // Check against persistent tracking (from Redux/API)
    if (addedItemsSet.has(externalRef)) {
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

      const result = await dispatch(createExpenseAction(newExpense));

      // Track the added item via API for persistent storage
      await dispatch(
        trackAddedItem(token, {
          externalRef: externalRef,
          resourceType: "EXPENSE",
          originalOwnerId: paginatedData?.owner?.id,
          newItemId: result?.id || null,
        }),
      );

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

  // Format date using user settings
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format(dateFormat + " HH:mm");
  };

  // Format currency with masking support
  const formatCurrency = (amount) => {
    if (maskingEnabled) {
      return formatMaskedAmount ? formatMaskedAmount(amount) : "***";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // ==========================================
  // DATA PROCESSING - Must be before early returns to avoid conditional hook calls
  // ==========================================

  // Map paginated response to expected format
  const shareInfo = paginatedData?.isValid
    ? {
        shareName: paginatedData.shareName,
        permission: paginatedData.permission,
        resourceType: paginatedData.resourceType,
        expiresAt: paginatedData.expiresAt,
        owner: paginatedData.owner,
        totalCount: paginatedData.totalCount || 0,
        countsByType: paginatedData.countsByType || {},
      }
    : null;

  // Get current tab's data
  const currentTabData = paginatedData?.itemsByType?.[activeResourceType] || {
    items: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
    hasMore: false,
  };

  // Extract items with their metadata (externalRef for tracking)
  const currentItems = useMemo(
    () => currentTabData.items || [],
    [currentTabData.items],
  );
  const warnings = paginatedData?.warnings || [];

  // Filter and search current tab's data - useMemo must be called unconditionally
  const filteredData = useMemo(() => {
    if (!currentItems || currentItems.length === 0) return [];
    let result = [...currentItems];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const data = item.data || item;
        const expense = data.expense || data;
        return (
          expense.expenseName?.toLowerCase().includes(term) ||
          data.categoryName?.toLowerCase().includes(term) ||
          data.name?.toLowerCase().includes(term) ||
          expense.comments?.toLowerCase().includes(term) ||
          item.externalRef?.toLowerCase().includes(term)
        );
      });
    }

    // Apply sorting
    if (sortBy === "amount-high") {
      result.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        return (
          (bData.expense?.amount || bData.amount || 0) -
          (aData.expense?.amount || aData.amount || 0)
        );
      });
    } else if (sortBy === "amount-low") {
      result.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        return (
          (aData.expense?.amount || aData.amount || 0) -
          (bData.expense?.amount || bData.amount || 0)
        );
      });
    } else if (sortBy === "date-new") {
      result.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        return (
          new Date(bData.date || bData.createdAt || 0) -
          new Date(aData.date || aData.createdAt || 0)
        );
      });
    } else if (sortBy === "date-old") {
      result.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        return (
          new Date(aData.date || aData.createdAt || 0) -
          new Date(bData.date || bData.createdAt || 0)
        );
      });
    } else if (sortBy === "name") {
      result.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        const nameA = aData.expense?.expenseName || aData.name || "";
        const nameB = bData.expense?.expenseName || bData.name || "";
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [currentItems, searchTerm, sortBy]);

  // Tab counts from API
  const countsByType = paginatedData?.countsByType || {};

  // Current tab index
  const activeTabIndex = RESOURCE_TYPES.indexOf(activeResourceType);

  // Pagination info for current tab
  const hasMore = currentTabData.hasMore;
  const totalItems = currentTabData.totalItems || filteredData.length;
  const displayedItems = filteredData.length;

  // Stats summary for current tab
  const stats = useMemo(() => {
    if (activeResourceType === "EXPENSE" && filteredData.length > 0) {
      const totalAmount = filteredData.reduce((sum, item) => {
        const data = item.data || item;
        return sum + (data.expense?.amount || data.amount || 0);
      }, 0);
      const creditCount = filteredData.filter((item) => {
        const data = item.data || item;
        return data.expense?.type === "CREDIT";
      }).length;
      const debitCount = filteredData.filter((item) => {
        const data = item.data || item;
        return data.expense?.type === "DEBIT";
      }).length;
      return { totalAmount, creditCount, debitCount };
    }
    return {};
  }, [filteredData, activeResourceType]);

  // ==========================================
  // EARLY RETURNS - After all hooks
  // ==========================================

  // Loading state
  if (paginatedDataLoading && !paginatedData?.isValid) {
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
  if (paginatedDataError) {
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
            {paginatedDataError}
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

  // No data state - check if paginatedData is invalid
  if (!paginatedData?.isValid) {
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
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
            width: "100%",
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

      {/* Combined Search and Info Header Bar - Full Width */}
      <Box
        sx={{
          width: "100vw",
          backgroundColor: colors.card_bg,
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
            maxWidth: "1800px",
            margin: "0 auto",
          }}
        >
          {/* Left: Search Bar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: { xs: "1 1 100%", md: "0 1 400px" },
              minWidth: 250,
            }}
          >
            <TextField
              placeholder="Search items..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: colors.secondary_bg,
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.accent },
                  "&.Mui-focused fieldset": { borderColor: colors.accent },
                },
                "& .MuiInputBase-input": { color: colors.primary_text },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchInput && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchInput("")}
                        sx={{ mr: 0.5 }}
                      >
                        <Typography
                          sx={{ color: colors.secondary_text, fontSize: 12 }}
                        >
                          ✕
                        </Typography>
                      </IconButton>
                    )}
                    <IconButton
                      onClick={handleSearch}
                      sx={{
                        backgroundColor: colors.accent,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: colors.accent + "cc",
                        },
                        borderRadius: 1,
                        p: 0.75,
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {searchTerm && (
              <Chip
                label={`Searching: "${searchTerm}"`}
                onDelete={handleClearSearch}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: colors.accent + "20",
                  color: colors.accent,
                  "& .MuiChip-deleteIcon": {
                    color: colors.accent,
                  },
                }}
              />
            )}
          </Box>

          {/* Center: Share Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: { xs: "1 1 100%", md: "1 1 auto" },
              justifyContent: { xs: "flex-start", md: "center" },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor:
                  RESOURCE_COLORS[shareInfo?.resourceType] || colors.accent,
              }}
            >
              {(() => {
                const IconComp =
                  RESOURCE_ICONS[shareInfo?.resourceType] || ReceiptIcon;
                return <IconComp sx={{ fontSize: 20 }} />;
              })()}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {shareInfo?.shareName || "Shared Content"}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Chip
                  icon={<ValidIcon sx={{ fontSize: 12 }} />}
                  label="Valid"
                  size="small"
                  sx={{
                    backgroundColor: "#10b98120",
                    color: "#10b981",
                    fontWeight: 500,
                    height: 20,
                    fontSize: "0.7rem",
                    "& .MuiChip-icon": { fontSize: 12 },
                  }}
                />
                <Chip
                  icon={
                    shareInfo?.permission === "VIEW" ? (
                      <ViewIcon sx={{ fontSize: 12 }} />
                    ) : (
                      <EditIcon sx={{ fontSize: 12 }} />
                    )
                  }
                  label={shareInfo?.permission === "VIEW" ? "View" : "Edit"}
                  size="small"
                  sx={{
                    backgroundColor:
                      shareInfo?.permission === "VIEW"
                        ? "#3b82f620"
                        : "#f59e0b20",
                    color:
                      shareInfo?.permission === "VIEW" ? "#3b82f6" : "#f59e0b",
                    fontWeight: 500,
                    height: 20,
                    fontSize: "0.7rem",
                    "& .MuiChip-icon": { fontSize: 12 },
                  }}
                />
                {shareInfo?.owner && (
                  <Typography
                    variant="caption"
                    sx={{ color: colors.secondary_text, ml: 1 }}
                  >
                    by {shareInfo.owner.firstName || "User"}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right: Stats */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: { xs: "1 1 100%", md: "0 1 auto" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            {/* Total Items */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: colors.hover_bg,
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Typography
                variant="h6"
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
            </Box>

            {/* Total Amount (for expenses) */}
            {shareInfo?.resourceType === "EXPENSE" && stats.totalAmount > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: colors.hover_bg,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#10b981", fontWeight: 700 }}
                >
                  {formatCurrency(stats.totalAmount)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary_text }}
                >
                  Total
                </Typography>
              </Box>
            )}

            {/* Expiry Info */}
            {shareInfo?.expiresAt && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 16, color: colors.secondary_text }} />
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary_text }}
                >
                  Expires: {formatDate(shareInfo.expiresAt)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Fixed Tabs Bar - Full Width */}
      <Box
        sx={{
          width: "100vw",
          backgroundColor: colors.card_bg,
          borderBottom: `1px solid ${colors.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
          px: 3,
        }}
      >
        <Tabs
          value={activeTabIndex}
          onChange={(e, newValue) => handleTabChange(RESOURCE_TYPES[newValue])}
          variant="fullWidth"
          sx={{
            minHeight: 56,
            "& .MuiTabs-indicator": {
              backgroundColor: colors.accent,
              height: 3,
            },
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-between",
            },
            "& .MuiTab-root": {
              color: colors.secondary_text,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9rem",
              minHeight: 56,
              flex: 1,
              maxWidth: "none",
              "&.Mui-selected": {
                color: colors.accent,
                fontWeight: 600,
              },
              "&:hover": {
                backgroundColor: colors.hover_bg,
              },
            },
          }}
        >
          {RESOURCE_TYPES.map((type) => {
            const count = countsByType?.[type] || 0;
            const TabIcon = RESOURCE_ICONS[type] || ReceiptIcon;
            return (
              <Tab
                key={type}
                icon={
                  <Badge
                    badgeContent={count}
                    color="primary"
                    max={999}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor:
                          count > 0 ? colors.accent : colors.secondary_text,
                        color: "#fff",
                        fontSize: "0.7rem",
                        minWidth: 20,
                        height: 20,
                      },
                    }}
                  >
                    <TabIcon sx={{ fontSize: 20 }} />
                  </Badge>
                }
                label={RESOURCE_LABELS[type]}
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Filter Bar - Full Width */}
      <Box
        sx={{
          width: "100vw",
          backgroundColor: colors.secondary_bg,
          borderBottom: `1px solid ${colors.border}`,
          py: 1.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Items Count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={`Showing ${displayedItems} of ${currentTabData?.totalItems || 0} ${RESOURCE_LABELS[activeResourceType]}`}
            sx={{
              backgroundColor: colors.accent + "20",
              color: colors.accent,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Right: Sort Filter */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: colors.card_bg,
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
        </Box>
      </Box>

      {/* Scrollable Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          width: "100vw",
          px: 3,
          py: 3,
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: "10px",
            height: "10px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: colors.secondary_bg,
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.accent,
            borderRadius: "5px",
            border: `2px solid ${colors.secondary_bg}`,
            "&:hover": {
              backgroundColor: colors.accent + "cc",
            },
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: colors.secondary_bg,
          },
          // Firefox scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.accent} ${colors.secondary_bg}`,
        }}
      >
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

        {/* Loading Skeleton */}
        {paginatedDataLoading && (
          <SharedItemsSkeleton colors={colors} count={8} />
        )}

        {/* Shared Data Display - Only show when not loading */}
        {!paginatedDataLoading && (
          <Box>
            {/* Add to account info for expenses */}
            {activeResourceType === "EXPENSE" && currentItems?.length > 0 && (
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
            {activeResourceType === "EXPENSE" && (
              <Grid container spacing={3}>
                {currentItems?.map((item, index) => {
                  // SharedItem structure: { type, externalRef, data: { id, date, categoryName, expense: {...} }, found }
                  const sharedData = item.data || {};
                  const expense = sharedData.expense || sharedData;
                  const expenseId = sharedData.id || item.externalRef;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={expenseId || index}
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
                            label={sharedData.categoryName || "Uncategorized"}
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
                                {sharedData.date || "N/A"}
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
                          {addedItemsSet.has(item.externalRef) ? (
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
                                addingExpense === expenseId ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <AddIcon />
                                )
                              }
                              onClick={() =>
                                handleAddToMyAccount(
                                  sharedData,
                                  item.externalRef,
                                )
                              }
                              disabled={addingExpense === expenseId}
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
                              {addingExpense === expenseId
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
            {activeResourceType === "CATEGORY" && (
              <Grid container spacing={3}>
                {currentItems?.map((item, index) => {
                  const category = item.data || item;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={category.id || item.externalRef || index}
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
                                sx={{
                                  color: colors.primary_text,
                                  fontWeight: 600,
                                }}
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
                  );
                })}
              </Grid>
            )}

            {/* Budgets Grid */}
            {activeResourceType === "BUDGET" && (
              <Grid container spacing={3}>
                {currentItems?.map((item, index) => {
                  const budget = item.data || item;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={budget.id || item.externalRef || index}
                    >
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
                                sx={{
                                  color: colors.primary_text,
                                  fontWeight: 600,
                                }}
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
                                sx={{
                                  color: colors.primary_text,
                                  fontWeight: 500,
                                }}
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
                  );
                })}
              </Grid>
            )}

            {/* Bills Grid */}
            {activeResourceType === "BILL" && (
              <Grid container spacing={3}>
                {currentItems?.map((item, index) => {
                  const bill = item.data || item;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={bill.id || item.externalRef || index}
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
                                sx={{
                                  color: colors.primary_text,
                                  fontWeight: 600,
                                }}
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
                  );
                })}
              </Grid>
            )}

            {/* Payment Methods Grid */}
            {activeResourceType === "PAYMENT_METHOD" && (
              <Grid container spacing={3}>
                {currentItems?.map((item, index) => {
                  const paymentMethod = item.data || item;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={paymentMethod.id || item.externalRef || index}
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "#3b82f6" }}>
                              <CreditCardIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  color: colors.primary_text,
                                  fontWeight: 600,
                                }}
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
                  );
                })}
              </Grid>
            )}

            {/* Empty state */}
            {(!currentItems || currentItems.length === 0) && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <LockIcon
                  sx={{ fontSize: 64, color: colors.secondary_text, mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: colors.primary_text, mb: 1 }}
                >
                  No {RESOURCE_LABELS[activeResourceType] || "Items"} Found
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.secondary_text }}
                >
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : `No ${RESOURCE_LABELS[activeResourceType]?.toLowerCase() || "data"} available in this share.`}
                </Typography>
              </Box>
            )}

            {/* Load More Button */}
            {hasMore && currentItems?.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadMoreLoading}
                  startIcon={
                    loadMoreLoading ? (
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
                  {loadMoreLoading
                    ? "Loading..."
                    : `Load More (${Math.max(0, totalItems - (currentItems?.length || 0))} remaining)`}
                </Button>
              </Box>
            )}

            {/* Summary Footer */}
            {currentItems?.length > 0 && (
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
                <Typography
                  variant="body2"
                  sx={{ color: colors.secondary_text }}
                >
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
          </Box>
        )}
      </Box>

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
