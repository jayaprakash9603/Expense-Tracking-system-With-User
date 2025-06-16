import React, { useState, useEffect, useMemo, useRef } from "react";
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
} from "recharts";
import {
  fetchCashflowExpenses,
  deleteExpenseAction,
} from "../../Redux/Expenses/expense.action";

import dayjs from "dayjs";
import {
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  x,
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
import moneyWithdrawalImg from "../../assests/money-withdrawal.png";
import saveMoneyImg from "../../assests/save-money.png";
import moneyInAndOutImg from "../../assests/money-in-and-out.png";
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { fetchFriendsDetailed } from "../../Redux/Friends/friendsActions";
import { fetchFriendship } from "../../Redux/Friends/friends.action";
import FriendInfoBar from "./FriendInfoBar";

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

const getRangeLabel = (range, offset, flowType) => {
  const now = dayjs();
  let start, end, label;
  if (range === "week") {
    start = now.startOf("week").add(offset, "week");
    end = now.endOf("week").add(offset, "week");
    if (offset === 0) {
      label = `${flowType === "outflow" ? "Debited" : "Credited"} this week`;
    } else {
      label = `${
        flowType === "outflow" ? "Debited" : "Credited"
      } ${start.format("D MMM")} - ${end.format("D MMM, YYYY")}`;
    }
  } else if (range === "month") {
    start = now.startOf("month").add(offset, "month");
    end = now.endOf("month").add(offset, "month");
    if (offset === 0) {
      label = `${flowType === "outflow" ? "Debited" : "Credited"} this month`;
    } else {
      label = `${
        flowType === "outflow" ? "Debited" : "Credited"
      } ${start.format("D MMM")} - ${end.format("D MMM, YYYY")}`;
    }
  } else if (range === "year") {
    start = now.startOf("year").add(offset, "year");
    end = now.endOf("year").add(offset, "year");
    if (offset === 0) {
      label = `${flowType === "outflow" ? "Debited" : "Credited"} this year`;
    } else {
      label = `${
        flowType === "outflow" ? "Debited" : "Credited"
      } ${start.format("D MMM")} - ${end.format("D MMM, YYYY")}`;
    }
  }
  return label;
};

const CashflowSearchToolbar = ({
  search,
  setSearch,
  onFilterClick,
  filterRef,
  setIsFiltering,
}) => (
  <div
    style={{
      display: "flex",
      gap: 8,
      padding: 8,
      alignItems: "center",
      width: "100%",
      maxWidth: "320px",
    }}
  >
    <input
      type="text"
      placeholder="Search expenses..."
      value={search}
      onChange={(e) => {
        // Set filtering flag to true when user is typing
        setIsFiltering(true);
        setSearch(e.target.value);
        // Reset filtering flag after a short delay
        setTimeout(() => setIsFiltering(false), 300);
      }}
      style={{
        backgroundColor: "#1b1b1b",
        color: "#ffffff",
        borderRadius: 8,
        fontSize: "0.75rem",
        border: "1px solid #00dac6",
        padding: "8px 16px",
        width: "100%",
        outline: "none",
      }}
    />
    <IconButton
      sx={{ color: "#00dac6", flexShrink: 0 }}
      onClick={onFilterClick}
      ref={filterRef}
    >
      <FilterListIcon fontSize="small" />
    </IconButton>
  </div>
);

const flowTypeCycle = [
  { label: "Money In & Out", value: "all", color: "bg-[#5b7fff] text-white" },
  { label: "Money In", value: "inflow", color: "bg-[#06D6A0] text-black" },
  { label: "Money Out", value: "outflow", color: "bg-[#FF6B6B] text-white" },
];

const FriendsExpenses = () => {
  const [activeRange, setActiveRange] = useState("month"); // Default to month on mount
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all"); // Start with 'all'
  const [search, setSearch] = useState("");
  const [selectedBar, setSelectedBar] = useState(null); // For bar chart filtering
  const [selectedCardIdx, setSelectedCardIdx] = useState(null); // NEW: for card selection only
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  const dispatch = useDispatch();
  const { cashflowExpenses, loading } = useSelector((state) => state.expenses);
  const { friendship, friends } = useSelector((state) => state.friends);
  const filterBtnRef = useRef(null);
  const friendDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isFiltering, setIsFiltering] = useState(false);
  const { friendId } = useParams();
  const [showFriendInfo, setShowFriendInfo] = useState(true);

  // useEffect(() => {
  //   if (friendId) {
  //     dispatch(fetchFriendship(friendId));
  //   }
  // }, [dispatch, friendId]);

  // Fetch detailed friends list when component mounts
  useEffect(() => {
    dispatch(fetchFriendsDetailed());
  }, [dispatch]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        friendDropdownRef.current &&
        !friendDropdownRef.current.contains(event.target)
      ) {
        setShowFriendDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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

  // Replace the existing useEffect for fetching data with this one
  useEffect(() => {
    // Get the category filter from search term
    const categoryFilter = search.trim() || null;

    console.log("Fetching expenses with filters:", {
      range: activeRange,
      offset: offset,
      flowType: flowTab === "all" ? null : flowTab,
      categoryFilter: categoryFilter,
    });

    // Set filtering flag to true when making API call
    setIsFiltering(true);

    // Make the API call with proper parameters
    dispatch(
      fetchCashflowExpenses(
        activeRange,
        offset,
        flowTab === "all" ? null : flowTab,
        categoryFilter,
        friendId
      )
    ).finally(() => {
      // Reset filtering flag when API call completes
      setIsFiltering(false);
    });
  }, [activeRange, offset, flowTab, dispatch, search]);

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

  // Reset selectedBar when main view changes
  useEffect(() => {
    setSelectedBar(null);
    setSelectedCardIdx(null); // Deselect card when range or offset changes
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

  const rangeLabel = getRangeLabel(activeRange, offset, flowTab);

  // Adjust bar chart styles based on screen size
  const barChartStyles = {
    barWidth: isMobile ? 10 : isTablet ? 20 : 30, // Decrease bar width for small screens
    hideNumbers: isMobile, // Hide numbers on top of bars for mobile screens
    hideAxisLabels: isMobile, // Hide axis labels for small screens
  };

  // Aggregate data for graph and cards
  const { chartData, cardData } = useMemo(() => {
    if (!Array.isArray(cashflowExpenses) || cashflowExpenses.length === 0) {
      return { chartData: [], cardData: [] };
    }

    if (activeRange === "week") {
      // Group by day of week (Mon-Sun)
      const weekMap = {};
      weekDays.forEach(
        (d) => (weekMap[d] = { day: d, amount: 0, expenses: [] })
      );
      cashflowExpenses.forEach((item) => {
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
      cashflowExpenses.forEach((item) => {
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
      cashflowExpenses.forEach((item) => {
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
  }, [cashflowExpenses, activeRange, offset]);

  // Chart axis keys
  const xKey =
    activeRange === "week" ? "day" : activeRange === "month" ? "day" : "month";

  // Filter cardData by search and selectedBar
  const filteredCardData = useMemo(() => {
    let filtered = cardData;
    if (selectedBar) {
      // Filter by bar (day or month)
      if (activeRange === "week") {
        filtered = filtered.filter((row) => row.day === selectedBar.data.day);
      } else if (activeRange === "month") {
        filtered = filtered.filter((row) => row.day === selectedBar.data.day);
      } else if (activeRange === "year") {
        filtered = filtered.filter(
          (row) => row.month === selectedBar.data.month
        );
      }
    }
    if (!search) return filtered;
    const lower = search.toLowerCase();
    return filtered.filter(
      (row) =>
        row.name.toLowerCase().includes(lower) ||
        row.comments.toLowerCase().includes(lower) ||
        (row.amount + "").includes(lower)
    );
  }, [cardData, search, selectedBar, activeRange]);

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

  // Handler for bar click (filters cards)
  const handleBarClick = (data, idx) => {
    // Toggle selection: if already selected, deselect
    if (selectedBar && selectedBar.idx === idx) {
      setSelectedBar(null);
    } else {
      setSelectedBar({ data, idx });
    }
    setSelectedCardIdx(null);
  };

  // Handler for card click (just highlights, does not filter)
  const handleCardClick = (idx) => {
    setSelectedCardIdx(idx === selectedCardIdx ? null : idx);
  };

  // Cycle flowTab on button click
  const handleFlowTabToggle = () => {
    const idx = flowTypeCycle.findIndex((t) => t.value === flowTab);
    const next = flowTypeCycle[(idx + 1) % flowTypeCycle.length];
    setFlowTab(next.value);
    setSelectedBar(null);
    setSelectedCardIdx(null);
  };

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

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      dispatch(deleteExpenseAction(expenseToDelete, friendId))
        .then(() => {
          // Refresh cashflow data after delete
          dispatch(
            fetchCashflowExpenses(activeRange, offset, flowTab, "", friendId)
          );
          setToastMessage("Expense deleted successfully.");
          setToastOpen(true);
        })
        .catch(() => {
          setToastMessage("Error deleting expense. Please try again.");
          setToastOpen(true);
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
          setSelectedCardIdx(null);
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
    setExpenseData({});
  };

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer
      width="100%"
      height={isMobile ? "100%" : "100%"} // Ensure full width and height for small screens
    >
      <BarChart
        data={chartData}
        barWidth={barChartStyles.barWidth}
        hideNumbers={barChartStyles.hideNumbers}
        onBarClick={handleBarClick}
        margin={{ right: isMobile ? 0 : 40 }} // Remove right margin for small screens
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#33384e" />
        <XAxis
          dataKey={xKey}
          stroke="#b0b6c3"
          tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
          tickLine={false}
          axisLine={{ stroke: "#33384e" }}
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
          height={50}
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
                  value: "Amount (₹)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#b0b6c3",
                  fontWeight: 700,
                  fontSize: 14,
                  dy: 40, // Move the Y axis label further left to avoid overlap
                }
          }
          width={80} // Increase Y axis width for more space
        />
        <Tooltip
          cursor={{ fill: "#23243a22" }}
          contentStyle={{
            background: "#23243a",
            border: "1px solid #00dac6",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 500,
          }}
          labelStyle={{ color: "#00dac6", fontWeight: 700 }}
          itemStyle={{ color: "#b0b6c3" }}
          formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
        />
        <Bar
          dataKey="amount"
          fill="#5b7fff"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        >
          {chartData.map((entry, idx) => (
            <Cell
              key={idx}
              fill={
                selectedBar && selectedBar.idx === idx
                  ? flowTab === "outflow"
                    ? "#ff4d4f"
                    : "#06d6a0"
                  : "#5b7fff"
              }
              cursor={chartData.length > 0 ? "pointer" : "default"}
              onClick={
                chartData.length > 0
                  ? () => handleBarClick(entry, idx)
                  : undefined
              }
            />
          ))}
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
                    {value.toFixed(0)}
                  </text>
                );
              }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <FriendInfoBar
        friendship={friendship}
        friendId={friendId}
        friends={friends || []}
        loading={loading}
        onFriendChange={(newFriendId) => {
          navigate(`/friends/expenses/${newFriendId}`);
        }}
      />

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
          padding: isMobile ? 4 : isTablet ? 8 : 16,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <div className="flex  flex-start gap-4">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1b1b1b",
                borderRadius: "8px",
                color: "#00DAC6",
                display: "flex",
                alignItems: "center",
                gap: "8px", // Adds spacing between the icon and text
                padding: "8px 8px", // Adjusts padding for better appearance
                "&:hover": {
                  backgroundColor: "#28282a",
                },
              }}
              onClick={() =>
                friendId && friendId !== "undefined"
                  ? navigate(`/friends`)
                  : navigate("/expenses")
              }
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
            {rangeTypes.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  if (activeRange === tab.value) {
                    setSelectedBar(null); // Reset bar selection if clicking the same tab
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
        </Box>
        <ToastNotification
          open={toastOpen}
          message={toastMessage}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Adjusted position to top-center
          autoHideDuration={5000} // Set duration to 5 seconds
        />
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Deletion Confirmation"
          data={expenseData}
          headerNames={headerNames}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
        />
        {/* Single Flow Type Toggle Button at top right */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={handleFlowTabToggle}
            className={`rounded-lg flex items-center justify-center animate-morph-flow-toggle-rect ${
              flowTypeCycle.find((t) => t.value === flowTab)?.color ||
              "bg-[#29282b] text-white"
            }`}
            style={{
              minWidth: isMobile ? 40 : 70, // Decreased size for small screens
              minHeight: isMobile ? 32 : 38, // Decreased size for small screens
              width: isMobile ? 40 : 70, // Decreased size for small screens
              height: isMobile ? 32 : 38, // Decreased size for small screens
              padding: 0,
              border: "none",
              outline: "none",
              boxShadow: "0 2px 8px #0002",
              position: "relative",
              transition: "background 0.5s, color 0.5s, box-shadow 0.5s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {/* Unfold icon in front of the animated flow type icon */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <img
                src={require("../../assests/unfold.png")}
                alt="Unfold"
                style={{
                  width: isMobile ? 20 : 25,
                  height: isMobile ? 25 : 25,
                  marginRight: isMobile ? 4 : 8,
                  verticalAlign: "middle",
                }}
              />
              <span
                className="flow-icon-wrapper"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignItems: isMobile ? "center" : "flex-start",
                  width: isMobile ? 24 : 36, // Decrease size for small screens
                  height: isMobile ? 24 : 36, // Decrease size for small screens
                  transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {isMobile
                  ? null
                  : flowTab === "outflow" && (
                      <img
                        src={moneyWithdrawalImg}
                        alt="Money Out"
                        style={{
                          width: isMobile ? 18 : 32,
                          height: isMobile ? 18 : 32,
                          transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    )}
                {isMobile
                  ? null
                  : flowTab === "inflow" && (
                      <img
                        src={saveMoneyImg}
                        alt="Money In"
                        style={{
                          width: isMobile ? 18 : 32,
                          height: isMobile ? 18 : 32,
                          transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    )}
                {isMobile
                  ? null
                  : flowTab === "all" && (
                      <img
                        src={moneyInAndOutImg}
                        alt="Money In & Out"
                        style={{
                          width: isMobile ? 18 : 32,
                          height: isMobile ? 18 : 32,
                          transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    )}
              </span>
            </span>
          </button>
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
          {loading && !isFiltering ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160} // Decreased height to avoid overlap
              animation="wave"
              sx={{ bgcolor: "#23243a", borderRadius: 2 }}
            />
          ) : chartData.length === 0 ? (
            <div
              style={{
                width: "100%",
                height: isMobile ? "80px" : "150px", // Adjust height for small screens
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1b1b1b",
                borderRadius: 8,
                border: "1px solid #23243a",
                position: "relative",
                minWidth: 0,
                boxSizing: "border-box",
                padding: isMobile ? "5px" : "16px", // Add padding for small screens
              }}
            >
              <span
                style={{
                  color: "#5b7fff",
                  fontWeight: 600,
                  fontSize: isMobile ? "14px" : "18px", // Adjust font size for small screens
                  width: "100%",
                  textAlign: "center",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                No data to display
              </span>
            </div>
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
            flexWrap: "nowrap", // Prevent wrapping
          }}
        >
          <CashflowSearchToolbar
            search={search}
            setSearch={setSearch}
            onFilterClick={() => setPopoverOpen((v) => !v)}
            filterRef={filterBtnRef}
            setIsFiltering={setIsFiltering}
          />

          {/* Fixed position for these buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "8px",
              flexShrink: 0, // Prevent shrinking
            }}
          >
            {/* Categories Icon Button */}
            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/category-flow/${friendId}`)}
              aria-label="Categories"
            >
              <img
                src={require("../../assests/category.png")}
                alt="Categories"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>

            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/transactions/${friendId}`)}
              aria-label="Transactions"
            >
              <img
                src={require("../../assests/history.png")}
                alt="Transactions"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>

            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/insights/${friendId}`)}
              aria-label="Insights"
            >
              <img
                src={require("../../assests/insight.png")}
                alt="Insights"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>

            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/reports/${friendId}`)}
              aria-label="Reports"
            >
              <img
                src={require("../../assests/report.png")}
                alt="Reports"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>

            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/cashflow/${friendId}`)}
              aria-label="All Expenses"
            >
              <img
                src={require("../../assests/list.png")}
                alt="All Expenses"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>

            <IconButton
              sx={{ p: 0.5, color: "#00DAC6" }}
              onClick={() => navigate(`/budget/${friendId}`)}
              aria-label="All Budgets"
            >
              <img
                src={require("../../assests/budget.png")}
                alt="All Budgets"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>
            <IconButton
              sx={{ p: 0.5 }}
              onClick={() => navigate(`/calendar-view/${friendId}`)}
              aria-label="Calendar View"
            >
              <img
                src={require("../../assests/calendar.png")}
                alt="Calendar View"
                style={{
                  width: 24,
                  height: 24,
                  display: "block",
                  filter:
                    "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                }}
              />
            </IconButton>
            <IconButton
              sx={{ color: "#5b7fff", ml: 1 }}
              onClick={() => navigate(`/expenses/create/${friendId}`)}
              aria-label="New Expense"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  fill="#23243a"
                />
                <path
                  d="M12 8V16"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12H16"
                  stroke="#5b7fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
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
                  maxHeight: isMobile ? 220 : isTablet ? 280 : 360,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
                  justifyContent: "flex-start",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 8 : 16,
                }
              : {
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(auto-fit, minmax(180px, 1fr))"
                    : "repeat(auto-fit, minmax(260px, 1fr))",
                  maxHeight: isMobile ? 220 : isTablet ? 280 : 360,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
                  gap: isMobile ? 8 : 16,
                }
          }
        >
          {loading && !isFiltering ? (
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
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="col-span-full text-center text-gray-400 py-4">
                No data found
              </div>
            </div>
          ) : (
            sortedCardData.map((row, idx) => {
              const isSelected = selectedCardIdx === idx;
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
                  }}
                  onClick={() => handleCardClick(idx)} // Only select card, do not filter
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
                        title={
                          activeRange === "week"
                            ? row.day
                            : activeRange === "month"
                            ? `Day ${row.day}`
                            : row.month
                        }
                        data-tooltip-id={`expense-date-tooltip-${idx}`}
                        data-tooltip-content={
                          activeRange === "week"
                            ? row.day
                            : activeRange === "month"
                            ? `Day ${row.day}`
                            : row.month
                        }
                      >
                        {activeRange === "week"
                          ? row.day
                          : activeRange === "month"
                          ? `Day ${row.day}`
                          : row.month}
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
                        title={`Amount: ₹${row.amount.toFixed(2)}`}
                        data-tooltip-id={`expense-amount-tooltip-${idx}`}
                        data-tooltip-content={`Amount: ₹${row.amount.toFixed(
                          2
                        )}`}
                      >
                        ₹{row.amount.toFixed(2)}
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
                  {isSelected && (
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
                        // onClick={async () => {
                        //   const result = await navigate(
                        //     `/expenses/edit/${row.id || row.expenseId}`
                        //   );
                        //   if (result && result.success) {
                        //     setToastMessage("Expense edited successfully");
                        //     setToastOpen(true);
                        //   }
                        // }}
                        onClick={() => {
                          dispatch(
                            getListOfBudgetsByExpenseId({
                              id: row.id || row.expenseId,
                              date: dayjs().format("YYYY-MM-DD"),
                            })
                          );
                          navigate(
                            `/expenses/edit/${
                              row.id || row.expenseId
                            }/friend/${friendId} `
                          );
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
  
  /* Friend dropdown animation */
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
      </div>
    </>
  );
};

export default FriendsExpenses;
