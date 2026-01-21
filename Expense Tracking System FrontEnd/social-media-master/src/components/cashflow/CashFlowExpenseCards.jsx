import React, { useRef, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NoDataPlaceholder from "../../components/NoDataPlaceholder"; // adjust path if needed
import DatePickerPopover from "../common/DatePickerPopover";
import MonthPickerDropdown from "./MonthPickerDropdown";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMasking } from "../../hooks/useMasking";
import { useTranslation } from "../../hooks/useTranslation";
import SelectionNavigator from "./SelectionNavigator";
import ExpenseCard from "./ExpenseCard";

import CashFlowExpenseCardsSkeleton from "../skeletons/CashFlowExpenseCardsSkeleton";

dayjs.extend(weekOfYear);

/**
 * Reusable expense cards list for CashFlow page.
 * Keeps purely presentational logic; side-effect actions passed via callbacks/props.
 */
function CashFlowExpenseCards({
  data = [],
  loading,
  search,
  selectedCardIdx = [],
  flowTab,
  activeRange,
  isMobile,
  isTablet,
  handleCardClick,
  hasWriteAccess,
  formatNumberFull,
  dispatch,
  navigate,
  friendId,
  isFriendView,
  handleDeleteClick,
  getListOfBudgetsByExpenseId,
  getExpenseAction,
  getBillByExpenseId,
}) {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  useMasking(); // Keep hook call but don't destructure unused variables
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);
  const savedScrollPositionRef = useRef(0);
  const [sortOrder, setSortOrder] = React.useState("desc"); // "asc" or "desc"
  const [currentHeader, setCurrentHeader] = React.useState({
    year: "",
    month: "",
    week: "",
    date: "",
  });
  const [datePickerAnchor, setDatePickerAnchor] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [monthPickerAnchor, setMonthPickerAnchor] = React.useState(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [showScrollBottom, setShowScrollBottom] = React.useState(false);
  const [selectedNavigatorIndex, setSelectedNavigatorIndex] = React.useState(0);
  const previousSelectionLengthRef = useRef(0);
  const autoScrollSuppressedRef = useRef(false);
  const autoScrollResetTimeoutRef = useRef(null);
  const manualSelectionChangeRef = useRef({
    active: false,
    preserveScroll: false,
    focusCardIndex: null,
  });

  const normalizedSelectedCardIdx = React.useMemo(() => {
    if (!Array.isArray(selectedCardIdx) || selectedCardIdx.length === 0) {
      return [];
    }

    const seen = new Set();
    return selectedCardIdx.filter((idx) => {
      const isValidIndex =
        typeof idx === "number" && Number.isFinite(idx) && idx >= 0;
      if (!isValidIndex || seen.has(idx)) {
        return false;
      }
      seen.add(idx);
      return true;
    });
  }, [selectedCardIdx]);

  const selectedIndicesSet = React.useMemo(
    () => new Set(normalizedSelectedCardIdx),
    [normalizedSelectedCardIdx],
  );

  const hasSelections = normalizedSelectedCardIdx.length > 0;
  const hasMultipleSelections = normalizedSelectedCardIdx.length > 1;

  const scrollToCardByIndex = React.useCallback(
    (cardIndex, behavior = "smooth") => {
      if (typeof cardIndex !== "number") return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const targetCard = container.querySelector(
        `[data-card-index="${cardIndex}"]`,
      );

      if (!targetCard) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();
      const offset = cardRect.top - containerRect.top;
      const targetTop = container.scrollTop + offset - 80;

      container.scrollTo({
        top: Math.max(targetTop, 0),
        behavior,
      });

      targetCard.classList.add("selected-card-focus");
      setTimeout(() => {
        targetCard.classList.remove("selected-card-focus");
      }, 400);
    },
    [],
  );

  const suppressAutoScrollTemporarily = React.useCallback(() => {
    autoScrollSuppressedRef.current = true;
    if (autoScrollResetTimeoutRef.current) {
      clearTimeout(autoScrollResetTimeoutRef.current);
    }
    autoScrollResetTimeoutRef.current = setTimeout(() => {
      autoScrollSuppressedRef.current = false;
      autoScrollResetTimeoutRef.current = null;
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (autoScrollResetTimeoutRef.current) {
        clearTimeout(autoScrollResetTimeoutRef.current);
        autoScrollResetTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasSelections) {
      setSelectedNavigatorIndex(0);
      previousSelectionLengthRef.current = 0;
      return;
    }

    const prevLength = previousSelectionLengthRef.current;
    let nextIndex = prevLength === 0 ? 0 : selectedNavigatorIndex;
    let shouldScroll = prevLength === 0;

    const manualState = manualSelectionChangeRef.current;
    const manualTargetIndex =
      manualState.active &&
      manualState.focusCardIndex !== null &&
      !manualState.preserveScroll
        ? normalizedSelectedCardIdx.indexOf(manualState.focusCardIndex)
        : -1;

    if (manualTargetIndex !== -1) {
      nextIndex = manualTargetIndex;
      shouldScroll = true;
    } else if (normalizedSelectedCardIdx.length > prevLength) {
      nextIndex = normalizedSelectedCardIdx.length - 1;
      shouldScroll = true;
    }

    if (nextIndex >= normalizedSelectedCardIdx.length) {
      nextIndex = normalizedSelectedCardIdx.length - 1;
    }
    if (nextIndex < 0) {
      nextIndex = 0;
    }

    const targetCardIndex = normalizedSelectedCardIdx[nextIndex];
    if (
      shouldScroll &&
      !autoScrollSuppressedRef.current &&
      typeof targetCardIndex === "number"
    ) {
      requestAnimationFrame(() => {
        scrollToCardByIndex(
          targetCardIndex,
          prevLength === 0 ? "auto" : "smooth",
        );
      });
    }

    previousSelectionLengthRef.current = normalizedSelectedCardIdx.length;

    if (selectedNavigatorIndex !== nextIndex) {
      setSelectedNavigatorIndex(nextIndex);
    }
  }, [
    hasSelections,
    normalizedSelectedCardIdx,
    scrollToCardByIndex,
    selectedNavigatorIndex,
  ]);

  useEffect(() => {
    const manualState = manualSelectionChangeRef.current;
    if (!manualState.active) {
      return;
    }

    manualSelectionChangeRef.current = {
      active: false,
      preserveScroll: false,
      focusCardIndex: null,
    };

    if (!manualState.preserveScroll) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTop = savedScrollPositionRef.current;
    });
  }, [normalizedSelectedCardIdx]);

  const handleSelectionNavigate = React.useCallback(
    (direction) => {
      if (!hasSelections) return;
      suppressAutoScrollTemporarily();

      const isPrev = direction === "prev";
      const currentIndex = selectedNavigatorIndex;
      const isAtBoundary = isPrev
        ? currentIndex === 0
        : currentIndex === normalizedSelectedCardIdx.length - 1;

      if (isAtBoundary) {
        return;
      }

      const nextIndex = isPrev ? currentIndex - 1 : currentIndex + 1;
      const targetCardIndex = normalizedSelectedCardIdx[nextIndex];

      // Update state first
      setSelectedNavigatorIndex(nextIndex);

      // Then scroll to the card
      requestAnimationFrame(() => {
        scrollToCardByIndex(targetCardIndex);
      });
    },
    [
      hasSelections,
      normalizedSelectedCardIdx,
      selectedNavigatorIndex,
      scrollToCardByIndex,
      suppressAutoScrollTemporarily,
    ],
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleDateClick = (event) => {
    setDatePickerAnchor(event.currentTarget);
    const currentDate = currentHeader.date
      ? dayjs(currentHeader.date, dateFormat)
      : dayjs();
    setSelectedDate(currentDate);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleMonthClick = (event) => {
    setMonthPickerAnchor(event.currentTarget);
  };

  const handleMonthPickerClose = () => {
    setMonthPickerAnchor(null);
  };

  const handleMonthSelect = (year, month) => {
    // Get the first date in this month to update the header
    const monthData = groupedExpenses.groups?.[year]?.[month];
    let firstDateInMonth = null;

    if (monthData) {
      // Get all dates in this month sorted by the current sort order
      const allDatesInMonth = [];
      Object.keys(monthData).forEach((week) => {
        Object.keys(monthData[week]).forEach((dateKey) => {
          allDatesInMonth.push({
            dateKey,
            week,
            displayDate: monthData[week][dateKey].displayDate,
          });
        });
      });

      // Sort dates: for desc (recent first), get the most recent date; for asc (old first), get the oldest date
      allDatesInMonth.sort((a, b) =>
        sortOrder === "desc"
          ? b.dateKey.localeCompare(a.dateKey)
          : a.dateKey.localeCompare(b.dateKey),
      );

      if (allDatesInMonth.length > 0) {
        firstDateInMonth = allDatesInMonth[0];
      }
    }

    // Update header state immediately before scrolling
    setCurrentHeader({
      year: year,
      month: month,
      week: firstDateInMonth?.week || "",
      date: firstDateInMonth?.displayDate || "",
    });

    // Find first date section of the selected month
    if (scrollContainerRef.current) {
      // Small delay to ensure DOM is updated after state change
      requestAnimationFrame(() => {
        const monthSection = document.querySelector(
          `[data-year="${year}"][data-month="${month}"]`,
        );

        if (monthSection && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const sectionRect = monthSection.getBoundingClientRect();

          // Calculate the scroll position relative to the container
          const scrollOffset =
            sectionRect.top - containerRect.top + container.scrollTop;

          // For the last item, we may need to scroll to maximum possible
          const maxScroll = container.scrollHeight - container.clientHeight;
          const targetScroll = Math.max(0, scrollOffset - 80);

          container.scrollTo({
            top: Math.min(targetScroll, maxScroll),
            behavior: "instant",
          });
        }
      });
    }
    handleMonthPickerClose();
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  };

  const handleDateChange = (newDate) => {
    if (!newDate || !newDate.isValid()) return;

    setSelectedDate(newDate);

    // Find and scroll to the selected date
    const formattedDate = newDate.format(dateFormat);

    // Update header state immediately
    const targetYear = newDate.year().toString();
    const targetMonth = newDate.format("MMMM YYYY");
    const targetWeek = `Week ${newDate.week()}`;

    setCurrentHeader({
      year: targetYear,
      month: targetMonth,
      week: targetWeek,
      date: formattedDate,
    });

    if (scrollContainerRef.current) {
      // Small delay to ensure DOM is updated after state change
      requestAnimationFrame(() => {
        const dateSection = document.querySelector(
          `[data-date-section="true"][data-date="${formattedDate}"]`,
        );

        if (dateSection && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const sectionRect = dateSection.getBoundingClientRect();

          // Calculate the scroll position relative to the container
          const scrollOffset =
            sectionRect.top - containerRect.top + container.scrollTop;

          // For the last item, we may need to scroll to maximum possible
          const maxScroll = container.scrollHeight - container.clientHeight;
          const targetScroll = Math.max(0, scrollOffset - 80);

          container.scrollTo({
            top: Math.min(targetScroll, maxScroll),
            behavior: "instant",
          });
        }
      });
    }
    handleDatePickerClose();
  };

  const navigateToDate = (direction) => {
    if (
      !groupedExpenses.availableDates ||
      groupedExpenses.availableDates.length === 0
    )
      return;

    // Sort dates chronologically (ascending order by actual date)
    const chronologicalDates = [...groupedExpenses.availableDates].sort(
      (a, b) => a.localeCompare(b),
    );

    // Parse current date properly - currentHeader.date is in dateFormat (e.g., "DD/MM/YYYY")
    // Convert it to "YYYY-MM-DD" format to match chronologicalDates
    let currentDateStr;
    if (currentHeader.date) {
      const parsedDate = dayjs(currentHeader.date, dateFormat);
      currentDateStr = parsedDate.isValid()
        ? parsedDate.format("YYYY-MM-DD")
        : null;
    } else {
      currentDateStr = null;
    }

    let currentIndex = currentDateStr
      ? chronologicalDates.indexOf(currentDateStr)
      : -1;

    // If current date not found, default to first or last based on sort order
    if (currentIndex === -1) {
      if (sortOrder === "asc") {
        // Old First: start from oldest
        currentIndex = direction === "next" ? 0 : -1;
      } else {
        // Recent First: start from newest
        currentIndex =
          direction === "next"
            ? chronologicalDates.length - 1
            : chronologicalDates.length;
      }
    }

    let targetIndex;

    // Logic based on sort order and direction
    // When sortOrder is "asc" (Old First): down = newer, up = older
    // When sortOrder is "desc" (Recent First): down = older, up = newer
    if (sortOrder === "asc") {
      // Old First: down arrow goes to newer date (forward in time)
      if (direction === "next") {
        targetIndex =
          currentIndex < chronologicalDates.length - 1
            ? currentIndex + 1
            : currentIndex;
      } else {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      }
    } else {
      // Recent First: down arrow goes to older date (backward in time)
      if (direction === "next") {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else {
        targetIndex =
          currentIndex < chronologicalDates.length - 1
            ? currentIndex + 1
            : currentIndex;
      }
    }

    // Ensure we don't go beyond bounds
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= chronologicalDates.length)
      targetIndex = chronologicalDates.length - 1;

    // Don't navigate if we're already at the target
    if (targetIndex === currentIndex) return;

    const targetDate = dayjs(chronologicalDates[targetIndex]);

    // Get target date info and update header immediately
    const formattedDate = targetDate.format(dateFormat);
    const targetYear = targetDate.year().toString();
    const targetMonth = targetDate.format("MMMM YYYY");
    const targetWeek = `Week ${targetDate.week()}`;

    // Update header state immediately before scrolling
    setCurrentHeader({
      year: targetYear,
      month: targetMonth,
      week: targetWeek,
      date: formattedDate,
    });

    // Scroll to the date section directly
    if (scrollContainerRef.current) {
      // Small delay to ensure DOM is updated after state change
      requestAnimationFrame(() => {
        const dateSection = document.querySelector(
          `[data-date-section="true"][data-date="${formattedDate}"]`,
        );

        if (dateSection && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const sectionRect = dateSection.getBoundingClientRect();

          // Calculate the scroll position relative to the container
          const scrollOffset =
            sectionRect.top - containerRect.top + container.scrollTop;

          // For the last item, we may need to scroll to maximum possible
          const maxScroll = container.scrollHeight - container.clientHeight;
          const targetScroll = Math.max(0, scrollOffset - 80); // Offset for sticky header

          // Use instant scroll instead of smooth to avoid blank page effect
          container.scrollTo({
            top: Math.min(targetScroll, maxScroll),
            behavior: "instant",
          });
        }
      });
    }
  };

  const isNavigationDisabled = (direction) => {
    if (
      !groupedExpenses.availableDates ||
      groupedExpenses.availableDates.length === 0
    )
      return true;

    if (!currentHeader.date) return true; // Changed from false to true

    const chronologicalDates = [...groupedExpenses.availableDates].sort(
      (a, b) => a.localeCompare(b),
    );

    const parsedDate = dayjs(currentHeader.date, dateFormat);
    if (!parsedDate.isValid()) return true; // Changed from false to true

    const currentDateStr = parsedDate.format("YYYY-MM-DD");
    const currentIndex = chronologicalDates.indexOf(currentDateStr);

    if (currentIndex === -1) return true; // Changed from false to true

    // Check boundaries based on sort order
    if (sortOrder === "asc") {
      // Old First: up goes to older (first), down goes to newer (last)
      if (direction === "prev") {
        return currentIndex === 0; // At oldest date
      } else {
        return currentIndex === chronologicalDates.length - 1; // At newest date
      }
    } else {
      // Recent First: up goes to newer (last), down goes to older (first)
      if (direction === "prev") {
        return currentIndex === chronologicalDates.length - 1; // At newest date
      } else {
        return currentIndex === 0; // At oldest date
      }
    }
  };

  const navigateToMonth = (direction) => {
    if (!groupedExpenses.groups) return;

    // Get all available months sorted chronologically
    const availableMonths = [];
    Object.keys(groupedExpenses.groups || {}).forEach((year) => {
      Object.keys(groupedExpenses.groups[year]).forEach((month) => {
        availableMonths.push({ year, month });
      });
    });

    // Sort by year and month
    availableMonths.sort((a, b) => {
      const dateA = dayjs(`${a.month}`, "MMMM YYYY");
      const dateB = dayjs(`${b.month}`, "MMMM YYYY");
      return dateA.valueOf() - dateB.valueOf();
    });

    if (availableMonths.length === 0) return;

    // Find current month index
    const currentMonthKey = `${currentHeader.year}-${currentHeader.month}`;
    const currentIndex = availableMonths.findIndex(
      (m) => `${m.year}-${m.month}` === currentMonthKey,
    );

    let targetIndex;
    if (currentIndex === -1) {
      targetIndex = sortOrder === "asc" ? 0 : availableMonths.length - 1;
    } else {
      if (sortOrder === "asc") {
        if (direction === "next") {
          targetIndex =
            currentIndex < availableMonths.length - 1
              ? currentIndex + 1
              : currentIndex;
        } else {
          targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        }
      } else {
        if (direction === "next") {
          targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        } else {
          targetIndex =
            currentIndex < availableMonths.length - 1
              ? currentIndex + 1
              : currentIndex;
        }
      }
    }

    if (targetIndex === currentIndex && currentIndex !== -1) return;

    const targetMonth = availableMonths[targetIndex];

    if (!targetMonth) return;

    // Get the first date in this month to update the header
    const monthData =
      groupedExpenses.groups[targetMonth.year]?.[targetMonth.month];
    let firstDateInMonth = null;

    if (monthData) {
      // Get all dates in this month sorted by the current sort order
      const allDatesInMonth = [];
      Object.keys(monthData).forEach((week) => {
        Object.keys(monthData[week]).forEach((dateKey) => {
          allDatesInMonth.push({
            dateKey,
            week,
            displayDate: monthData[week][dateKey].displayDate,
          });
        });
      });

      // Sort dates: for desc (recent first), get the most recent date; for asc (old first), get the oldest date
      allDatesInMonth.sort((a, b) =>
        sortOrder === "desc"
          ? b.dateKey.localeCompare(a.dateKey)
          : a.dateKey.localeCompare(b.dateKey),
      );

      if (allDatesInMonth.length > 0) {
        firstDateInMonth = allDatesInMonth[0];
      }
    }

    // Update header state immediately before scrolling
    setCurrentHeader({
      year: targetMonth.year,
      month: targetMonth.month,
      week: firstDateInMonth?.week || "",
      date: firstDateInMonth?.displayDate || "",
    });

    // Scroll to first date section of the target month
    if (scrollContainerRef.current) {
      // Small delay to ensure DOM is updated after state change
      requestAnimationFrame(() => {
        const monthSection = document.querySelector(
          `[data-year="${targetMonth.year}"][data-month="${targetMonth.month}"]`,
        );

        if (monthSection && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const containerRect = container.getBoundingClientRect();
          const sectionRect = monthSection.getBoundingClientRect();

          // Calculate the scroll position relative to the container
          const scrollOffset =
            sectionRect.top - containerRect.top + container.scrollTop;

          // For the last item, we may need to scroll to maximum possible
          const maxScroll = container.scrollHeight - container.clientHeight;
          const targetScroll = Math.max(0, scrollOffset - 80);

          container.scrollTo({
            top: Math.min(targetScroll, maxScroll),
            behavior: "instant",
          });
        }
      });
    }
  };

  const isMonthNavigationDisabled = (direction) => {
    if (!groupedExpenses.groups) return true;
    if (!currentHeader.month || !currentHeader.year) return true; // Changed from false to true

    const availableMonths = [];
    Object.keys(groupedExpenses.groups || {}).forEach((year) => {
      Object.keys(groupedExpenses.groups[year]).forEach((month) => {
        availableMonths.push({ year, month });
      });
    });

    if (availableMonths.length === 0) return true;

    // Sort by year and month
    availableMonths.sort((a, b) => {
      const dateA = dayjs(`${a.month}`, "MMMM YYYY");
      const dateB = dayjs(`${b.month}`, "MMMM YYYY");
      return dateA.valueOf() - dateB.valueOf();
    });

    const currentMonthKey = `${currentHeader.year}-${currentHeader.month}`;
    const currentIndex = availableMonths.findIndex(
      (m) => `${m.year}-${m.month}` === currentMonthKey,
    );

    if (currentIndex === -1) return true; // Changed from false to true

    // Check boundaries based on sort order
    if (sortOrder === "asc") {
      // Old First: prev goes to older, next goes to newer
      return direction === "prev"
        ? currentIndex === 0
        : currentIndex === availableMonths.length - 1;
    } else {
      // Recent First: prev goes to newer, next goes to older
      return direction === "prev"
        ? currentIndex === availableMonths.length - 1
        : currentIndex === 0;
    }
  };

  // Group expenses by Year > Month > Week > Date
  const groupedExpenses = useMemo(() => {
    if (!data || data.length === 0) return {};

    const groups = {};
    let latestDate = null;
    let oldestDate = null;
    let latestTimestamp = 0;
    let oldestTimestamp = Infinity;
    const availableDatesSet = new Set();

    data.forEach((expense, idx) => {
      const sourceIndex =
        typeof expense.__sourceIndex === "number"
          ? expense.__sourceIndex
          : typeof expense.originalIndex === "number"
            ? expense.originalIndex
            : idx;
      const dt = expense.date || expense.expense?.date;
      if (!dt || !dayjs(dt).isValid()) return;

      const date = dayjs(dt);
      const year = date.year();
      const month = date.format("MMMM YYYY");
      const weekNum = date.week();
      const weekLabel = `Week ${weekNum}`;
      const dateKey = date.format("YYYY-MM-DD");

      // Add to available dates
      availableDatesSet.add(dateKey);

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = {};
      if (!groups[year][month][weekLabel]) groups[year][month][weekLabel] = {};
      if (!groups[year][month][weekLabel][dateKey]) {
        groups[year][month][weekLabel][dateKey] = {
          displayDate: date.format(dateFormat),
          expenses: [],
        };

        // Capture both latest and oldest date info
        const timestamp = date.valueOf();
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestDate = {
            year: year.toString(),
            month: month,
            week: weekLabel,
            date: date.format(dateFormat),
          };
        }
        if (timestamp < oldestTimestamp) {
          oldestTimestamp = timestamp;
          oldestDate = {
            year: year.toString(),
            month: month,
            week: weekLabel,
            date: date.format(dateFormat),
          };
        }
      }

      groups[year][month][weekLabel][dateKey].expenses.push({
        ...expense,
        originalIndex: sourceIndex,
      });
    });

    return {
      groups,
      firstDate: latestDate,
      lastDate: oldestDate,
      availableDates: Array.from(availableDatesSet),
      minDate: oldestDate ? dayjs(oldestDate.date, dateFormat) : null,
      maxDate: latestDate ? dayjs(latestDate.date, dateFormat) : null,
    };
  }, [data, dateFormat]);

  // Get available months in current year for dropdown
  const availableMonthsInYear = useMemo(() => {
    if (!groupedExpenses.groups || !currentHeader.year) return [];

    const currentYear = currentHeader.year;
    const yearData = groupedExpenses.groups[currentYear];

    if (!yearData) return [];

    return Object.keys(yearData)
      .map((month) => ({
        year: currentYear,
        month: month,
        monthOnly: month, // Keep full "November 2025" format
      }))
      .sort((a, b) => {
        const dateA = dayjs(a.month, "MMMM YYYY");
        const dateB = dayjs(b.month, "MMMM YYYY");
        return dateA.valueOf() - dateB.valueOf();
      });
  }, [groupedExpenses.groups, currentHeader.year]);

  // Update header when data changes or sort order changes
  useEffect(() => {
    const headerDate =
      sortOrder === "desc"
        ? groupedExpenses.firstDate
        : groupedExpenses.lastDate;
    if (headerDate) {
      setCurrentHeader(headerDate);
    }
  }, [groupedExpenses.firstDate, groupedExpenses.lastDate, sortOrder]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      savedScrollPositionRef.current = container.scrollTop;

      // Check scroll position for button visibility (800px threshold)
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      setShowScrollTop(scrollTop > 800);
      setShowScrollBottom(scrollBottom > 800 && scrollTop > 800);

      // Update sticky header based on scroll position
      const sections = container.querySelectorAll("[data-date-section]");
      let foundHeader = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Check if section is visible in viewport (with better detection for last items)
        if (
          rect.top <= containerRect.top + 100 &&
          rect.bottom > containerRect.top + 50
        ) {
          foundHeader = {
            year: section.dataset.year,
            month: section.dataset.month,
            week: section.dataset.week,
            date: section.dataset.date,
          };
        }
      });

      // If we're near the bottom and no header was found, use the last section
      if (!foundHeader && sections.length > 0) {
        const scrollBottom = container.scrollTop + container.clientHeight;
        const scrollHeight = container.scrollHeight;

        if (scrollHeight - scrollBottom < 50) {
          const lastSection = sections[sections.length - 1];
          foundHeader = {
            year: lastSection.dataset.year,
            month: lastSection.dataset.month,
            week: lastSection.dataset.week,
            date: lastSection.dataset.date,
          };
        }
      }

      if (foundHeader) {
        setCurrentHeader(foundHeader);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Set initial header only once when component mounts or data first loads
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Memoized edit handler to prevent re-renders - MUST be before early returns
  const handleEdit = useCallback(
    async (row) => {
      dispatch(
        getListOfBudgetsByExpenseId({
          id: row.id || row.expenseId,
          date: dayjs().format("YYYY-MM-DD"),
          friendId: friendId || null,
        }),
      );
      const expensedata = await dispatch(
        getExpenseAction(row.id, friendId || ""),
      );
      const bill = expensedata.bill
        ? await dispatch(getBillByExpenseId(row.id, friendId || ""))
        : false;
      if (expensedata.bill) {
        navigate(
          isFriendView
            ? `/bill/edit/${bill.id}/friend/${friendId}`
            : `/bill/edit/${bill.id}`,
        );
      } else {
        navigate(
          isFriendView
            ? `/expenses/edit/${row.id}/friend/${friendId}`
            : `/expenses/edit/${row.id}`,
        );
      }
    },
    [
      dispatch,
      friendId,
      isFriendView,
      navigate,
      getListOfBudgetsByExpenseId,
      getExpenseAction,
      getBillByExpenseId,
    ],
  );

  // Memoized card click handler wrapper - MUST be before early returns
  const handleCardClickWrapper = useCallback(
    (sourceIndex, row, event) => {
      event.preventDefault();
      event.stopPropagation();
      const isCurrentlySelected = selectedIndicesSet.has(sourceIndex);
      const shouldPreserveScroll = isCurrentlySelected;

      manualSelectionChangeRef.current = {
        active: true,
        preserveScroll: shouldPreserveScroll,
        focusCardIndex: sourceIndex,
      };

      if (shouldPreserveScroll) {
        suppressAutoScrollTemporarily();
      } else {
        if (autoScrollResetTimeoutRef.current) {
          clearTimeout(autoScrollResetTimeoutRef.current);
          autoScrollResetTimeoutRef.current = null;
        }
        autoScrollSuppressedRef.current = false;
      }

      const container = scrollContainerRef.current;

      if (container) {
        const scrollBeforeClick = container.scrollTop;
        savedScrollPositionRef.current = scrollBeforeClick;

        handleCardClick(sourceIndex, event);

        if (shouldPreserveScroll) {
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = scrollBeforeClick;
            }
          });

          setTimeout(() => {
            if (container) {
              container.scrollTop = scrollBeforeClick;
            }
          }, 0);

          setTimeout(() => {
            if (container) {
              container.scrollTop = scrollBeforeClick;
            }
          }, 10);

          setTimeout(() => {
            if (container) {
              container.scrollTop = scrollBeforeClick;
            }
          }, 50);
        }
      } else {
        handleCardClick(sourceIndex, event);
      }
    },
    [selectedIndicesSet, suppressAutoScrollTemporarily, handleCardClick],
  );

  /**
   * Render expense card using the memoized ExpenseCard component
   * This reduces re-renders by isolating each card's state
   * MUST be before early returns
   */
  const renderExpenseCard = useCallback(
    (row, idx) => {
      const sourceIndex =
        typeof row.originalIndex === "number" ? row.originalIndex : idx;
      const isSelected = selectedIndicesSet.has(sourceIndex);

      return (
        <ExpenseCard
          key={row.id || row.expenseId || `expense-${idx}`}
          row={row}
          idx={idx}
          sourceIndex={sourceIndex}
          isSelected={isSelected}
          flowTab={flowTab}
          isMobile={isMobile}
          isTablet={isTablet}
          hasWriteAccess={hasWriteAccess}
          formatNumberFull={formatNumberFull}
          normalizedSelectedCardIdx={normalizedSelectedCardIdx}
          selectedIndicesSet={selectedIndicesSet}
          handleCardClick={handleCardClickWrapper}
          handleDeleteClick={handleDeleteClick}
          onEdit={handleEdit}
        />
      );
    },
    [
      selectedIndicesSet,
      flowTab,
      isMobile,
      isTablet,
      hasWriteAccess,
      formatNumberFull,
      normalizedSelectedCardIdx,
      handleCardClickWrapper,
      handleDeleteClick,
      handleEdit,
    ],
  );

  const wrapperClass = "custom-scrollbar";

  const wrapperStyle = {
    maxHeight: isMobile ? 500 : isTablet ? 280 : 360,
    overflowY: "auto",
    overflowX: "hidden",
    paddingBottom: 40,
    scrollBehavior: "auto",
    overflowAnchor: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  };

  if (loading && !search && data.length === 0) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <CashFlowExpenseCardsSkeleton />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <NoDataPlaceholder
          size={isMobile ? "lg" : "fill"}
          fullWidth
          iconSize={isMobile ? 54 : 72}
          style={{ minHeight: isMobile ? 260 : 340 }}
          message={
            search
              ? t("cashflow.messages.noMatches")
              : t("cashflow.messages.noData")
          }
          subMessage={
            search
              ? t("cashflow.messages.searchSuggestion")
              : t("cashflow.messages.adjustPeriod")
          }
        />
      </div>
    );
  }

  const selectionNavigatorLabel = hasMultipleSelections
    ? t("cashflow.labels.selectionCounter", {
        current: selectedNavigatorIndex + 1,
        total: normalizedSelectedCardIdx.length,
      })
    : "";

  const getWeekSortValue = (yearKey, monthKey, weekKey) => {
    const weekGroups = groupedExpenses.groups?.[yearKey]?.[monthKey]?.[weekKey];

    if (!weekGroups) {
      return Number.NEGATIVE_INFINITY;
    }

    return Object.keys(weekGroups).reduce((latest, dateKey) => {
      const parsedDate = dayjs(dateKey);
      if (!parsedDate.isValid()) {
        return latest;
      }

      const timestamp = parsedDate.valueOf();
      return timestamp > latest ? timestamp : latest;
    }, Number.NEGATIVE_INFINITY);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Hide scrollbar with CSS */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .selected-card-focus {
            box-shadow: 0 0 0 2px var(--selection-outline-color, ${colors.primary_accent}) inset,
              0 6px 18px rgba(0, 0, 0, 0.12) !important;
          }
        `}
      </style>

      {/* Scroll to Top Button - Fixed within parent container */}
      {showScrollTop && (
        <IconButton
          onClick={scrollToTop}
          size="small"
          sx={{
            position: "absolute",
            top: "70px",
            right: "5px",
            width: "28px",
            height: "28px",
            background: `${colors.primary_accent}15`,
            border: `1px solid ${colors.primary_accent}40`,
            color: colors.primary_accent,
            zIndex: 9,
            transition: "all 0.2s ease",
            "&:hover": {
              background: `${colors.primary_accent}25`,
              transform: "scale(1.1)",
            },
          }}
          title={t("cashflow.tooltips.scrollTop")}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      {/* Scroll to Bottom Button - Fixed within parent container */}
      {showScrollBottom && (
        <IconButton
          onClick={scrollToBottom}
          size="small"
          sx={{
            position: "absolute",
            bottom: "10px",
            right: "5px",
            width: "28px",
            height: "28px",
            background: `${colors.primary_accent}15`,
            border: `1px solid ${colors.primary_accent}40`,
            color: colors.primary_accent,
            zIndex: 9,
            transition: "all 0.2s ease",
            "&:hover": {
              background: `${colors.primary_accent}25`,
              transform: "scale(1.1)",
            },
          }}
          title={t("cashflow.tooltips.scrollBottom")}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      <div
        ref={scrollContainerRef}
        className={wrapperClass}
        style={{
          ...wrapperStyle,
          position: "relative",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Fixed Sticky Header - Always visible */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: "12px",
            padding: "10px 16px",
            background: colors.primary_bg,
            borderRadius: "8px",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(10px)",
            boxShadow: `0 2px 8px ${colors.primary_bg}dd`,
            marginBottom: "16px",
            transition: "none",
            border: `1px solid ${colors.border_color}`,
          }}
        >
          {/* Left Side - Month with Navigation Arrows */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Previous Month Arrow - Hide for month/week view */}
            {activeRange !== "month" && activeRange !== "week" && (
              <IconButton
                onClick={() => navigateToMonth("prev")}
                disabled={isMonthNavigationDisabled("prev")}
                size="small"
                sx={{
                  width: "28px",
                  height: "28px",
                  background: `${colors.primary_accent}15`,
                  border: `1px solid ${colors.primary_accent}40`,
                  color: colors.primary_accent,
                  "&:hover": {
                    background: `${colors.primary_accent}25`,
                    transform: "scale(1.1)",
                  },
                  "&:disabled": {
                    background: `${colors.secondary_bg}`,
                    border: `1px solid ${colors.border_color}`,
                    color: `${colors.secondary_text}`,
                    opacity: 0.5,
                    cursor: "not-allowed",
                  },
                  transition: "all 0.2s ease",
                }}
                title={t("cashflow.tooltips.previousMonth")}
              >
                <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            {/* Month Badge - Clickable only in year view */}
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: colors.primary_accent,
                padding: "6px 16px",
                borderRadius: "20px",
                background: `${colors.primary_accent}15`,
                border: `1px solid ${colors.primary_accent}40`,
                minWidth: "130px",
                textAlign: "center",
                cursor: activeRange === "year" ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
              onClick={activeRange === "year" ? handleMonthClick : undefined}
              onMouseEnter={
                activeRange === "year"
                  ? (e) => {
                      e.currentTarget.style.background = `${colors.primary_accent}25`;
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  : undefined
              }
              onMouseLeave={
                activeRange === "year"
                  ? (e) => {
                      e.currentTarget.style.background = `${colors.primary_accent}15`;
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  : undefined
              }
              title={
                activeRange === "year"
                  ? t("cashflow.tooltips.selectMonth")
                  : currentHeader.month || t("cashflow.labels.monthPlaceholder")
              }
            >
              {currentHeader.month || t("cashflow.labels.monthPlaceholder")}
            </div>

            {/* Month Picker Dropdown - Only show in year view */}
            {activeRange === "year" && (
              <MonthPickerDropdown
                anchorEl={monthPickerAnchor}
                open={Boolean(monthPickerAnchor)}
                onClose={handleMonthPickerClose}
                availableMonths={availableMonthsInYear}
                currentMonth={currentHeader.month}
                onMonthSelect={handleMonthSelect}
              />
            )}

            {/* Next Month Arrow - Hide for month/week view */}
            {activeRange !== "month" && activeRange !== "week" && (
              <IconButton
                onClick={() => navigateToMonth("next")}
                disabled={isMonthNavigationDisabled("next")}
                size="small"
                sx={{
                  width: "28px",
                  height: "28px",
                  background: `${colors.primary_accent}15`,
                  border: `1px solid ${colors.primary_accent}40`,
                  color: colors.primary_accent,
                  "&:hover": {
                    background: `${colors.primary_accent}25`,
                    transform: "scale(1.1)",
                  },
                  "&:disabled": {
                    background: `${colors.secondary_bg}`,
                    border: `1px solid ${colors.border_color}`,
                    color: `${colors.secondary_text}`,
                    opacity: 0.5,
                    cursor: "not-allowed",
                  },
                  transition: "all 0.2s ease",
                }}
                title={t("cashflow.tooltips.nextMonth")}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </div>

          {/* Center - Date with Navigation Arrows */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Previous Date Arrow */}
            <IconButton
              onClick={() => navigateToDate("prev")}
              disabled={isNavigationDisabled("prev")}
              size="small"
              sx={{
                width: "28px",
                height: "28px",
                background: `${colors.primary_accent}15`,
                border: `1px solid ${colors.primary_accent}40`,
                color: colors.primary_accent,
                "&:hover": {
                  background: `${colors.primary_accent}25`,
                  transform: "scale(1.1)",
                },
                "&:disabled": {
                  background: `${colors.secondary_bg}`,
                  border: `1px solid ${colors.border_color}`,
                  color: `${colors.secondary_text}`,
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
                transition: "all 0.2s ease",
              }}
              title={t("cashflow.tooltips.previousDate")}
            >
              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Date Badge */}
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: colors.primary_accent,
                background: `${colors.primary_accent}15`,
                padding: "6px 16px",
                borderRadius: "20px",
                border: `1px solid ${colors.primary_accent}40`,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={handleDateClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${colors.primary_accent}25`;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${colors.primary_accent}15`;
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={t("cashflow.tooltips.selectDate")}
            >
              {currentHeader.date || t("cashflow.labels.datePlaceholder")}
            </div>

            {/* Next Date Arrow */}
            <IconButton
              onClick={() => navigateToDate("next")}
              disabled={isNavigationDisabled("next")}
              size="small"
              sx={{
                width: "28px",
                height: "28px",
                background: `${colors.primary_accent}15`,
                border: `1px solid ${colors.primary_accent}40`,
                color: colors.primary_accent,
                "&:hover": {
                  background: `${colors.primary_accent}25`,
                  transform: "scale(1.1)",
                },
                "&:disabled": {
                  background: `${colors.secondary_bg}`,
                  border: `1px solid ${colors.border_color}`,
                  color: `${colors.secondary_text}`,
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
                transition: "all 0.2s ease",
              }}
              title={t("cashflow.tooltips.nextDate")}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>

          {/* Date Picker Popover */}
          <DatePickerPopover
            open={Boolean(datePickerAnchor)}
            anchorEl={datePickerAnchor}
            onClose={handleDatePickerClose}
            value={selectedDate}
            onChange={handleDateChange}
            format={dateFormat}
            availableDates={groupedExpenses.availableDates}
            minDate={groupedExpenses.minDate}
            maxDate={groupedExpenses.maxDate}
          />

          {/* Right Side - Selection Navigator & Sort Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: isMobile ? "wrap" : "nowrap",
              justifyContent: isMobile ? "space-between" : "flex-end",
              marginLeft: "auto",
            }}
          >
            {hasMultipleSelections && (
              <SelectionNavigator
                label={selectionNavigatorLabel}
                onNavigate={handleSelectionNavigate}
                disablePrev={selectedNavigatorIndex === 0}
                disableNext={
                  selectedNavigatorIndex ===
                  normalizedSelectedCardIdx.length - 1
                }
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "20px",
                background: `${colors.primary_accent}15`,
                border: `1px solid ${colors.primary_accent}40`,
                transition: "all 0.3s ease",
              }}
              onClick={toggleSortOrder}
              title={
                sortOrder === "desc"
                  ? t("cashflow.tooltips.sortAscending")
                  : t("cashflow.tooltips.sortDescending")
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${colors.primary_accent}25`;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${colors.primary_accent}15`;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {sortOrder === "desc" ? (
                <AccessTimeIcon
                  sx={{
                    fontSize: 16,
                    color: colors.primary_accent,
                    transition: "all 0.3s ease-in-out",
                  }}
                />
              ) : (
                <HistoryIcon
                  sx={{
                    fontSize: 16,
                    color: colors.primary_accent,
                    transition: "all 0.3s ease-in-out",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: colors.primary_accent,
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                {sortOrder === "desc"
                  ? t("cashflow.labels.recentFirst")
                  : t("cashflow.labels.oldFirst")}
              </span>
            </div>
          </div>
        </div>

        {Object.keys(groupedExpenses.groups || {})
          .sort((a, b) => (sortOrder === "desc" ? b - a : a - b))
          .map((year, yearIndex) => (
            <div key={year} style={{ marginBottom: "32px" }}>
              {/* Months in Year */}
              {Object.keys(groupedExpenses.groups[year])
                .sort((a, b) =>
                  sortOrder === "desc"
                    ? dayjs(b, "MMMM YYYY").valueOf() -
                      dayjs(a, "MMMM YYYY").valueOf()
                    : dayjs(a, "MMMM YYYY").valueOf() -
                      dayjs(b, "MMMM YYYY").valueOf(),
                )
                .map((month, monthIndex) => (
                  <div key={month} style={{ marginBottom: "24px" }}>
                    {/* Weeks in Month */}
                    {Object.keys(groupedExpenses.groups[year][month])
                      .sort((weekA, weekB) => {
                        const tsA = getWeekSortValue(year, month, weekA);
                        const tsB = getWeekSortValue(year, month, weekB);
                        return sortOrder === "desc" ? tsB - tsA : tsA - tsB;
                      })
                      .map((week, weekIndex) => (
                        <div key={week} style={{ marginBottom: "18px" }}>
                          {/* Dates in Week */}
                          {Object.keys(
                            groupedExpenses.groups[year][month][week],
                          )
                            .sort((a, b) =>
                              sortOrder === "desc"
                                ? b.localeCompare(a)
                                : a.localeCompare(b),
                            )
                            .map((dateKey, dateIndex) => {
                              const dateGroup =
                                groupedExpenses.groups[year][month][week][
                                  dateKey
                                ];
                              const isFirstDate =
                                yearIndex === 0 &&
                                monthIndex === 0 &&
                                weekIndex === 0 &&
                                dateIndex === 0;

                              return (
                                <div
                                  key={dateKey}
                                  data-date-section="true"
                                  data-year={year}
                                  data-month={month}
                                  data-week={week}
                                  data-date={dateGroup.displayDate}
                                  style={{
                                    marginBottom: "20px",
                                  }}
                                >
                                  {/* Date Divider with Horizontal Lines - Skip for first date */}
                                  {!isFirstDate && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        marginBottom: "16px",
                                        width: "100%",
                                      }}
                                    >
                                      {/* Left Line */}
                                      <div
                                        style={{
                                          flex: 1,
                                          height: "2px",
                                          background: `linear-gradient(to right, transparent, ${colors.primary_accent}60)`,
                                        }}
                                      />

                                      {/* Date Label */}
                                      <div
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: "600",
                                          color: colors.primary_accent,
                                          background: `${colors.primary_accent}15`,
                                          padding: "6px 16px",
                                          borderRadius: "20px",
                                          whiteSpace: "nowrap",
                                          border: `1px solid ${colors.primary_accent}40`,
                                        }}
                                      >
                                        {dateGroup.displayDate}
                                      </div>

                                      {/* Right Line */}
                                      <div
                                        style={{
                                          flex: 1,
                                          height: "2px",
                                          background: `linear-gradient(to left, transparent, ${colors.primary_accent}60)`,
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Expenses Grid */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "16px",
                                      marginTop: "8px",
                                      paddingBottom: "16px",
                                      borderBottom: `1px dashed ${colors.border_color}50`,
                                    }}
                                  >
                                    {dateGroup.expenses.map((expense) =>
                                      renderExpenseCard(
                                        expense,
                                        expense.originalIndex,
                                      ),
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default React.memo(CashFlowExpenseCards);
