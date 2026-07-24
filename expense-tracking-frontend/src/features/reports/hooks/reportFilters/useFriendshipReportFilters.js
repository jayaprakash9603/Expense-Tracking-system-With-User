import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendshipReport } from "../../../../Redux/Friends/friendsActions";
import {
  buildReportFilterSections,
  getReportFilterDefaults,
} from "../../../../constants/reportFilters";

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

const EMPTY_DATE_RANGE = { fromDate: "", toDate: "" };

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

const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const useFriendshipReportFilters = () => {
  const dispatch = useDispatch();
  const defaults = useMemo(() => getReportFilterDefaults("friendship"), []);

  const {
    friendshipReport,
    loadingFriendshipReport,
    friendshipReportError,
  } = useSelector((state) => state.friends || {});

  const [timeframe, setTimeframe] = useState(defaults.timeframe);
  const [status, setStatus] = useState(defaults.status);
  const [accessLevel, setAccessLevel] = useState(defaults.accessLevel);
  const [sortBy, setSortBy] = useState(defaults.sortBy);
  const [sortDirection, setSortDirection] = useState(defaults.sortDirection);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [customDateRange, setCustomDateRange] = useState({
    fromDate: null,
    toDate: null,
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);

  const activeDateRange = useMemo(() => {
    if (isCustomRange && customDateRange.fromDate && customDateRange.toDate) {
      return customDateRange;
    }
    return getDateRangeFromTimeframe(timeframe);
  }, [timeframe, isCustomRange, customDateRange]);

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
  }, [
    dispatch,
    activeDateRange,
    status,
    accessLevel,
    sortBy,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const openFilters = useCallback(() => setFilterOpen(true), []);
  const closeFilters = useCallback(() => setFilterOpen(false), []);

  const applyFilters = useCallback(
    (newFilters) => {
      if (newFilters.timeframe !== undefined) {
        setTimeframe(newFilters.timeframe);
      }
      if (newFilters.status !== undefined) {
        setStatus(newFilters.status);
      }
      if (newFilters.accessLevel !== undefined) {
        setAccessLevel(newFilters.accessLevel);
      }
      if (newFilters.sortBy !== undefined) {
        setSortBy(newFilters.sortBy);
      }
      if (newFilters.sortDirection !== undefined) {
        setSortDirection(newFilters.sortDirection);
      }

      const range = newFilters.dateRange;
      if (range?.fromDate && range?.toDate) {
        setCustomDateRange({
          fromDate: toDateOrNull(range.fromDate),
          toDate: toDateOrNull(range.toDate),
        });
        setIsCustomRange(true);
      } else if (isCustomRange) {
        setCustomDateRange({ fromDate: null, toDate: null });
        setIsCustomRange(false);
      }

      setPage(0);
      closeFilters();
    },
    [closeFilters, isCustomRange]
  );

  const resetFilters = useCallback(() => {
    setTimeframe(defaults.timeframe);
    setStatus(defaults.status);
    setAccessLevel(defaults.accessLevel);
    setSortBy(defaults.sortBy);
    setSortDirection(defaults.sortDirection);
    setCustomDateRange({ fromDate: null, toDate: null });
    setIsCustomRange(false);
    setPage(0);
    return {
      ...defaults,
      dateRange: EMPTY_DATE_RANGE,
    };
  }, [defaults]);

  const handleSetCustomDateRange = useCallback((range) => {
    setCustomDateRange({
      fromDate: toDateOrNull(range?.fromDate),
      toDate: toDateOrNull(range?.toDate),
    });
    setIsCustomRange(true);
    setTimeframe("all");
  }, []);

  const resetDateRange = useCallback(() => {
    setCustomDateRange({ fromDate: null, toDate: null });
    setIsCustomRange(false);
  }, []);

  const sections = useMemo(
    () =>
      buildReportFilterSections("friendship", {
        timeframeOptions: FRIENDSHIP_TIMEFRAME_OPTIONS,
        statusOptions: FRIENDSHIP_STATUS_OPTIONS,
        accessLevelOptions: ACCESS_LEVEL_OPTIONS,
        sortOptions: SORT_OPTIONS,
      }),
    []
  );

  const filtersActive = useMemo(
    () =>
      timeframe !== defaults.timeframe ||
      status !== defaults.status ||
      accessLevel !== defaults.accessLevel ||
      sortBy !== defaults.sortBy ||
      sortDirection !== defaults.sortDirection ||
      isCustomRange,
    [
      timeframe,
      status,
      accessLevel,
      sortBy,
      sortDirection,
      isCustomRange,
      defaults,
    ]
  );

  const filterValues = useMemo(
    () => ({
      timeframe,
      status,
      accessLevel,
      sortBy,
      sortDirection,
      dateRange: isCustomRange
        ? {
            fromDate: customDateRange.fromDate
              ? customDateRange.fromDate.toISOString().slice(0, 10)
              : "",
            toDate: customDateRange.toDate
              ? customDateRange.toDate.toISOString().slice(0, 10)
              : "",
          }
        : EMPTY_DATE_RANGE,
    }),
    [
      timeframe,
      status,
      accessLevel,
      sortBy,
      sortDirection,
      isCustomRange,
      customDateRange,
    ]
  );

  return {
    friendshipReport,
    loading: loadingFriendshipReport,
    error: friendshipReportError,
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
    setTimeframe,
    setStatus,
    setAccessLevel,
    setSortBy,
    setSortDirection,
    setPage,
    setPageSize,
    setCustomDateRange: handleSetCustomDateRange,
    resetDateRange,
    isFilterOpen,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    fetchReport,
    filterSections: sections,
    filterDefaults: defaults,
    filterValues,
    filtersActive,
  };
};

export default useFriendshipReportFilters;
