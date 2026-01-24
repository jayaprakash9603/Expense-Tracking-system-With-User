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
import JumpToTodayButton from "../JumpToTodayButton";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import CalendarDayCell from "./CalendarDayCell";
import SpendingMomentumInsight from "./SpendingMomentumInsight";
import { FINANCE_COLOR_TOKENS } from "../../config/financeColorTokens";
import {
  getDaysArray,
  getSalaryDateLastWorkingDay,
  getPaydayDistanceText,
} from "../../utils/calendar/calendarDates";
import { computeMonthCalendarStats } from "../../utils/calendar/calendarMetrics";
import { buildHeatmapBackground } from "../../utils/calendar/calendarHeatmap";
import { formatCompactNumber } from "../../utils/numberFormatters";

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
          {formatCompactNumber(amount)}
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

// NOTE: Day rendering is implemented in the shared CalendarDayCell component.

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
    spendingColor: FINANCE_COLOR_TOKENS.calendar.spending.base,
    incomeColor: FINANCE_COLOR_TOKENS.calendar.income.base,
    spendingIconColor: FINANCE_COLOR_TOKENS.calendar.spending.icon,
    incomeIconColor: FINANCE_COLOR_TOKENS.calendar.income.icon,
    spendingTextColor: FINANCE_COLOR_TOKENS.calendar.spending.text,
    incomeTextColor: FINANCE_COLOR_TOKENS.calendar.income.text,
  },

  // Initial state
  initialDate = dayjs(),
  initialOffset = 0,

  // Features
  showSalaryIndicator = true,
  showTodayIndicator = true,
  showJumpToToday = true,
  showBackButton = true,

  // Visual toggles
  showHeatmap = true,
  showSummaryCards = true,

  // Optional macro insight (anchored to today, computed outside)
  momentumInsight,

  // Optional: render icons instead of amounts inside day cells
  dayCellConfig,

  // Optional: right-side panel aligned with the calendar grid (desktop only)
  rightPanel,
  rightPanelOpen = false,
  rightPanelWidth = 350,
  rightPanelGap = 20,

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
    [selectedDate],
  );

  const startDay = useMemo(
    () => dayjs(`${selectedDate.year()}-${selectedDate.month() + 1}-01`).day(),
    [selectedDate],
  );

  // Calculate monthly summary
  const monthStats = useMemo(
    () =>
      computeMonthCalendarStats({
        data,
        monthDate: selectedDate,
        spendingKey: summaryConfig.spendingKey,
        incomeKey: summaryConfig.incomeKey,
      }),
    [data, selectedDate, summaryConfig.spendingKey, summaryConfig.incomeKey],
  );

  const { totalSpending, totalIncome, avgDailySpend, maxSpending, maxIncome } =
    monthStats;

  // Get salary date
  const salaryDate = useMemo(
    () =>
      getSalaryDateLastWorkingDay(selectedDate.year(), selectedDate.month()),
    [selectedDate],
  );

  // NOTE: Spending Momentum is now provided via `momentumInsight`.

  // Check if viewing current month
  const isViewingCurrentMonth = useMemo(
    () => selectedDate.isSame(dayjs(), "month"),
    [selectedDate],
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

  const showRightPanelDesktop = Boolean(rightPanel) && !isSmallScreen;
  const computedRightPanelGap =
    showRightPanelDesktop && rightPanelOpen ? rightPanelGap : 0;
  const computedLeftWidth =
    showRightPanelDesktop && rightPanelOpen
      ? `calc(100% - ${rightPanelWidth}px - ${computedRightPanelGap}px)`
      : "100%";

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
        {/* Spending Momentum (macro insight) */}
        {momentumInsight && (
          <Box
            sx={{
              position: isSmallScreen ? "static" : "absolute",
              top: isSmallScreen ? "auto" : 64,
              left: isSmallScreen ? "auto" : 24,
              transform: isSmallScreen ? "none" : "translateX(-20px)",
              mb: isSmallScreen ? 1 : 0,
              mt: isSmallScreen ? 1 : 0,
              zIndex: 5,
              opacity: 0.98,
              display: "flex",
              justifyContent: isSmallScreen ? "center" : "flex-start",
              width: isSmallScreen ? "100%" : "auto",
            }}
          >
            <SpendingMomentumInsight
              insight={momentumInsight}
              colors={colors}
              spendingColor={summaryConfig.spendingColor}
              incomeColor={summaryConfig.incomeColor}
            />
          </Box>
        )}

        {/* Spending card */}
        {showSummaryCards && (
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
        )}

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
        {showSummaryCards && (
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
        )}
      </Box>

      {/* Calendar grid + optional right panel (desktop) */}
      <Box
        sx={{
          flex: 1,
          minHeight: isSmallScreen ? "auto" : 0,
          height: isSmallScreen ? "auto" : "100%",
          display: showRightPanelDesktop ? "flex" : "block",
          gap: computedRightPanelGap,
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: computedLeftWidth,
            transition: "width 280ms ease",
            minWidth: 0,
            flex: showRightPanelDesktop ? "0 0 auto" : "1 1 auto",
          }}
        >
          <Box
            sx={{
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
                ...(showSummaryCards
                  ? {
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
                          return `linear-gradient(90deg, ${summaryConfig.incomeColor} ${incomePercent}%, ${summaryConfig.spendingColor} ${incomePercent}%, ${summaryConfig.spendingColor} 100%)`;
                        })(),
                        zIndex: 1,
                      },
                    }
                  : null),
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
                const dateObj = dayjs(selectedDate).date(day);
                const isToday = dayjs().isSame(dateObj, "day");
                const isWeekend = dateObj.day() === 0 || dateObj.day() === 6;
                const isSalaryDay =
                  showSalaryIndicator &&
                  day === salaryDate.date() &&
                  selectedDate.month() === salaryDate.month() &&
                  selectedDate.year() === salaryDate.year();

                const paydayDistanceText = showSalaryIndicator
                  ? getPaydayDistanceText(dateObj, salaryDate)
                  : "";

                const spending =
                  Number(dayData?.[summaryConfig.spendingKey]) || 0;
                const income = Number(dayData?.[summaryConfig.incomeKey]) || 0;

                const heatmapBackground = showHeatmap
                  ? buildHeatmapBackground({
                      baseBg: colors.secondary_bg,
                      accentColor: colors.primary_accent,
                      isWeekend,
                      spending,
                      income,
                      maxSpending,
                      maxIncome,
                      spendingColor: summaryConfig.spendingColor,
                      incomeColor: summaryConfig.incomeColor,
                    })
                  : null;

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
                    <CalendarDayCell
                      dayNumber={day}
                      date={dateObj}
                      dayData={dayData}
                      isToday={showTodayIndicator && isToday}
                      isSalaryDay={isSalaryDay}
                      paydayDistanceText={paydayDistanceText}
                      onClick={handleDayClick}
                      isSmallScreen={isSmallScreen}
                      spendingKey={summaryConfig.spendingKey}
                      incomeKey={summaryConfig.incomeKey}
                      spendingColor={summaryConfig.spendingColor}
                      incomeColor={summaryConfig.incomeColor}
                      colors={colors}
                      currencySymbol={currencySymbol}
                      heatmapBackground={heatmapBackground}
                      avgDailySpend={avgDailySpend}
                      iconsKey={dayCellConfig?.iconsKey}
                      renderIcon={dayCellConfig?.renderIcon}
                      maxIcons={dayCellConfig?.maxIcons}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>

        {showRightPanelDesktop && (
          <Box
            sx={{
              width: rightPanelOpen ? rightPanelWidth : 0,
              minWidth: rightPanelOpen ? rightPanelWidth : 0,
              maxWidth: rightPanelWidth,
              transition: "width 280ms ease, min-width 280ms ease",
              overflow: "hidden",
              flex: "0 0 auto",
            }}
          >
            {rightPanelOpen ? rightPanel : null}
          </Box>
        )}
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

MonthlyCalendarView.propTypes = {
  title: PropTypes.string,
  data: PropTypes.object.isRequired,
  onDayClick: PropTypes.func,
  onMonthChange: PropTypes.func,
  onBack: PropTypes.func,
  momentumInsight: PropTypes.shape({
    category: PropTypes.string,
    tone: PropTypes.oneOf(["bad", "good", "warn", "neutral"]),
    icon: PropTypes.oneOf(["up", "down", "line", "dot"]),
    percentChange: PropTypes.number,
    message: PropTypes.string,
    key: PropTypes.string,
  }),
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
  showHeatmap: PropTypes.bool,
  showSummaryCards: PropTypes.bool,
  dayCellConfig: PropTypes.shape({
    iconsKey: PropTypes.string,
    renderIcon: PropTypes.func,
    maxIcons: PropTypes.number,
  }),
  rightPanel: PropTypes.node,
  rightPanelOpen: PropTypes.bool,
  rightPanelWidth: PropTypes.number,
  rightPanelGap: PropTypes.number,
  showBackButton: PropTypes.bool,
  containerStyle: PropTypes.object,
};

export default MonthlyCalendarView;
