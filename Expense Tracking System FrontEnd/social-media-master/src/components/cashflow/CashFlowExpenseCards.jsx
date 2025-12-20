import React, { useRef, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Skeleton, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
import { formatPaymentMethodName } from "../../utils/paymentMethodUtils";
import { useTranslation } from "../../hooks/useTranslation";
import SelectionNavigator from "./SelectionNavigator";

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
  const { maskAmount, isMasking } = useMasking();
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
    [normalizedSelectedCardIdx]
  );

  const hasSelections = normalizedSelectedCardIdx.length > 0;
  const hasMultipleSelections = normalizedSelectedCardIdx.length > 1;

  const scrollToCardByIndex = React.useCallback(
    (cardIndex, behavior = "smooth") => {
      if (typeof cardIndex !== "number") return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const targetCard = container.querySelector(
        `[data-card-index="${cardIndex}"]`
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
    []
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
          prevLength === 0 ? "auto" : "smooth"
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

      setSelectedNavigatorIndex((prev) => {
        const isPrev = direction === "prev";
        const isAtBoundary = isPrev
          ? prev === 0
          : prev === normalizedSelectedCardIdx.length - 1;

        if (isAtBoundary) {
          return prev;
        }

        const nextIndex = isPrev ? prev - 1 : prev + 1;
        const targetCardIndex = normalizedSelectedCardIdx[nextIndex];
        scrollToCardByIndex(targetCardIndex);
        return nextIndex;
      });
    },
    [
      hasSelections,
      normalizedSelectedCardIdx,
      scrollToCardByIndex,
      suppressAutoScrollTemporarily,
    ]
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
    // Find first date section of the selected month
    if (scrollContainerRef.current) {
      const monthSection = document.querySelector(
        `[data-year="${year}"][data-month="${month}"]`
      );

      if (monthSection) {
        const container = scrollContainerRef.current;
        const sectionTop = monthSection.offsetTop;
        container.scrollTo({
          top: sectionTop - 80,
          behavior: "smooth",
        });
      }
    }
    handleMonthPickerClose();
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleDateChange = (newDate) => {
    if (!newDate || !newDate.isValid()) return;

    setSelectedDate(newDate);

    // Find and scroll to the selected date
    const formattedDate = newDate.format(dateFormat);
    const dateSection = document.querySelector(
      `[data-date-section="true"][data-date="${formattedDate}"]`
    );

    if (dateSection && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionTop = dateSection.offsetTop;
      container.scrollTo({
        top: sectionTop - 80, // Offset for sticky header
        behavior: "smooth",
      });
      handleDatePickerClose();
    }
  };

  const navigateToDate = (direction) => {
    if (
      !groupedExpenses.availableDates ||
      groupedExpenses.availableDates.length === 0
    )
      return;

    // Sort dates chronologically (ascending order by actual date)
    const chronologicalDates = [...groupedExpenses.availableDates].sort(
      (a, b) => a.localeCompare(b)
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

    // Scroll to the date section directly
    if (scrollContainerRef.current) {
      const formattedDate = targetDate.format(dateFormat);
      const dateSection = document.querySelector(
        `[data-date-section="true"][data-date="${formattedDate}"]`
      );

      if (dateSection) {
        const container = scrollContainerRef.current;
        const sectionTop = dateSection.offsetTop;
        container.scrollTo({
          top: sectionTop - 80, // Offset for sticky header
          behavior: "smooth",
        });
      }
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
      (a, b) => a.localeCompare(b)
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
      (m) => `${m.year}-${m.month}` === currentMonthKey
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

    // Scroll to first date section of the target month
    if (scrollContainerRef.current && targetMonth) {
      const monthSection = document.querySelector(
        `[data-year="${targetMonth.year}"][data-month="${targetMonth.month}"]`
      );

      if (monthSection) {
        const container = scrollContainerRef.current;
        const sectionTop = monthSection.offsetTop;
        container.scrollTo({
          top: sectionTop - 80,
          behavior: "smooth",
        });
      }
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
      (m) => `${m.year}-${m.month}` === currentMonthKey
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

  const renderExpenseCard = (row, idx) => {
    const sourceIndex =
      typeof row.originalIndex === "number" ? row.originalIndex : idx;
    const isSelected = selectedIndicesSet.has(sourceIndex);
    const type =
      flowTab === "all" ? row.type || row.expense?.type || "outflow" : flowTab;
    const isGain = !(type === "outflow" || type === "loss");
    const amountColor = isGain ? "#06d6a0" : "#ff4d4f";
    const icon = isGain ? (
      <span style={{ color: "#06d6a0", display: "flex", alignItems: "center" }}>
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
    ) : (
      <span style={{ color: "#ff4d4f", display: "flex", alignItems: "center" }}>
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

    const dateValue = (() => {
      const dt = row.date || row.expense?.date;
      const dtStr =
        dt && dayjs(dt).isValid() ? dayjs(dt).format(dateFormat) : "";
      return dtStr;
    })();

    const categoryName =
      row.categoryName ||
      row.category?.name ||
      row.category ||
      row.expense?.category ||
      t("cashflow.labels.uncategorized");
    const rawPaymentMethod =
      row.paymentMethodName ||
      row.paymentMethod?.name ||
      row.paymentMethod ||
      row.expense?.paymentMethod ||
      t("cashflow.labels.unknownPayment");
    const paymentMethodName = formatPaymentMethodName(rawPaymentMethod);
    const isBill = row.bill === true;

    return (
      <div
        key={row.id || row.expenseId || `expense-${idx}`}
        className="rounded-lg shadow-md flex flex-col justify-between relative group"
        data-card-index={sourceIndex}
        style={{
          minHeight: "155px",
          maxHeight: "155px",
          height: "155px",
          width: "100%",
          flex: isMobile
            ? "1 1 100%"
            : isTablet
            ? "0 1 calc(33.333% - 12px)"
            : "0 1 calc(19% - 12.8px)",
          minWidth: isMobile
            ? "100%"
            : isTablet
            ? "180px"
            : "calc(19% - 12.8px)",
          maxWidth: isMobile
            ? "100%"
            : isTablet
            ? "240px"
            : "calc(19% - 12.8px)",
          padding: "10px",
          boxSizing: "border-box",
          overflow: "hidden",
          cursor: "pointer",
          background: isSelected
            ? isGain
              ? "rgba(6, 214, 160, 0.13)"
              : "rgba(255, 77, 79, 0.13)"
            : colors.primary_bg,
          // Changed from "all" to specific properties to prevent layout shifts
          transition:
            "background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease",
          margin: "6px",
          border: isSelected
            ? `2px solid ${isGain ? "#06d6a0" : "#ff4d4f"}`
            : `1px solid ${colors.border_color || "transparent"}`,
          userSelect: "none",
          outline: "none", // Prevent focus outline that triggers scroll
          willChange: "background, border, box-shadow", // Optimize rendering
          contain: "layout style paint", // Isolate layout calculations
          // Removed scale transform to prevent browser auto-scroll
          boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
          "--selection-outline-color": isGain ? "#06d6a0" : "#ff4d4f",
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const isCurrentlySelected = selectedIndicesSet.has(sourceIndex);
          const willClearAll =
            isCurrentlySelected && normalizedSelectedCardIdx.length === 1;
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
        }}
        onFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-1" style={{ height: "100%" }}>
          {/* Header: Expense Name (wrapped) */}
          <div
            className="flex items-center min-w-0 border-b pb-1"
            style={{
              borderColor: colors.border_color,
              marginBottom: "4px",
            }}
          >
            <span
              className="font-bold text-base min-w-0"
              title={row.name}
              style={{
                fontSize: "14px",
                color: colors.primary_text,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.3",
              }}
            >
              {row.name}
            </span>
          </div>

          {/* Amount with Bill Badge */}
          <div
            className="text-xl font-bold flex items-center justify-between gap-1.5"
            style={{ margin: "2px 0" }}
          >
            <div className="flex items-center gap-1.5">
              {icon}
              <span
                style={{
                  color: amountColor,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
                title={
                  row.expense?.masked || (isMasking() && row.amount)
                    ? t("cashflow.labels.amountMasked")
                    : t("cashflow.labels.amountWithValue", {
                        amount: formatNumberFull(row.amount),
                      })
                }
              >
                {row.expense?.masked || (isMasking() && row.amount)
                  ? maskAmount(row.amount)
                  : formatNumberFull(row.amount)}
              </span>
            </div>
            {isBill && (
              <span
                className="flex items-center gap-0.5 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)",
                  color: "#fff",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "0.2px",
                  boxShadow: "0 1px 3px rgba(255, 152, 0, 0.3)",
                  textTransform: "uppercase",
                  lineHeight: "1.1",
                }}
                title={t("cashflow.tooltips.billExpense")}
              >
                <ReceiptIcon sx={{ fontSize: 10, color: "#fff" }} />
                {t("cashflow.labels.billBadge")}
              </span>
            )}
          </div>

          {/* Details: Category & Payment Method */}
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: colors.secondary_text, margin: "2px 0" }}
          >
            <div
              className="flex items-center gap-1 min-w-0 flex-1"
              title={t("cashflow.tooltips.category", {
                category: categoryName,
              })}
            >
              <LocalOfferIcon
                sx={{ fontSize: 13, color: colors.primary_accent }}
              />
              <span
                className="truncate font-medium"
                style={{ fontSize: "10.5px" }}
              >
                {categoryName}
              </span>
            </div>
            <div
              className="flex items-center gap-1 min-w-0 flex-1"
              title={t("cashflow.tooltips.paymentMethod", {
                method: paymentMethodName,
              })}
            >
              <AccountBalanceWalletIcon
                sx={{ fontSize: 13, color: colors.secondary_accent }}
              />
              <span
                className="truncate font-medium"
                style={{ fontSize: "10.5px" }}
              >
                {paymentMethodName}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div
            className="text-xs break-words card-comments-clamp mt-auto pt-1 border-t"
            style={{
              wordBreak: "break-word",
              overflow: "hidden",
              color: colors.secondary_text,
              borderColor: colors.border_color,
              fontStyle: "normal",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontSize: "11px",
              minHeight: "3.1em",
              maxHeight: "3.1em",
            }}
            title={row.comments}
          >
            {row.comments || t("cashflow.labels.noComments")}
          </div>
        </div>
        {isSelected &&
          normalizedSelectedCardIdx.length === 1 &&
          hasWriteAccess && (
            <div
              className="absolute bottom-2 right-2 flex gap-2 opacity-90"
              style={{
                zIndex: 2,
                background: colors.active_bg,
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
                  background: colors.active_bg,
                  borderRadius: 1,
                  boxShadow: 1,
                  "&:hover": { background: colors.hover_bg, color: "#fff" },
                }}
                onClick={async () => {
                  dispatch(
                    getListOfBudgetsByExpenseId({
                      id: row.id || row.expenseId,
                      date: dayjs().format("YYYY-MM-DD"),
                      friendId: friendId || null,
                    })
                  );
                  const expensedata = await dispatch(
                    getExpenseAction(row.id, friendId || "")
                  );
                  const bill = expensedata.bill
                    ? await dispatch(getBillByExpenseId(row.id, friendId || ""))
                    : false;
                  if (expensedata.bill) {
                    navigate(
                      isFriendView
                        ? `/bill/edit/${bill.id}/friend/${friendId}`
                        : `/bill/edit/${bill.id}`
                    );
                  } else {
                    navigate(
                      isFriendView
                        ? `/expenses/edit/${row.id}/friend/${friendId}`
                        : `/expenses/edit/${row.id}`
                    );
                  }
                }}
                aria-label={t("cashflow.actions.editExpense")}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#ff4d4f",
                  p: "4px",
                  background: colors.active_bg,
                  borderRadius: 1,
                  boxShadow: 1,
                  "&:hover": { background: colors.hover_bg, color: "#fff" },
                }}
                onClick={() => handleDeleteClick(row, idx)}
                aria-label={t("cashflow.actions.deleteExpense")}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          )}
      </div>
    );
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
          .map((year) => (
            <div key={year} style={{ marginBottom: "32px" }}>
              {/* Months in Year */}
              {Object.keys(groupedExpenses.groups[year])
                .sort((a, b) =>
                  sortOrder === "desc"
                    ? dayjs(b, "MMMM YYYY").valueOf() -
                      dayjs(a, "MMMM YYYY").valueOf()
                    : dayjs(a, "MMMM YYYY").valueOf() -
                      dayjs(b, "MMMM YYYY").valueOf()
                )
                .map((month) => (
                  <div key={month} style={{ marginBottom: "24px" }}>
                    {/* Weeks in Month */}
                    {Object.keys(groupedExpenses.groups[year][month])
                      .sort((a, b) => {
                        const weekA = parseInt(a.replace("Week ", ""));
                        const weekB = parseInt(b.replace("Week ", ""));
                        return sortOrder === "desc"
                          ? weekB - weekA
                          : weekA - weekB;
                      })
                      .map((week) => (
                        <div key={week} style={{ marginBottom: "18px" }}>
                          {/* Dates in Week */}
                          {Object.keys(
                            groupedExpenses.groups[year][month][week]
                          )
                            .sort((a, b) =>
                              sortOrder === "desc"
                                ? b.localeCompare(a)
                                : a.localeCompare(b)
                            )
                            .map((dateKey, dateIndex, allDates) => {
                              const dateGroup =
                                groupedExpenses.groups[year][month][week][
                                  dateKey
                                ];
                              const isFirstDate =
                                year ===
                                  Object.keys(groupedExpenses.groups).sort(
                                    (a, b) =>
                                      sortOrder === "desc" ? b - a : a - b
                                  )[0] &&
                                month ===
                                  Object.keys(
                                    groupedExpenses.groups[year]
                                  ).sort((a, b) =>
                                    sortOrder === "desc"
                                      ? dayjs(b, "MMMM YYYY").valueOf() -
                                        dayjs(a, "MMMM YYYY").valueOf()
                                      : dayjs(a, "MMMM YYYY").valueOf() -
                                        dayjs(b, "MMMM YYYY").valueOf()
                                  )[0] &&
                                week ===
                                  Object.keys(
                                    groupedExpenses.groups[year][month]
                                  ).sort((a, b) => {
                                    const weekA = parseInt(
                                      a.replace("Week ", "")
                                    );
                                    const weekB = parseInt(
                                      b.replace("Week ", "")
                                    );
                                    return sortOrder === "desc"
                                      ? weekB - weekA
                                      : weekA - weekB;
                                  })[0] &&
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
                                        expense.originalIndex
                                      )
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
