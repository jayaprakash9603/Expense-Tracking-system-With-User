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
} from "recharts";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import dayjs from "dayjs";
import { IconButton, Skeleton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RepeatIcon from "@mui/icons-material/Repeat";
import { createPortal } from "react-dom";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import recentPng from "../../assests/recent.png";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import { useNavigate } from "react-router-dom";

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
}) => (
  <div style={{ display: "flex", gap: 8, padding: 8 }}>
    <input
      type="text"
      placeholder="Search expenses..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        backgroundColor: "#1b1b1b",
        color: "#ffffff",
        borderRadius: 8,
        fontSize: "0.75rem",
        border: "1px solid #00dac6",
        padding: "8px 16px",
        minWidth: 220,
        maxWidth: 320,
        width: "100%",
        outline: "none",
      }}
    />
    <IconButton
      sx={{ color: "#00dac6" }}
      onClick={onFilterClick}
      ref={filterRef}
    >
      <FilterListIcon fontSize="small" />
    </IconButton>
  </div>
);

const Cashflow = () => {
  const [activeRange, setActiveRange] = useState("week"); // Default to month on mount
  const [offset, setOffset] = useState(0);
  const [flowType, setFlowType] = useState("outflow");
  const [search, setSearch] = useState("");
  const [selectedBar, setSelectedBar] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sortType, setSortType] = useState("recent");
  const dispatch = useDispatch();
  const { cashflowExpenses, loading } = useSelector((state) => state.expenses);
  const filterBtnRef = useRef(null);
  const navigate = useNavigate();

  // Fetch data from API with correct flowType ("outflow" or "inflow")
  useEffect(() => {
    dispatch(fetchCashflowExpenses(activeRange, offset, flowType));
  }, [activeRange, offset, flowType, dispatch]);

  useEffect(() => {
    setOffset(0);
  }, [activeRange]);

  // Reset selectedBar when main view changes
  useEffect(() => {
    setSelectedBar(null);
  }, [activeRange, offset, flowType]);

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
  const toggleFlowType = () => {
    setFlowType((prev) => {
      const newType = prev === "outflow" ? "inflow" : "outflow";
      // After updating flowType, immediately fetch with the new value and current selections
      dispatch(fetchCashflowExpenses(activeRange, offset, newType));
      return newType;
    });
  };

  const handleSort = (type) => {
    setSortType(type);
    setPopoverOpen(false);
  };

  const rangeLabel = getRangeLabel(activeRange, offset, flowType);

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

  // Handler for bar click
  const handleBarClick = (data, idx) => {
    // Toggle selection: if already selected, deselect
    if (selectedBar && selectedBar.idx === idx) {
      setSelectedBar(null);
    } else {
      setSelectedBar({ data, idx });
    }
  };

  return (
    <div
      className="bg-[#0b0b0b] p-4 rounded-lg mt-[50px]"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        marginRight: "20px",
        borderRadius: "8px",
        // border: "1px solid #000",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Money In/Out Toggle Button */}
      <button
        onClick={toggleFlowType}
        className={`absolute top-4 right-4 px-4 py-2 rounded font-semibold flex items-center gap-2 ${
          flowType === "outflow"
            ? "bg-[#FF6B6B] text-white"
            : "bg-[#06D6A0] text-black"
        }`}
        style={{ minWidth: 150, maxWidth: 180 }}
      >
        <RepeatIcon fontSize="small" />
        {flowType === "outflow" ? "Money Out" : "Money In"}
      </button>

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
            className={`px-4 py-2 rounded font-semibold ${
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
        style={{ background: "#1b1b1b", paddingRight: 60 }} // Added right padding for label visibility
      >
        {loading ? (
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
              height: 150, // Decreased height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1b1b1b",
              borderRadius: 8,
              border: "1px solid #23243a",
              position: "relative",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                color: "#5b7fff",
                fontWeight: 600,
                fontSize: 18,
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ right: 40 }}>
              {" "}
              {/* Add right margin for label */}
              <CartesianGrid strokeDasharray="3 3" stroke="#33384e" />
              <XAxis
                dataKey={xKey}
                stroke="#b0b6c3"
                tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: "#33384e" }}
                label={{
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
                }}
              />
              <YAxis
                stroke="#b0b6c3"
                tick={{ fill: "#b0b6c3", fontWeight: 600, fontSize: 13 }}
                axisLine={{ stroke: "#33384e" }}
                tickLine={false}
                label={{
                  value: "Amount (₹)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#b0b6c3",
                  fontWeight: 700,
                  fontSize: 14,
                }}
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
              {/* Average Line and Label at Top Right */}
              {chartData.length > 0 &&
                (() => {
                  // Determine if current period (offset === 0)
                  let isCurrent = offset === 0;
                  let validData;
                  if (isCurrent) {
                    // For current period, only consider up to today/this week/this month
                    if (activeRange === "year") {
                      // Only months up to current month (May = 5, so index 0-4)
                      const currentMonth = dayjs().month();
                      validData = chartData
                        .slice(0, currentMonth + 1)
                        .filter((d) => d.amount > 0);
                      if (validData.length === 0)
                        validData = chartData.slice(0, currentMonth + 1);
                    } else if (activeRange === "month") {
                      // Only days up to today
                      const currentDay = dayjs().date();
                      validData = chartData
                        .slice(0, currentDay)
                        .filter((d) => d.amount > 0);
                      if (validData.length === 0)
                        validData = chartData.slice(0, currentDay);
                    } else if (activeRange === "week") {
                      // Only days up to today in week (Mon-Sun)
                      const currentDayIdx = (dayjs().day() + 6) % 7; // Monday=0
                      validData = chartData
                        .slice(0, currentDayIdx + 1)
                        .filter((d) => d.amount > 0);
                      if (validData.length === 0)
                        validData = chartData.slice(0, currentDayIdx + 1);
                    } else {
                      validData = chartData;
                    }
                  } else {
                    // For past periods, use all bars
                    validData = chartData;
                  }
                  const avg =
                    validData.length > 0
                      ? validData.reduce((sum, d) => sum + d.amount, 0) /
                        validData.length
                      : 0;
                  return (
                    <>
                      <ReferenceLine
                        y={avg}
                        stroke="#FFD600"
                        strokeDasharray="6 4"
                        ifOverflow="extendDomain"
                      >
                        <Label
                          value="Avg"
                          position="right"
                          fontSize={13}
                          fontWeight={700}
                          fill="#FFD600"
                          dx={2}
                          dy={-15}
                        />
                        <Label
                          value={
                            avg >= 1e6
                              ? (avg / 1e6).toFixed(1).replace(/\.0$/, "") + "m"
                              : avg >= 1e3
                              ? (avg / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
                              : avg.toFixed(0)
                          }
                          position="right"
                          fontSize={13}
                          fontWeight={700}
                          fill="#FFD600"
                          dx={2}
                          dy={5} // Increased dy for more space between "Avg" and value
                        />
                      </ReferenceLine>
                    </>
                  );
                })()}
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
                        ? flowType === "outflow"
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
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Search Bar */}
      <div className="flex justify-start mt-2 mb-2">
        <CashflowSearchToolbar
          search={search}
          setSearch={setSearch}
          onFilterClick={() => setPopoverOpen((v) => !v)}
          filterRef={filterBtnRef}
        />
        <IconButton
          sx={{ color: "#00dac6", ml: 1 }}
          onClick={() => navigate("/calendar-view")}
          aria-label="Calendar View"
        >
          <CalendarViewMonthIcon />
        </IconButton>
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
                  background: sortType === "recent" ? "#5b7fff" : "transparent",
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
                  style={{ color: sortType === "low" ? "#23243a" : "#06d6a0" }}
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
                maxHeight: "360px",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 16,
                justifyContent: "flex-start",
              }
            : {
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                maxHeight: "360px",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 16,
              }
        }
      >
        {loading ? (
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
          sortedCardData.map((row, idx) => (
            <div
              key={idx}
              className="bg-[#1b1b1b] rounded-lg shadow-md flex flex-col justify-between"
              style={{
                minHeight: "120px",
                maxHeight: "180px",
                minWidth: "220px",
                maxWidth: "340px",
                width: "100%",
                padding: "18px 20px",
                // border: "1px solid #dee2e6", // removed card border
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between min-w-0">
                  <span
                    className="font-semibold text-lg truncate min-w-0 text-white"
                    title={row.name}
                    style={{ maxWidth: "70%" }}
                  >
                    {row.name}
                  </span>
                  <span
                    className="text-xs font-semibold text-[#b0b6c3] ml-2 flex-shrink-0"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {activeRange === "week"
                      ? row.day
                      : activeRange === "month"
                      ? `Day ${row.day}`
                      : row.month}
                  </span>
                </div>
                <div className="text-base font-bold flex items-center gap-1">
                  {flowType === "outflow" ? (
                    <span
                      style={{
                        color: "#ff4d4f",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="16" // decreased from 20 to 16 for smaller icon
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
                  ) : (
                    <span
                      style={{
                        color: "#06d6a0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="16" // decreased from 20 to 16 for smaller icon
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
                  )}
                  <span
                    style={{
                      color: flowType === "outflow" ? "#ff4d4f" : "#06d6a0",
                      fontSize: "16px", // decreased from 20px to 16px
                      fontWeight: 700,
                    }}
                  >
                    ₹{row.amount.toFixed(2)}
                  </span>
                </div>
                <div
                  className="text-gray-300 text-sm break-words"
                  style={{ wordBreak: "break-word" }}
                >
                  {row.comments}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* End Expense Cards Section */}
      <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    background: #23243a;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${flowType === "outflow" ? "#ff4d4f" : "#06d6a0"};
    border-radius: 6px;
  }
`}</style>
    </div>
  );
};

export default Cashflow;
