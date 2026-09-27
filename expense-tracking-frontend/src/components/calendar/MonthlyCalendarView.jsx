import React, { useEffect, useState, useMemo } from "react";
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
import HeatmapModeToggle from "./HeatmapModeToggle";
import SpendingMomentumInsight from "./SpendingMomentumInsight";
import CalendarViewSkeleton from "../skeletons/CalendarViewSkeleton";
import FinanceSummaryCard from "./FinanceSummaryCard";
import {
  getFinanceCalendarColors,
  getCalendarWeekendTokens,
} from "../../config/financeColorTokens";
import {
  getDaysArray,
  getSalaryDateLastWorkingDay,
  getPaydayDistanceText,
} from "../../utils/calendar/calendarDates";
import { computeMonthCalendarStats } from "../../utils/calendar/calendarMetrics";
import {
  buildHeatmapBackground,
  hexToRgba,
} from "../../utils/calendar/calendarHeatmap";
import { formatCompactNumber } from "../../utils/formatting/numberFormatters";

/**
 * ============================================================================
 * MonthlyCalendarView - Reusable Monthly Calendar Component
 * ============================================================================
 *
 * A flexible, feature-rich calendar component for displaying financial data
 * across months with support for daily spending/income tracking.
 */

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

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
}) => {
  const navButtonSx = {
    color: colors.primary_accent,
    width: 44,
    height: 44,
    border: `1px solid ${colors.border_color}`,
    borderRadius: "12px",
    backgroundColor: colors.secondary_bg,
    transition: "background-color 200ms ease, transform 200ms ease, border-color 200ms ease",
    "&:hover": {
      backgroundColor: colors.hover_bg,
      transform: "scale(1.03)",
      borderColor: `${colors.primary_accent}55`,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: "14px",
        border: `1px solid ${colors.border_color}`,
        backgroundColor: colors.secondary_bg,
        boxShadow: `0 2px 10px rgba(0, 0, 0, 0.08)`,
      }}
    >
      <IconButton onClick={onPrevMonth} aria-label="Previous month" sx={navButtonSx}>
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          views={["year", "month"]}
          value={selectedDate}
          onChange={onDateChange}
          sx={{
            background: "transparent",
            borderRadius: 2,
            color: colors.primary_text,
            ".MuiInputBase-input": {
              color: colors.primary_text,
              fontWeight: 600,
              textAlign: "center",
            },
            ".MuiSvgIcon-root": { color: colors.primary_accent },
            width: isSmallScreen ? "100%" : 148,
          }}
          slotProps={{
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                color: colors.primary_text,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: `${colors.border_color}80` },
                  "&:hover fieldset": { borderColor: colors.primary_accent },
                  "&.Mui-focused fieldset": { borderColor: colors.primary_accent },
                },
              },
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  backgroundColor: colors.card_bg,
                  color: colors.primary_text,
                  border: `1px solid ${colors.border_color}`,
                },
                "& .MuiPickersMonth-monthButton": {
                  color: colors.primary_text,
                  "&:hover": { backgroundColor: colors.hover_bg },
                  "&.Mui-selected": {
                    backgroundColor: colors.primary_accent,
                    color: colors.button_text,
                  },
                },
                "& .MuiPickersYear-yearButton": {
                  color: colors.primary_text,
                  "&:hover": { backgroundColor: colors.hover_bg },
                  "&.Mui-selected": {
                    backgroundColor: colors.primary_accent,
                    color: colors.button_text,
                  },
                },
                "& .MuiPickersCalendarHeader-label": { color: colors.primary_text },
                "& .MuiPickersCalendarHeader-switchViewButton": {
                  color: colors.primary_accent,
                },
                "& .MuiPickersArrowSwitcher-button": { color: colors.primary_accent },
              },
            },
          }}
        />
      </LocalizationProvider>

      <IconButton onClick={onNextMonth} aria-label="Next month" sx={navButtonSx}>
        <ArrowBackIcon sx={{ fontSize: 20, transform: "scaleX(-1)" }} />
      </IconButton>
    </Box>
  );
};

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

  // Configuration (colors resolved from theme in component)
  summaryConfig = {},

  // Initial state
  initialDate = dayjs(),
  initialOffset = 0,

  // Optional controlled mode (lets parents jump months programmatically)
  controlledDate,
  controlledOffset,

  // Features
  showSalaryIndicator = true,
  showTodayIndicator = true,
  showJumpToToday = true,
  showBackButton = true,

  // Visual toggles
  showHeatmap = true,
  showSummaryCards = true,

  // Optional heatmap mode toggle (Loss / Gain / Both)
  showHeatmapModeToggle = false,
  initialHeatmapMode = "both",

  // Disable selecting days with no data (no expenses)
  disableDaysWithoutData = false,

  // Optional: highlight a single active date (YYYY-MM-DD)
  activeDateStr,

  // Optional macro insight (anchored to today, computed outside)
  momentumInsight,
  showSpendingMomentum = false,

  // Optional: render icons instead of amounts inside day cells
  dayCellConfig,

  // Optional: right-side panel aligned with the calendar grid (desktop only)
  rightPanel,
  rightPanelOpen = false,
  rightPanelWidth = 350,
  rightPanelGap = 20,

  // Styling
  containerStyle = {},

  loading = false,
}) => {
  const muiTheme = useMuiTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { colors, mode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const financeColors = useMemo(
    () => getFinanceCalendarColors(mode),
    [mode],
  );

  const weekendTokens = useMemo(
    () => getCalendarWeekendTokens(mode),
    [mode],
  );

  const resolvedSummaryConfig = useMemo(
    () => ({
      spendingLabel: summaryConfig?.spendingLabel ?? "Spending",
      incomeLabel: summaryConfig?.incomeLabel ?? "Income",
      spendingKey: summaryConfig?.spendingKey ?? "spending",
      incomeKey: summaryConfig?.incomeKey ?? "income",
      spendingColor: summaryConfig?.spendingColor ?? financeColors.spending.base,
      incomeColor: summaryConfig?.incomeColor ?? financeColors.income.base,
      spendingIconColor: summaryConfig?.spendingIconColor ?? financeColors.spending.icon,
      incomeIconColor: summaryConfig?.incomeIconColor ?? financeColors.income.icon,
      spendingTextColor: summaryConfig?.spendingTextColor ?? financeColors.spending.text,
      incomeTextColor: summaryConfig?.incomeTextColor ?? financeColors.income.text,
    }),
    [summaryConfig, financeColors],
  );

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [monthOffset, setMonthOffset] = useState(initialOffset);
  const [heatmapMode, setHeatmapMode] = useState(initialHeatmapMode);

  useEffect(() => {
    setHeatmapMode(initialHeatmapMode);
  }, [initialHeatmapMode]);

  useEffect(() => {
    if (!controlledDate) return;

    const nextDate = controlledDate;
    const shouldUpdateMonth =
      !selectedDate?.isValid?.() || !selectedDate.isSame(nextDate, "month");

    if (shouldUpdateMonth) {
      setSelectedDate(nextDate);
    }

    if (
      typeof controlledOffset === "number" &&
      controlledOffset !== monthOffset
    ) {
      setMonthOffset(controlledOffset);
    }
  }, [controlledDate, controlledOffset, monthOffset, selectedDate]);

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
        spendingKey: resolvedSummaryConfig.spendingKey,
        incomeKey: resolvedSummaryConfig.incomeKey,
      }),
    [data, selectedDate, resolvedSummaryConfig.spendingKey, resolvedSummaryConfig.incomeKey],
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
          flexDirection: "column",
          alignItems: "stretch",
          mb: 2,
          mt: 3,
          gap: 1.5,
          px: { xs: 0.5, sm: 1 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1.25, sm: 2 },
            flexDirection: isSmallScreen ? "column" : "row",
            width: "100%",
          }}
        >
          {showSummaryCards && (
            <FinanceSummaryCard
              label={resolvedSummaryConfig.spendingLabel}
              amount={loading ? "loading" : totalSpending}
              accentColor={resolvedSummaryConfig.spendingColor}
              textColor={resolvedSummaryConfig.spendingTextColor}
              iconType="down"
              isSmallScreen={isSmallScreen}
              currencySymbol={currencySymbol}
              colors={colors}
            />
          )}

          <MonthNavigator
            selectedDate={selectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDateChange={handleDatePicker}
            isSmallScreen={isSmallScreen}
            colors={colors}
          />

          {showSummaryCards && (
            <FinanceSummaryCard
              label={resolvedSummaryConfig.incomeLabel}
              amount={loading ? "loading" : totalIncome}
              accentColor={resolvedSummaryConfig.incomeColor}
              textColor={resolvedSummaryConfig.incomeTextColor}
              iconType="up"
              isSmallScreen={isSmallScreen}
              currencySymbol={currencySymbol}
              colors={colors}
            />
          )}
        </Box>

        {showSpendingMomentum && !loading && momentumInsight && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <SpendingMomentumInsight
              insight={momentumInsight}
              colors={colors}
              spendingColor={resolvedSummaryConfig.spendingColor}
              incomeColor={resolvedSummaryConfig.incomeColor}
            />
          </Box>
        )}
      </Box>

      {/* Top-right controls: Heatmap mode + Current Month */}
      {(showJumpToToday || (showHeatmap && showHeatmapModeToggle)) && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 30,
            zIndex: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            maxWidth: isSmallScreen ? "calc(100% - 120px)" : "none",
            flexWrap: isSmallScreen ? "wrap" : "nowrap",
          }}
        >
          {showHeatmap && showHeatmapModeToggle && (
            <HeatmapModeToggle
              value={heatmapMode}
              onChange={setHeatmapMode}
              lossColor={resolvedSummaryConfig.spendingColor}
              gainColor={resolvedSummaryConfig.incomeColor}
              bothColor={colors.primary_accent || "#4563ff"}
              background={colors.secondary_bg}
              borderColor={colors.border_color}
              textColor={colors.primary_text}
              mutedTextColor={colors.secondary_text}
            />
          )}

          {showJumpToToday && (
            <JumpToTodayButton
              onClick={handleJumpToToday}
              isToday={isViewingCurrentMonth}
              visible={true}
              hideWhenActive={true}
              position="static"
              customPosition={{}}
              viewType="month"
              zIndex={20}
            />
          )}
        </Box>
      )}

      {/* Calendar grid + optional right panel (desktop) */}
      <Box
        sx={{
          flex: 1,
          minHeight: isSmallScreen ? "auto" : 0,
          height: isSmallScreen ? "auto" : "100%",
          display: isSmallScreen ? "block" : "flex",
          // Use px gap to avoid MUI theme spacing multiplying the number.
          gap: computedRightPanelGap ? `${computedRightPanelGap}px` : 0,
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
            height: isSmallScreen ? "auto" : "100%",
            minHeight: isSmallScreen ? "auto" : 0,
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
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
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
                          return `linear-gradient(90deg, ${resolvedSummaryConfig.incomeColor} ${incomePercent}%, ${resolvedSummaryConfig.spendingColor} ${incomePercent}%, ${resolvedSummaryConfig.spendingColor} 100%)`;
                        })(),
                        zIndex: 1,
                      },
                    }
                  : null),
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => {
                const isWeekendHeader = idx === 0 || idx === 6;
                return (
                  <Grid item xs={1} key={d}>
                    <Typography
                      align="center"
                      variant="subtitle2"
                      sx={{
                        fontWeight: isWeekendHeader ? 800 : 700,
                        color: isWeekendHeader
                          ? weekendTokens.header
                          : colors.primary_text,
                        py: 1,
                        letterSpacing: isWeekendHeader ? 0.6 : 1,
                        border: "none",
                        borderRadius: 2,
                        backgroundColor: isWeekendHeader
                          ? hexToRgba(
                              weekendTokens.tint,
                              mode === "light" ? 0.1 : 0.14,
                            )
                          : "transparent",
                      }}
                    >
                      {d}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>

            {loading ? (
              <CalendarViewSkeleton isSmallScreen={isSmallScreen} />
            ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gridTemplateRows: isSmallScreen
                  ? "auto"
                  : "repeat(6, minmax(0, 1fr))",
                gap: 1,
                flex: isSmallScreen ? "0 0 auto" : "1 1 auto",
                minHeight: isSmallScreen ? "auto" : 0,
                height: isSmallScreen ? "auto" : "100%",
                alignContent: "stretch",
              }}
            >
              {/* Empty cells for offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <Box
                  key={`empty-start-${i}`}
                  sx={{ display: "flex", alignItems: "stretch", minWidth: 0 }}
                />
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
                  Number(dayData?.[resolvedSummaryConfig.spendingKey]) || 0;
                const income = Number(dayData?.[resolvedSummaryConfig.incomeKey]) || 0;

                const hasIcons = (() => {
                  const iconsKey = dayCellConfig?.iconsKey;
                  const icons = iconsKey ? dayData?.[iconsKey] : null;
                  return Array.isArray(icons) && icons.length > 0;
                })();

                const isDayDisabled =
                  disableDaysWithoutData &&
                  (!dayData || (spending === 0 && income === 0 && !hasIcons));

                const isActive =
                  typeof activeDateStr === "string" && activeDateStr === key;

                const effectiveSpending =
                  showHeatmap && showHeatmapModeToggle && heatmapMode === "gain"
                    ? 0
                    : spending;
                const effectiveIncome =
                  showHeatmap && showHeatmapModeToggle && heatmapMode === "loss"
                    ? 0
                    : income;
                const effectiveMaxSpending =
                  showHeatmap && showHeatmapModeToggle && heatmapMode === "gain"
                    ? 0
                    : maxSpending;
                const effectiveMaxIncome =
                  showHeatmap && showHeatmapModeToggle && heatmapMode === "loss"
                    ? 0
                    : maxIncome;

                const bothOnDay =
                  effectiveSpending > 0 && effectiveIncome > 0;
                const heatmapBackground = showHeatmap
                  ? buildHeatmapBackground({
                      baseBg: colors.secondary_bg,
                      accentColor: colors.primary_accent,
                      isWeekend,
                      weekendTint: weekendTokens.tint,
                      weekendAlpha: weekendTokens.alpha,
                      themeMode: mode,
                      spending: effectiveSpending,
                      income: effectiveIncome,
                      maxSpending: effectiveMaxSpending,
                      maxIncome: effectiveMaxIncome,
                      spendingColor: resolvedSummaryConfig.spendingColor,
                      incomeColor: resolvedSummaryConfig.incomeColor,
                      emphasizeBothSplit:
                        showHeatmapModeToggle &&
                        heatmapMode === "both" &&
                        bothOnDay,
                    })
                  : null;

                return (
                  <Box
                    key={day}
                    sx={{
                      borderRadius: 2,
                      position: "relative",
                      overflow: "visible",
                      display: "flex",
                      alignItems: "stretch",
                      minWidth: 0,
                      minHeight: 0,
                    }}
                  >
                    <CalendarDayCell
                      dayNumber={day}
                      date={dateObj}
                      dayData={dayData}
                      isToday={showTodayIndicator && isToday}
                      isSalaryDay={isSalaryDay}
                      isActive={isActive}
                      paydayDistanceText={paydayDistanceText}
                      onClick={handleDayClick}
                      disabled={isDayDisabled}
                      isSmallScreen={isSmallScreen}
                      spendingKey={resolvedSummaryConfig.spendingKey}
                      incomeKey={resolvedSummaryConfig.incomeKey}
                      spendingColor={resolvedSummaryConfig.spendingColor}
                      incomeColor={resolvedSummaryConfig.incomeColor}
                      spendingTextColor={resolvedSummaryConfig.spendingTextColor}
                      incomeTextColor={resolvedSummaryConfig.incomeTextColor}
                      colors={colors}
                      currencySymbol={currencySymbol}
                      heatmapBackground={heatmapBackground}
                      isWeekend={isWeekend}
                      heatmapMode={
                        showHeatmapModeToggle ? heatmapMode : "both"
                      }
                      themeMode={mode}
                      showMixedAmountsOverlay={
                        !(showHeatmapModeToggle && heatmapMode !== "both")
                      }
                      avgDailySpend={avgDailySpend}
                      iconsKey={dayCellConfig?.iconsKey}
                      renderIcon={dayCellConfig?.renderIcon}
                      maxIcons={dayCellConfig?.maxIcons}
                    />
                  </Box>
                );
              })}

              {/* Trailing empty cells to keep a stable 7x6 grid */}
              {Array.from({
                length: Math.max(0, 42 - (startDay + days.length)),
              }).map((_, i) => (
                <Box
                  key={`empty-end-${i}`}
                  sx={{ display: "flex", alignItems: "stretch", minWidth: 0 }}
                />
              ))}
            </Box>
            )}
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
    </div>
  );
};

// ============================================================================
// PROP TYPES
// ============================================================================

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
  activeDateStr: PropTypes.string,
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
  controlledDate: PropTypes.object,
  controlledOffset: PropTypes.number,
  showSalaryIndicator: PropTypes.bool,
  showTodayIndicator: PropTypes.bool,
  showJumpToToday: PropTypes.bool,
  showHeatmap: PropTypes.bool,
  showHeatmapModeToggle: PropTypes.bool,
  initialHeatmapMode: PropTypes.oneOf(["loss", "gain", "both"]),
  showSummaryCards: PropTypes.bool,
  showSpendingMomentum: PropTypes.bool,
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
  disableDaysWithoutData: PropTypes.bool,
  loading: PropTypes.bool,
};

export default MonthlyCalendarView;
