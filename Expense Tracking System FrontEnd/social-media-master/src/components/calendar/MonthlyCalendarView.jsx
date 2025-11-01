import React, { useState, useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DateIndicator from "../DateIndicator";
import JumpToTodayButton from "../JumpToTodayButton";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

/**
 * ============================================================================
 * MonthlyCalendarView - Reusable Monthly Calendar Component
 * ============================================================================
 *
 * A flexible, feature-rich calendar component for displaying financial data
 * across months with support for daily spending/income tracking.
 *
 * FEATURES:
 * - Month navigation (prev/next/date picker)
 * - Daily data visualization (spending/income)
 * - Summary cards (total spending/income)
 * - Date indicators (today, salary day, custom)
 * - Jump to today functionality
 * - Fully responsive design
 * - Customizable colors and labels
 * - Extensible for future features
 *
 * USAGE:
 * ------
 * <MonthlyCalendarView
 *   title="Calendar View"
 *   data={daysData}
 *   onDayClick={handleDayClick}
 *   onMonthChange={handleMonthChange}
 *   summaryConfig={{
 *     spendingLabel: "Spending",
 *     incomeLabel: "Income",
 *     spendingColor: "#cf667a",
 *     incomeColor: "#437746"
 *   }}
 *   onBack={() => navigate('/expenses')}
 * />
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the salary date for a given year and month (last working day)
 */
function getSalaryDate(year, month) {
  let lastDay = dayjs(`${year}-${month + 1}-01`).endOf("month");
  let dayOfWeek = lastDay.day();

  if (dayOfWeek === 6) return lastDay.subtract(1, "day"); // Saturday -> Friday
  if (dayOfWeek === 0) return lastDay.subtract(2, "day"); // Sunday -> Friday
  return lastDay;
}

/**
 * Get all days in a month as an array
 */
function getDaysArray(year, month) {
  const numDays = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

/**
 * Format numbers with K, M, B, T suffixes
 */
function formatAmount(num) {
  if (num === 0) return "0";
  const absNum = Math.abs(num);

  if (absNum >= 1e12)
    return (
      (num / 1e12).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "T"
    );
  if (absNum >= 1e9)
    return (
      (num / 1e9).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "B"
    );
  if (absNum >= 1e6)
    return (
      (num / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "M"
    );
  if (absNum >= 1e3)
    return (
      (num / 1e3).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + "K"
    );

  return num.toLocaleString();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * SummaryCard - Displays total spending or income
 */
const SummaryCard = ({
  label,
  amount,
  backgroundColor,
  iconColor,
  textColor,
  iconType = "down",
  isSmallScreen,
  currencySymbol = "₹",
}) => (
  <Box
    sx={{
      background: backgroundColor,
      borderRadius: "40px",
      py: 1.5,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: 2,
      minWidth: isSmallScreen ? "100%" : 190,
      maxWidth: isSmallScreen ? "100%" : 190,
      mr: isSmallScreen ? 0 : iconType === "down" ? 4 : 0,
      ml: isSmallScreen ? 0 : iconType === "up" ? 4 : 0,
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
        height: 40,
        width: "100%",
      }}
    >
      {/* Icon container */}
      <Box
        sx={{
          width: 48,
          minWidth: 48,
          maxWidth: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: iconColor,
          borderRadius: "50%",
          mr: 1,
          ml: 1.5,
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
          <circle cx="16" cy="16" r="15" fill={iconColor} />
          {iconType === "down" ? (
            <path
              d="M16 8v16M16 24l7-7M16 24l-7-7"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M16 24V8M16 8L9 15M16 8L23 15"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </Box>

      {/* Text content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          flex: 1,
          ml: -0.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: textColor,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: "justify",
          }}
        >
          {label}
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
          {currencySymbol}
          {formatAmount(amount)}
        </Typography>
      </Box>
    </Box>
  </Box>
);

/**
 * MonthNavigator - Month selection controls with date picker
 */
const MonthNavigator = ({
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onDateChange,
  isSmallScreen,
  colors,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: isSmallScreen ? "column" : "row",
      alignItems: "center",
      gap: isSmallScreen ? 1 : 2,
    }}
  >
    <IconButton onClick={onPrevMonth} sx={{ color: "#14b8a6" }}>
      <ArrowBackIcon />
    </IconButton>

    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={["year", "month"]}
        value={selectedDate}
        onChange={onDateChange}
        sx={{
          background: colors.primary_bg,
          borderRadius: 2,
          color: colors.primary_text,
          ".MuiInputBase-input": { color: colors.primary_text },
          ".MuiSvgIcon-root": { color: "#14b8a6" },
          width: isSmallScreen ? "100%" : 140,
        }}
        slotProps={{
          textField: {
            size: "small",
            variant: "outlined",
            sx: { color: colors.primary_text },
          },
        }}
      />
    </LocalizationProvider>

    <IconButton onClick={onNextMonth} sx={{ color: "#14b8a6" }}>
      <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
    </IconButton>
  </Box>
);

/**
 * CalendarDay - Individual day cell with spending/income display
 */
const CalendarDay = ({
  day,
  dayData,
  isToday,
  isSalaryDay,
  onClick,
  isSmallScreen,
  spendingKey = "spending",
  incomeKey = "income",
  colors,
  currencySymbol = "₹",
}) => {
  const spending = dayData?.[spendingKey] || 0;
  const income = dayData?.[incomeKey] || 0;

  return (
    <Box
      onClick={() => onClick(day)}
      sx={{
        borderRadius: 2,
        background: colors.secondary_bg,
        cursor: "pointer",
        p: 1,
        minHeight: isSmallScreen ? 50 : 60,
        height: isSmallScreen ? 70 : 80,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        zIndex: 3,
      }}
    >
      {/* Salary Day Indicator */}
      {isSalaryDay && (
        <DateIndicator
          type="salary"
          position="top-right"
          showAnimation={true}
          showCornerAccent={true}
          showBadge={true}
        />
      )}

      {/* Today Indicator */}
      {isToday && (
        <DateIndicator
          type="today"
          position="top-left"
          showAnimation={true}
          showCornerAccent={true}
          showBadge={true}
        />
      )}

      {/* Day number */}
      <Typography variant="body1" fontWeight={700} color={colors.primary_text}>
        {day}
      </Typography>

      {/* Amount display */}
      {(spending !== 0 || income !== 0) && (
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
          {spending !== 0 && (
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
              {currencySymbol}
              {Math.abs(spending).toFixed(0)}
            </Typography>
          )}
          {income !== 0 && (
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
              {currencySymbol}
              {income.toFixed(0)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MonthlyCalendarView - Main calendar component
 */
const MonthlyCalendarView = ({
  // Required props
  title = "Calendar View",
  data = {},
  onDayClick,

  // Optional callbacks
  onMonthChange,
  onBack,

  // Configuration
  summaryConfig = {
    spendingLabel: "Spending",
    incomeLabel: "Income",
    spendingKey: "spending",
    incomeKey: "income",
    spendingColor: "#cf667a",
    incomeColor: "#437746",
    spendingIconColor: "#e2a4af",
    incomeIconColor: "#84ba86",
    spendingTextColor: "#e6a2af",
    incomeTextColor: "#83b985",
  },

  // Initial state
  initialDate = dayjs(),
  initialOffset = 0,

  // Features
  showSalaryIndicator = true,
  showTodayIndicator = true,
  showJumpToToday = true,
  showBackButton = true,

  // Styling
  containerStyle = {},
}) => {
  const muiTheme = useMuiTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [monthOffset, setMonthOffset] = useState(initialOffset);

  // Calculate days array and start day
  const days = useMemo(
    () => getDaysArray(selectedDate.year(), selectedDate.month()),
    [selectedDate]
  );

  const startDay = useMemo(
    () => dayjs(`${selectedDate.year()}-${selectedDate.month() + 1}-01`).day(),
    [selectedDate]
  );

  // Calculate monthly summary
  const { totalSpending, totalIncome } = useMemo(() => {
    let spending = 0;
    let income = 0;

    Object.entries(data).forEach(([key, items]) => {
      if (dayjs(key).isSame(selectedDate, "month")) {
        spending += items[summaryConfig.spendingKey] || 0;
        income += items[summaryConfig.incomeKey] || 0;
      }
    });

    return { totalSpending: spending, totalIncome: income };
  }, [data, selectedDate, summaryConfig.spendingKey, summaryConfig.incomeKey]);

  // Get salary date
  const salaryDate = useMemo(
    () => getSalaryDate(selectedDate.year(), selectedDate.month()),
    [selectedDate]
  );

  // Check if viewing current month
  const isViewingCurrentMonth = useMemo(
    () => selectedDate.isSame(dayjs(), "month"),
    [selectedDate]
  );

  // Navigation handlers
  const handlePrevMonth = () => {
    const newDate = selectedDate.subtract(1, "month");
    const newOffset = monthOffset - 1;
    setSelectedDate(newDate);
    setMonthOffset(newOffset);
    onMonthChange?.(newDate, newOffset);
  };

  const handleNextMonth = () => {
    const newDate = selectedDate.add(1, "month");
    const newOffset = monthOffset + 1;
    setSelectedDate(newDate);
    setMonthOffset(newOffset);
    onMonthChange?.(newDate, newOffset);
  };

  const handleDatePicker = (newValue) => {
    if (!newValue) return;
    const today = dayjs();
    const diff = newValue
      .startOf("month")
      .diff(today.startOf("month"), "month");
    setSelectedDate(newValue);
    setMonthOffset(diff);
    onMonthChange?.(newValue, diff);
  };

  const handleJumpToToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    setMonthOffset(0);
    onMonthChange?.(today, 0);
  };

  const handleDayClick = (day) => {
    const dateStr = dayjs(selectedDate).date(day).format("YYYY-MM-DD");
    onDayClick?.(dateStr, day, selectedDate);
  };

  return (
    <div
      style={{
        backgroundColor: colors.secondary_bg,
        padding: "16px",
        borderRadius: "8px",
        width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
        height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
        marginRight: isSmallScreen ? "0" : "20px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: isSmallScreen ? "auto" : "800px",
        maxHeight: isSmallScreen ? "none" : "calc(100vh - 100px)",
        ...containerStyle,
      }}
    >
      {/* Back button */}
      {showBackButton && onBack && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#14b8a6",
              backgroundColor: colors.primary_bg,
              "&:hover": { backgroundColor: colors.hover_bg },
              zIndex: 10,
            }}
            onClick={onBack}
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
                stroke="#14b8a6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </Box>
      )}

      {/* Header title */}
      <Typography
        variant="h5"
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: 700,
          textAlign: "center",
          color: colors.primary_text,
          m: 0,
          zIndex: 15,
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>

      {/* Summary and navigation controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "center",
          gap: isSmallScreen ? 1 : 2,
          position: "relative",
          mt: 3,
          flexDirection: isSmallScreen ? "column" : "row",
          paddingTop: isSmallScreen ? 0 : 1,
          pt: isSmallScreen ? 0 : 1,
        }}
      >
        {/* Spending card */}
        <SummaryCard
          label={summaryConfig.spendingLabel}
          amount={totalSpending}
          backgroundColor={summaryConfig.spendingColor}
          iconColor={summaryConfig.spendingIconColor}
          textColor={summaryConfig.spendingTextColor}
          iconType="down"
          isSmallScreen={isSmallScreen}
          currencySymbol={currencySymbol}
        />

        {/* Month navigator */}
        <MonthNavigator
          selectedDate={selectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateChange={handleDatePicker}
          isSmallScreen={isSmallScreen}
          colors={colors}
        />

        {/* Income card */}
        <SummaryCard
          label={summaryConfig.incomeLabel}
          amount={totalIncome}
          backgroundColor={summaryConfig.incomeColor}
          iconColor={summaryConfig.incomeIconColor}
          textColor={summaryConfig.incomeTextColor}
          iconType="up"
          isSmallScreen={isSmallScreen}
          currencySymbol={currencySymbol}
        />
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          background: colors.primary_bg,
          borderRadius: 2,
          p: 2,
          minHeight: isSmallScreen ? "auto" : "0px",
          height: isSmallScreen ? "auto" : "100%",
        }}
      >
        {/* Weekday headers */}
        <Grid
          container
          spacing={1}
          columns={7}
          sx={{
            mb: 2,
            background: colors.primary_bg,
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
                const total = totalIncome + Math.abs(totalSpending);
                if (total === 0)
                  return `linear-gradient(90deg, ${colors.primary_bg} 100%, ${colors.primary_bg} 100%)`;
                const incomePercent = (totalIncome / total) * 100;
                return `linear-gradient(90deg, #06d6a0 ${incomePercent}%, #ff4d4f ${incomePercent}%, #ff4d4f 100%)`;
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
                  color: colors.primary_text,
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

        {/* Calendar days */}
        <Grid container spacing={1} columns={7}>
          {/* Empty cells for offset */}
          {Array.from({ length: startDay }).map((_, i) => (
            <Grid item xs={1} key={`empty-${i}`}></Grid>
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const key = dayjs(selectedDate).date(day).format("YYYY-MM-DD");
            const dayData = data[key];
            const isToday = dayjs().isSame(
              dayjs(selectedDate).date(day),
              "day"
            );
            const isSalaryDay =
              showSalaryIndicator &&
              day === salaryDate.date() &&
              selectedDate.month() === salaryDate.month() &&
              selectedDate.year() === salaryDate.year();

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
                <CalendarDay
                  day={day}
                  dayData={dayData}
                  isToday={showTodayIndicator && isToday}
                  isSalaryDay={isSalaryDay}
                  onClick={handleDayClick}
                  isSmallScreen={isSmallScreen}
                  spendingKey={summaryConfig.spendingKey}
                  incomeKey={summaryConfig.incomeKey}
                  colors={colors}
                  currencySymbol={currencySymbol}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Jump to Today button */}
      {showJumpToToday && (
        <JumpToTodayButton
          onClick={handleJumpToToday}
          isToday={isViewingCurrentMonth}
          visible={true}
          position="absolute"
          customPosition={{ top: 16, right: 30 }}
          viewType="month"
          zIndex={20}
        />
      )}
    </div>
  );
};

// ============================================================================
// PROP TYPES
// ============================================================================

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  iconType: PropTypes.oneOf(["up", "down"]),
  isSmallScreen: PropTypes.bool,
  currencySymbol: PropTypes.string,
};

MonthNavigator.propTypes = {
  selectedDate: PropTypes.object.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  isSmallScreen: PropTypes.bool,
  colors: PropTypes.object,
};

CalendarDay.propTypes = {
  day: PropTypes.number.isRequired,
  dayData: PropTypes.object,
  isToday: PropTypes.bool,
  isSalaryDay: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isSmallScreen: PropTypes.bool,
  spendingKey: PropTypes.string,
  incomeKey: PropTypes.string,
  colors: PropTypes.object,
  currencySymbol: PropTypes.string,
};

MonthlyCalendarView.propTypes = {
  title: PropTypes.string,
  data: PropTypes.object.isRequired,
  onDayClick: PropTypes.func,
  onMonthChange: PropTypes.func,
  onBack: PropTypes.func,
  summaryConfig: PropTypes.shape({
    spendingLabel: PropTypes.string,
    incomeLabel: PropTypes.string,
    spendingKey: PropTypes.string,
    incomeKey: PropTypes.string,
    spendingColor: PropTypes.string,
    incomeColor: PropTypes.string,
    spendingIconColor: PropTypes.string,
    incomeIconColor: PropTypes.string,
    spendingTextColor: PropTypes.string,
    incomeTextColor: PropTypes.string,
  }),
  initialDate: PropTypes.object,
  initialOffset: PropTypes.number,
  showSalaryIndicator: PropTypes.bool,
  showTodayIndicator: PropTypes.bool,
  showJumpToToday: PropTypes.bool,
  showBackButton: PropTypes.bool,
  containerStyle: PropTypes.object,
};

export default MonthlyCalendarView;
