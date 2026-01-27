import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTheme } from "../../hooks/useTheme";
import { useMasking } from "../../hooks/useMasking";
import { formatPaymentMethodName } from "../../utils/paymentMethodUtils";
import { useTranslation } from "../../hooks/useTranslation";
import { getCategoryIcon, getPaymentMethodIcon } from "../../utils/iconMapping";

/**
 * Memoized individual expense card component for performance.
 * Renders only when its specific props change.
 * Scroll handling is done in the parent component's handleCardClickWrapper.
 */
const ExpenseCard = React.memo(
  function ExpenseCard({
    row,
    idx,
    sourceIndex,
    isSelected,
    flowTab,
    isMobile,
    isTablet,
    hasWriteAccess,
    formatNumberFull,
    normalizedSelectedCardIdx,
    selectedIndicesSet,
    handleCardClick,
    handleDeleteClick,
    onEdit,
    friendId,
    isFriendView,
  }) {
    const { colors } = useTheme();
    const navigate = useNavigate();
    const { maskAmount, isMasking } = useMasking();
    const { t } = useTranslation();

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

    const categoryName =
      row.categoryName ||
      row.category?.name ||
      row.category ||
      row.expense?.category ||
      t("cashflow.labels.uncategorized");

    // Get the actual icon key from the expense data, fallback to category name for mapping
    const categoryIconKey =
      row.categoryIcon ||
      row.category?.icon ||
      row.expense?.categoryIcon ||
      categoryName;

    const rawPaymentMethod =
      row.paymentMethodName ||
      row.paymentMethod?.name ||
      row.paymentMethod ||
      row.expense?.paymentMethod ||
      t("cashflow.labels.unknownPayment");
    const paymentMethodName = formatPaymentMethodName(rawPaymentMethod);

    // Get the actual payment method icon key from the expense data, fallback to name for mapping
    const paymentMethodIconKey =
      row.paymentMethodIcon ||
      row.paymentMethod?.icon ||
      row.expense?.paymentMethodIcon ||
      paymentMethodName;

    const isBill = row.bill === true;

    // Simplified click handler - scroll handling moved to parent wrapper
    const handleClick = useCallback(
      (event) => {
        handleCardClick(sourceIndex, row, event);
      },
      [handleCardClick, sourceIndex, row],
    );

    // Navigate to view expense page
    const handleNameClick = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        const expenseId = row.id || row.expenseId;
        if (expenseId) {
          const viewPath = isFriendView
            ? `/expenses/view/${expenseId}/friend/${friendId}`
            : `/expenses/view/${expenseId}`;
          navigate(viewPath);
        }
      },
      [row, friendId, isFriendView, navigate],
    );

    // Generate full URL for tooltip
    const getViewExpenseUrl = useCallback(() => {
      const expenseId = row.id || row.expenseId;
      const routePath = isFriendView
        ? `/expenses/view/${expenseId}/friend/${friendId}`
        : `/expenses/view/${expenseId}`;
      return `${window.location.origin}${routePath}`;
    }, [row, friendId, isFriendView]);

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
          transition:
            "background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease",
          margin: "6px",
          border: isSelected
            ? `2px solid ${isGain ? "#06d6a0" : "#ff4d4f"}`
            : `1px solid ${colors.border_color || "transparent"}`,
          userSelect: "none",
          outline: "none",
          willChange: "background, border, box-shadow",
          contain: "layout style paint",
          boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
          "--selection-outline-color": isGain ? "#06d6a0" : "#ff4d4f",
        }}
        onClick={handleClick}
        onFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-1" style={{ height: "100%" }}>
          {/* Header: Expense Name (wrapped) - Clickable link */}
          <div
            className="flex items-center min-w-0 border-b pb-1"
            style={{
              borderColor: colors.border_color,
              marginBottom: "4px",
            }}
          >
            <span
              className="font-bold text-base min-w-0 expense-name-link"
              title={getViewExpenseUrl()}
              onClick={handleNameClick}
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
                cursor: "pointer",
                transition: "color 0.2s ease, text-decoration 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
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
              {getCategoryIcon(categoryIconKey, {
                sx: { fontSize: 13, color: colors.primary_accent },
              })}
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
              {getPaymentMethodIcon(paymentMethodIconKey, {
                sx: { fontSize: 13, color: colors.secondary_accent },
              })}
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
                onClick={() => onEdit(row)}
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
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    // Only re-render when these specific props change
    return (
      prevProps.row === nextProps.row &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.flowTab === nextProps.flowTab &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.isTablet === nextProps.isTablet &&
      prevProps.hasWriteAccess === nextProps.hasWriteAccess &&
      prevProps.normalizedSelectedCardIdx.length ===
        nextProps.normalizedSelectedCardIdx.length
    );
  },
);

export default ExpenseCard;
