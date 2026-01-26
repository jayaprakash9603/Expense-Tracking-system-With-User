import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api";
import {
  searchQuickActions,
  getRouteForResult,
  SEARCH_TYPES,
  SECTION_ORDER,
} from "./quickActions.config";

// Debounce delay in ms
const DEBOUNCE_DELAY = 300;

// API endpoint for unified search
const SEARCH_API_ENDPOINT = "/api/search";

/**
 * Custom hook for Universal Search functionality
 * Handles debounced API calls, local quick action search, and keyboard navigation
 */
export const useUniversalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
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

  // Refs for debouncing
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get existing data from Redux for local search
  const { expenses } = useSelector((state) => state.expenses || {});
  const { budgets } = useSelector((state) => state.budgets || {});
  const { categories } = useSelector((state) => state.categories || {});
  const { bills } = useSelector((state) => state.bill || {});
  const { paymentMethods } = useSelector((state) => state.paymentMethod || {});
  const { friends } = useSelector((state) => state.friends || {});

  /**
   * Open the search modal
   */
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setError(null);
    // Show default quick actions immediately
    setQuickActionResults(searchQuickActions(""));
  }, []);

  /**
   * Close the search modal
   */
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
    setLoading(false);
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
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Local search in Redux data (for instant results)
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

      // Search expenses
      const matchedExpenses = (expenses || [])
        .filter((exp) => {
          const name = exp?.expense?.name || exp?.name || "";
          const description =
            exp?.expense?.description || exp?.description || "";
          const categoryName = exp?.categoryName || "";
          return (
            name.toLowerCase().includes(queryLower) ||
            description.toLowerCase().includes(queryLower) ||
            categoryName.toLowerCase().includes(queryLower)
          );
        })
        .slice(0, 5)
        .map((exp) => ({
          id: exp.id,
          type: SEARCH_TYPES.EXPENSE,
          title: exp?.expense?.name || exp?.name || "Expense",
          subtitle: `${exp?.categoryName || "Uncategorized"} • ${exp?.expense?.amount || exp?.amount || 0}`,
          metadata: {
            amount: exp?.expense?.amount || exp?.amount,
            date: exp?.date,
            categoryName: exp?.categoryName,
          },
          route: getRouteForResult(SEARCH_TYPES.EXPENSE, exp.id),
        }));

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
        .slice(0, 5)
        .map((budget) => ({
          id: budget.id,
          type: SEARCH_TYPES.BUDGET,
          title: budget.name || "Budget",
          subtitle: `${budget?.categoryName || "All Categories"} • ${budget?.amount || 0}`,
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
        .slice(0, 5)
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
        .slice(0, 5)
        .map((bill) => ({
          id: bill.id,
          type: SEARCH_TYPES.BILL,
          title: bill.name || "Bill",
          subtitle: `${bill?.frequency || "One-time"} • ${bill?.amount || 0}`,
          metadata: {
            amount: bill?.amount,
            dueDate: bill?.dueDate,
            frequency: bill?.frequency,
          },
          route: getRouteForResult(SEARCH_TYPES.BILL, bill.id),
        }));

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
        .slice(0, 5)
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
        .slice(0, 5)
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
    [expenses, budgets, categories, bills, paymentMethods, friends],
  );

  /**
   * API search for comprehensive results
   */
  const performApiSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(SEARCH_API_ENDPOINT, {
        params: {
          q: searchQuery,
          limit: 5, // Limit per section
        },
        signal: abortControllerRef.current.signal,
      });

      if (response.data) {
        // Transform API response to match our format
        const transformedResults = {
          expenses: (response.data.expenses || []).map((exp) => ({
            id: exp.id,
            type: SEARCH_TYPES.EXPENSE,
            title: exp.title || exp.name,
            subtitle:
              exp.subtitle || `${exp.categoryName || ""} • ${exp.amount || ""}`,
            metadata: exp.metadata || {},
            route: getRouteForResult(SEARCH_TYPES.EXPENSE, exp.id),
          })),
          budgets: (response.data.budgets || []).map((budget) => ({
            id: budget.id,
            type: SEARCH_TYPES.BUDGET,
            title: budget.title || budget.name,
            subtitle:
              budget.subtitle ||
              `${budget.categoryName || ""} • ${budget.amount || ""}`,
            metadata: budget.metadata || {},
            route: getRouteForResult(SEARCH_TYPES.BUDGET, budget.id),
          })),
          categories: (response.data.categories || []).map((cat) => ({
            id: cat.id,
            type: SEARCH_TYPES.CATEGORY,
            title: cat.title || cat.name,
            subtitle: cat.subtitle || cat.type || "",
            icon: cat.icon,
            color: cat.color,
            route: getRouteForResult(SEARCH_TYPES.CATEGORY, cat.id),
          })),
          bills: (response.data.bills || []).map((bill) => ({
            id: bill.id,
            type: SEARCH_TYPES.BILL,
            title: bill.title || bill.name,
            subtitle:
              bill.subtitle || `${bill.frequency || ""} • ${bill.amount || ""}`,
            metadata: bill.metadata || {},
            route: getRouteForResult(SEARCH_TYPES.BILL, bill.id),
          })),
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
      setLoading(false);
    }
  }, []);

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

      setQuery(newQuery);
      setSelectedIndex(0);

      // Immediate local search for quick actions
      setQuickActionResults(searchQuickActions(newQuery));

      // Immediate local search for Redux data
      const localResults = performLocalSearch(newQuery);
      setApiResults(localResults);

      // Debounced API search for comprehensive results
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (newQuery && newQuery.length >= 2) {
        setLoading(true);
        debounceTimerRef.current = setTimeout(() => {
          performApiSearch(newQuery);
        }, DEBOUNCE_DELAY);
      } else {
        setLoading(false);
      }
    },
    [performLocalSearch, performApiSearch],
  );

  /**
   * Combine and flatten all results for navigation
   */
  const allResults = useMemo(() => {
    const results = [];

    // Add quick actions first
    quickActionResults.forEach((action) => {
      results.push({
        ...action,
        section: action.section || "actions",
      });
    });

    // Add API/local results by section
    if (apiResults.expenses.length > 0) {
      apiResults.expenses.forEach((item) =>
        results.push({ ...item, section: "expenses" }),
      );
    }
    if (apiResults.budgets.length > 0) {
      apiResults.budgets.forEach((item) =>
        results.push({ ...item, section: "budgets" }),
      );
    }
    if (apiResults.categories.length > 0) {
      apiResults.categories.forEach((item) =>
        results.push({ ...item, section: "categories" }),
      );
    }
    if (apiResults.bills.length > 0) {
      apiResults.bills.forEach((item) =>
        results.push({ ...item, section: "bills" }),
      );
    }
    if (apiResults.paymentMethods.length > 0) {
      apiResults.paymentMethods.forEach((item) =>
        results.push({ ...item, section: "payment_methods" }),
      );
    }
    if (apiResults.friends.length > 0) {
      apiResults.friends.forEach((item) =>
        results.push({ ...item, section: "friends" }),
      );
    }

    return results;
  }, [quickActionResults, apiResults]);

  /**
   * Group results by section for display
   */
  const groupedResults = useMemo(() => {
    const groups = {};

    allResults.forEach((result) => {
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
  }, [allResults]);

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isOpen,
    query,
    loading,
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
