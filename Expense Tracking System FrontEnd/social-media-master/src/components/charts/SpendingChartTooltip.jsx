import React from "react";
import PropTypes from "prop-types";

/**
 * SpendingChartTooltip - Custom tooltip for spending chart
 * Displays date, total amount, and list of expenses
 *
 * @param {boolean} active - Whether tooltip is active
 * @param {Array} payload - Chart data payload
 * @param {string} selectedType - Current type (loss/gain) for theming
 * @param {object} config - Tooltip configuration
 * @param {object} theme - Theme colors for the tooltip
 */
const SpendingChartTooltip = ({
  active,
  payload,
  selectedType,
  config,
  theme,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const expenses = data.expenses || [];
  const displayExpenses = expenses.slice(0, config.maxExpensesToShow);
  const remainingCount = expenses.length - config.maxExpensesToShow;

  // Format date label
  const formatDate = (rawDate, dayNumber) => {
    if (!rawDate) return dayNumber ? `Day ${dayNumber}` : "";
    const date = new Date(rawDate);
    return !isNaN(date)
      ? date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
      : `Day ${dayNumber}`;
  };

  // Format number
  const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });

  const dateLabel = formatDate(data.date, data.day);

  return (
    <div
      className="spending-tooltip"
      style={{
        backgroundColor: "#1b1b1b",
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        color: "#fff",
        padding: 12,
        minWidth: config.minWidth,
        maxWidth: config.maxWidth,
        transform: "translateY(-20px)",
        margin: 0,
        lineHeight: 1.4,
      }}
    >
      {/* Date header */}
      <div
        style={{
          fontSize: 12,
          color: "#cfd8dc",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {dateLabel}
      </div>

      {/* Total amount */}
      <div
        style={{
          fontWeight: 700,
          color: theme.color,
          marginBottom: expenses.length > 0 ? 8 : 0,
          fontSize: 16,
        }}
      >
        Total: ₹{formatNumber(payload[0].value)}
      </div>

      {/* Expenses list */}
      {expenses.length > 0 && (
        <div
          style={{
            borderTop: `1px solid ${theme.divider}`,
            paddingTop: 8,
            margin: 0,
          }}
        >
          {/* Header with count and "X+ more" indicator */}
          <div
            style={{
              fontSize: 11,
              color: "#888",
              marginBottom: 6,
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Expenses ({expenses.length})</span>
            {remainingCount > 0 && (
              <span style={{ fontStyle: "italic", fontSize: 10 }}>
                +{remainingCount} more
              </span>
            )}
          </div>

          {/* Individual expense items */}
          {displayExpenses.map((exp, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: idx < displayExpenses.length - 1 ? 8 : 0,
                paddingBottom: idx < displayExpenses.length - 1 ? 8 : 0,
                borderBottom:
                  idx < displayExpenses.length - 1
                    ? "1px solid #2a2a2a"
                    : "none",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                {exp.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  margin: 0,
                }}
              >
                <span style={{ color: "#888" }}>{exp.category}</span>
                <span style={{ color: theme.color, fontWeight: 600 }}>
                  ₹{formatNumber(exp.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SpendingChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  selectedType: PropTypes.string.isRequired,
  config: PropTypes.shape({
    maxExpensesToShow: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
  }).isRequired,
  theme: PropTypes.shape({
    color: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    divider: PropTypes.string.isRequired,
  }).isRequired,
};

export default SpendingChartTooltip;
