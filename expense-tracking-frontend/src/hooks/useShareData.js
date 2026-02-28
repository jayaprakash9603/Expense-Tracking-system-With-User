/**
 * =============================================================================
 * useShareData - Custom Hook for Share Creation Data Management
 * =============================================================================
 *
 * Manages data fetching and state for the share creation flow:
 * - Fetches expenses, categories, and budgets
 * - Handles item selection and filtering
 * - Manages share configuration state
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getPaginatedExpensesAction,
  resetPaginatedExpenses,
} from "../Redux/Expenses/expense.action";
import { fetchCategories } from "../Redux/Category/categoryActions";
import { getBudgetData } from "../Redux/Budget/budget.action";
import { createShare, clearShareError } from "../Redux/Shares/shares.actions";
import { fetchFriends } from "../Redux/Friends/friendsActions";

// =============================================================================
// Constants
// =============================================================================

export const DATA_TYPE_OPTIONS = [
  {
    value: "EXPENSE",
    label: "Expenses",
    description: "Share expense records",
  },
  {
    value: "CATEGORY",
    label: "Categories",
    description: "Share categories",
  },
  {
    value: "BUDGET",
    label: "Budgets",
    description: "Share budget plans",
  },
];

export const EXPIRY_OPTIONS = [
  { value: "1", label: "1 Day" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
  { value: "never", label: "Never" },
  { value: "custom", label: "Custom" },
];

export const VISIBILITY_OPTIONS = [
  {
    value: "LINK_ONLY",
    label: "Link Only",
    description: "Anyone with the link can access",
    icon: "Link",
  },
  {
    value: "PUBLIC",
    label: "Public",
    description: "Visible on public shares page",
    icon: "Public",
  },
  {
    value: "FRIENDS_ONLY",
    label: "Friends Only",
    description: "Only your friends can access",
    icon: "People",
  },
  {
    value: "SPECIFIC_USERS",
    label: "Specific Friends",
    description: "Only selected friends can access",
    icon: "PersonAdd",
  },
];

export const STEPS = ["Select Data", "Configure Access", "Review & Generate"];

// =============================================================================
// Hook
// =============================================================================

const useShareData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-selected items from route state (from ShareSelectedButton)
  const preSelectedType = location.state?.preSelectedType;
  const preSelectedItems = location.state?.preSelectedItems || [];
  // Get return route info for back navigation
  const returnRoute = location.state?.returnRoute;
  const returnRouteState = location.state?.returnRouteState;

  // Redux state
  const {
    paginatedExpenses = [],
    paginatedExpensesLoading,
    paginatedExpensesHasMore,
    paginatedExpensesPage,
    paginatedExpensesTotalElements,
  } = useSelector((state) => state.expenses);
  const { categories = [] } = useSelector((state) => state.categories);
  const { budgets = [] } = useSelector((state) => state.budgets);
  const { createShareLoading, createShareError, currentShare } = useSelector(
    (state) => state.shares,
  );
  const { friends = [], loadingFriends } = useSelector(
    (state) => state.friends,
  );

  // Step management
  const [activeStep, setActiveStep] = useState(0);

  // Data selection state
  const [activeTab, setActiveTab] = useState(0);
  const [resourceType, setResourceType] = useState("EXPENSE");
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Share configuration state
  const [shareName, setShareName] = useState("");
  const [permission, setPermission] = useState("VIEW");
  const [expiryOption, setExpiryOption] = useState("7");
  const [customExpiry, setCustomExpiry] = useState("");
  const [visibility, setVisibility] = useState("LINK_ONLY");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // UI state
  const [error, setError] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [createdShare, setCreatedShare] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  // Check if we're in pre-selected mode (coming from CashFlow with selected items)
  const hasPreSelectedItems = preSelectedItems && preSelectedItems.length > 0;

  // ---------------------------------------------------------------------------
  // Data Fetching - Skip expenses if we have pre-selected items
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Only fetch data if we're NOT in pre-selected mode
    if (!hasPreSelectedItems) {
      // Reset and fetch first page of expenses
      dispatch(resetPaginatedExpenses());
      dispatch(getPaginatedExpensesAction(0, 100, "desc"));
      dispatch(fetchCategories());
      dispatch(getBudgetData());
    } else {
      // Still fetch categories and budgets for other tabs
      dispatch(fetchCategories());
      dispatch(getBudgetData());
    }

    // Fetch friends for visibility selection
    dispatch(fetchFriends());

    // Cleanup on unmount
    return () => {
      dispatch(resetPaginatedExpenses());
    };
  }, [dispatch, hasPreSelectedItems]);

  // ---------------------------------------------------------------------------
  // Load More Expenses on Scroll
  // ---------------------------------------------------------------------------

  const loadMoreExpenses = useCallback(() => {
    if (
      !hasPreSelectedItems &&
      resourceType === "EXPENSE" &&
      paginatedExpensesHasMore &&
      !paginatedExpensesLoading &&
      !loadingRef.current
    ) {
      loadingRef.current = true;
      setIsLoadingMore(true);
      const nextPage = paginatedExpensesPage + 1;
      dispatch(
        getPaginatedExpensesAction(nextPage, 100, "desc", null, true),
      ).finally(() => {
        loadingRef.current = false;
        setIsLoadingMore(false);
      });
    }
  }, [
    hasPreSelectedItems,
    resourceType,
    paginatedExpensesHasMore,
    paginatedExpensesLoading,
    paginatedExpensesPage,
    dispatch,
  ]);

  // ---------------------------------------------------------------------------
  // Pre-selected Items Handling
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (preSelectedType) {
      const typeIndex = DATA_TYPE_OPTIONS.findIndex(
        (opt) => opt.value === preSelectedType,
      );
      if (typeIndex !== -1) {
        setActiveTab(typeIndex);
        setResourceType(preSelectedType);
      }
    }
    if (preSelectedItems && preSelectedItems.length > 0) {
      const formattedItems = preSelectedItems.map((item) => ({
        id: item.internalId || item.id,
        externalRef:
          item.externalRef ||
          `${preSelectedType || "EXPENSE"}_${item.internalId || item.id}`,
        displayName:
          item.displayName ||
          item.name ||
          `Item #${item.internalId || item.id}`,
        subtitle: item.subtitle || item.categoryName || "",
        amount: item.amount,
        date: item.date,
        type: preSelectedType || "EXPENSE",
      }));
      setSelectedItems(formattedItems);
    }
  }, [preSelectedType, preSelectedItems]);

  // ---------------------------------------------------------------------------
  // Tab/Type Sync - Don't clear selection in pre-selected mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const types = ["EXPENSE", "CATEGORY", "BUDGET"];
    setResourceType(types[activeTab]);
    // Only clear selection when switching tabs manually (not in pre-selected mode)
    if (initialLoadDone && !hasPreSelectedItems) {
      setSelectedItems([]);
      setSearchTerm("");
    }
  }, [activeTab, initialLoadDone, hasPreSelectedItems]);

  useEffect(() => {
    if (!initialLoadDone) {
      const timer = setTimeout(() => setInitialLoadDone(true), 100);
      return () => clearTimeout(timer);
    }
  }, [initialLoadDone]);

  // ---------------------------------------------------------------------------
  // Error Reset
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setError("");
    dispatch(clearShareError());
  }, [activeStep, dispatch]);

  // ---------------------------------------------------------------------------
  // Available Items - Use pre-selected items if provided, otherwise fetch from Redux
  // ---------------------------------------------------------------------------

  const availableItems = useMemo(() => {
    // If we have pre-selected items, use ONLY those items
    if (hasPreSelectedItems) {
      return preSelectedItems.map((item) => ({
        id: item.internalId || item.id,
        externalRef:
          item.externalRef ||
          `${preSelectedType || "EXPENSE"}_${item.internalId || item.id}`,
        displayName:
          item.displayName ||
          item.name ||
          `Item #${item.internalId || item.id}`,
        subtitle: item.subtitle || item.categoryName || "",
        amount: item.amount,
        date: item.date,
        type: preSelectedType || "EXPENSE",
      }));
    }

    // Otherwise, get items from Redux based on resource type
    const expenseList = Array.isArray(paginatedExpenses)
      ? paginatedExpenses
      : paginatedExpenses?.content || [];
    const categoryList = Array.isArray(categories)
      ? categories
      : categories?.content || [];
    const budgetList = Array.isArray(budgets)
      ? budgets
      : budgets?.content || [];

    switch (resourceType) {
      case "EXPENSE":
        return expenseList.map((exp) => ({
          id: exp.id,
          externalRef: exp.externalRef || `EXP_${exp.id}_${exp.date}`,
          displayName:
            exp.name ||
            exp.description ||
            exp.expense?.name ||
            exp.expense?.expenseName ||
            `Expense #${exp.id}`,
          subtitle: `${exp.date} - ${exp.categoryName || exp.category?.name || "No category"}`,
          amount: exp.amount,
          date: exp.date,
          type: "EXPENSE",
        }));
      case "CATEGORY":
        return categoryList.map((cat) => ({
          id: cat.id,
          externalRef: cat.externalRef || `CAT_${cat.id}_${cat.name}`,
          displayName: cat.name,
          subtitle: `${cat.expenseCount || 0} expenses`,
          type: "CATEGORY",
        }));
      case "BUDGET":
        return budgetList.map((budget) => ({
          id: budget.id,
          externalRef: budget.externalRef || `BUD_${budget.id}_${budget.name}`,
          displayName: budget.name,
          subtitle: `$${budget.amount} - ${budget.period || "Monthly"}`,
          type: "BUDGET",
        }));
      default:
        return [];
    }
  }, [
    resourceType,
    paginatedExpenses,
    categories,
    budgets,
    hasPreSelectedItems,
    preSelectedItems,
    preSelectedType,
  ]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return availableItems;
    const search = searchTerm.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.displayName?.toLowerCase().includes(search) ||
        item.subtitle?.toLowerCase().includes(search),
    );
  }, [availableItems, searchTerm]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleToggleItem = useCallback((item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.externalRef === item.externalRef);
      if (exists) {
        return prev.filter((i) => i.externalRef !== item.externalRef);
      }
      return [...prev, item];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems);
    }
  }, [selectedItems, filteredItems]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && selectedItems.length === 0) {
      setError("Please select at least one item to share");
      return;
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  }, [activeStep, selectedItems.length]);

  /**
   * Navigate back - to previous step or to return route/my-shares
   */
  const navigateToReturnRoute = useCallback(() => {
    if (returnRoute) {
      navigate(returnRoute, { state: returnRouteState });
    } else {
      navigate("/my-shares");
    }
  }, [navigate, returnRoute, returnRouteState]);

  const handleBack = useCallback(() => {
    setError("");
    if (activeStep === 0) {
      navigateToReturnRoute();
    } else {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep, navigateToReturnRoute]);

  const handleCreateShare = useCallback(async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to share");
      return;
    }

    // Validate specific friends selection
    if (visibility === "SPECIFIC_USERS" && selectedFriends.length === 0) {
      setError("Please select at least one friend for specific sharing");
      return;
    }

    const shareData = {
      resourceType,
      resourceRefs: selectedItems.map((item) => ({
        type: resourceType,
        internalId: item.id,
        externalRef: item.externalRef,
        displayName: item.displayName,
      })),
      permission,
      expiryDays:
        expiryOption !== "custom" && expiryOption !== "never"
          ? parseInt(expiryOption, 10)
          : null,
      customExpiry: expiryOption === "custom" ? customExpiry : null,
      shareName: shareName || null,
      visibility,
      allowedUserIds:
        visibility === "SPECIFIC_USERS"
          ? selectedFriends.map((f) => f.id)
          : null,
    };

    const result = await dispatch(createShare(shareData));

    if (result.success) {
      setCreatedShare(result.data);
      setShowQrModal(true);
    }
  }, [
    selectedItems,
    resourceType,
    permission,
    expiryOption,
    customExpiry,
    shareName,
    visibility,
    selectedFriends,
    dispatch,
  ]);

  const handleQrModalClose = useCallback(() => {
    setShowQrModal(false);
    // Navigate back to return route or my-shares
    navigateToReturnRoute();
  }, [navigateToReturnRoute]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // Step management
    activeStep,
    setActiveStep,

    // Data selection
    activeTab,
    resourceType,
    selectedItems,
    searchTerm,
    setSearchTerm,
    availableItems,
    filteredItems,

    // Share configuration
    shareName,
    setShareName,
    permission,
    setPermission,
    expiryOption,
    setExpiryOption,
    customExpiry,
    setCustomExpiry,
    visibility,
    setVisibility,
    selectedFriends,
    setSelectedFriends,

    // Friends data
    friends,
    loadingFriends,

    // UI state
    error,
    showQrModal,
    createdShare,
    createShareLoading,
    createShareError,

    // Navigation
    returnRoute,
    returnRouteState,
    navigateToReturnRoute,

    // Pre-selected mode
    hasPreSelectedItems,
    preSelectedType,

    // Pagination
    loadMoreExpenses,
    isLoadingMore,
    hasMoreExpenses: paginatedExpensesHasMore,
    totalExpenses: paginatedExpensesTotalElements,
    isLoadingExpenses: paginatedExpensesLoading,

    // Handlers
    handleToggleItem,
    handleSelectAll,
    handleTabChange,
    handleNext,
    handleBack,
    handleCreateShare,
    handleQrModalClose,

    // Constants
    DATA_TYPE_OPTIONS,
    EXPIRY_OPTIONS,
    VISIBILITY_OPTIONS,
    STEPS,
  };
};

export default useShareData;
