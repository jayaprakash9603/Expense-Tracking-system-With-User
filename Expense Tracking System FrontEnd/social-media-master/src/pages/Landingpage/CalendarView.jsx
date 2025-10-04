import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Typography,
  Grid,
  Box,
  useTheme,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Helper to get the salary date for a given year and month
function getSalaryDate(year, month) {
  // month: 0-based (0=Jan, 11=Dec)
  let lastDay = dayjs(`${year}-${month + 1}-01`).endOf("month");
  let dayOfWeek = lastDay.day(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (dayOfWeek === 6) {
    // Saturday
    return lastDay.subtract(1, "day"); // Friday
  } else if (dayOfWeek === 0) {
    // Sunday
    return lastDay.subtract(2, "day"); // Friday
  } else {
    return lastDay;
  }
}

// Helper to get all days in a month
function getDaysArray(year, month) {
  const numDays = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

// Helper to format numbers as K, M, B, etc.
function formatAmount(num) {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum >= 1e12)
    return (
      (num / 1e12).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "T"
    ); // Trillion
  if (absNum >= 1e9)
    return (
      (num / 1e9).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "B"
    ); // Billion
  if (absNum >= 1e6)
    return (
      (num / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "M"
    ); // Million
  if (absNum >= 1e3)
    return (
      (num / 1e3).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "K"
    ); // Thousand
  return num.toLocaleString();
}

const CalendarView = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [monthOffset, setMonthOffset] = useState(0);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { friendId } = useParams();

  // Fetch cashflow expenses for the selected month
  React.useEffect(() => {
    dispatch(
      fetchCashflowExpenses("month", monthOffset, "", "", friendId || "")
    );
  }, [dispatch, monthOffset, friendId]);

  // Group expenses by day and calculate profit/gain
  const daysData = useMemo(() => {
    const map = {};
    if (!Array.isArray(cashflowExpenses)) return map;
    cashflowExpenses.forEach((item) => {
      const date = dayjs(item.date || item.expense?.date);
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = { profit: 0, gain: 0 };
      const type = item.type || item.expense?.type;
      const amt = item.amount ?? item.expense?.amount ?? 0;
      if (type === "loss") map[key].profit += amt;
      if (type === "gain") map[key].gain += amt;
    });
    return map;
  }, [cashflowExpenses]);

  // Calculate monthly summary
  const { totalGains, totalLosses } = useMemo(() => {
    let gains = 0,
      losses = 0;
    Object.entries(daysData).forEach(([key, items]) => {
      if (dayjs(key).isSame(selectedDate, "month")) {
        if (items.gain) gains += items.gain;
        if (items.profit) losses += items.profit;
      }
    });
    return { totalGains: gains, totalLosses: losses };
  }, [daysData, selectedDate]);

  const days = getDaysArray(selectedDate.year(), selectedDate.month());
  const startDay = dayjs(
    `${selectedDate.year()}-${selectedDate.month() + 1}-01`
  ).day();

  // Open detail dialog for a day
  const handleDayClick = (day) => {
    const dateStr = dayjs(selectedDate).date(day).format("YYYY-MM-DD");
    dispatch(
      fetchCashflowExpenses("month", monthOffset, "", "", friendId || "")
    );
    if (friendId && friendId !== "undefined") {
      navigate(`/day-view/${dateStr}/friend/${friendId}`);
    } else {
      navigate(`/day-view/${dateStr}`);
    }
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedDate(selectedDate.subtract(1, "month"));
    setMonthOffset((prev) => prev - 1);
  };
  const handleNextMonth = () => {
    setSelectedDate(selectedDate.add(1, "month"));
    setMonthOffset((prev) => prev + 1);
  };
  const handleDatePicker = (newValue) => {
    if (!newValue) return;
    const today = dayjs();
    const diff = newValue
      .startOf("month")
      .diff(today.startOf("month"), "month");
    setSelectedDate(newValue);
    setMonthOffset(diff);
  };

  return (
    <div
      className="bg-[#0b0b0b] p-4 rounded-lg"
      style={{
        width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
        height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
        marginRight: isSmallScreen ? "0" : "20px",
        borderRadius: "8px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: isSmallScreen ? "auto" : "800px",
        maxHeight: isSmallScreen ? "none" : "calc(100vh - 100px)",
      }}
    >
      {/* Back to expenses button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            "&:hover": {
              backgroundColor: "#28282a",
            },
            zIndex: 10,
          }}
          onClick={() =>
            friendId && friendId !== "undefined"
              ? navigate(`/friends/expenses/${friendId}`)
              : navigate("/expenses")
          }
          aria-label="Back"
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
        </IconButton>
      </Box>
      {/* Header for Day/Calendar View */}
      <Typography
        variant={isSmallScreen ? "h6" : "h5"}
        sx={{
          mb: 2,
          fontWeight: 700,
          textAlign: "center",
          color: "#fff",
          mt: 1,
        }}
      >
        Calendar View
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "center",
          gap: isSmallScreen ? 1 : 2,
          position: "relative",
          mt: isSmallScreen ? 0 : -4,
          flexDirection: isSmallScreen ? "column" : "row",
        }}
      >
        {/* Total Losses card on the left */}
        <Box
          sx={{
            background: "#cf667a",
            borderRadius: "40px",
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: isSmallScreen ? "100%" : 190,
            maxWidth: isSmallScreen ? "100%" : 190,
            mr: isSmallScreen ? 0 : 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 0.5,
              flexDirection: "row",
              justifyContent: "space-around",
              height: 40, // Set a fixed height for the row
              width: "100%",
            }}
          >
            {/* Fixed-width arrow container */}
            <Box
              sx={{
                width: 48,
                minWidth: 48,
                maxWidth: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#e2a4af",
                borderRadius: "50%",
                mr: 1,
                ml: 1.5, // Move arrow a little right
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <circle cx="16" cy="16" r="15" fill="#e2a4af" />
                <path
                  d="M16 8v16M16 24l7-7M16 24l-7-7"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            {/* Text content grows to fill */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                flex: 1,
                ml: -0.5, // Move text a little left
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#e6a2af",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: "justify",
                }}
              >
                Spending
              </Typography>
              <Typography
                variant="h6"
                color="#fff"
                fontWeight={700}
                sx={{
                  lineHeight: 1.2,
                  fontSize: "1.25rem",
                  textAlign: "left",
                  mt: 0.5,
                }}
              >
                ₹{formatAmount(totalLosses)}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* Month selection controls in the center */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: "center",
            gap: isSmallScreen ? 1 : 2,
          }}
        >
          <IconButton onClick={handlePrevMonth} sx={{ color: "#00dac6" }}>
            <ArrowBackIcon />
          </IconButton>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month"]}
              value={selectedDate}
              onChange={handleDatePicker}
              sx={{
                background: "#23243a",
                borderRadius: 2,
                color: "#fff",
                ".MuiInputBase-input": { color: "#fff" },
                ".MuiSvgIcon-root": { color: "#00dac6" },
                width: isSmallScreen ? "100%" : 140,
              }}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { color: "#fff" },
                },
              }}
            />
          </LocalizationProvider>
          <IconButton onClick={handleNextMonth} sx={{ color: "#00dac6" }}>
            <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
          </IconButton>
        </Box>
        {/* Total Gains card on the right */}
        <Box
          sx={{
            background: "#437746",
            borderRadius: "40px",
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: isSmallScreen ? "100%" : 190,
            maxWidth: isSmallScreen ? "100%" : 190,
            ml: isSmallScreen ? 0 : 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 0.5,
              flexDirection: "row",
              justifyContent: "space-around",
              height: 40, // Set a fixed height for the row
              width: "100%",
            }}
          >
            {/* Fixed-width arrow container */}
            <Box
              sx={{
                width: 48,
                minWidth: 48,
                maxWidth: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#84ba86",
                borderRadius: "50%",
                mr: 1,
                ml: 1.5, // Move arrow a little right
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <circle cx="16" cy="16" r="15" fill="#84ba86" />
                <path
                  d="M16 24V8M16 8L9 15M16 8L23 15"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            {/* Text content grows to fill */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                flex: 1,
                ml: -0.5, // Move text a little left
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#83b985",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: "justify",
                }}
              >
                Income
              </Typography>
              <Typography
                variant="h6"
                color="#fff"
                fontWeight={700}
                sx={{
                  lineHeight: 1.2,
                  fontSize: "1.25rem",
                  textAlign: "left",
                  mt: 0.5,
                }}
              >
                ₹{formatAmount(totalGains)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden", // Prevent pagination by hiding overflow
          background: "#1b1b1b",
          borderRadius: 2,
          p: 2,
          minHeight: isSmallScreen ? "auto" : "0px",
          height: isSmallScreen ? "auto" : "100%",
        }}
      >
        <Grid
          container
          spacing={1}
          columns={7}
          sx={{
            mb: 2,
            background: "#1b1b1b", // Changed from #bdbdbd to #1b1b1b for weekname header background
            borderRadius: 2,
            borderBottom: 0,
            position: "relative",
            "::after": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 4,
              borderRadius: "0 0 8px 8px",
              background: (() => {
                let total = totalGains + Math.abs(totalLosses);
                if (total === 0)
                  return "linear-gradient(90deg, #1b1b1b 100%, #1b1b1b 100%)";
                let gainPercent = (totalGains / total) * 100;
                let lossPercent = 100 - gainPercent;
                return `linear-gradient(90deg, #06d6a0 ${gainPercent}%, #ff4d4f ${gainPercent}%, #ff4d4f 100%)`;
              })(),
              zIndex: 1,
            },
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Grid item xs={1} key={d}>
              <Typography
                align="center"
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#fff",
                  py: 1,
                  letterSpacing: 1,
                  border: "none",
                  borderRadius: 2,
                }}
              >
                {d}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1} columns={7}>
          {Array.from({ length: startDay }).map((_, i) => (
            <Grid item xs={1} key={`empty-${i}`}></Grid>
          ))}
          {(() => {
            const salaryDate = getSalaryDate(
              selectedDate.year(),
              selectedDate.month()
            );
            const salaryDay = salaryDate.date();
            const salaryMonth = salaryDate.month();
            const salaryYear = salaryDate.year();
            return days.map((day) => {
              const key = dayjs(selectedDate).date(day).format("YYYY-MM-DD");
              const profit = daysData[key]?.profit || 0;
              const gain = daysData[key]?.gain || 0;
              const isToday = dayjs().isSame(
                dayjs(selectedDate).date(day),
                "day"
              );
              const isSalaryDay =
                day === salaryDay &&
                selectedDate.month() === salaryMonth &&
                selectedDate.year() === salaryYear;
              return (
                <Grid
                  item
                  xs={1}
                  key={day}
                  sx={{
                    borderRadius: 2,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <Box
                    onClick={() => handleDayClick(day)}
                    sx={{
                      borderRadius: 2,
                      background: "#0b0b0b",
                      border:
                        isSalaryDay && isToday
                          ? "none"
                          : isToday
                          ? "2.5px solid #00dac6"
                          : "1.5px solid #444",
                      cursor: "pointer",
                      p: 1,
                      minHeight: isSmallScreen ? 50 : 60,
                      height: isSmallScreen ? 70 : 80,
                      textAlign: "center",
                      transition: "background 0.2s, border 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      position: "relative",
                      zIndex: 3,
                    }}
                  >
                    {/* Show green corner borders only if today is salary day */}
                    {isSalaryDay && isToday && (
                      <>
                        {/* Top Right */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: 20,
                            height: 20,
                            pointerEvents: "none",
                            zIndex: 10,
                            borderTop: "2.5px solid #22c55e",
                            borderRight: "2.5px solid #22c55e",
                            borderTopRightRadius: 6,
                          }}
                        />
                        {/* Top Left */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 20,
                            height: 20,
                            pointerEvents: "none",
                            zIndex: 10,
                            borderTop: "2.5px solid #22c55e",
                            borderLeft: "2.5px solid #22c55e",
                            borderTopLeftRadius: 6,
                          }}
                        />
                        {/* Bottom Right */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 20,
                            height: 20,
                            pointerEvents: "none",
                            zIndex: 10,
                            borderBottom: "2.5px solid #22c55e",
                            borderRight: "2.5px solid #22c55e",
                            borderBottomRightRadius: 6,
                          }}
                        />
                        {/* Bottom Left */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: 20,
                            height: 20,
                            pointerEvents: "none",
                            zIndex: 10,
                            borderBottom: "2.5px solid #22c55e",
                            borderLeft: "2.5px solid #22c55e",
                            borderBottomLeftRadius: 6,
                          }}
                        />
                      </>
                    )}
                    <Typography variant="body1" fontWeight={700} color="#fff">
                      {day}
                    </Typography>
                    {(profit !== 0 || gain !== 0) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          gap: 1,
                          width: "100%",
                          mt: 2.2,
                        }}
                      >
                        {profit !== 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff",
                              background: "rgba(255, 77, 79, 0.4)",
                              display: "inline-block",
                              fontWeight: 700,
                              borderRadius: 1,
                              px: 1.5,
                              minWidth: 32,
                              textAlign: "center",
                            }}
                          >
                            ₹{Math.abs(profit).toFixed(0)}
                          </Typography>
                        )}
                        {gain !== 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff",
                              background: "rgba(6, 214, 160, 0.4)",
                              display: "inline-block",
                              fontWeight: 700,
                              borderRadius: 1,
                              px: 1.5,
                              minWidth: 32,
                              textAlign: "center",
                            }}
                          >
                            ₹{gain.toFixed(0)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            });
          })()}
        </Grid>
      </Box>
    </div>
  );
};

export default CalendarView;
