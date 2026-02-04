import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api";
import {
  searchQuickActions,
  getRouteForResult,
  SEARCH_TYPES,
  SECTION_ORDER,
  SEARCH_MODES,
} from "./quickActions.config";
import { sortByRelevance, memoize, createDebouncer } from "./searchUtils";
import UserSettingsHelper from "../../../utils/UserSettingsHelper";
import { formatDate } from "../../../utils/dateFormatter";

// Debounce delay in ms - Reduced for better UX
const DEBOUNCE_DELAY = 150;

// Minimum query length for API search
const MIN_QUERY_LENGTH = 2;

// Maximum results per section
const MAX_RESULTS_PER_SECTION = 20;

// API endpoint for unified search
const SEARCH_API_ENDPOINT = "/api/search";

// Create a memoization key that includes both query and mode
const createMemoizedSearchQuickActions = () => {
  const cache = new Map();
  const maxSize = 50;

  return (query, mode) => {
    const cacheKey = `${query || ""}:${mode || "USER"}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = searchQuickActions(query, mode);

    // Manage cache size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(cacheKey, result);
    return result;
  };
};

// Memoized quick action search for performance (handles query + mode)
const memoizedSearchQuickActions = createMemoizedSearchQuickActions();

/**
 * Custom hook for Universal Search functionality
 * Handles debounced API calls, local quick action search, and keyboard navigation
 *
 * Performance optimizations:
 * - Memoized quick action search
 * - Debounced API calls with reduced delay
 * - Request cancellation for stale queries
 * - Relevance-based result sorting
 */
export const useUniversalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [apiLoading, setApiLoading] = useState(false); // Only for API calls, doesn't block typing
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Results from different sources
  const [quickActionResults, setQuickActionResults] = useState([]);
  const [apiResults, setApiResults] = useState({
    expenses: [],
    budgets: [],
    categories: [],
    bills: [],
    paymentMethods: [],
    friends: [],
  });

  // Refs for debouncing and request management
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastQueryRef = useRef("");
  const debouncerRef = useRef(createDebouncer(DEBOUNCE_DELAY));

  // Get existing data from Redux for local search with shallow comparison
  const expenses = useSelector((state) => state.expenses?.expenses || []);
  const budgets = useSelector((state) => state.budgets?.budgets || []);
  const categories = useSelector((state) => state.categories?.categories || []);
  const bills = useSelector((state) => state.bill?.bills || []);
  const paymentMethods = useSelector(
    (state) => state.paymentMethod?.paymentMethods || [],
  );
  const friends = useSelector((state) => state.friends?.friends || []);

  // Get user's currency preference
  const userCurrency = useSelector(
    (state) => state.userSettings?.settings?.currency || "INR",
  );

  // Get user's date format preference
  const dateFormat = useSelector(
    (state) => state.userSettings?.settings?.dateFormat || "DD/MM/YYYY",
  );

  // Get current mode (USER or ADMIN) from auth state
  const currentMode = useSelector(
    (state) => state.auth?.currentMode || SEARCH_MODES.USER,
  );

  /**
   * Format currency amount using user's preferred currency
   */
  const formatAmount = useCallback(
    (amount) => {
      if (amount === null || amount === undefined) return "";
      return UserSettingsHelper.formatCurrency(amount, userCurrency);
    },
    [userCurrency],
  );

  /**
   * Format date using user's preferred date format
   */
  const formatDateForSearch = useCallback(
    (date) => {
      if (!date) return "";
      return formatDate(date, dateFormat);
    },
    [dateFormat],
  );

  /**
   * Open the search modal
   */
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setError(null);
    // Show default quick actions immediately using memoized search (filtered by mode)
    setQuickActionResults(memoizedSearchQuickActions("", currentMode));
  }, [currentMode]);

  /**
   * Close the search modal
   */
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
    setApiLoading(false);
    setError(null);
    setQuickActionResults([]);
    setApiResults({
      expenses: [],
      budgets: [],
      categories: [],
      bills: [],
      paymentMethods: [],
      friends: [],
    });

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    debouncerRef.current.cancel();
  }, []);

  /**
   * Optimized local search in Redux data
   * Uses early termination and efficient string matching
   */
  const performLocalSearch = useCallback(
    (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        return {
          expenses: [],
          budgets: [],
          categories: [],
          bills: [],
          paymentMethods: [],
          friends: [],
        };
      }

      const queryLower = searchQuery.toLowerCase();

      // Search expenses - expense data structure: { id, name, amount, categoryName, date, ... }
      const matchedExpenses = (expenses || [])
        .filter((exp) => {
          const name = exp?.name || exp?.expense?.name || "";
          const description =
            exp?.description || exp?.expense?.description || "";
          const categoryName = exp?.categoryName || exp?.category?.name || "";
          const comments = exp?.comments || exp?.expense?.comments || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            description.toLowerCase().includes(queryLower) ||
            categoryName.toLowerCase().includes(queryLower) ||
            comments.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((exp) => {
          const expName = exp?.name || exp?.expense?.name || "Expense";
          const amount = exp?.amount || exp?.expense?.amount || 0;
          const categoryName =
            exp?.categoryName || exp?.category?.name || "Uncategorized";
          const comments = exp?.comments || exp?.expense?.comments || "";
          const expDate = exp?.date || exp?.expense?.date;
          // Show comments if available, otherwise show category
          const subtitle = comments || categoryName;
          return {
            id: exp.id,
            type: SEARCH_TYPES.EXPENSE,
            title: expName,
            subtitle: subtitle,
            metadata: {
              amount: amount,
              date: expDate,
              categoryName: categoryName,
              comments: comments,
            },
            route: getRouteForResult(SEARCH_TYPES.EXPENSE, exp.id),
          };
        });

      // Search budgets
      const matchedBudgets = (budgets || [])
        .filter((budget) => {
          const name = budget?.name || "";
          const categoryName = budget?.categoryName || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            categoryName.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((budget) => ({
          id: budget.id,
          type: SEARCH_TYPES.BUDGET,
          title: budget.name || "Budget",
          subtitle: `${budget?.categoryName || "All Categories"} • ${formatAmount(budget?.amount || 0)}`,
          metadata: {
            amount: budget?.amount,
            spent: budget?.spent,
            remaining: budget?.remaining,
          },
          route: getRouteForResult(SEARCH_TYPES.BUDGET, budget.id),
        }));

      // Search categories
      const matchedCategories = (categories || [])
        .filter((cat) => {
          const name = cat?.name || "";
          return name.toLowerCase().includes(queryLower);
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((cat) => ({
          id: cat.id,
          type: SEARCH_TYPES.CATEGORY,
          title: cat.name || "Category",
          subtitle: cat?.type || "Custom category",
          icon: cat?.icon,
          color: cat?.color,
          route: getRouteForResult(SEARCH_TYPES.CATEGORY, cat.id),
        }));

      // Search bills
      const matchedBills = (bills || [])
        .filter((bill) => {
          const name = bill?.name || "";
          const description = bill?.description || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            description.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((bill) => {
          const dueDate = bill?.dueDate;
          const description = bill?.description || "";
          const frequency = bill?.frequency || "One-time";
          // Show description if available, otherwise show frequency
          const subtitle = description || frequency;
          return {
            id: bill.id,
            type: SEARCH_TYPES.BILL,
            title: bill.name || "Bill",
            subtitle: subtitle,
            metadata: {
              amount: bill?.amount,
              dueDate: dueDate,
              frequency: frequency,
              description: description,
            },
            route: getRouteForResult(SEARCH_TYPES.BILL, bill.id),
          };
        });

      // Search payment methods
      const matchedPaymentMethods = (paymentMethods || [])
        .filter((pm) => {
          const name = pm?.name || "";
          const type = pm?.type || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            type.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((pm) => ({
          id: pm.id,
          type: SEARCH_TYPES.PAYMENT_METHOD,
          title: pm.name || "Payment Method",
          subtitle: pm?.type || "Payment method",
          icon: pm?.icon,
          color: pm?.color,
          route: getRouteForResult(SEARCH_TYPES.PAYMENT_METHOD, pm.id),
        }));

      // Search friends
      const matchedFriends = (friends || [])
        .filter((friend) => {
          const name =
            `${friend?.firstName || ""} ${friend?.lastName || ""}`.trim();
          const email = friend?.email || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            email.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, MAX_RESULTS_PER_SECTION)
        .map((friend) => ({
          id: friend.id,
          type: SEARCH_TYPES.FRIEND,
          title:
            `${friend?.firstName || ""} ${friend?.lastName || ""}`.trim() ||
            friend?.email ||
            "Friend",
          subtitle: friend?.email || "",
          metadata: {
            email: friend?.email,
          },
          route: getRouteForResult(SEARCH_TYPES.FRIEND, friend.id),
        }));

      return {
        expenses: matchedExpenses,
        budgets: matchedBudgets,
        categories: matchedCategories,
        bills: matchedBills,
        paymentMethods: matchedPaymentMethods,
        friends: matchedFriends,
      };
    },
    [
      expenses,
      budgets,
      categories,
      bills,
      paymentMethods,
      friends,
      formatAmount,
      formatDateForSearch,
    ],
  );

  /**
   * API search for comprehensive results
   */
  const performApiSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setApiLoading(true);
        setError(null);

        const response = await api.get(SEARCH_API_ENDPOINT, {
          params: {
            q: searchQuery,
            limit: 20, // Limit per section - increased for comprehensive results
          },
          signal: abortControllerRef.current.signal,
        });

        if (response.data) {
          // Transform API response to match our format
          // Use formatAmount to format amounts with user's currency preference
          const transformedResults = {
            expenses: (response.data.expenses || []).map((exp) => {
              // Get fields from metadata or direct field
              const amount = exp.metadata?.amount || exp.amount || 0;
              const categoryName =
                exp.metadata?.categoryName ||
                exp.categoryName ||
                "Uncategorized";
              const comments = exp.metadata?.comments || "";
              const expDate = exp.metadata?.date;
              // Use subtitle from API (which contains comments or category)
              // or fallback to comments/category
              const subtitle = exp.subtitle || comments || categoryName;
              return {
                id: exp.id,
                type: SEARCH_TYPES.EXPENSE,
                title: exp.title || exp.name,
                subtitle: subtitle,
                metadata: exp.metadata || {},
                route: getRouteForResult(SEARCH_TYPES.EXPENSE, exp.id),
              };
            }),
            budgets: (response.data.budgets || []).map((budget) => {
              // Get amount from metadata or direct field
              const amount = budget.metadata?.amount || budget.amount || 0;
              const categoryName =
                budget.metadata?.categoryName ||
                budget.categoryName ||
                "All Categories";
              return {
                id: budget.id,
                type: SEARCH_TYPES.BUDGET,
                title: budget.title || budget.name,
                subtitle: `${categoryName} • ${formatAmount(amount)}`,
                metadata: budget.metadata || {},
                route: getRouteForResult(SEARCH_TYPES.BUDGET, budget.id),
              };
            }),
            categories: (response.data.categories || []).map((cat) => ({
              id: cat.id,
              type: SEARCH_TYPES.CATEGORY,
              title: cat.title || cat.name,
              subtitle: cat.subtitle || cat.type || "",
              icon: cat.icon,
              color: cat.color,
              route: getRouteForResult(SEARCH_TYPES.CATEGORY, cat.id),
            })),
            bills: (response.data.bills || []).map((bill) => {
              // Get fields from metadata or direct field
              const amount = bill.metadata?.amount || bill.amount || 0;
              const frequency =
                bill.metadata?.frequency || bill.frequency || "One-time";
              const description = bill.metadata?.description || "";
              const dueDate = bill.metadata?.dueDate;
              // Use subtitle from API or fallback to description/frequency
              const subtitle = bill.subtitle || description || frequency;
              return {
                id: bill.id,
                type: SEARCH_TYPES.BILL,
                title: bill.title || bill.name,
                subtitle: subtitle,
                metadata: bill.metadata || {},
                route: getRouteForResult(SEARCH_TYPES.BILL, bill.id),
              };
            }),
            paymentMethods: (response.data.paymentMethods || []).map((pm) => ({
              id: pm.id,
              type: SEARCH_TYPES.PAYMENT_METHOD,
              title: pm.title || pm.name,
              subtitle: pm.subtitle || pm.type || "",
              icon: pm.icon,
              color: pm.color,
              route: getRouteForResult(SEARCH_TYPES.PAYMENT_METHOD, pm.id),
            })),
            friends: (response.data.friends || []).map((friend) => ({
              id: friend.id,
              type: SEARCH_TYPES.FRIEND,
              title: friend.title || friend.name,
              subtitle: friend.subtitle || friend.email || "",
              metadata: friend.metadata || {},
              route: getRouteForResult(SEARCH_TYPES.FRIEND, friend.id),
            })),
          };

          setApiResults(transformedResults);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Search API error:", err);
          // Don't show error to user for search - just use local results
          // setError('Search temporarily unavailable');
        }
      } finally {
        setApiLoading(false);
      }
    },
    [formatAmount, formatDateForSearch],
  );

  /**
   * Handle query change with debouncing
   * Accepts either a string or an event object (from input onChange)
   */
  const handleQueryChange = useCallback(
    (queryOrEvent) => {
      // Handle both string and event object
      const newQuery =
        typeof queryOrEvent === "string"
          ? queryOrEvent
          : (queryOrEvent?.target?.value ?? "");

      // Skip if query hasn't changed
      if (newQuery === lastQueryRef.current) return;
      lastQueryRef.current = newQuery;

      setQuery(newQuery);
      setSelectedIndex(0);

      // Immediate local search for quick actions using memoized function (filtered by mode)
      setQuickActionResults(memoizedSearchQuickActions(newQuery, currentMode));

      // Immediate local search for Redux data
      const localResults = performLocalSearch(newQuery);
      setApiResults(localResults);

      // Debounced API search for comprehensive results
      if (newQuery && newQuery.length >= MIN_QUERY_LENGTH) {
        // Don't set loading here - let performApiSearch handle it
        // This ensures typing is never blocked by loading state
        debouncerRef.current.debounce(() => {
          performApiSearch(newQuery);
        });
      } else {
        setApiLoading(false);
        debouncerRef.current.cancel();
      }
    },
    [performLocalSearch, performApiSearch, currentMode],
  );

  /**
   * Combine and flatten all results for navigation
   * Results are sorted by relevance within each section
   */
  const allResults = useMemo(() => {
    const results = [];

    // Add quick actions first (already sorted by priority)
    quickActionResults.forEach((action) => {
      results.push({
        ...action,
        section: action.section || "actions",
      });
    });

    // Add API/local results by section
    // Sort each section by relevance when there's a query
    const addSortedResults = (items, section) => {
      if (items.length > 0) {
        const sortedItems = query ? sortByRelevance(items, query) : items;
        sortedItems.forEach((item) => results.push({ ...item, section }));
      }
    };

    addSortedResults(apiResults.expenses, "expenses");
    addSortedResults(apiResults.budgets, "budgets");
    addSortedResults(apiResults.categories, "categories");
    addSortedResults(apiResults.bills, "bills");
    addSortedResults(apiResults.paymentMethods, "payment_methods");
    addSortedResults(apiResults.friends, "friends");

    return results;
  }, [quickActionResults, apiResults, query]);

  // Defer the results to prevent blocking input - React 18 concurrent feature
  const deferredResults = useDeferredValue(allResults);

  /**
   * Group results by section for display
   * Uses deferred results to avoid blocking input during typing
   */
  const groupedResults = useMemo(() => {
    const groups = {};

    deferredResults.forEach((result) => {
      const section = result.section || "actions";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(result);
    });

    // Sort sections according to SECTION_ORDER
    const sortedGroups = {};
    SECTION_ORDER.forEach((section) => {
      if (groups[section] && groups[section].length > 0) {
        sortedGroups[section] = groups[section];
      }
    });

    return sortedGroups;
  }, [deferredResults]);

  /**
   * Navigate to selected result
   */
  const selectResult = useCallback(
    (result) => {
      if (!result) return;

      const route = result.route;
      if (route) {
        closeSearch();
        navigate(route);
      }
    },
    [navigate, closeSearch],
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allResults.length - 1,
          );
          break;

        case "Enter":
          event.preventDefault();
          if (allResults[selectedIndex]) {
            selectResult(allResults[selectedIndex]);
          }
          break;

        case "Escape":
          event.preventDefault();
          closeSearch();
          break;

        default:
          break;
      }
    },
    [isOpen, allResults, selectedIndex, selectResult, closeSearch],
  );

  /**
   * Global keyboard shortcut (Cmd/Ctrl + K)
   */
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      // Cmd/Ctrl + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      debouncerRef.current.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isOpen,
    query,
    loading: apiLoading, // Only true when API is fetching, doesn't block typing
    error,
    selectedIndex,

    // Results
    allResults,
    flatResults: allResults, // Alias for compatibility
    groupedResults,
    quickActionResults,
    apiResults,

    // Actions
    openSearch,
    closeSearch,
    handleQueryChange,
    handleKeyDown,
    selectResult,
    setSelectedIndex,
    setQuery,
  };
};

export default useUniversalSearch;
