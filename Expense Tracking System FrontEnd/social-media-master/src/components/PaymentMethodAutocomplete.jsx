import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { createFilterOptions } from "@mui/material/Autocomplete";
import ReusableAutocomplete from "./ReusableAutocomplete";
import usePaymentMethods from "../hooks/usePaymentMethods";
import { useTheme } from "../hooks/useTheme";
import {
  findPaymentMethodByValue,
  arePaymentMethodsEqual,
  getPaymentMethodDisplayLabel,
  normalizePaymentMethod,
} from "../utils/paymentMethodUtils";
import { highlightText } from "../utils/highlightUtils";

/**
 * PaymentMethodAutocomplete - A reusable payment method selection component
 *
 * Features:
 * - Automatic payment method fetching from API
 * - Filtering by transaction type (loss/gain = expense/income)
 * - Fallback to default payment methods
 * - Smart normalization and formatting
 * - Customizable styling and behavior
 * - Loading and error states
 *
 * @param {string} value - The selected payment method value
 * @param {function} onChange - Callback when payment method selection changes (value)
 * @param {string} transactionType - "loss" (expense) or "gain" (income)
 * @param {string} friendId - Optional friend ID for fetching friend-specific payment methods
 * @param {string} placeholder - Placeholder text for the input
 * @param {boolean} error - Whether to show error state
 * @param {string} helperText - Helper text to display below the input
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the field is required
 * @param {object} sx - Additional MUI sx styles
 * @param {string} size - Input size: "small", "medium"
 * @param {function} onPaymentMethodChange - Callback with full payment method object (optional)
 * @param {boolean} autoFocus - Whether to auto-focus the input
 * @param {string} label - Label for the autocomplete (if used standalone)
 * @param {boolean} showLabel - Whether to show the label
 * @param {boolean} autofetch - Whether to automatically fetch payment methods (default: true)
 */
const PaymentMethodAutocomplete = ({
  value,
  onChange,
  transactionType = "loss",
  friendId = "",
  placeholder = "Select payment method",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  sx = {},
  size = "medium",
  onPaymentMethodChange = null,
  autoFocus = false,
  label = "",
  showLabel = false,
  autofetch = true,
}) => {
  const { colors } = useTheme();

  // Custom filter options for better search with spaces
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option) => {
      // Combine label and value for searching, remove extra spaces
      const label = (option.label || "").toLowerCase().trim();
      const value = (option.value || "").toLowerCase().trim();
      return `${label} ${value}`;
    },
    trim: true,
  });

  // Use custom hook for payment method management
  const {
    processedPaymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = usePaymentMethods(friendId, transactionType, autofetch);

  // Find the selected payment method option
  const selectedPaymentMethod = useMemo(() => {
    return findPaymentMethodByValue(processedPaymentMethods, value);
  }, [value, processedPaymentMethods]);

  // Handle payment method selection change
  const handleChange = (event, newValue) => {
    const paymentMethodValue = newValue ? newValue.value : "cash";
    onChange(paymentMethodValue);

    // Call optional callback with full payment method object
    if (onPaymentMethodChange) {
      onPaymentMethodChange(newValue);
    }
  };

  // Custom render option with highlighting
  const renderOption = (props, option, { inputValue }) => (
    <li
      {...props}
      style={{
        fontSize: size === "small" ? "0.875rem" : "0.92rem",
        paddingTop: 4,
        paddingBottom: 12,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 300,
      }}
      title={option.label}
    >
      {highlightText(option.label, inputValue)}
    </li>
  );

  const noOptionsText = paymentMethodsLoading
    ? "Loading payment methods..."
    : paymentMethodsError
    ? "Error loading payment methods"
    : transactionType
    ? `No ${
        transactionType === "loss" ? "expense" : "income"
      } payment methods available`
    : "No payment methods available";

  return (
    <div style={{ width: "100%", maxWidth: "300px" }}>
      {showLabel && label && (
        <label
          style={{
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
            marginBottom: "4px",
            display: "block",
          }}
        >
          {label}
          {required && <span style={{ color: "#ff4d4f" }}> *</span>}
        </label>
      )}
      <ReusableAutocomplete
        options={processedPaymentMethods}
        value={selectedPaymentMethod}
        onChange={handleChange}
        getOptionLabel={getPaymentMethodDisplayLabel}
        isOptionEqualToValue={arePaymentMethodsEqual}
        filterOptions={filterOptions}
        renderOption={renderOption}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        loading={paymentMethodsLoading}
        noOptionsText={noOptionsText}
        size={size}
        autoFocus={autoFocus}
        sx={sx}
      />
      {paymentMethodsError && !helperText && (
        <div
          style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "4px" }}
        >
          Error: {paymentMethodsError}
        </div>
      )}
    </div>
  );
};

PaymentMethodAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  transactionType: PropTypes.oneOf(["loss", "gain"]),
  friendId: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.oneOf(["small", "medium"]),
  onPaymentMethodChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  autofetch: PropTypes.bool,
};

export default PaymentMethodAutocomplete;
