import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  LabelList,
  Customized,
} from "recharts";
import {
  fetchCashflowExpenses,
  deleteExpenseAction,
  getExpenseAction,
  deleteMultiExpenses,
} from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";
import {
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RepeatIcon from "@mui/icons-material/Repeat";
import { createPortal } from "react-dom";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import recentPng from "../../assests/recent.png";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ToastNotification from "./ToastNotification";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "./Modal";
// removed image imports for flow icons to use inline SVGs for cleaner, scalable UI
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { deleteBill, getBillByExpenseId } from "../../Redux/Bill/bill.action";
import NoDataPlaceholder from "../../components/NoDataPlaceholder";
// Friend related imports
import FriendInfoBar from "./FriendInfoBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";

const rangeTypes = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthDays = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
const yearMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Format range label per new requirements (month: full date range, week: week range, year: year only)
const getRangeLabel = (range, offset) => {
  const base = dayjs();
  if (range === "month") {
    const start = base.startOf("month").add(offset, "month");
    const end = base.endOf("month").add(offset, "month");
    if (offset === 0) {
      // Current month label format: This Month (Sep 25)
      return `This Month (${base.format("MMM YY")})`;
    }
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
  }
  if (range === "week") {
    const start = base.startOf("week").add(offset, "week");
    const end = base.endOf("week").add(offset, "week");
    // Show concise range without redundant year if same year
    if (start.year() === end.year()) {
      return `${start.format("D MMM")} - ${end.format("D MMM YYYY")}`;
    }
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
  }
  if (range === "year") {
    const year = base.startOf("year").add(offset, "year").year();
    return `${year}`;
  }
  return "";
};

const CashflowSearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
  isMobile,
  isTablet,
}) => (
  <div
    style={{
      display: "flex",
      gap: 8,
      padding: isMobile ? 6 : 8,
      alignItems: "center",
      width: "100%",
      maxWidth: isMobile ? "220px" : isTablet ? "280px" : "320px",
    }}
  >
    <input
      type="text"
      placeholder="Search expenses..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        backgroundColor: "#1b1b1b",
        color: "#ffffff",
        borderRadius: 8,
        fontSize: isMobile ? "0.7rem" : "0.75rem",
        border: "1px solid #00dac6",
        padding: isMobile ? "6px 10px" : "8px 16px",
        width: "100%",
        outline: "none",
      }}
    />
    <IconButton
      sx={{ color: "#00dac6", flexShrink: 0, p: isMobile ? 0.5 : 1 }}
      onClick={onFilterClick}
      ref={filterRef}
    >
      <FilterListIcon fontSize={isMobile ? "small" : "small"} />
    </IconButton>
  </div>
);

const flowTypeCycle = [
  { label: "Money In & Out", value: "all", color: "bg-[#5b7fff] text-white" },
  { label: "Money In", value: "inflow", color: "bg-[#06D6A0] text-black" },
  { label: "Money Out", value: "outflow", color: "bg-[#FF6B6B] text-white" },
];

