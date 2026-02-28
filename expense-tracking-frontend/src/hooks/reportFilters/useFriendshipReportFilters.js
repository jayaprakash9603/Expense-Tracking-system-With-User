import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendshipReport } from "../../Redux/Friends/friendsActions";

export const FRIENDSHIP_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

export const ACCESS_LEVEL_OPTIONS = [
  { value: "all", label: "All Access Levels" },
  { value: "FULL", label: "Full Access" },
  { value: "WRITE", label: "Write Access" },
  { value: "READ", label: "Read Access" },
  { value: "NONE", label: "No Access" },
];

export const FRIENDSHIP_TIMEFRAME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Connected Date" },
  { value: "updatedAt", label: "Last Updated" },
  { value: "status", label: "Status" },
];

const getDateRangeFromTimeframe = (timeframe) => {
  const now = new Date();
  let fromDate = null;
  let toDate = new Date(now);

  switch (timeframe) {
    case "this_month":
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      toDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "this_year":
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "last_year":
      fromDate = new Date(now.getFullYear() - 1, 0, 1);
      toDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      fromDate = null;
      toDate = null;
  }

  return { fromDate, toDate };
};

const useFriendshipReportFilters = () => {
  const dispatch = useDispatch();

  // Get report data from Redux
  const {
    friendshipReport,
    loadingFriendshipReport,
    friendshipReportError,
  } = useSelector((state) => state.friends || {});

  // Filter states
  const [timeframe, setTimeframe] = useState("all");
  const [status, setStatus] = useState("all");
  const [accessLevel, setAccessLevel] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [customDateRange, setCustomDateRange] = useState({ fromDate: null, toDate: null });
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Filter drawer state
  const [isFilterOpen, setFilterOpen] = useState(false);

  // Computed date range
  const activeDateRange = useMemo(() => {
    if (isCustomRange && customDateRange.fromDate && customDateRange.toDate) {
      return customDateRange;
    }
    return getDateRangeFromTimeframe(timeframe);
  }, [timeframe, isCustomRange, customDateRange]);

  // Fetch report data
  const fetchReport = useCallback(() => {
    const filters = {
      fromDate: activeDateRange.fromDate,
      toDate: activeDateRange.toDate,
      status: status !== "all" ? status : null,
      accessLevel: accessLevel !== "all" ? accessLevel : null,
      sortBy,
      sortDirection,
      page,
      size: pageSize,
    };
    dispatch(fetchFriendshipReport(filters));
  }, [dispatch, activeDateRange, status, accessLevel, sortBy, sortDirection, page, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Open/close filters
  const openFilters = useCallback(() => setFilterOpen(true), []);
  const closeFilters = useCallback(() => setFilterOpen(false), []);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    if (newFilters.timeframe !== undefined) setTimeframe(newFilters.timeframe);
    if (newFilters.status !== undefined) setStatus(newFilters.status);
    if (newFilters.accessLevel !== undefined) setAccessLevel(newFilters.accessLevel);
    if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
    if (newFilters.sortDirection !== undefined) setSortDirection(newFilters.sortDirection);
    if (newFilters.dateRange) {
      setCustomDateRange(newFilters.dateRange);
      setIsCustomRange(true);
    }
    setPage(0); // Reset to first page when filters change
    closeFilters();
  }, [closeFilters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setTimeframe("all");
    setStatus("all");
    setAccessLevel("all");
    setSortBy("createdAt");
    setSortDirection("desc");
    setCustomDateRange({ fromDate: null, toDate: null });
    setIsCustomRange(false);
    setPage(0);
  }, []);

  // Set custom date range
  const handleSetCustomDateRange = useCallback((range) => {
    setCustomDateRange(range);
    setIsCustomRange(true);
    setTimeframe("all");
  }, []);

  // Reset date range
  const resetDateRange = useCallback(() => {
    setCustomDateRange({ fromDate: null, toDate: null });
    setIsCustomRange(false);
  }, []);

  // Build filter sections for drawer
  const filterSections = useMemo(() => [
    {
      key: "timeframe",
      label: "Time Period",
      type: "select",
      options: FRIENDSHIP_TIMEFRAME_OPTIONS,
      value: timeframe,
    },
    {
      key: "status",
      label: "Friendship Status",
      type: "select",
      options: FRIENDSHIP_STATUS_OPTIONS,
      value: status,
    },
    {
      key: "accessLevel",
      label: "Access Level",
      type: "select",
      options: ACCESS_LEVEL_OPTIONS,
      value: accessLevel,
    },
    {
      key: "sortBy",
      label: "Sort By",
      type: "select",
      options: SORT_OPTIONS,
      value: sortBy,
    },
    {
      key: "sortDirection",
      label: "Sort Direction",
      type: "select",
      options: [
        { value: "desc", label: "Newest First" },
        { value: "asc", label: "Oldest First" },
      ],
      value: sortDirection,
    },
    {
      key: "dateRange",
      label: "Custom Date Range",
      type: "dateRange",
      value: customDateRange,
    },
  ], [timeframe, status, accessLevel, sortBy, sortDirection, customDateRange]);

  // Check if any filters are active
  const filtersActive = useMemo(() => {
    return (
      timeframe !== "all" ||
      status !== "all" ||
      accessLevel !== "all" ||
      sortBy !== "createdAt" ||
      sortDirection !== "desc" ||
      isCustomRange
    );
  }, [timeframe, status, accessLevel, sortBy, sortDirection, isCustomRange]);

  // Current filter values for drawer
  const filterValues = useMemo(() => ({
    timeframe,
    status,
    accessLevel,
    sortBy,
    sortDirection,
    dateRange: customDateRange,
  }), [timeframe, status, accessLevel, sortBy, sortDirection, customDateRange]);

  return {
    // Data
    friendshipReport,
    loading: loadingFriendshipReport,
    error: friendshipReportError,

    // Filter states
    timeframe,
    status,
    accessLevel,
    sortBy,
    sortDirection,
    page,
    pageSize,
    customDateRange,
    isCustomRange,
    activeDateRange,

    // Setters
    setTimeframe,
    setStatus,
    setAccessLevel,
    setSortBy,
    setSortDirection,
    setPage,
    setPageSize,
    setCustomDateRange: handleSetCustomDateRange,
    resetDateRange,

    // Drawer
    isFilterOpen,
    openFilters,
    closeFilters,
    
    // Actions
    applyFilters,
    resetFilters,
    fetchReport,

    // Filter sections for drawer
    filterSections,
    filterValues,
    filtersActive,
  };
};

export default useFriendshipReportFilters;
