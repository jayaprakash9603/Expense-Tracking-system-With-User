import React from "react";
import { Typography, Tooltip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTheme } from "../../hooks/useTheme";
import dayjs from "dayjs";

/**
 * Expense Highlight Card for displaying highest/lowest/recent expenses.
 * Compact card designed for quick expense insights.
 *
 * @param {string} type - 'highest' | 'lowest' | 'recent' | 'oldest'
 * @param {Object} expense - Expense data { amount, date, description, merchant, paymentMethod }
 * @param {string} currencySymbol - Currency symbol
 * @param {string} dateFormat - Date format string
 */
const ExpenseHighlightCard = ({
  type = "highest",
  expense,
  currencySymbol = "₹",
  dateFormat = "DD/MM/YYYY",
}) => {
  const { colors, mode } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  if (!expense) {
    return null;
  }

  const getTypeConfig = () => {
    switch (type) {
      case "highest":
        return {
          label: "Highest Expense",
          color: "#ff4d4f",
          icon: <TrendingUpIcon sx={{ fontSize: 18, color: "#ff4d4f" }} />,
          emoji: "📈",
        };
      case "lowest":
        return {
          label: "Lowest Expense",
          color: "#52c41a",
          icon: <TrendingDownIcon sx={{ fontSize: 18, color: "#52c41a" }} />,
          emoji: "📉",
        };
      case "recent":
        return {
          label: "Most Recent",
          color: "#6366f1",
          icon: <CalendarTodayIcon sx={{ fontSize: 18, color: "#6366f1" }} />,
          emoji: "🕐",
        };
      case "oldest":
        return {
          label: "First Expense",
          color: "#8b5cf6",
          icon: <CalendarTodayIcon sx={{ fontSize: 18, color: "#8b5cf6" }} />,
          emoji: "📅",
        };
      default:
        return {
          label: "Expense",
          color: "#00DAC6",
          icon: null,
          emoji: "💰",
        };
    }
  };

  const config = getTypeConfig();

  const formatCurrency = (amount) => {
    if (amount == null) return `${currencySymbol}0`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(Math.abs(amount))
      .replace("₹", currencySymbol);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format(dateFormat);
  };

  const cardStyle = {
    background:
      mode === "dark"
        ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${colors.border_color}`,
    borderLeft: `3px solid ${config.color}`,
    borderRadius: "10px",
    padding: "14px 16px",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  };

  return (
    <Tooltip
      title={`${config.label}: ${expense.description || "N/A"}`}
      arrow
      placement="top"
    >
      <div
        style={{
          ...cardStyle,
          ...(isHovered
            ? {
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${config.color}20`,
              }
            : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "1rem" }}>{config.emoji}</span>
            <Typography
              variant="caption"
              sx={{
                color: colors.secondary_text,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}
            >
              {config.label}
            </Typography>
          </div>
          {config.icon}
        </div>

        {/* Amount */}
        <Typography
          sx={{
            color: config.color,
            fontSize: "1.4rem",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "4px",
          }}
        >
          {formatCurrency(expense.amount)}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            color: colors.primary_text,
            fontSize: "0.85rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
            marginBottom: "4px",
          }}
        >
          {expense.description || expense.merchant || "N/A"}
        </Typography>

        {/* Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CalendarTodayIcon
            sx={{ fontSize: 12, color: colors.secondary_text }}
          />
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              fontSize: "0.7rem",
            }}
          >
            {formatDate(expense.date)}
          </Typography>
        </div>
      </div>
    </Tooltip>
  );
};

export default ExpenseHighlightCard;
