import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ============================================================================
 * SpendingChartTooltip - Modular & Customizable Tooltip Component
 * ============================================================================
 *
 * A highly flexible tooltip component with responsive design and easy customization.
 *
 * FEATURES:
 * - Fully responsive (auto-adjusts for mobile/tablet/desktop)
 * - Modular styling with easy override options
 * - Theme-based coloring (loss/gain)
 * - Configurable layout and spacing
 * - Reusable across different charts
 *
 * USAGE EXAMPLES:
 * ---------------
 *
 * 1. Basic usage:
 *    <SpendingChartTooltip
 *      active={true}
 *      payload={chartPayload}
 *      selectedType="loss"
 *      config={TOOLTIP_CONFIG}
 *      theme={CHART_THEME.loss}
 *    />
 *
 * 2. Mobile optimized:
 *    <SpendingChartTooltip
 *      active={true}
 *      payload={chartPayload}
 *      selectedType="loss"
 *      config={{ ...TOOLTIP_CONFIG, responsive: true }}
 *      theme={CHART_THEME.loss}
 *    />
 *
 * 3. Custom styling:
 *    <SpendingChartTooltip
 *      active={true}
 *      payload={chartPayload}
 *      selectedType="loss"
 *      config={{
 *        ...TOOLTIP_CONFIG,
 *        style: { borderRadius: 20, maxWidth: 400 }
 *      }}
 *      theme={CHART_THEME.loss}
 *    />
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Default responsive breakpoints
 */
const BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
};

/**
 * Default styling presets for different screen sizes
 */
const RESPONSIVE_STYLES = {
  mobile: {
    container: {
      minWidth: 180,
      maxWidth: 280,
      borderRadius: 10,
      borderWidth: 2,
    },
    header: {
      padding: "6px 10px 5px 10px",
    },
    body: {
      padding: "8px 10px 8px 10px",
    },
    typography: {
      date: 8,
      label: 7,
      amount: 13,
      transactionName: 10,
      transactionAmount: 11,
      category: 9,
    },
    icons: {
      date: 10,
      arrow: 13,
      transaction: 11,
    },
    spacing: {
      gap: 5,
      itemGap: 5,
    },
  },
  tablet: {
    container: {
      minWidth: 200,
      maxWidth: 300,
      borderRadius: 12,
      borderWidth: 2,
    },
    header: {
      padding: "7px 12px 6px 12px",
    },
    body: {
      padding: "10px 12px 10px 12px",
    },
    typography: {
      date: 9,
      label: 8,
      amount: 15,
      transactionName: 11,
      transactionAmount: 12,
      category: 10,
    },
    icons: {
      date: 11,
      arrow: 14,
      transaction: 12,
    },
    spacing: {
      gap: 5,
      itemGap: 6,
    },
  },
  desktop: {
    container: {
      minWidth: 220,
      maxWidth: 320,
      borderRadius: 14,
      borderWidth: 2,
    },
    header: {
      padding: "8px 14px 7px 14px",
    },
    body: {
      padding: "12px 14px 12px 14px",
    },
    typography: {
      date: 10,
      label: 9,
      amount: 16,
      transactionName: 12,
      transactionAmount: 13,
      category: 11,
    },
    icons: {
      date: 12,
      arrow: 15,
      transaction: 13,
    },
    spacing: {
      gap: 5,
      itemGap: 7,
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive styles based on screen width
 */
const getResponsiveStyles = (responsive = true) => {
  if (!responsive) return RESPONSIVE_STYLES.tablet;

  if (typeof window === "undefined") return RESPONSIVE_STYLES.tablet;

  const width = window.innerWidth;
  if (width <= BREAKPOINTS.mobile) return RESPONSIVE_STYLES.mobile;
  if (width <= BREAKPOINTS.tablet) return RESPONSIVE_STYLES.tablet;
  return RESPONSIVE_STYLES.desktop;
};

/**
 * Merge custom styles with default styles
 */
const mergeStyles = (defaultStyles, customStyles = {}) => {
  return {
    ...defaultStyles,
    ...customStyles,
  };
};

/**
 * Format date label
 */
const formatDate = (rawDate, dayNumber, fallbackLabel = "") => {
  if (!rawDate) return dayNumber ? fallbackLabel : "";
  const date = new Date(rawDate);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    });
  }
  if (typeof rawDate === "string" && rawDate.trim().length > 0) {
    return rawDate;
  }
  return dayNumber ? fallbackLabel : "";
};

