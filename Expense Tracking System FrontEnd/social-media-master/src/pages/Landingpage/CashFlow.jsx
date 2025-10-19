import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
// Recharts usage moved entirely into CashFlowChart component
import CashFlowChart from "../../components/CashFlowChart";
import {
  fetchCashflowExpenses,
  deleteExpenseAction,
  getExpenseAction,
  deleteMultiExpenses,
} from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";
import useFriendAccess from "../../hooks/useFriendAccess";
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
import ToastNotification from "./ToastNotification"; // kept for other potential usages
import DeletionConfirmationWithToast from "../../components/common/DeletionConfirmationWithToast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "./Modal";
// removed image imports for flow icons to use inline SVGs for cleaner, scalable UI
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { deleteBill, getBillByExpenseId } from "../../Redux/Bill/bill.action";
import {
  rangeTypes,
  flowTypeCycleDefault as flowTypeCycle,
  weekDays,
  monthDays,
  yearMonths,
  getRangeLabel,
} from "../../utils/flowDateUtils";
import RangePeriodNavigator from "../../components/common/RangePeriodNavigator";
import NoDataPlaceholder from "../../components/NoDataPlaceholder";
import CashFlowExpenseCards from "../../components/cashflow/CashFlowExpenseCards";
import QuickNavBar from "../../components/cashflow/QuickNavBar";
import SummaryPill from "../../components/cashflow/SummaryPill";
import SearchToolbar from "../../components/common/SearchToolbar";
// Friend related imports
import FriendInfoBar from "./FriendInfoBar";
import {
  fetchFriendship,
  fetchFriendsDetailed,
} from "../../Redux/Friends/friendsActions";
import { canWrite } from "../../utils/accessControl";
import SortPopover from "../../components/cashflow/SortPopover";
import NavigationActions from "../../components/cashflow/NavigationActions";
import SearchNavigationBar from "../../components/cashflow/SearchNavigationBar";

