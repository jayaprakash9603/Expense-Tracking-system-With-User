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
  getExpenseAction,
  deleteMultiExpenses,
} from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";
import { IconButton, Skeleton, useTheme, useMediaQuery } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RepeatIcon from "@mui/icons-material/Repeat";
import { createPortal } from "react-dom";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import recentPng from "../../assests/recent.png";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import { useNavigate, useLocation } from "react-router-dom";
import ToastNotification from "./ToastNotification";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "./Modal";
import moneyWithdrawalImg from "../../assests/money-withdrawal.png";
import saveMoneyImg from "../../assests/save-money.png";
import moneyInAndOutImg from "../../assests/money-in-and-out.png";
import { getListOfBudgetsByExpenseId } from "../../Redux/Budget/budget.action";
import { deleteBill, getBillByExpenseId } from "../../Redux/Bill/bill.action";

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

const Cashflow = () => {
  const [activeRange, setActiveRange] = useState("month"); // Default to month on mount
  const [offset, setOffset] = useState(0);
  const [flowTab, setFlowTab] = useState("all"); // Start with 'all'
  const [search, setSearch] = useState("");
  const [selectedBar, setSelectedBar] = useState(null); // For bar chart filtering
  const [selectedCardIdx, setSelectedCardIdx] = useState([]); // Change from null to an array
  const [lastSelectedIdx, setLastSelectedIdx] = useState(null); // For shift selection
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("recent");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});
  const dispatch = useDispatch();
  const { cashflowExpenses, loading } = useSelector((state) => state.expenses);
  const filterBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isFiltering, setIsFiltering] = useState(false);
  const [addNewPopoverOpen, setAddNewPopoverOpen] = useState(false);
  const [addNewBtnRef, setAddNewBtnRef] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
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
        categoryFilter
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
    setSelectedCardIdx([]);
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
          await dispatch(deleteMultiExpenses(expenseToDelete));
          dispatch(fetchCashflowExpenses(activeRange, offset, flowTab));
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
          dispatch(fetchCashflowExpenses(activeRange, offset, flowTab));
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
      <div className="h-[50px]"></div>
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
        {/* Single Flow Type Toggle Button at top right */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* Delete Selected Button (now left of flow toggle) - only visible if more than one selected */}
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
          <button
            onClick={handleFlowTabToggle}
            className={`rounded-lg flex items-center justify-center animate-morph-flow-toggle-rect ${
              flowTypeCycle.find((t) => t.value === flowTab)?.color ||
              "bg-[#29282b] text-white"
            }`}
            style={{
              minWidth: isMobile ? 40 : 70,
              minHeight: isMobile ? 32 : 38,
              width: isMobile ? 40 : 70,
              height: isMobile ? 32 : 38,
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
                  width: isMobile ? 24 : 36,
                  height: isMobile ? 24 : 36,
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

        <div className="flex gap-4 mb-4">
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

          {/* Navigation Section with Names and Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "8px",
              flexShrink: 0,
              gap: isMobile ? "4px" : "8px",
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}
          >
            {[
              {
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
                onClick={() => navigate(path)}
                className="nav-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: isMobile ? "6px 8px" : "8px 12px",
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
                padding: isMobile ? "4px 6px" : "6px 8px",
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
                      route: "/expenses/create",
                      color: "#00DAC6",
                    },
                    {
                      label: "Upload File",
                      route: "/upload",
                      color: "#5b7fff",
                    },
                    {
                      label: "Add Budget",
                      route: "/budget/create",
                      color: "#FFC107",
                    },
                    {
                      label: "Add Category",
                      route: "/category-flow/create",
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
                          expensedata.bill
                            ? navigate(`/bill/edit/${bill.id}`)
                            : navigate(`/expenses/edit/${row.id}`);
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