/**
 * Format number with locale
 */
const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Calendar Icon Component
 */
const CalendarIcon = ({ size = 11, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="15"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M3 10h18" stroke={color} strokeWidth="2" />
    <path
      d="M8 3v4M16 3v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Arrow Icon Component (Up/Down for Gain/Loss)
 */
const ArrowIcon = ({ size = 16, direction = "down", color = "white" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {direction === "down" ? (
      <path
        d="M12 5v14M12 19l-7-7M12 19l7-7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M12 19V5M12 5l7 7M12 5l-7 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

/**
 * Transaction Icon Component
 */
const TransactionIcon = ({ size = 12, color = "#00dac6" }) => (
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
 * Decorative Background Circles
 */
const DecorativeCircles = () => (
  <>
    <div
      style={{
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        top: -15,
        right: -15,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.08)",
        bottom: -8,
        left: -8,
      }}
    />
  </>
);

/**
 * Tooltip Header Component
 */
const TooltipHeader = ({
  dateLabel,
  amount,
  isLoss,
  theme,
  styles,
  responsiveStyles,
  currencySymbol = "₹",
}) => {
  const { t } = useTranslation();
  const gradient = isLoss
    ? "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)"
    : "linear-gradient(135deg, #00dac6 0%, #00a896 100%)";
  const totalLabel = isLoss
    ? t("dashboard.charts.tooltip.totalSpending")
    : t("dashboard.charts.tooltip.totalIncome");

  return (
    <div
      style={{
        background: gradient,
        padding: responsiveStyles.header.padding,
        position: "relative",
        overflow: "hidden",
        ...styles.header,
      }}
    >
      <DecorativeCircles />

      {/* Date Section */}
      <div
        style={{
          fontSize: responsiveStyles.typography.date,
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: 3,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 4,
          position: "relative",
          zIndex: 1,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        <CalendarIcon
          size={responsiveStyles.icons.date}
          color="rgba(255, 255, 255, 0.9)"
        />
        {dateLabel}
      </div>

      {/* Amount Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: responsiveStyles.spacing.gap,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowIcon
            size={responsiveStyles.icons.arrow}
            direction={isLoss ? "down" : "up"}
            color="white"
          />
        </div>
        <div>
          <div
            style={{
              fontSize: responsiveStyles.typography.label,
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: 500,
              marginBottom: 1,
              letterSpacing: "0.3px",
            }}
          >
            {totalLabel}
          </div>
          <div
            style={{
              fontWeight: 700,
              color: "#fff",
              fontSize: responsiveStyles.typography.amount,
              letterSpacing: "-0.5px",
            }}
          >
            {currencySymbol}
            {formatNumber(amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Transaction Item Component
 */
const TransactionItem = ({
  expense,
  theme,
  responsiveStyles,
  colors,
  currencySymbol = "₹",
}) => (
  <div
    style={{
      background: colors.tertiary_bg,
      borderRadius: 8,
      padding: "8px 10px",
      border: `1px solid ${colors.border_color}`,
      transition: "all 0.2s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          fontSize: responsiveStyles.typography.transactionName,
          color: colors.primary_text,
          fontWeight: 600,
          flex: 1,
          lineHeight: 1.3,
        }}
      >
        {expense.name}
      </div>
      <div
        style={{
          fontSize: responsiveStyles.typography.transactionAmount,
          color: theme.color,
          fontWeight: 700,
          marginLeft: 10,
          whiteSpace: "nowrap",
        }}
      >
        {currencySymbol}
        {formatNumber(expense.amount)}
      </div>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: theme.color,
          opacity: 0.6,
        }}
      />
      <span
        style={{
          fontSize: responsiveStyles.typography.category,
          color: colors.secondary_text,
          fontWeight: 500,
        }}
      >
        {expense.category}
      </span>
    </div>
  </div>
);

/**
 * Transactions List Component
 */
const TransactionsList = ({
  expenses,
  displayExpenses,
  remainingCount,
  theme,
  responsiveStyles,
  styles,
  colors,
  currencySymbol = "₹",
}) => {
  const { t } = useTranslation();
  const transactionsLabel = t("dashboard.charts.tooltip.transactions");
  const moreLabel = t("dashboard.charts.tooltip.moreLabel");
  if (expenses.length === 0) return null;

  return (
    <div
      style={{
        padding: responsiveStyles.body.padding,
        background: colors.secondary_bg,
        ...styles.body,
      }}
    >
      {/* Header with count badge */}
      <div
        style={{
          fontSize: 10,
          color: colors.secondary_text,
          marginBottom: 8,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <TransactionIcon
            size={responsiveStyles.icons.transaction}
            color={theme.color}
          />
          <span style={{ color: colors.primary_text }}>
            {transactionsLabel}
          </span>
          <span
            style={{
              background: theme.color,
              color: "#000",
              padding: "1px 6px",
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {expenses.length}
          </span>
        </div>
        {remainingCount > 0 && (
          <span
            style={{
              background: colors.tertiary_bg,
              color: colors.secondary_text,
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            +{remainingCount} {moreLabel}
          </span>
        )}
      </div>

      {/* Transaction Items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: responsiveStyles.spacing.itemGap,
        }}
      >
        {displayExpenses.map((expense, index) => (
          <TransactionItem
            key={index}
            expense={expense}
            theme={theme}
            responsiveStyles={responsiveStyles}
            colors={colors}
            currencySymbol={currencySymbol}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SpendingChartTooltip - Main tooltip component
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
  config = {},
  theme,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;

  // Early return if tooltip is not active
  if (!active || !payload || !payload.length) return null;

  // Extract data
  const data = payload[0].payload;
  const expenses = data.expenses || [];
  const displayExpenses = expenses.slice(0, config.maxExpensesToShow || 5);
  const remainingCount = expenses.length - (config.maxExpensesToShow || 5);

  // Determine responsive styles
  const responsiveStyles = getResponsiveStyles(config.responsive !== false);

  // Build container styles
  const containerStyles = mergeStyles(
    {
      // backgroundColor: "#0f0f0f",
      border: `${responsiveStyles.container.borderWidth}px solid ${theme.border}`,
      borderRadius: responsiveStyles.container.borderRadius,
      color: colors.primary_text,
      padding: 0,
      minWidth: config.minWidth || responsiveStyles.container.minWidth,
      maxWidth: config.maxWidth || responsiveStyles.container.maxWidth,
      transform: "translateY(-20px)",
      boxShadow:
        "0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      overflow: "hidden",
      background: "transparent",
    },
    config.style
  );

  // Custom styles for sub-components
  const customStyles = {
    header: config.headerStyle || {},
    body: config.bodyStyle || {},
  };

  // Format data
  const dayLabel = data?.day
    ? `${t("dashboard.charts.tooltip.dayPrefix")} ${data.day}`
    : "";
  const dateLabel = formatDate(data.date, data.day, dayLabel);
  const isLoss = selectedType === "loss";

  return (
    <div style={containerStyles}>
      <TooltipHeader
        dateLabel={dateLabel}
        amount={payload[0].value}
        isLoss={isLoss}
        theme={theme}
        styles={customStyles}
        responsiveStyles={responsiveStyles}
        currencySymbol={currencySymbol}
      />
      <TransactionsList
        expenses={expenses}
        displayExpenses={displayExpenses}
        remainingCount={remainingCount}
        theme={theme}
        responsiveStyles={responsiveStyles}
        styles={customStyles}
        colors={colors}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

// ============================================================================
// PROP TYPES
// ============================================================================

CalendarIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

ArrowIcon.propTypes = {
  size: PropTypes.number,
  direction: PropTypes.oneOf(["up", "down"]),
  color: PropTypes.string,
};

TransactionIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

TooltipHeader.propTypes = {
  dateLabel: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  isLoss: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
  responsiveStyles: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string,
};

TransactionItem.propTypes = {
  expense: PropTypes.shape({
    name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.object.isRequired,
  responsiveStyles: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string,
};

TransactionsList.propTypes = {
  expenses: PropTypes.array.isRequired,
  displayExpenses: PropTypes.array.isRequired,
  remainingCount: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  responsiveStyles: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string,
};

SpendingChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  selectedType: PropTypes.string.isRequired,
  config: PropTypes.shape({
    maxExpensesToShow: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    responsive: PropTypes.bool,
    style: PropTypes.object,
    headerStyle: PropTypes.object,
    bodyStyle: PropTypes.object,
  }),
  theme: PropTypes.shape({
    color: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    divider: PropTypes.string,
  }).isRequired,
};

export default SpendingChartTooltip;
