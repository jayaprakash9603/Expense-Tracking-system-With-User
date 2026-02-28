import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

/**
 * ============================================================================
 * PieChartTooltip - Specialized Tooltip for Pie/Donut Charts
 * ============================================================================
 *
 * A clean, focused tooltip designed for category breakdown and payment method charts.
 * Shows category/method overview with transaction count and total amount - no expense list.
 *
 * FEATURES:
 * - Compact design optimized for pie chart segments
 * - Color-coded header matching segment color
 * - Shows transaction count and total amount
 * - Percentage of total
 * - Optional description/details
 * - Fully responsive
 *
 * USAGE:
 * ------
 * <PieChartTooltip
 *   active={true}
 *   payload={chartPayload}
 *   data={categoryData}  // Full data object from API
 * />
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build friendly label from raw key
 */
const buildFriendlyLabel = (key) => {
  const labelMap = {
    creditNeedToPaid: "Credit (Due)",
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    netBanking: "Net Banking",
  };

  return (
    labelMap[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
};

/**
 * Reverse mapping - Get original key from friendly label
 */
const getOriginalKey = (friendlyLabel, data) => {
  const reverseMap = {
    "Credit (Due)": "creditNeedToPaid",
    Cash: "cash",
    UPI: "upi",
    Card: "card",
    "Credit Card": "creditCard",
    "Debit Card": "debitCard",
    "Net Banking": "netBanking",
  };

  // Try reverse map first
  if (reverseMap[friendlyLabel]) {
    return reverseMap[friendlyLabel];
  }

  // Try to find by comparing all keys with their friendly versions
  const allKeys = Object.keys(data || {}).filter((key) => key !== "summary");
  for (const key of allKeys) {
    if (buildFriendlyLabel(key) === friendlyLabel) {
      return key;
    }
  }

  return null;
};

/**
 * Format number with locale
 */
const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

/**
 * Format percentage - always 2 decimal places
 */
const formatPercentage = (value, total) => {
  if (!total || total === 0) return "0.00%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Get responsive styles based on screen width
 */
const getResponsiveStyles = () => {
  if (typeof window === "undefined") return "tablet";

  const width = window.innerWidth;
  if (width <= 600) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
};

// ============================================================================
// ICON COMPONENTS
// ============================================================================

/**
 * Transaction Count Icon
 */
const TransactionIcon = ({ size = 14, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 11l3 3L22 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Amount Icon
 */
const AmountIcon = ({ size = 14, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path
      d="M12 6v12M15 9h-4.5a1.5 1.5 0 000 3h3a1.5 1.5 0 010 3H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Percentage Icon
 */
const PercentageIcon = ({ size = 14, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7" cy="7" r="2" stroke={color} strokeWidth="2" />
    <circle cx="17" cy="17" r="2" stroke={color} strokeWidth="2" />
    <path d="M19 5L5 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PieChartTooltip - Main tooltip component for pie/donut charts
 *
 * @param {boolean} active - Whether tooltip is active
 * @param {Array} payload - Chart data payload from Recharts
 * @param {object} data - Full data object from API (with summary and category details)
 */
const PieChartTooltip = ({ active, payload, data }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Early return if tooltip is not active
  if (!active || !payload || !payload.length) return null;

  // Extract segment data
  const segment = payload[0];
  const categoryName = segment.name;
  const categoryValue = segment.value;
  const categoryColor = segment.payload.fill || "#00dac6";

  // Get category/payment method details from full data
  // First, try to get the original key from the friendly label
  const originalKey = getOriginalKey(categoryName, data);

  // Try exact match first
  let categoryDetails = data?.[categoryName];

  // Try using original key if friendly label was detected
  if (!categoryDetails && originalKey) {
    categoryDetails = data?.[originalKey];
  }

  if (!categoryDetails) {
    // Try lowercase match (for payment methods like "cash", "credit", etc.)
    const lowerCaseName = categoryName.toLowerCase();
    categoryDetails = data?.[lowerCaseName];
  }

  if (!categoryDetails) {
    // Try to find by case-insensitive search in all keys
    const matchingKey = Object.keys(data || {}).find(
      (key) =>
        key.toLowerCase() === categoryName.toLowerCase() && key !== "summary"
    );
    categoryDetails = matchingKey ? data[matchingKey] : {};
  }

  if (!categoryDetails) {
    // Last resort: try to find by comparing friendly labels
    const allKeys = Object.keys(data || {}).filter((key) => key !== "summary");
    for (const key of allKeys) {
      if (
        buildFriendlyLabel(key).toLowerCase() === categoryName.toLowerCase()
      ) {
        categoryDetails = data[key];
        break;
      }
    }
  }

  const expenseCount = categoryDetails?.expenseCount || 0;
  const totalAmount = categoryDetails?.totalAmount || categoryValue;
  const description = categoryDetails?.description || "";

  // Calculate percentage
  const summaryTotal = data?.summary?.totalAmount || 0;
  const percentage = formatPercentage(totalAmount, summaryTotal);

  // Responsive sizing
  const screenSize = getResponsiveStyles();
  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";

  // Dynamic sizing based on screen
  const fontSize = {
    title: isMobile ? 12 : isTablet ? 13 : 14,
    label: isMobile ? 9 : 10,
    value: isMobile ? 13 : isTablet ? 14 : 15,
    percentage: isMobile ? 11 : isTablet ? 12 : 13,
  };

  const iconSize = isMobile ? 12 : isTablet ? 13 : 14;
  const padding = isMobile ? "8px 10px" : isTablet ? "10px 12px" : "12px 14px";
  const gap = isMobile ? 8 : 10;

  return (
    <div
      style={{
        backgroundColor: colors.tertiary_bg,
        border: `2px solid ${categoryColor}`,
        borderRadius: 12,
        color: colors.primary_text,
        padding: 0,
        minWidth: isMobile ? 200 : isTablet ? 220 : 240,
        maxWidth: isMobile ? 280 : isTablet ? 300 : 320,
        boxShadow:
          "0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Header with category color */}
      <div
        style={{
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
          padding: padding,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            top: -10,
            right: -10,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 25,
            height: 25,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            bottom: -5,
            left: -5,
          }}
        />

        {/* Category Name */}
        <div
          style={{
            fontSize: fontSize.title,
            color: "#fff",
            fontWeight: 700,
            marginBottom: 6,
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.3px",
            textTransform: "capitalize",
          }}
        >
          {categoryName}
        </div>

        {/* Percentage Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255, 255, 255, 0.25)",
            padding: "3px 8px",
            borderRadius: 12,
            fontSize: fontSize.percentage,
            fontWeight: 700,
            position: "relative",
            zIndex: 1,
          }}
        >
          <PercentageIcon size={iconSize - 2} color="#fff" />
          {percentage} of total
        </div>
      </div>

      {/* Body with details */}
      <div
        style={{
          padding: padding,
          background: colors.secondary_bg,
        }}
      >
        {/* Transaction Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: gap,
            padding: "8px 10px",
            background: colors.tertiary_bg,
            borderRadius: 8,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TransactionIcon size={iconSize} color={categoryColor} />
            <span
              style={{
                fontSize: fontSize.label,
                color: colors.secondary_text,
                fontWeight: 500,
              }}
            >
              Transactions
            </span>
          </div>
          <span
            style={{
              fontSize: fontSize.value,
              color: colors.primary_text,
              fontWeight: 700,
            }}
          >
            {expenseCount}
          </span>
        </div>

        {/* Total Amount */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            background: colors.tertiary_bg,
            borderRadius: 8,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AmountIcon size={iconSize} color={categoryColor} />
            <span
              style={{
                fontSize: fontSize.label,
                color: colors.secondary_text,
                fontWeight: 500,
              }}
            >
              Total Amount
            </span>
          </div>
          <span
            style={{
              fontSize: fontSize.value,
              color: categoryColor,
              fontWeight: 700,
            }}
          >
            {currencySymbol}
            {formatNumber(totalAmount)}
          </span>
        </div>

        {/* Description (if available) */}
        {description && (
          <div
            style={{
              marginTop: gap,
              padding: "8px 10px",
              background: colors.tertiary_bg,
              borderRadius: 8,
              borderLeft: `3px solid ${categoryColor}`,
            }}
          >
            <div
              style={{
                fontSize: fontSize.label - 1,
                color: colors.secondary_text,
                fontWeight: 500,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Description
            </div>
            <div
              style={{
                fontSize: fontSize.label,
                color: colors.primary_text,
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PROP TYPES
// ============================================================================

TransactionIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

AmountIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

PercentageIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

PieChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  data: PropTypes.object,
};

export default PieChartTooltip;
