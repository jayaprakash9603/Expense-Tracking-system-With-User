import React from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import useUserSettings from "../hooks/useUserSettings";

/**
 * PreviousExpenseIndicator Component
 *
 * A reusable indicator that displays information about a previously created expense.
 * Shows the date when the expense was last added and provides additional details on hover.
 *
 * @component
 * @example
 * ```jsx
 * <PreviousExpenseIndicator
 *   expense={previousExpenseData}
 *   isLoading={false}
 *   position="right"
 *   showTooltip={true}
 *   dateFormat="DD MMM YYYY"
 * />
 * ```
 */
const PreviousExpenseIndicator = ({
  // Main data
  expense = null,
  isLoading = false,

  // Display configuration
  position = "right", // "left" | "right"
  showTooltip = true,
  dateFormat = "DD MMM YYYY",

  // Text customization
  label = "Previously Added",
  labelPosition = "top", // "top" | "left" | "none"

  // Styling options
  variant = "gradient", // "gradient" | "solid" | "outline"
  colorScheme = {
    primary: "#00dac6",
    secondary: "#00b8a0",
    text: "#ffffff",
    subtext: "#9ca3af",
  },

  // Tooltip configuration
  tooltipConfig = {},

  // Additional features
  icon = "calendar", // "calendar" | "clock" | "info" | "custom" | null
  customIcon = null, // React component or JSX
  className = "",
  onClick = null, // Click handler for the entire component

  // Accessibility
  ariaLabel = "Previously added expense information",
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Don't render if no expense data
  if (!expense) return null;

  // Merge tooltip config with defaults
  const defaultTooltipConfig = {
    showAmount: true,
    showPaymentMethod: true,
    showType: true,
    amountFormatter: (amount) =>
      `${currencySymbol}${amount?.toLocaleString() || 0}`,
    paymentMethodFormatter: null,
    typeFormatter: null,
  };

  const mergedTooltipConfig = {
    ...defaultTooltipConfig,
    ...tooltipConfig,
  };

  // Icon components
  const CalendarIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative"
    >
      <path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
        fill={colorScheme.primary}
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
        fill={colorScheme.primary}
      />
    </svg>
  );

  const InfoIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        fill={colorScheme.primary}
      />
    </svg>
  );

  // Select icon based on prop
  const renderIcon = () => {
    if (customIcon) return customIcon;
    if (icon === null) return null;

    switch (icon) {
      case "calendar":
        return <CalendarIcon />;
      case "clock":
        return <ClockIcon />;
      case "info":
        return <InfoIcon />;
      default:
        return <CalendarIcon />;
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return `bg-gradient-to-r from-[${colorScheme.primary}]/20 to-[${colorScheme.secondary}]/20 border-l-4 border-[${colorScheme.primary}]`;
      case "solid":
        return `bg-[${colorScheme.primary}]/10 border border-[${colorScheme.primary}]`;
      case "outline":
        return `bg-transparent border-2 border-[${colorScheme.primary}]`;
      default:
        return `bg-gradient-to-r from-[${colorScheme.primary}]/20 to-[${colorScheme.secondary}]/20 border-l-4 border-[${colorScheme.primary}]`;
    }
  };

  // Format payment method using custom formatter or default
  const formatPaymentMethod = (paymentMethod) => {
    if (mergedTooltipConfig.paymentMethodFormatter) {
      return mergedTooltipConfig.paymentMethodFormatter(paymentMethod);
    }

    // Default formatter
    const formatted = String(paymentMethod || "")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    // Handle specific cases
    const lower = String(paymentMethod || "")
      .toLowerCase()
      .trim();
    if (lower === "cash" || lower === "cash ") return "Cash";
    if (lower.includes("credit") && lower.includes("paid"))
      return "Credit Paid";
    if (
      lower.includes("credit") &&
      (lower.includes("due") || lower.includes("need"))
    )
      return "Credit Due";

    return formatted;
  };

  // Format type using custom formatter or default
  const formatType = (type) => {
    if (mergedTooltipConfig.typeFormatter) {
      return mergedTooltipConfig.typeFormatter(type);
    }
    return type === "loss" ? "Loss" : "Gain";
  };

  // Get tooltip position class
  const getTooltipPosition = () => {
    return position === "left" ? "left-0" : "right-0";
  };

  // Get tooltip arrow position
  const getTooltipArrow = () => {
    return position === "left" ? "left-4" : "right-4";
  };

  return (
    <div
      className={`relative group ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      <div
        className={`
          flex items-center gap-2 
          ${getVariantStyles()}
          rounded-r-lg px-4 py-2 
          shadow-lg hover:shadow-[${colorScheme.primary}]/20 
          transition-all duration-300
          ${onClick ? "cursor-pointer" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          {/* Icon with glow effect */}
          {renderIcon() && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-sm opacity-50"
                style={{ backgroundColor: colorScheme.primary }}
              ></div>
              {renderIcon()}
            </div>
          )}

          {/* Text content */}
          <div
            className={`flex ${
              labelPosition === "left"
                ? "flex-row items-center gap-2"
                : "flex-col"
            }`}
          >
            {labelPosition !== "none" && (
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colorScheme.subtext }}
              >
                {label}
              </span>
            )}
            <span
              className="text-sm font-bold"
              style={{ color: colorScheme.text }}
            >
              {dayjs(expense.date).format(dateFormat)}
            </span>
          </div>
        </div>

        {/* Hover tooltip with details */}
        {showTooltip && (
          <div
            className={`
              absolute ${getTooltipPosition()} top-full mt-2 w-64 
              rounded-lg shadow-xl p-3 
              opacity-0 invisible 
              group-hover:opacity-100 group-hover:visible 
              transition-all duration-200 z-50
            `}
            style={{
              backgroundColor: colors.primary_bg,
              borderColor: colorScheme.primary,
              borderWidth: "1px",
            }}
          >
            <div className="space-y-2">
              {/* Amount */}
              {mergedTooltipConfig.showAmount &&
                expense.expense?.amount !== undefined && (
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs"
                      style={{ color: colorScheme.subtext }}
                    >
                      Amount:
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: colorScheme.text }}
                    >
                      {mergedTooltipConfig.amountFormatter(
                        expense.expense.amount
                      )}
                    </span>
                  </div>
                )}

              {/* Payment Method */}
              {mergedTooltipConfig.showPaymentMethod &&
                expense.expense?.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs"
                      style={{ color: colorScheme.subtext }}
                    >
                      Payment:
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: colorScheme.text }}
                    >
                      {formatPaymentMethod(expense.expense.paymentMethod)}
                    </span>
                  </div>
                )}

              {/* Type */}
              {mergedTooltipConfig.showType && expense.expense?.type && (
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: colorScheme.subtext }}
                  >
                    Type:
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      expense.expense.type === "loss"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {formatType(expense.expense.type)}
                  </span>
                </div>
              )}
            </div>

            {/* Tooltip Arrow */}
            <div
              className={`absolute -top-1 ${getTooltipArrow()} w-2 h-2 transform rotate-45`}
              style={{
                backgroundColor: colors.primary_bg,
                borderLeft: `1px solid ${colorScheme.primary}`,
                borderTop: `1px solid ${colorScheme.primary}`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes for type checking and documentation
PreviousExpenseIndicator.propTypes = {
  // Main data
  expense: PropTypes.shape({
    date: PropTypes.string.isRequired,
    expense: PropTypes.shape({
      amount: PropTypes.number,
      paymentMethod: PropTypes.string,
      type: PropTypes.oneOf(["loss", "gain"]),
    }),
  }),
  isLoading: PropTypes.bool,

  // Display configuration
  position: PropTypes.oneOf(["left", "right"]),
  showTooltip: PropTypes.bool,
  dateFormat: PropTypes.string,

  // Text customization
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(["top", "left", "none"]),

  // Styling options
  variant: PropTypes.oneOf(["gradient", "solid", "outline"]),
  colorScheme: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
    text: PropTypes.string,
    subtext: PropTypes.string,
  }),

  // Tooltip configuration
  tooltipConfig: PropTypes.shape({
    showAmount: PropTypes.bool,
    showPaymentMethod: PropTypes.bool,
    showType: PropTypes.bool,
    amountFormatter: PropTypes.func,
    paymentMethodFormatter: PropTypes.func,
    typeFormatter: PropTypes.func,
  }),

  // Additional features
  icon: PropTypes.oneOf(["calendar", "clock", "info", "custom", null]),
  customIcon: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,

  // Accessibility
  ariaLabel: PropTypes.string,
};

export default PreviousExpenseIndicator;
