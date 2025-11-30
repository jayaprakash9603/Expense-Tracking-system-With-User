import React, { useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Skeleton, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NoDataPlaceholder from "../../components/NoDataPlaceholder"; // adjust path if needed
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useMasking } from "../../hooks/useMasking";
import { formatPaymentMethodName } from "../../utils/paymentMethodUtils";

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

  // Save scroll position on user scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      savedScrollPositionRef.current = container.scrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const wrapperClass =
    data.length <= 3
      ? "flex items-start gap-4 flex-wrap custom-scrollbar"
      : "grid gap-4 custom-scrollbar";

  const wrapperStyle =
    data.length <= 3
      ? {
          maxHeight: isMobile ? 500 : isTablet ? 280 : 360,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isMobile ? 6 : isTablet ? 8 : 16,
          justifyContent: "flex-start",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 10 : 16,
          scrollBehavior: "auto", // Prevent smooth scroll
          overflowAnchor: "none", // Prevent scroll anchoring
        }
      : {
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "repeat(auto-fit, minmax(180px, 1fr))"
            : "repeat(auto-fit, minmax(260px, 1fr))",
          maxHeight: isMobile ? 420 : isTablet ? 280 : 360,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isMobile ? 6 : isTablet ? 8 : 16,
          gap: isMobile ? 10 : 16,
          scrollBehavior: "auto", // Prevent smooth scroll
          overflowAnchor: "none", // Prevent scroll anchoring
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

  return (
    <div
      ref={scrollContainerRef}
      className={wrapperClass}
      style={wrapperStyle}
      onMouseLeave={(e) => {
        // Prevent any automatic scrolling when mouse leaves
        e.preventDefault();
        e.stopPropagation();
        // Lock scroll position
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
        // Save scroll position immediately on any click
        if (scrollContainerRef.current) {
          savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
        }
      }}
    >
      {data.map((row, idx) => {
        const isSelected = selectedCardIdx.includes(idx);
        // Determine flow type in 'all' mode
        const type =
          flowTab === "all"
            ? row.type || row.expense?.type || "outflow"
            : flowTab;
        const isGain = !(type === "outflow" || type === "loss");
        const amountColor = isGain ? "#06d6a0" : "#ff4d4f";
        const icon = isGain ? (
          <span
            style={{ color: "#06d6a0", display: "flex", alignItems: "center" }}
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
        ) : (
          <span
            style={{ color: "#ff4d4f", display: "flex", alignItems: "center" }}
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
        const isBill = row.bill === true; // Check if this is a bill expense

        return (
          <div
            key={row.id || row.expenseId || `expense-${idx}`}
            className="rounded-lg shadow-md flex flex-col justify-between relative group"
            style={{
              minHeight: "155px",
              maxHeight: "155px",
              height: "155px",
              minWidth: "260px",
              maxWidth: "340px",
              width: "100%",
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
              {/* Header: Name and Date */}
              <div
                className="flex items-center justify-between min-w-0 border-b pb-0.5"
                style={{
                  borderColor: colors.border_color,
                  marginBottom: "2px",
                }}
              >
                <span
                  className="font-bold text-base truncate min-w-0"
                  title={row.name}
                  style={{
                    maxWidth: "65%",
                    fontSize: "14px",
                    color: colors.primary_text,
                  }}
                >
                  {row.name}
                </span>
                <span
                  className="text-xs font-medium ml-2 flex-shrink-0"
                  style={{
                    whiteSpace: "nowrap",
                    color: colors.primary_text,
                    background: `${colors.primary_accent}22`,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.3px",
                  }}
                  title={dateValue}
                >
                  {dateValue}
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
                      ? await dispatch(
                          getBillByExpenseId(row.id, friendId || "")
                        )
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
      })}
    </div>
  );
}
