/**
 * =============================================================================
 * useSharesPage - Custom Hook for Share Page Logic
 * =============================================================================
 *
 * Provides common state and logic for shares pages including:
 * - Tab management
 * - Search filtering
 * - View mode toggle (grid/list)
 * - Pagination
 * - Statistics calculation
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  filterSharesBySearch,
  filterSharesByStatus,
  calculateShareStats,
} from "../utils/sharesUtils";

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_PAGE_SIZE = 12;
const VIEW_MODE_STORAGE_KEY = "shares_view_mode";
const TAB_STORAGE_PREFIX = "shares_tab_";

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Custom hook for managing shares page state and logic
 * @param {Object} options Configuration options
 * @param {Array} options.data - The shares data array
 * @param {boolean} options.loading - Loading state
 * @param {string} options.error - Error message
 * @param {Array} options.tabs - Tab configuration array
 * @param {string} options.pageKey - Unique key for persisting preferences
 * @param {number} options.pageSize - Items per page
 * @param {Function} options.fetchAction - Redux action to fetch data
 * @returns {Object} Hook state and methods
 */
const useSharesPage = ({
  data = [],
  loading = false,
  error = null,
  tabs = [],
  pageKey = "default",
  pageSize = DEFAULT_PAGE_SIZE,
  fetchAction = null,
}) => {
  const dispatch = useDispatch();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  // View mode (grid/list) - persisted to localStorage
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(VIEW_MODE_STORAGE_KEY) || "grid";
    }
    return "grid";
  });

  // Active tab - persisted per page
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(`${TAB_STORAGE_PREFIX}${pageKey}`) ||
        (tabs[0]?.value ?? "all")
      );
    }
    return tabs[0]?.value ?? "all";
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Sort configuration
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc",
  });

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Persist view mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  // Persist active tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${TAB_STORAGE_PREFIX}${pageKey}`, activeTab);
    }
  }, [activeTab, pageKey]);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Fetch data on mount and refresh
  useEffect(() => {
    if (fetchAction) {
      dispatch(fetchAction());
    }
  }, [dispatch, fetchAction, refreshKey]);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  // Filter data based on active tab
  const tabFilteredData = useMemo(() => {
    if (!activeTab || activeTab === "all") {
      return data;
    }

    // Find the tab configuration
    const tabConfig = tabs.find((t) => t.value === activeTab);
    if (!tabConfig) return data;

    // If tab has a custom filter function
    if (tabConfig.filterFn) {
      return data.filter(tabConfig.filterFn);
    }

    // If tab has a status filter
    if (tabConfig.status) {
      return filterSharesByStatus(data, tabConfig.status);
    }

    return data;
  }, [data, activeTab, tabs]);

  // Filter by search query
  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return tabFilteredData;
    }

    return filterSharesBySearch(tabFilteredData, searchQuery);
  }, [tabFilteredData, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.field) {
      return searchFilteredData;
    }

    return [...searchFilteredData].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  }, [searchFilteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / pageSize);
  }, [sortedData.length, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    return calculateShareStats(data);
  }, [data]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: data.length };

    tabs.forEach((tab) => {
      if (tab.value === "all") return;

      if (tab.filterFn) {
        counts[tab.value] = data.filter(tab.filterFn).length;
      } else if (tab.status) {
        counts[tab.value] = filterSharesByStatus(data, tab.status).length;
      }
    });

    return counts;
  }, [data, tabs]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleViewModeToggle = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // State
    viewMode,
    activeTab,
    searchQuery,
    currentPage,
    totalPages,
    sortConfig,
    loading,
    error,

    // Data
    data: paginatedData,
    filteredData: sortedData,
    allData: data,
    stats,
    tabCounts,
    isEmpty: data.length === 0,
    isFiltered: searchQuery.trim() !== "" || activeTab !== "all",
    noResults: sortedData.length === 0 && data.length > 0,

    // Handlers
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleViewModeToggle,
    handlePageChange,
    handleSort,
    handleRefresh,
    setActiveTab,
    setSearchQuery,
    setViewMode,
  };
};

export default useSharesPage;