// Small pill for selection summary values (basic pill reused inside enhanced bar)
const SummaryPill = ({ label, value, icon }) => (
  <span
    style={{
      background: "#1b1b1b",
      border: "1px solid #262626",
      borderRadius: 8,
      padding: "6px 10px",
      fontSize: 11,
      fontWeight: 600,
      color: "#cfd3d8",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      lineHeight: 1.15,
      position: "relative",
      minHeight: 30,
      boxShadow:
        "0 2px 4px -1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)",
    }}
  >
    {icon && (
      <span
        style={{
          fontSize: 13,
          opacity: 0.9,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
    )}
    <span style={{ opacity: 0.55, fontWeight: 500 }}>{label}</span>
    <span style={{ color: "#00dac6", fontVariantNumeric: "tabular-nums" }}>
      {value}
    </span>
  </span>
);

const Cashflow = () => {
  const [activeRange, setActiveRange] = useState("month"); // Default to month on mount
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all"); // Start with 'all'
  const [search, setSearch] = useState("");
  // Legacy single selection kept for compatibility; new multi-select uses selectedBars
  const [selectedBar, setSelectedBar] = useState(null); // last clicked (primary) bar
  const [selectedBars, setSelectedBars] = useState([]); // array of { idx, data }
  const [lastBarSelectedIdx, setLastBarSelectedIdx] = useState(null); // anchor for shift selection
  // Track which bar user is hovering (via activeTooltipIndex) so even tiny bars can be clicked
  const [hoverBarIndex, setHoverBarIndex] = useState(null);
  const [selectedCardIdx, setSelectedCardIdx] = useState([]); // Change from null to an array
  const [lastSelectedIdx, setLastSelectedIdx] = useState(null); // For shift selection
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  // Enhanced summary bar toggle (collapsed by default on very small screens)
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [expenseData, setExpenseData] = useState({});
  const dispatch = useDispatch();
  const { cashflowExpenses, loading } = useSelector((state) => state.expenses);
  const { friendship, friends } = useSelector((state) => state.friends || {});
  const filterBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { friendId } = useParams();
  const isFriendView = Boolean(friendId && friendId !== "undefined");
  // Compact number formatter: 1.2k, 3.4M, 1B
  const formatCompactNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e9) {
      const v = +(value / 1e9).toFixed(abs >= 1e10 ? 0 : 1);
      return `${sign}${v.toString().replace(/\.0$/, "")}B`;
    }
    if (abs >= 1e6) {
      const v = +(value / 1e6).toFixed(abs >= 1e7 ? 0 : 1);
      return `${sign}${v.toString().replace(/\.0$/, "")}M`;
    }
    if (abs >= 1e3) {
      const v = +(value / 1e3).toFixed(abs >= 1e4 ? 0 : 1);
      return `${sign}${v.toString().replace(/\.0$/, "")}k`;
    }
    // Show two decimals for fractional amounts, otherwise integer
    return value % 1 === 0
      ? `${sign}${Math.round(abs)}`
      : `${sign}${abs.toFixed(2)}`;
  };

  // Return compact formatted number without currency symbol
  const formatCurrencyCompact = (value) => formatCompactNumber(value);

  // Full numeric formatter for labels (e.g. 12,345 or 12.34)
  const formatNumberFull = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    // If integer, show with thousand separators
    if (Number.isInteger(value)) return value.toLocaleString();
    // Otherwise show up to 2 decimal places
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };
  // Removed isFiltering; search is client-side only
  const [addNewPopoverOpen, setAddNewPopoverOpen] = useState(false);
  const [addNewBtnRef, setAddNewBtnRef] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  // Controls a brief shrink animation when the flow button is clicked
  const [shrinkFlowBtn, setShrinkFlowBtn] = useState(false);
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      // Set the range type and offset from the navigation state if available
      if (location.state.rangeType) {
        setActiveRange(location.state.rangeType);
      }
      if (location.state.offset !== undefined) {
        setOffset(location.state.offset);
      }
      if (location.state.flowType) {
        setFlowTab(location.state.flowType);
      }

      // Set search to filter by the selected category
      setSearch(location.state.selectedCategory);

      // Clear the navigation state to prevent reapplying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch data on range/offset/flow changes; search is client-side only
  useEffect(() => {
    // Friend view adds friendId param, category filter still derived from search client-side
    dispatch(
      fetchCashflowExpenses(
        activeRange,
        offset,
        flowTab === "all" ? null : flowTab,
        null,
        isFriendView ? friendId : null
      )
    );
  }, [activeRange, offset, flowTab, dispatch, friendId, isFriendView]);

  // Load friendship + friends list if in friend view
  useEffect(() => {
    if (isFriendView) {
      if (friendId) dispatch(fetchFriendship(friendId));
      dispatch(fetchFriendsDetailed());
    }
  }, [dispatch, friendId, isFriendView]);

  // Add this to your component to debug the category selection
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      console.log(
        "Category selected from navigation:",
        location.state.selectedCategory
      );
      console.log("Current search term:", search);
    }
  }, [location.state, search]);

  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  // Reset selections when main view changes
  useEffect(() => {
    setSelectedBar(null);
    setSelectedBars([]);
    setSelectedCardIdx([]); // Deselect card when range or offset changes
  }, [activeRange, offset, flowTab]);

  // Popover close on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target) &&
        !document.getElementById("sort-popover")?.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const handleBack = () => setOffset((prev) => prev - 1);
  const handleNext = () => setOffset((prev) => prev + 1);
  const handleSort = (type) => {
    setSortType(type);
    setPopoverOpen(false);
  };

  const rangeLabel = getRangeLabel(activeRange, offset);

  // Adjust bar chart styles based on screen size
  const barChartStyles = {
    barWidth: isMobile ? 10 : isTablet ? 20 : 30, // Decrease bar width for small screens
    hideNumbers: isMobile, // Hide numbers on top of bars for mobile screens
    hideAxisLabels: isMobile, // Hide axis labels for small screens
  };

  // Apply client-side search filter once and use it for both chart and cards
  const filteredExpensesForView = useMemo(() => {
    const list = Array.isArray(cashflowExpenses) ? cashflowExpenses : [];
    const q = (search || "").toLowerCase().trim();
    if (!q) return list;
    return list.filter((item) => {
      const exp = item?.expense || {};
      const name = (exp.expenseName || item.name || "").toLowerCase();
      const comments = (exp.comments || item.comments || "").toLowerCase();
      const amountStr = String(exp.amount ?? item.amount ?? "").toLowerCase();
      const category = (
        item.categoryName ||
        item.category?.name ||
        item.category ||
        ""
      )
        .toString()
        .toLowerCase();
      return (
        name.includes(q) ||
        comments.includes(q) ||
        amountStr.includes(q) ||
        category.includes(q)
      );
    });
  }, [cashflowExpenses, search]);

  // Aggregate data for graph and cards from filtered list
  const { chartData, cardData } = useMemo(() => {
    if (
      !Array.isArray(filteredExpensesForView) ||
      filteredExpensesForView.length === 0
    ) {
      return { chartData: [], cardData: [] };
    }

    if (activeRange === "week") {
      // Group by day of week (Mon-Sun)
      const weekMap = {};
      weekDays.forEach(
        (d) => (weekMap[d] = { day: d, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const dayIdx = dayjs(date).day(); // 0=Sunday, 1=Monday...
        const weekDay = weekDays[(dayIdx + 6) % 7]; // shift so Monday is 0
        weekMap[weekDay].amount += item.expense?.amount || 0;
        weekMap[weekDay].expenses.push(item);
      });
      return {
        chartData: weekDays.map((d) => ({
          day: d,
          amount: weekMap[d].amount,
        })),
        cardData: weekDays.flatMap((d) =>
          weekMap[d].expenses.map((item) => ({
            ...item,
            day: d,
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ),
      };
    } else if (activeRange === "month") {
      // Group by day of month (1-31)
      const daysInMonth = dayjs()
        .startOf("month")
        .add(offset, "month")
        .daysInMonth();
      const monthMap = {};
      for (let i = 1; i <= daysInMonth; i++) {
        monthMap[i] = { day: i, amount: 0, expenses: [] };
      }
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const day = dayjs(date).date();
        if (monthMap[day]) {
          monthMap[day].amount += item.expense?.amount || 0;
          monthMap[day].expenses.push(item);
        }
      });
      return {
        chartData: Array.from({ length: daysInMonth }, (_, i) => ({
          day: (i + 1).toString(),
          amount: monthMap[i + 1].amount,
        })),
        cardData: Array.from({ length: daysInMonth }, (_, i) =>
          monthMap[i + 1].expenses.map((item) => ({
            ...item,
            day: (i + 1).toString(),
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ).flat(),
      };
    } else if (activeRange === "year") {
      // Group by month (Jan-Dec)
      const yearMap = {};
      yearMonths.forEach(
        (m, idx) => (yearMap[idx] = { month: m, amount: 0, expenses: [] })
      );
      filteredExpensesForView.forEach((item) => {
        const date = item.date || item.expense?.date;
        const monthIdx = dayjs(date).month(); // 0=Jan
        yearMap[monthIdx].amount += item.expense?.amount || 0;
        yearMap[monthIdx].expenses.push(item);
      });
      return {
        chartData: yearMonths.map((m, idx) => ({
          month: m,
          amount: yearMap[idx].amount,
        })),
        cardData: yearMonths.flatMap((m, idx) =>
          yearMap[idx].expenses.map((item) => ({
            ...item,
            month: m,
            name: item.expense?.expenseName || "",
            amount: item.expense?.amount || 0,
            comments: item.expense?.comments || "",
          }))
        ),
      };
    }
    return { chartData: [], cardData: [] };
  }, [filteredExpensesForView, activeRange, offset]);

  // Chart axis keys
  const xKey =
    activeRange === "week" ? "day" : activeRange === "month" ? "day" : "month";

  // Filter cardData by multi-selection (union). If none selected, show all.
  const filteredCardData = useMemo(() => {
    if (!selectedBars.length) return cardData;
    const keys = new Set();
    selectedBars.forEach((b) => {
      if (activeRange === "week" || activeRange === "month") {
        keys.add(`${b.data.day}`);
      } else if (activeRange === "year") {
        keys.add(`${b.data.month}`);
      }
    });
    return cardData.filter((row) => {
      if (activeRange === "week" || activeRange === "month") {
        return keys.has(String(row.day));
      }
      if (activeRange === "year") return keys.has(String(row.month));
      return true;
    });
  }, [cardData, selectedBars, activeRange]);

  // Sort filteredCardData based on sortType
  const sortedCardData = useMemo(() => {
    let data = [...filteredCardData];
    if (sortType === "high") {
      data.sort((a, b) => b.amount - a.amount);
    } else if (sortType === "low") {
      data.sort((a, b) => a.amount - b.amount);
    } else if (sortType === "recent") {
      data.sort(
        (a, b) =>
          new Date(b.date || b.expense?.date) -
          new Date(a.date || a.expense?.date)
      );
    }
    return data;
  }, [filteredCardData, sortType]);

  // Handler for bar click (supports single, ctrl/cmd multi, and shift range)
  const handleBarClick = (data, idx, multi = false, rangeSelect = false) => {
    setSelectedCardIdx([]);
    if (
      rangeSelect &&
      lastBarSelectedIdx !== null &&
      lastBarSelectedIdx !== undefined
    ) {
      const start = Math.min(lastBarSelectedIdx, idx);
      const end = Math.max(lastBarSelectedIdx, idx);
      const range = [];
      for (let i = start; i <= end; i++) {
        if (chartData[i]) range.push({ data: chartData[i], idx: i });
      }
      setSelectedBars(range);
      setSelectedBar(range[range.length - 1] || null);
      return;
    }
    if (!multi) {
      setSelectedBar((prev) =>
        prev && prev.idx === idx ? null : { data, idx }
      );
      setSelectedBars((prev) => {
        if (prev.length === 1 && prev[0].idx === idx) {
          setLastBarSelectedIdx(null);
          return [];
        }
        setLastBarSelectedIdx(idx);
        return [{ data, idx }];
      });
      return;
    }
    // ctrl/cmd multi toggle
    setSelectedBars((prev) => {
      const exists = prev.find((p) => p.idx === idx);
      let next;
      if (exists) {
        next = prev.filter((p) => p.idx !== idx);
      } else {
        next = [...prev, { data, idx }];
        setLastBarSelectedIdx(idx);
      }
      setSelectedBar(next.length ? next[next.length - 1] : null);
      return next;
    });
  };

  // Modify the handleCardClick function to support Shift+Click and prevent text selection
  const handleCardClick = (idx, event) => {
    if (event) {
      event.preventDefault(); // Prevent text selection
    }
    if (
      event &&
      event.shiftKey &&
      lastSelectedIdx !== null &&
      lastSelectedIdx !== undefined
    ) {
      // Range selection
      const start = Math.min(lastSelectedIdx, idx);
      const end = Math.max(lastSelectedIdx, idx);
      const range = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      setSelectedCardIdx(range);
    } else if (event && event.ctrlKey) {
      setSelectedCardIdx((prevSelected) => {
        if (prevSelected.includes(idx)) {
          // If already selected, deselect it
          return prevSelected.filter((i) => i !== idx);
        } else {
          // Otherwise, add it to the selection
          return [...prevSelected, idx];
        }
      });
      setLastSelectedIdx(idx);
    } else {
      // Single select: if already selected, deselect
      setSelectedCardIdx((prevSelected) => {
        if (prevSelected.length === 1 && prevSelected[0] === idx) {
          return [];
        } else {
          return [idx];
        }
      });
      setLastSelectedIdx(idx);
    }
  };

  // Cycle flowTab on button click
  const handleFlowTabToggle = () => {
    const idx = flowTypeCycle.findIndex((t) => t.value === flowTab);
    const next = flowTypeCycle[(idx + 1) % flowTypeCycle.length];
    setFlowTab(next.value);
    setSelectedBar(null);
    setSelectedCardIdx([]);
  };

  // Compute totals for display in summary pills
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    if (Array.isArray(filteredExpensesForView)) {
      filteredExpensesForView.forEach((item) => {
        const amount = item.expense?.amount || item.amount || 0;
        const type = (
          item.type ||
          item.expense?.type ||
          "outflow"
        ).toLowerCase();
        if (type === "inflow" || type === "gain") inflow += amount;
        else outflow += amount;
      });
    }
    return { inflow, outflow, total: inflow + outflow };
  }, [filteredExpensesForView]);

  // Selection statistics (bars). If none selected, fallback to whole chartData.
  const selectionStats = useMemo(() => {
    const base = selectedBars.length ? selectedBars.map((b) => b.data) : [];
    if (!base.length) return null;
    const amounts = base.map((d) => d.amount || 0);
    const count = amounts.length;
    const total = amounts.reduce((a, b) => a + b, 0);
    const avg = count ? total / count : 0;
    let min = Infinity,
      max = -Infinity,
      minIdx = -1,
      maxIdx = -1;
    amounts.forEach((v, i) => {
      if (v < min) {
        min = v;
        minIdx = i;
      }
      if (v > max) {
        max = v;
        maxIdx = i;
      }
    });
    return {
      count,
      total,
      avg,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }, [selectedBars]);

  const clearSelection = () => {
    setSelectedBars([]);
    setSelectedBar(null);
    setLastBarSelectedIdx(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addNewPopoverOpen &&
        addNewBtnRef &&
        !addNewBtnRef.contains(event.target)
      ) {
        // Check if click is outside both the button and the popover
        const popover = document.querySelector('[data-popover="add-new"]');
        if (!popover || !popover.contains(event.target)) {
          setAddNewPopoverOpen(false);
        }
      }
    };

    if (addNewPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [addNewPopoverOpen, addNewBtnRef]);
  useEffect(() => {
    // Show toast if redirected with toastMessage in location.state
    if (location.state && location.state.toastMessage) {
      setToastMessage(location.state.toastMessage);
      setToastOpen(true);
      // Remove the toastMessage from history state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  // Header names for modal
  const headerNames = {
    name: "Expense Name",
    amount: "Amount",
    type: "Type",
    paymentMethod: "Payment Method",
    netAmount: "Net Amount",
    comments: "Comments",
    creditDue: "Credit Due",
    date: "Date",
  };

  // Delete handlers
  const handleDeleteClick = (row, idx) => {
    setExpenseData({
      name: row.name,
      amount: row.amount,
      type: row.type || row.expense?.type,
      paymentMethod: row.paymentMethod || row.expense?.paymentMethod,
      netAmount: row.netAmount || row.expense?.netAmount,
      comments: row.comments,
      creditDue: row.creditDue || row.expense?.creditDue,
      date: row.date || row.expense?.date,
    });
    setExpenseToDelete(row.id || row.expenseId);
    setIsDeleteModalOpen(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      setIsDeleting(true);
      if (Array.isArray(expenseToDelete)) {
        try {
          await dispatch(
            deleteMultiExpenses(
              expenseToDelete,
              isFriendView ? friendId : undefined
            )
          );
          dispatch(
            fetchCashflowExpenses(
              activeRange,
              offset,
              flowTab === "all" ? null : flowTab,
              null,
              isFriendView ? friendId : null
            )
          );
          setToastMessage("Selected expenses deleted successfully.");
          setToastOpen(true);
        } catch (err) {
          setToastMessage(
            "Error deleting selected expenses. Please try again."
          );
          setToastOpen(true);
        } finally {
          setIsDeleting(false);
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
          setSelectedCardIdx([]);
        }
      } else {
        try {
          const expensedata = await dispatch(getExpenseAction(expenseToDelete));
          const bill = expensedata.bill
            ? await dispatch(getBillByExpenseId(expenseToDelete))
            : false;
          await dispatch(
            bill ? deleteBill(bill.id) : deleteExpenseAction(expenseToDelete)
          );
          dispatch(
            fetchCashflowExpenses(
              activeRange,
              offset,
              flowTab === "all" ? null : flowTab,
              null,
              isFriendView ? friendId : null
            )
          );
          setToastMessage(
            bill ? "Bill deleted successfully" : "Expense deleted successfully."
          );
          setToastOpen(true);
        } catch {
          setToastMessage("Error deleting expense. Please try again.");
          setToastOpen(true);
        } finally {
          setIsDeleting(false);
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
          setSelectedCardIdx([]);
        }
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
    setExpenseData({});
  };

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={isMobile ? "100%" : "100%"}>
      <BarChart
        data={chartData}
        barWidth={barChartStyles.barWidth}
        hideNumbers={barChartStyles.hideNumbers}
        margin={{ right: isMobile ? 0 : 40 }}
        // Use mouse move to capture activeTooltipIndex (works even if bar value ~0)
        onMouseMove={(state) => {
          if (state && typeof state.activeTooltipIndex === "number") {
            setHoverBarIndex(state.activeTooltipIndex);
          } else {
            setHoverBarIndex(null);
          }
        }}
        onMouseLeave={() => setHoverBarIndex(null)}
        // Chart-level click: if we have a hovered index, select that bar
        onClick={(e) => {
          if (hoverBarIndex !== null && chartData[hoverBarIndex]) {
            const multi = e && (e.ctrlKey || e.metaKey);
            const rangeSel = e && e.shiftKey;
            handleBarClick(
              chartData[hoverBarIndex],
              hoverBarIndex,
              multi,
              rangeSel
            );
          }
        }}
        style={{ cursor: hoverBarIndex !== null ? "pointer" : "default" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#33384e" />
        {/** Custom clickable X axis tick so user can click anywhere on the date label area (not just the bar). */}
        <XAxis
          dataKey={xKey}
          stroke="#b0b6c3"
          tickLine={false}
          axisLine={{ stroke: "#33384e" }}
          height={50}
          tick={(props) => {
            const { x, y, payload, index } = props; // index corresponds to data index
            const isSelected = selectedBars.some((b) => b.idx === index);
            // Approximate band width for clickable rect (safer than relying on internals)
            const band = barChartStyles.barWidth + (isMobile ? 8 : 12);
            const selectedColor =
              flowTab === "outflow"
                ? "#ff4d4f"
                : flowTab === "inflow"
                ? "#06d6a0"
                : "#5b7fff";
            return (
              <g
                transform={`translate(${x},${y})`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const multi = e && (e.ctrlKey || e.metaKey);
                  const rangeSel = e && e.shiftKey;
                  if (chartData[index]) {
                    handleBarClick(chartData[index], index, multi, rangeSel);
                  }
                  e.stopPropagation();
                }}
              >
                {/* Invisible rectangle expands the hit area for easier clicking */}
                <rect
                  x={-band / 2}
                  y={-(isMobile ? 26 : 30)}
                  width={band}
                  height={isMobile ? 34 : 40}
                  fill="transparent"
                />
                <text
                  dy={10}
                  fill={isSelected ? selectedColor : "#b0b6c3"}
                  fontSize={13}
                  fontWeight={isSelected ? 800 : 600}
                  textAnchor="middle"
                >
                  {payload?.value}
                </text>
              </g>
            );
          }}
          label={
            barChartStyles.hideAxisLabels
              ? null
              : {
                  value:
                    activeRange === "month"
                      ? "Day"
                      : activeRange === "week"
                      ? "Weekday"
                      : "Month",
                  position: "insideBottomRight",
                  offset: -5,
                  fill: "#b0b6c3",
                  fontWeight: 700,
                  fontSize: 14,
                  dy: -20,
                  dx: 30,
                }
          }
        />
        <YAxis
          stroke="#b0b6c3"
          tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
          axisLine={{ stroke: "#33384e" }}
          tickLine={false}
          label={
            barChartStyles.hideAxisLabels
              ? null
              : {
                  value: "Amount",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#b0b6c3",
                  fontWeight: 700,
                  fontSize: 14,
                  dy: 40, // Move the Y axis label further left to avoid overlap
                }
          }
          tickFormatter={(value) => formatCompactNumber(value)}
          width={80} // Increase Y axis width for more space
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "#23243a",
            border: "1px solid #00dac6",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 500,
          }}
          labelStyle={{ color: "#00dac6", fontWeight: 700 }}
          itemStyle={{ color: "#b0b6c3" }}
          formatter={(value) => [formatCurrencyCompact(value), "Amount"]}
          wrapperStyle={{ zIndex: 1000 }}
          labelFormatter={(label, payload) => {
            try {
              if (!Array.isArray(payload) || payload.length === 0) return label;
              if (activeRange === "year") {
                const monthIdx = yearMonths.indexOf(String(label));
                if (monthIdx >= 0) {
                  const baseYear = dayjs().startOf("year").add(offset, "year");
                  const monthStart = baseYear.month(monthIdx).startOf("month");
                  const monthEnd = monthStart.endOf("month");
                  return `${monthStart.format("MMM")} (${monthStart.format(
                    "D MMM"
                  )} - ${monthEnd.format("D MMM")})`;
                }
              } else if (activeRange === "month") {
                const dayNum = parseInt(String(label), 10);
                if (!isNaN(dayNum)) {
                  const baseMonth = dayjs()
                    .startOf("month")
                    .add(offset, "month");
                  const date = baseMonth.date(dayNum);
                  return date.format("D MMM");
                }
              } else if (activeRange === "week") {
                const idx = weekDays.indexOf(String(label));
                if (idx >= 0) {
                  // Compute Monday of the CURRENT week explicitly (independent of startOf('week') which is Sunday)
                  // then apply the offset in weeks. This avoids accidental +1 week drift.
                  const today = dayjs();
                  const daysSinceMonday = (today.day() + 6) % 7; // 0 if Monday, 6 if Sunday
                  const currentMonday = today.subtract(daysSinceMonday, "day");
                  const monday = currentMonday.add(offset, "week");
                  const date = monday.add(idx, "day");
                  return `${date.format("ddd")}, ${date.format("D MMM")}`;
                }
              }
            } catch (e) {
              // silent fallback
            }
            return label;
          }}
        />
        {/* Average line */}
        {Array.isArray(chartData) &&
          chartData.length > 0 &&
          (() => {
            // Calculate average only over the portion of the range that has passed
            // (for the current period when offset === 0). For past/future offsets
            // use the full range length.
            let visibleCount = chartData.length;
            if (offset === 0) {
              if (activeRange === "year") {
                // include months up to current month (month() is 0-based)
                visibleCount = Math.min(chartData.length, dayjs().month() + 1);
              } else if (activeRange === "month") {
                // include days up to today
                visibleCount = Math.min(chartData.length, dayjs().date());
              } else if (activeRange === "week") {
                // include weekdays up to today in Mon..Sun order
                const todayIdx = (dayjs().day() + 6) % 7; // 0=Mon
                visibleCount = Math.min(chartData.length, todayIdx + 1);
              }
            }
            const total = chartData
              .slice(0, visibleCount)
              .reduce((s, item) => s + (item.amount || 0), 0);
            const avg = visibleCount ? total / visibleCount : 0;
            const labelText = `Avg ${formatCurrencyCompact(avg)}`;
            return (
              <ReferenceLine
                y={avg}
                stroke="#FFD54A"
                strokeDasharray="4 4"
                label={({ viewBox, x, y }) => {
                  // Position the label near the right end of the line; fallback to x/y
                  // move 30px to the right as requested
                  const tx =
                    ((viewBox && viewBox.x + viewBox.width - 8) || x || 0) + 35;
                  const baseY =
                    typeof y === "number"
                      ? y
                      : (viewBox && viewBox.y + viewBox.height / 2) || 0;
                  // Two-line label: 'Avg' above, amount on the next line
                  const labelYTop = baseY - 8; // slightly above the line
                  const labelYBottom = baseY + 10; // below the top line
                  return (
                    <g style={{ pointerEvents: "none" }}>
                      <text
                        x={tx}
                        y={labelYTop}
                        fill="#FFD54A"
                        fontWeight={700}
                        fontSize={12}
                        textAnchor="end"
                      >
                        Avg
                      </text>
                      <text
                        x={tx}
                        y={labelYBottom}
                        fill="#FFD54A"
                        fontWeight={700}
                        fontSize={12}
                        textAnchor="end"
                      >
                        {formatNumberFull(
                          Number.isFinite(avg) ? Math.trunc(avg) : 0
                        )}
                      </text>
                    </g>
                  );
                }}
              />
            );
          })()}
        <Bar
          dataKey="amount"
          fill="#5b7fff"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        >
          {chartData.map((entry, idx) => {
            const isSelected = selectedBars.some((b) => b.idx === idx);
            const isHover = hoverBarIndex === idx && !isSelected;
            return (
              <Cell
                key={idx}
                fill={
                  isSelected
                    ? flowTab === "outflow"
                      ? "#ff4d4f"
                      : flowTab === "inflow"
                      ? "#06d6a0"
                      : "#5b7fff"
                    : isHover
                    ? "#7895ff"
                    : "#5b7fff"
                }
                cursor={chartData.length > 0 ? "pointer" : "default"}
                onClick={(e) => {
                  if (!chartData.length) return;
                  const multi = e && (e.ctrlKey || e.metaKey);
                  const rangeSel = e && e.shiftKey;
                  handleBarClick(entry, idx, multi, rangeSel);
                  e.stopPropagation();
                }}
              />
            );
          })}
          {/* Add value labels on top of bars */}
          {!barChartStyles.hideNumbers && (
            <LabelList
              dataKey="amount"
              position="top"
              content={({ x, y, width, value }) => {
                if (!value) return null; // Don't render label for 0
                const labelY = y < 18 ? y + 14 : y - 6;
                return (
                  <text
                    x={x + width / 2}
                    y={labelY}
                    fill="#fff"
                    fontSize={11}
                    textAnchor="middle"
                  >
                    {formatNumberFull(value)}
                  </text>
                );
              }}
            />
          )}
        </Bar>
        {/* Transparent full-height clickable columns so user can click empty vertical space above tiny bars */}
        <Customized
          component={(props) => {
            const { xAxisMap, offset } = props || {};
            if (!xAxisMap || !chartData?.length) return null;
            const axisKey = Object.keys(xAxisMap)[0];
            const xAxisCfg = xAxisMap[axisKey];
            const scale = xAxisCfg && xAxisCfg.scale;
            if (!scale || typeof scale.bandwidth !== "function") return null;
            const bandW = scale.bandwidth();
            return (
              <g>
                {chartData.map((entry, idx) => {
                  const xPos = scale(entry[xKey]);
                  if (typeof xPos !== "number" || isNaN(xPos)) return null;
                  const isSelected = selectedBars.some((b) => b.idx === idx);
                  const isHover = hoverBarIndex === idx && !isSelected;
                  return (
                    <g key={`col-hit-${idx}`}>
                      <rect
                        x={xPos}
                        y={offset.top}
                        width={bandW}
                        height={offset.height}
                        fill={(function () {
                          const base =
                            flowTab === "outflow"
                              ? "255,77,79"
                              : flowTab === "inflow"
                              ? "6,214,160"
                              : "91,127,255";
                          if (isSelected) return `rgba(${base},0.18)`;
                          if (isHover) return `rgba(${base},0.12)`;
                          return "transparent";
                        })()}
                        style={{
                          cursor: "pointer",
                          transition: "fill 100ms linear",
                        }}
                        onMouseEnter={() => setHoverBarIndex(idx)}
                        onMouseLeave={() => setHoverBarIndex(null)}
                        onClick={(e) => {
                          const multi = e && (e.ctrlKey || e.metaKey);
                          const rangeSel = e && e.shiftKey;
                          handleBarClick(entry, idx, multi, rangeSel);
                          e.stopPropagation();
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Friend switching helper
  const handleRouteChange = async (newFriendId) => {
    navigate(`/friends/expenses/${newFriendId}`);
  };

  const refreshData = async (newFriendId) => {
    const targetId = newFriendId || friendId;
    if (!targetId) return;
    await Promise.all([
      dispatch(fetchFriendship(targetId)),
      dispatch(fetchFriendsDetailed()),
      dispatch(
        fetchCashflowExpenses(
          activeRange,
          offset,
          flowTab === "all" ? null : flowTab,
          null,
          targetId
        )
      ),
    ]);
    setSelectedBar(null);
    setSelectedBars([]);
    setSelectedCardIdx([]);
  };

  return (
    <>
      {/* Friend info bar if in friend view */}
      {isFriendView && (
        <FriendInfoBar
          friendship={friendship}
          friendId={friendId}
          friends={friends || []}
          loading={loading}
          onRouteChange={handleRouteChange}
          refreshData={refreshData}
          showInfoBar={true}
        />
      )}
      {!isFriendView && (
        <div className={isMobile ? "h-[34px]" : "h-[50px]"}></div>
      )}
      <div
        className="bg-[#0b0b0b] p-4 rounded-lg mt-[0px]"
        style={{
          width: isMobile
            ? "100vw"
            : isTablet
            ? "100vw"
            : "calc(100vw - 370px)",
          height: isMobile ? "auto" : isTablet ? "auto" : "calc(100vh - 100px)",
          marginRight: isMobile ? 0 : isTablet ? 0 : "20px",
          borderRadius: isMobile ? 0 : isTablet ? "8px" : "8px",
          boxSizing: "border-box",
          position: "relative",
          padding: isMobile ? 8 : isTablet ? 12 : 16,
          minWidth: 0,
        }}
      >
        <ToastNotification
          open={toastOpen}
          message={toastMessage}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Adjusted position to top-center
          autoHideDuration={5000} // Set duration to 5 seconds
        />
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={isDeleting ? undefined : handleCancelDelete}
          title="Deletion Confirmation"
          data={expenseData}
          headerNames={headerNames}
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
          confirmationText={confirmationText}
          disableActions={isDeleting}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        {/* Flow Summary Pills (Money In / Money Out / In & Out) */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 10,
            alignItems: "center",
            zIndex: 5,
          }}
        >
          {/* Delete Selected Button (left of flow pills) - only visible if more than one selected */}
          {selectedCardIdx.length > 1 && (
            <button
              onClick={async () => {
                setIsDeleteModalOpen(true);
                setExpenseData({}); // <-- Set to empty object
                setExpenseToDelete(
                  selectedCardIdx.map(
                    (idx) =>
                      sortedCardData[idx].id || sortedCardData[idx].expenseId
                  )
                );
                setConfirmationText(
                  `Are you sure you want to delete ${selectedCardIdx.length} selected expenses?`
                );
              }}
              style={{
                minWidth: isMobile ? 80 : 140,
                minHeight: isMobile ? 32 : 38,
                width: isMobile ? 100 : 160,
                height: isMobile ? 32 : 38,
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 2px 8px #0002",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: isMobile ? 13 : 15,
                cursor: "pointer",
                transition: "background 0.2s",
                gap: 6,
              }}
              title={`Delete ${selectedCardIdx.length} selected`}
            >
              <svg
                width={isMobile ? 16 : 20}
                height={isMobile ? 16 : 20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              {!isMobile && (
                <span style={{ marginLeft: 4 }}>Delete Selected</span>
              )}
            </button>
          )}
          {/* Single compact flow button that cycles flowTab and shrinks briefly on click */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => {
                // trigger shrink animation
                setShrinkFlowBtn(true);
                setTimeout(() => setShrinkFlowBtn(false), 220);
                // cycle flow type
                const idx = flowTypeCycle.findIndex((t) => t.value === flowTab);
                const next = flowTypeCycle[(idx + 1) % flowTypeCycle.length];
                setFlowTab(next.value);
                setSelectedBar(null);
                setSelectedBars([]);
                setSelectedCardIdx([]);
              }}
              aria-pressed={false}
              className={`rounded-lg flex items-center gap-3 justify-center`}
              style={{
                minWidth: isMobile ? 48 : 110,
                height: isMobile ? 36 : 40,
                padding: "4px 8px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                transition:
                  "transform 200ms ease, width 200ms ease, background 300ms",
                transform: shrinkFlowBtn ? "scale(0.88)" : "scale(1)",
                background:
                  flowTab === "inflow"
                    ? "linear-gradient(180deg,#06D6A0,#05b890)"
                    : flowTab === "outflow"
                    ? "linear-gradient(180deg,#ff6b6b,#ff4d4f)"
                    : "linear-gradient(180deg,#5b7fff,#4563ff)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  {flowTab === "inflow" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 19V5"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 12l7-7 7 7"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {flowTab === "outflow" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 12l-7 7-7-7"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {flowTab === "all" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Combined up + down arrows icon */}
                      <path
                        d="M12 3v6"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 6l3-3 3 3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 21v-6"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 18l3 3 3-3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {!isMobile && (
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {flowTypeCycle.find((t) => t.value === flowTab)?.label}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.95 }}>
                      {flowTab === "inflow"
                        ? formatCurrencyCompact(totals.inflow)
                        : flowTab === "outflow"
                        ? formatCurrencyCompact(totals.outflow)
                        : formatCurrencyCompact(totals.total)}
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
          <style>{`
          .animate-morph-flow-toggle-rect {
            transition: background 0.5s, color 0.5s, box-shadow 0.5s, border-radius 0.5s, width 0.5s, height 0.5s;
            border-radius: 12px;
            will-change: border-radius, background, color, box-shadow, width, height;
            animation: morphInOutRect 0.5s cubic-bezier(0.4,0,0.2,1);
          }
          .animate-morph-flow-toggle-rect:active {
            transform: scale(0.97) rotate(-3deg);
          }
          .flow-icon-wrapper img {
            transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
            will-change: transform, opacity;
          }
          @keyframes morphInOutRect {
            0% { border-radius: 20%; box-shadow: 0 2px 8px #0002; }
            50% { border-radius: 18px; box-shadow: 0 4px 16px #0004; }
            100% { border-radius: 12px; box-shadow: 0 2px 8px #0002; }
          }
        `}</style>
        </div>
        {/* Enhanced Selection Summary Bar */}
        {selectionStats && selectionStats.count > 1 && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              // Shift 50px to the right from centered position
              transform: "translateX(calc(-50% + 50px))",
              zIndex: 7,
              maxWidth: isMobile ? "94%" : 840,
              width: "max-content",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 8,
                  background: "#1b1b1b",
                  backdropFilter: "blur(10px) saturate(140%)",
                  WebkitBackdropFilter: "blur(10px) saturate(140%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow:
                    "0 4px 18px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.6)",
                  borderRadius: 14,
                  padding: "10px 14px 10px 14px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative gradient shimmer */}
                {/* Removed decorative gradient overlays per solid background request */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingRight: summaryExpanded ? 8 : 0,
                  }}
                >
                  <button
                    onClick={() => setSummaryExpanded((e) => !e)}
                    aria-label={
                      summaryExpanded
                        ? "Collapse selection stats"
                        : "Expand selection stats"
                    }
                    style={{
                      background: "#1b1b1b",
                      border: "1px solid #303030",
                      color: "#00dac6",
                      width: 34,
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 16,
                      fontWeight: 600,
                      boxShadow:
                        "0 2px 6px -2px #0009, inset 0 0 0 1px rgba(255,255,255,0.03)",
                      transition: "all .35s cubic-bezier(.4,0,.2,1)",
                    }}
                    title={summaryExpanded ? "Hide stats" : "Show stats"}
                  >
                    {summaryExpanded ? "−" : "+"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                    paddingLeft: 4,
                    paddingRight: 4,
                    maxWidth: summaryExpanded
                      ? isMobile
                        ? "66vw"
                        : "600px"
                      : 0,
                    overflow: "hidden",
                    transition: "max-width .45s cubic-bezier(.4,0,.2,1)",
                  }}
                >
                  {summaryExpanded && (
                    <>
                      <SummaryPill
                        icon=""
                        label="Expenses"
                        value={selectedBars.length ? sortedCardData.length : 0}
                      />
                      <SummaryPill
                        icon="💰"
                        label="Total"
                        value={formatNumberFull(selectionStats.total)}
                      />
                      <SummaryPill
                        icon="📊"
                        label="Avg"
                        value={formatNumberFull(Math.trunc(selectionStats.avg))}
                      />
                      <SummaryPill
                        icon="⬇"
                        label="Min"
                        value={formatNumberFull(selectionStats.min)}
                      />
                      <SummaryPill
                        icon="⬆"
                        label="Max"
                        value={formatNumberFull(selectionStats.max)}
                      />
                    </>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: 4,
                  }}
                >
                  <button
                    onClick={clearSelection}
                    style={{
                      background: "#2a1313",
                      border: "1px solid #4b1d1d",
                      color: "#ff6b6b",
                      fontSize: 12,
                      padding: "8px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 600,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow:
                        "0 2px 6px -2px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)",
                      transition: "background .35s, transform .25s",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    title="Clear selection"
                  >
                    <span style={{ fontSize: 14 }}>✕</span>
                    <span style={{ letterSpacing: 0.5 }}>Clear</span>
                  </button>
                </div>
              </div>
              {/* Keyboard hint (appears when expanded)
              {summaryExpanded && (
                <div style={{ textAlign: 'center', fontSize: 10, color: '#8a8f95', fontWeight: 500, letterSpacing: 0.5 }}>
                  Ctrl / Cmd to toggle • Shift for range • Click Clear to reset
                </div>
              )} */}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-4">
          {isFriendView && (
            <Button
              variant="contained"
              onClick={() =>
                friendId && friendId !== "undefined"
                  ? navigate(`/friends`)
                  : navigate("/expenses")
              }
              sx={{
                backgroundColor: "#1b1b1b",
                borderRadius: "8px",
                color: "#00DAC6",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                px: 1.5,
                py: 0.75,
                textTransform: "none",
                fontSize: "0.8rem",
                "&:hover": { backgroundColor: "#28282a" },
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#00DAC6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </Button>
          )}
          {rangeTypes.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                if (activeRange === tab.value) {
                  setSelectedBar(null); // Reset bar selection if clicking the same tab
                  setSelectedBars([]);
                }
                setActiveRange(tab.value);
              }}
              className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
                activeRange === tab.value
                  ? "bg-[#00DAC6] text-black"
                  : "bg-[#29282b] text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handleBack}
            disabled={offset <= -52}
            className={`px-3 py-1 rounded text-lg flex items-center ${
              offset <= -52
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
            }`}
            aria-label="Previous"
          >
            &#8592;
          </button>
          <span className="text-white text-sm">{rangeLabel}</span>
          <button
            onClick={handleNext}
            disabled={offset >= 0}
            className={`px-3 py-1 rounded text-lg flex items-center ${
              offset >= 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
            }`}
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>
        {/* Decreased graph height and moved cards/search up */}
        <div
          className="w-full h-[220px] rounded-lg p-4 mb-4"
          style={{
            background: "#1b1b1b",
            paddingRight: isMobile ? 8 : isTablet ? 24 : 60,
            height: isMobile ? 120 : isTablet ? 160 : 220,
            minWidth: 0,
          }}
        >
          {loading && !search ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160} // Decreased height to avoid overlap
              animation="wave"
              sx={{ bgcolor: "#23243a", borderRadius: 2 }}
            />
          ) : chartData.length === 0 ? (
            <NoDataPlaceholder
              size={isMobile ? "md" : "lg"}
              fullWidth
              message="No data to display"
              subMessage="Try adjusting filters or date range"
            />
          ) : (
            renderBarChart()
          )}
        </div>
        {/* Search Bar */}
        <div
          className="flex items-center mt-2 mb-2"
          style={{
            width: "100%",
            justifyContent: "flex-start",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: isMobile ? 8 : 0,
          }}
        >
          <CashflowSearchToolbar
            search={search}
            setSearch={setSearch}
            onFilterClick={() => setPopoverOpen((v) => !v)}
            filterRef={filterBtnRef}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* Fixed position for these buttons */}

          {/* Navigation Section with Names and Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: isMobile ? 0 : "8px",
              flexShrink: 0,
              gap: isMobile ? "6px" : "8px",
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}
          >
            {[
              {
                // Use base path; friendId appended later to avoid duplicate /id/id
                path: "/category-flow",
                icon: "category.png",
                label: "Categories",
              },
              { path: "/transactions", icon: "history.png", label: "History" },
              { path: "/insights", icon: "insight.png", label: "Insights" },
              { path: "/reports", icon: "report.png", label: "Reports" },
              { path: "/cashflow", icon: "list.png", label: "Expenses" },
              { path: "/budget", icon: "budget.png", label: "Budget" },
              {
                path: "/payment-method",
                icon: "payment-method.png",
                label: "Payment Method",
              },
              {
                path: "/bill",
                icon: "bill.png",
                label: "Bill",
              },
              {
                path: "/calendar-view",
                icon: "calendar.png",
                label: "Calendar",
              },
            ].map(({ path, icon, label }) => (
              <button
                key={path}
                onClick={() => {
                  const target = isFriendView ? `${path}/${friendId}` : path;
                  navigate(target);
                }}
                className="nav-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "6px" : "6px",
                  padding: isMobile ? "6px 8px" : "8px 10px",
                  backgroundColor: "#1b1b1b",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#00DAC6",
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "fit-content",
                }}
              >
                <img
                  src={require(`../../assests/${icon}`)}
                  alt={label}
                  style={{
                    width: isMobile ? 16 : 18,
                    height: isMobile ? 16 : 18,
                    filter:
                      "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                    transition: "filter 0.2s ease",
                  }}
                />
                {!isMobile && <span>{label}</span>}
              </button>
            ))}
            {/* Add New - Simplified button */}
            <button
              ref={setAddNewBtnRef}
              onClick={() => setAddNewPopoverOpen(!addNewPopoverOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: isMobile ? "6px 8px" : "6px 8px",
                backgroundColor: "#1b1b1b",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "#00DAC6",
                fontSize: isMobile ? "11px" : "12px",
                fontWeight: "500",
                cursor: "pointer",
                minWidth: "fit-content",
              }}
            >
              <img
                src={require("../../assests/add.png")}
                alt="Add"
                style={{
                  width: isMobile ? 14 : 16,
                  height: isMobile ? 14 : 16,
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                  transition: "filter 0.2s ease",
                }}
              />
              {!isMobile && <span>Add New</span>}
            </button>

            {/* Simplified Add New Popover */}
            {addNewPopoverOpen &&
              addNewBtnRef &&
              createPortal(
                <div
                  data-popover="add-new"
                  style={{
                    position: "fixed",
                    top:
                      addNewBtnRef.getBoundingClientRect().bottom +
                      4 +
                      window.scrollY,
                    left:
                      addNewBtnRef.getBoundingClientRect().left +
                      window.scrollX,
                    zIndex: 1000,
                    background: "#0b0b0b",
                    border: "1px solid #333",
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    minWidth: 140,
                    padding: 4,
                  }}
                >
                  {[
                    {
                      label: "Add Expense",
                      route: isFriendView
                        ? `/expenses/create/${friendId}`
                        : "/expenses/create",
                      color: "#00DAC6",
                    },
                    {
                      label: "Upload File",
                      route: isFriendView ? `/upload/${friendId}` : "/upload",
                      color: "#5b7fff",
                    },
                    {
                      label: "Add Budget",
                      route: isFriendView
                        ? `/budget/create/${friendId}`
                        : "/budget/create",
                      color: "#FFC107",
                    },
                    {
                      label: "Add Category",
                      route: isFriendView
                        ? `/categories/create/${friendId}`
                        : "/category-flow/create",
                      color: "#ff6b6b",
                    },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      style={{
                        display: "block",
                        width: "100%",
                        background: "transparent",
                        color: item.color,
                        border: "none",
                        textAlign: "left",
                        padding: "8px 10px",
                        cursor: "pointer",
                        fontSize: "12px",
                        borderRadius: 4,
                      }}
                      onClick={() => {
                        navigate(item.route);
                        setAddNewPopoverOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = item.color;
                        e.target.style.color =
                          item.color === "#FFC107" ? "#000" : "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = item.color;
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>,
                document.body
              )}
          </div>

          <style jsx>{`
            .nav-button:hover {
              background-color: #00dac6 !important;
              color: #000 !important;
              border-color: #00dac6 !important;
            }
            .nav-button:hover img {
              filter: brightness(0) saturate(100%) invert(0%) !important;
            }
            .nav-button:hover svg circle,
            .nav-button:hover svg path {
              stroke: #000 !important;
            }
            .nav-button:hover span {
              color: #000 !important;
            }
            .nav-button:active {
              transform: scale(0.98);
            }
          `}</style>
        </div>
        {/* Sort Popover */}
        {popoverOpen &&
          filterBtnRef.current &&
          createPortal(
            <div
              id="sort-popover"
              style={{
                position: "fixed",
                top:
                  filterBtnRef.current.getBoundingClientRect().top +
                  window.scrollY,
                left:
                  filterBtnRef.current.getBoundingClientRect().right +
                  8 +
                  window.scrollX,
                zIndex: 1000,
                background: "#0b0b0b", // changed from #23243a to #0b0b0b
                border: "1px solid #333",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                minWidth: 140,
                maxWidth: 180,
                padding: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: 4,
                }}
              >
                {/* Recent First (moved to first option) */}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background:
                      sortType === "recent" ? "#5b7fff" : "transparent",
                    color: sortType === "recent" ? "#fff" : "#5b7fff",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: sortType === "recent" ? 700 : 500,
                    borderRadius: 6,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onClick={() => handleSort("recent")}
                >
                  <img
                    src={recentPng}
                    alt="Recent"
                    style={{
                      width: 18,
                      height: 18,
                      filter:
                        sortType === "recent"
                          ? "none"
                          : "grayscale(1) brightness(2)",
                      borderRadius: 3,
                      background: "transparent",
                      opacity: 1,
                      ...(sortType === "recent"
                        ? {
                            filter:
                              "invert(1) sepia(1) saturate(5) hue-rotate(200deg)",
                          }
                        : {
                            filter:
                              "invert(34%) sepia(99%) saturate(749%) hue-rotate(200deg) brightness(1.2)",
                          }),
                    }}
                  />
                  <span>Recent First</span>
                </button>
                {/* High to Low */}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background: sortType === "high" ? "#ff4d4f" : "transparent",
                    color: sortType === "high" ? "#fff" : "#ff4d4f",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: sortType === "high" ? 700 : 500,
                    borderRadius: 6,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onClick={() => handleSort("high")}
                >
                  <ArrowDownwardIcon
                    fontSize="small"
                    style={{ color: sortType === "high" ? "#fff" : "#ff4d4f" }}
                  />
                  <span>High to Low</span>
                </button>
                {/* Low to High */}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background: sortType === "low" ? "#06d6a0" : "transparent",
                    color: sortType === "low" ? "#23243a" : "#06d6a0",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: sortType === "low" ? 700 : 500,
                    borderRadius: 6,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onClick={() => handleSort("low")}
                >
                  <ArrowUpwardIcon
                    fontSize="small"
                    style={{
                      color: sortType === "low" ? "#23243a" : "#06d6a0",
                    }}
                  />
                  <span>Low to High</span>
                </button>
              </div>
            </div>,
            document.body
          )}
        {/* Expense Cards Section */}
        <div
          className={
            sortedCardData.length <= 3
              ? "flex items-start gap-4 flex-wrap custom-scrollbar"
              : "grid gap-4 custom-scrollbar"
          }
          style={
            sortedCardData.length <= 3
              ? {
                  maxHeight: isMobile ? 500 : isTablet ? 280 : 360,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: isMobile ? 6 : isTablet ? 8 : 16,
                  justifyContent: "flex-start",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 10 : 16,
                }
              : {
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(auto-fit, minmax(180px, 1fr))"
                    : "repeat(auto-fit, minmax(260px, 1fr))",
                  maxHeight: isMobile ? 420 : isTablet ? 280 : 360,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: isMobile ? 6 : isTablet ? 8 : 16,
                  gap: isMobile ? 10 : 16,
                }
          }
        >
          {loading && !search ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                width={340}
                height={140}
                animation="wave"
                sx={{ bgcolor: "#23243a", borderRadius: 2 }}
                style={{ minWidth: 220, maxWidth: 340, margin: "0 8px 16px 0" }}
              />
            ))
          ) : sortedCardData.length === 0 ? (
            <NoDataPlaceholder
              size={isMobile ? "lg" : "fill"}
              fullWidth
              iconSize={isMobile ? 54 : 72}
              style={{ minHeight: isMobile ? 260 : 340 }}
              message={search ? "No matches" : "No data found"}
              subMessage={
                search
                  ? "Try a different search term"
                  : "Adjust filters or change the period"
              }
            />
          ) : (
            sortedCardData.map((row, idx) => {
              const isSelected = selectedCardIdx.includes(idx);
              // Determine type for icon/color in 'all' mode
              let type;
              if (flowTab === "all") {
                type = row.type || row.expense?.type || "outflow";
              } else {
                type = flowTab;
              }
              // For 'all' mode, set color/icon per expense type
              let amountColor = "#06d6a0"; // default inflow
              let icon = (
                <span
                  style={{
                    color: "#06d6a0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginBottom: "-2px",
                    }}
                  >
                    <path
                      d="M8 14V2M8 2L3 7M8 2L13 7"
                      stroke="#06d6a0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              );
              let isGain = true;
              if (type === "outflow" || type === "loss") {
                amountColor = "#ff4d4f";
                isGain = false;
                icon = (
                  <span
                    style={{
                      color: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginBottom: "-2px",
                      }}
                    >
                      <path
                        d="M8 2V14M8 14L3 9M8 14L13 9"
                        stroke="#ff4d4f"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                );
              }
              return (
                <div
                  key={idx}
                  className={`bg-[#1b1b1b] rounded-lg shadow-md flex flex-col justify-between relative group transition-colors duration-200`}
                  style={{
                    minHeight: "140px",
                    maxHeight: "140px",
                    height: "140px",
                    minWidth: "220px",
                    maxWidth: "340px",
                    width: "100%",
                    padding: "18px 20px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: isSelected
                      ? isGain
                        ? "rgba(6, 214, 160, 0.13)"
                        : "rgba(255, 77, 79, 0.13)"
                      : "#1b1b1b",
                    transition: "background 0.2s, box-shadow 0.2s, border 0.2s",
                    margin: "6px",
                    border: isSelected
                      ? `2px solid ${isGain ? "#06d6a0" : "#ff4d4f"}`
                      : "2px solid transparent",
                    userSelect: "none", // Prevent text selection
                  }}
                  onMouseDown={(event) => event.preventDefault()} // Prevent text selection on mouse down
                  onClick={(event) => handleCardClick(idx, event)} // Pass event for ctrlKey/shiftKey support
                >
                  <div
                    className="flex flex-col gap-2"
                    style={{ height: "100%" }}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <span
                        className="font-semibold text-base truncate min-w-0 text-white"
                        title={row.name}
                        style={{ maxWidth: "70%", fontSize: "15px" }}
                        data-tooltip-id={`expense-name-tooltip-${idx}`}
                        data-tooltip-content={row.name}
                      >
                        {row.name}
                      </span>
                      <span
                        className="text-xs font-semibold text-[#b0b6c3] ml-2 flex-shrink-0"
                        style={{ whiteSpace: "nowrap" }}
                        title={(() => {
                          const dt = row.date || row.expense?.date;
                          const dtStr =
                            dt && dayjs(dt).isValid()
                              ? dayjs(dt).format("D MMM")
                              : "";
                          const left = ""; // show only D MMM across ranges on card
                          if (dtStr && left) return `${left} • ${dtStr}`;
                          return left || dtStr;
                        })()}
                        data-tooltip-id={`expense-date-tooltip-${idx}`}
                        data-tooltip-content={(() => {
                          const dt = row.date || row.expense?.date;
                          const dtStr =
                            dt && dayjs(dt).isValid()
                              ? dayjs(dt).format("D MMM")
                              : "";
                          const left = ""; // show only D MMM across ranges on card
                          if (dtStr && left) return `${left} • ${dtStr}`;
                          return left || dtStr;
                        })()}
                      >
                        {(() => {
                          const dt = row.date || row.expense?.date;
                          const dtStr =
                            dt && dayjs(dt).isValid()
                              ? dayjs(dt).format("D MMM")
                              : "";
                          const left = ""; // show only D MMM across ranges on card
                          if (dtStr && left) return `${left} • ${dtStr}`;
                          return left || dtStr;
                        })()}
                      </span>
                    </div>
                    <div className="text-base font-bold flex items-center gap-1">
                      {icon}
                      <span
                        style={{
                          color: amountColor,
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                        title={`Amount: ${formatNumberFull(row.amount)}`}
                        data-tooltip-id={`expense-amount-tooltip-${idx}`}
                        data-tooltip-content={`Amount: ${formatNumberFull(
                          row.amount
                        )}`}
                      >
                        {formatNumberFull(row.amount)}
                      </span>
                    </div>
                    <div
                      className="text-gray-300 text-sm break-words card-comments-clamp"
                      style={{
                        wordBreak: "break-word",
                        flex: 1,
                        overflow: "hidden",
                      }}
                      title={row.comments}
                      data-tooltip-id={`expense-comments-tooltip-${idx}`}
                      data-tooltip-content={row.comments}
                    >
                      {row.comments}
                    </div>
                  </div>
                  {isSelected && selectedCardIdx.length === 1 && (
                    <div
                      className="absolute bottom-2 right-2 flex gap-2 opacity-90"
                      style={{
                        zIndex: 2,
                        background: "#23243a",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px #0002",
                        padding: 4,
                        display: "flex",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          color: "#5b7fff",
                          p: "4px",
                          background: "#23243a",
                          borderRadius: 1,
                          boxShadow: 1,
                          "&:hover": {
                            background: "#2e335a",
                            color: "#fff",
                          },
                        }}
                        onClick={async () => {
                          dispatch(
                            getListOfBudgetsByExpenseId({
                              id: row.id || row.expenseId,
                              date: dayjs().format("YYYY-MM-DD"),
                            })
                          );
                          const expensedata = await dispatch(
                            getExpenseAction(row.id)
                          );
                          const bill = expensedata.bill
                            ? await dispatch(getBillByExpenseId(row.id))
                            : false;
                          if (expensedata.bill) {
                            navigate(
                              isFriendView
                                ? `/bill/edit/${bill.id}/friend/${friendId}`
                                : `/bill/edit/${bill.id}`
                            );
                          } else {
                            navigate(
                              isFriendView
                                ? `/expenses/edit/${row.id}/friend/${friendId}`
                                : `/expenses/edit/${row.id}`
                            );
                          }
                        }}
                        aria-label="Edit Expense"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#ff4d4f",
                          p: "4px",
                          background: "#23243a",
                          borderRadius: 1,
                          boxShadow: 1,
                          "&:hover": {
                            background: "#2e335a",
                            color: "#fff",
                          },
                        }}
                        onClick={() => handleDeleteClick(row, idx)}
                        aria-label="Delete Expense"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* End Expense Cards Section */}
        <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    background: #23243a;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${
      flowTab === "outflow"
        ? "#ff4d4f"
        : flowTab === "inflow"
        ? "#06d6a0"
        : "#5b7fff"
    };
    border-radius: 6px;
  }
  .card-comments-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    min-height: 0;
    max-height: 60px;
  }
`}</style>
      </div>
    </>
  );
};

export default Cashflow;
