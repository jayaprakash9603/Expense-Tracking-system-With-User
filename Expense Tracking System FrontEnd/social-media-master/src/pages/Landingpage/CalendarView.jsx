import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Typography,
  Grid,
  Box,
  useTheme,
  IconButton,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Helper to get all days in a month
function getDaysArray(year, month) {
  const numDays = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

const CalendarView = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [monthOffset, setMonthOffset] = useState(0);
  const navigate = useNavigate();

  // Fetch cashflow expenses for the selected month
  React.useEffect(() => {
    dispatch(fetchCashflowExpenses("month", monthOffset, ""));
  }, [dispatch, monthOffset]);

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
    dispatch(fetchCashflowExpenses("month", monthOffset, "")); // Ensure fresh data
    navigate(`/day-view/${dateStr}`);
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
      className="bg-[#0b0b0b] p-4 rounded-lg mt-[50px]"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        marginRight: "20px",
        borderRadius: "8px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IconButton
        onClick={() => navigate("/cashflow", { replace: true })}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#00dac6",
          zIndex: 2,
        }}
        aria-label="Back"
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h5"
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
          gap: 2,
          position: "relative",
        }}
      >
        {/* Total Gains card on the left */}
        <Box
          sx={{
            background: "#23243a",
            borderRadius: 2,
            px: 3,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: 120,
            mr: 4,
          }}
        >
          <Typography variant="subtitle2" color="#06d6a0" fontWeight={700}>
            Total Gains
          </Typography>
          <Typography variant="h6" color="#fff" fontWeight={700}>
            ₹{totalGains.toFixed(2)}
          </Typography>
        </Box>
        {/* Month selection controls in the center */}
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
              width: 180,
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
        {/* Total Losses card on the right */}
        <Box
          sx={{
            background: "#23243a",
            borderRadius: 2,
            px: 3,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
            minWidth: 120,
            ml: 4,
          }}
        >
          <Typography variant="subtitle2" color="#ff4d4f" fontWeight={700}>
            Total Losses
          </Typography>
          <Typography variant="h6" color="#fff" fontWeight={700}>
            ₹{totalLosses.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#1b1b1b",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Grid
          container
          spacing={1}
          columns={7}
          sx={{
            mb: 2,
            background: "#bdbdbd", // Gray background for weekday header
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
                  return "linear-gradient(90deg, #bdbdbd 100%, #bdbdbd 100%)";
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
          {days.map((day) => {
            const key = dayjs(selectedDate).date(day).format("YYYY-MM-DD");
            const profit = daysData[key]?.profit || 0;
            const gain = daysData[key]?.gain || 0;
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
                    cursor: "pointer",
                    p: 1,
                    minHeight: 60,
                    height: 80,
                    textAlign: "center",
                    transition: "background 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    position: "relative",
                    zIndex: 3,
                  }}
                >
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
                            background: "#ff4d4f",
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
                            background: "#06d6a0",
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
          })}
        </Grid>
      </Box>
    </div>
  );
};

export default CalendarView;
