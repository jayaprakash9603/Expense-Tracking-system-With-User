import React, { useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Skeleton, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NoDataPlaceholder from "../../components/NoDataPlaceholder"; // adjust path if needed

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
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const lastClickedIndexRef = useRef(null);

  // Scroll to the last clicked card when selection changes
  useEffect(() => {
    if (
      lastClickedIndexRef.current !== null &&
      cardRefs.current[lastClickedIndexRef.current]
    ) {
      const cardElement = cardRefs.current[lastClickedIndexRef.current];

      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        cardElement.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "nearest",
        });
      }, 0);

      lastClickedIndexRef.current = null;
    }
  }, [selectedCardIdx]);

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
        };

  if (loading && !search) {
    return (
      <div
        ref={scrollContainerRef}
        className={wrapperClass}
        style={wrapperStyle}
      >
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width={340}
            height={140}
            animation="wave"
            sx={{ bgcolor: "#23243a", borderRadius: 2 }}
            style={{ minWidth: 220, maxWidth: 340, margin: "0 8px 16px 0" }}
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        ref={scrollContainerRef}
        className={wrapperClass}
        style={wrapperStyle}
      >
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
    <div ref={scrollContainerRef} className={wrapperClass} style={wrapperStyle}>
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
            dt && dayjs(dt).isValid() ? dayjs(dt).format("D MMM") : "";
          return dtStr;
        })();

        return (
          <div
            key={row.id || row.expenseId || `expense-${idx}`}
            ref={(el) => (cardRefs.current[idx] = el)}
            className="bg-[#1b1b1b] rounded-lg shadow-md flex flex-col justify-between relative group transition-colors duration-200"
            style={{
              minHeight: "140px",
              maxHeight: "140px",
              height: "140px",
              minWidth: "220px",
              maxWidth: "340px",
              width: "100%",
              padding: "18px 20px",
              boxSizing: "border-box",
              overflow: "hidden",
              cursor: "pointer",
              background: isSelected
                ? isGain
                  ? "rgba(6, 214, 160, 0.13)"
                  : "rgba(255, 77, 79, 0.13)"
                : "#1b1b1b",
              transition: "background 0.2s, box-shadow 0.2s, border 0.2s",
              margin: "6px",
              border: isSelected
                ? `2px solid ${isGain ? "#06d6a0" : "#ff4d4f"}`
                : "2px solid transparent",
              userSelect: "none",
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              // Store the clicked index
              lastClickedIndexRef.current = idx;

              handleCardClick(idx, event);
            }}
          >
            <div className="flex flex-col gap-2" style={{ height: "100%" }}>
              <div className="flex items-center justify-between min-w-0">
                <span
                  className="font-semibold text-base truncate min-w-0 text-white"
                  title={row.name}
                  style={{ maxWidth: "70%", fontSize: "15px" }}
                >
                  {row.name}
                </span>
                <span
                  className="text-xs font-semibold text-[#b0b6c3] ml-2 flex-shrink-0"
                  style={{ whiteSpace: "nowrap" }}
                  title={dateValue}
                >
                  {dateValue}
                </span>
              </div>
              <div className="text-base font-bold flex items-center gap-1">
                {icon}
                <span
                  style={{
                    color: amountColor,
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                  title={`Amount: ${formatNumberFull(row.amount)}`}
                >
                  {formatNumberFull(row.amount)}
                </span>
              </div>
              <div
                className="text-gray-300 text-sm break-words card-comments-clamp"
                style={{ wordBreak: "break-word", flex: 1, overflow: "hidden" }}
                title={row.comments}
              >
                {row.comments}
              </div>
            </div>
            {isSelected && selectedCardIdx.length === 1 && hasWriteAccess && (
              <div
                className="absolute bottom-2 right-2 flex gap-2 opacity-90"
                style={{
                  zIndex: 2,
                  background: "#23243a",
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
                    background: "#23243a",
                    borderRadius: 1,
                    boxShadow: 1,
                    "&:hover": { background: "#2e335a", color: "#fff" },
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
                    background: "#23243a",
                    borderRadius: 1,
                    boxShadow: 1,
                    "&:hover": { background: "#2e335a", color: "#fff" },
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