// Main component
const Cashflow = () => {
  const [activeRange, setActiveRange] = useState("month");
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedBars, setSelectedBars] = useState([]);
  const [lastBarSelectedIdx, setLastBarSelectedIdx] = useState(null);
  const [hoverBarIndex, setHoverBarIndex] = useState(null);
  const [selectedCardIdx, setSelectedCardIdx] = useState([]);
  const [lastSelectedIdx, setLastSelectedIdx] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
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
  const currentUserId = useSelector(
    (s) => s.auth?.user?.id || s.auth?.userId || null
  );
  const { hasWriteAccess } = useFriendAccess(friendId);
  const formatCompactNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + "M";
    if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "k";
    return value % 1 === 0
      ? `${sign}${Math.round(abs)}`
      : `${sign}${abs.toFixed(2)}`;
  };
  const formatCurrencyCompact = (value) => formatCompactNumber(value);
  const formatNumberFull = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };
  const [addNewPopoverOpen, setAddNewPopoverOpen] = useState(false);
  const [addNewBtnRef, setAddNewBtnRef] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [shrinkFlowBtn, setShrinkFlowBtn] = useState(false);

  useEffect(() => {
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

  const rangeLabel = getRangeLabel(activeRange, offset, "cashflow");

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
          const expensedata = await dispatch(
            getExpenseAction(expenseToDelete, friendId || "")
          );
          const bill = expensedata.bill
            ? await dispatch(
                getBillByExpenseId(expenseToDelete, friendId || "")
              )
            : false;
          await dispatch(
            bill
              ? deleteBill(bill.id, friendId || "")
              : deleteExpenseAction(expenseToDelete, friendId || "")
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

  return (
    <>
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
        <DeletionConfirmationWithToast
          toastOpen={toastOpen}
          toastMessage={toastMessage}
          onToastClose={handleToastClose}
          isDeleteModalOpen={isDeleteModalOpen}
          isDeleting={isDeleting}
          expenseData={expenseData}
          headerNames={headerNames}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
          confirmationText={confirmationText}
        />
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
          {selectedCardIdx.length > 1 && hasWriteAccess && (
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
              title={
                hasWriteAccess
                  ? `Delete ${selectedCardIdx.length} selected`
                  : "Read only"
              }
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

        <RangePeriodNavigator
          isFriendView={isFriendView}
          friendId={friendId}
          navigate={navigate}
          rangeTypes={rangeTypes}
          activeRange={activeRange}
          setActiveRange={setActiveRange}
          offset={offset}
          handleBack={handleBack}
          handleNext={handleNext}
          rangeLabel={rangeLabel}
          onResetSelection={() => {
            setSelectedBar(null);
            setSelectedBars([]);
          }}
          disablePrevAt={-52}
          disableNextAt={0}
          isMobile={isMobile}
        />
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
            <CashFlowChart
              chartData={chartData}
              xKey={xKey}
              barChartStyles={barChartStyles}
              isMobile={isMobile}
              isTablet={isTablet}
              selectedBars={selectedBars}
              hoverBarIndex={hoverBarIndex}
              setHoverBarIndex={setHoverBarIndex}
              handleBarClick={handleBarClick}
              flowTab={flowTab}
              activeRange={activeRange}
              offset={offset}
              formatCompactNumber={formatCompactNumber}
              formatCurrencyCompact={formatCurrencyCompact}
              formatNumberFull={formatNumberFull}
              yearMonths={yearMonths}
              weekDays={weekDays}
            />
          )}
        </div>
        {/* Search Bar */}
        <SearchNavigationBar
          search={search}
          setSearch={setSearch}
          onFilterToggle={() => setPopoverOpen((v) => !v)}
          filterRef={filterBtnRef}
          isMobile={isMobile}
          isTablet={isTablet}
          navItems={[
            {
              path: "/category-flow",
              icon: "category.png",
              label: "Categories",
            },
            { path: "/budget", icon: "budget.png", label: "Budget" },
            {
              path: "/payment-method",
              icon: "payment-method.png",
              label: "Payment Method",
            },
            { path: "/bill", icon: "bill.png", label: "Bill" },
            { path: "/calendar-view", icon: "calendar.png", label: "Calendar" },
          ]}
          friendId={friendId}
          isFriendView={isFriendView}
          hasWriteAccess={hasWriteAccess}
          navigate={navigate}
          addNewOptions={[
            {
              label: "Add Expense",
              route: isFriendView
                ? `/expenses/create/${friendId}`
                : "/expenses/create",
              color: "#00DAC6",
            },
            {
              label: "Upload File",
              route: isFriendView
                ? `/upload/expenses/${friendId}`
                : "/upload/expenses",
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
                ? `/category-flow/create/${friendId}`
                : "/category-flow/create",
              color: "#ff6b6b",
            },
          ]}
          placeholder="Search expenses..."
        />
        {/* Sort Popover (refactored) */}
        <SortPopover
          open={popoverOpen}
          anchorRect={filterBtnRef.current?.getBoundingClientRect() || null}
          sortType={sortType}
          onSelect={(type) => handleSort(type)}
          recentIcon={recentPng}
        />
        {/* Expense Cards Section (refactored) */}
        <CashFlowExpenseCards
          data={sortedCardData}
          loading={loading}
          search={search}
          selectedCardIdx={selectedCardIdx}
          flowTab={flowTab}
          isMobile={isMobile}
          isTablet={isTablet}
          handleCardClick={handleCardClick}
          hasWriteAccess={hasWriteAccess}
          formatNumberFull={formatNumberFull}
          dispatch={dispatch}
          navigate={navigate}
          friendId={friendId}
          isFriendView={isFriendView}
          handleDeleteClick={handleDeleteClick}
          getListOfBudgetsByExpenseId={getListOfBudgetsByExpenseId}
          getExpenseAction={getExpenseAction}
          getBillByExpenseId={getBillByExpenseId}
        />
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
