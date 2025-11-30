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
import NoDataPlaceholder from "../../components/NoDataPlaceholder"; // adjust path if needed
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMasking } from "../../hooks/useMasking";
import { formatPaymentMethodName } from "../../utils/paymentMethodUtils";

dayjs.extend(weekOfYear);

/**
 * Reusable expense cards list for CashFlow page.
 * Keeps purely presentational logic; side-effect actions passed via callbacks/props.
 */
export default function CashFlowExpenseCards({
  data = [],
  loading,
  search,
  selectedCardIdx = [],
  flowTab,
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
  const scrollContainerRef = useRef(null);
  const savedScrollPositionRef = useRef(0);
  const [sortOrder, setSortOrder] = React.useState("desc"); // "asc" or "desc"
  const [currentHeader, setCurrentHeader] = React.useState({
    year: "",
    month: "",
    week: "",
    date: "",
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Group expenses by Year > Month > Week > Date
  const groupedExpenses = useMemo(() => {
    if (!data || data.length === 0) return {};

    const groups = {};
    let latestDate = null;
    let oldestDate = null;
    let latestTimestamp = 0;
    let oldestTimestamp = Infinity;

    data.forEach((expense, idx) => {
      const dt = expense.date || expense.expense?.date;
      if (!dt || !dayjs(dt).isValid()) return;

      const date = dayjs(dt);
      const year = date.year();
      const month = date.format("MMMM YYYY");
      const weekNum = date.week();
      const weekLabel = `Week ${weekNum}`;
      const dateKey = date.format("YYYY-MM-DD");

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
        originalIndex: idx,
      });
    });

    return { groups, firstDate: latestDate, lastDate: oldestDate };
  }, [data, dateFormat]);

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

  // Save scroll position on user scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      savedScrollPositionRef.current = container.scrollTop;

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
    paddingRight: isMobile ? 6 : isTablet ? 8 : 16,
    paddingBottom: 40,
    scrollBehavior: "auto",
    overflowAnchor: "none",
  };

  if (loading && !search && data.length === 0) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width={340}
            height={155}
            animation="wave"
            sx={{ bgcolor: colors.hover_bg, borderRadius: 2 }}
            style={{ minWidth: 220, maxWidth: 340, margin: "0 8px 16px 0" }}
          />
        ))}
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
          message={search ? "No matches" : "No data found"}
          subMessage={
            search
              ? "Try a different search term"
              : "Adjust filters or change the period"
          }
        />
      </div>
    );
  }

  const renderExpenseCard = (row, idx) => {
    const isSelected = selectedCardIdx.includes(idx);
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
      "Uncategorized";
    const rawPaymentMethod =
      row.paymentMethodName ||
      row.paymentMethod?.name ||
      row.paymentMethod ||
      row.expense?.paymentMethod ||
      "Unknown";
    const paymentMethodName = formatPaymentMethodName(rawPaymentMethod);
    const isBill = row.bill === true;

    return (
      <div
        key={row.id || row.expenseId || `expense-${idx}`}
        className="rounded-lg shadow-md flex flex-col justify-between relative group"
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
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          // Save current scroll position BEFORE handling click
          const container = scrollContainerRef.current;
          const scrollPos = container ? container.scrollTop : 0;

          // Prevent any scroll behavior
          if (event.target && event.target.blur) {
            event.target.blur();
          }

          // Handle the click
          handleCardClick(idx, event);

          // Restore scroll position immediately after click
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = scrollPos;
              savedScrollPositionRef.current = scrollPos;
            }
          });

          // Double-check after a short delay
          setTimeout(() => {
            if (container && container.scrollTop !== scrollPos) {
              container.scrollTop = scrollPos;
            }
          }, 0);
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
                    ? "Amount masked"
                    : `Amount: ${formatNumberFull(row.amount)}`
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
                title="This is a bill expense"
              >
                <ReceiptIcon sx={{ fontSize: 10, color: "#fff" }} />
                Bill
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
              title={`Category: ${categoryName}`}
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
              title={`Payment: ${paymentMethodName}`}
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
            {row.comments || "No comments"}
          </div>
        </div>
        {isSelected && selectedCardIdx.length === 1 && hasWriteAccess && (
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
              aria-label="Edit Expense"
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
              aria-label="Delete Expense"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className={wrapperClass}
      style={{
        ...wrapperStyle,
        position: "relative",
      }}
      onMouseLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (scrollContainerRef.current) {
          const savedPos = savedScrollPositionRef.current;
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = savedPos;
            }
          }, 0);
        }
      }}
      onClick={(e) => {
        if (scrollContainerRef.current) {
          savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
        }
      }}
    >
      {/* Fixed Sticky Header - Always visible */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        {/* Left Side - Month */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: colors.primary_accent,
            padding: "6px 16px",
            borderRadius: "20px",
            background: `${colors.primary_accent}15`,
            border: `1px solid ${colors.primary_accent}40`,
          }}
        >
          {currentHeader.month || "Month"}
        </div>

        {/* Center - Date */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: colors.primary_accent,
            background: `${colors.primary_accent}15`,
            padding: "6px 16px",
            borderRadius: "20px",
            border: `1px solid ${colors.primary_accent}40`,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {currentHeader.date || "Date"}
        </div>

        {/* Right Side - Sort Toggle */}
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
              ? "Sort by Oldest First (Ascending Order)"
              : "Sort by Newest First (Descending Order)"
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
            {sortOrder === "desc" ? "Recent First" : "Old First"}
          </span>
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
                        {Object.keys(groupedExpenses.groups[year][month][week])
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
                                Object.keys(groupedExpenses.groups[year]).sort(
                                  (a, b) =>
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
  );
}
