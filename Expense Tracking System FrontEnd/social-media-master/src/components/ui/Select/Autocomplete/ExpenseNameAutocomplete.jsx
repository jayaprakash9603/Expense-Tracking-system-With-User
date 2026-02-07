import React, { useMemo } from "react";
import PropTypes from "prop-types";
import AppAutocomplete from "../AppAutocomplete";
import useExpenseNames from "../../../../hooks/useExpenseNames";
import { useTheme } from "../../../../hooks/useTheme";
import {
  findExpenseNameByValue,
  areExpenseNamesEqual,
  getExpenseNameDisplayLabel,
} from "../../../../utils/expenseNameUtils";
import HighlightedText from "../../../common/HighlightedText";
import { createFuzzyFilterOptions } from "../../../../utils/fuzzyMatchUtils";

/**
 * ExpenseNameAutocomplete - A reusable expense/bill name selection component
 *
 * Features:
 * - Automatic expense name fetching from API
 * - FreeSolo support for custom entries
 * - Smart normalization and formatting
 * - Customizable styling and behavior
 * - Loading and error states
 * - Fuzzy search filtering
 *
 * @param {string} value - The selected expense name value
 * @param {function} onChange - Callback when expense name selection changes (value)
 * @param {string} sourceType - Type of source: "bills" or "expenses"
 * @param {string} label - Label for the autocomplete
 * @param {string} placeholder - Placeholder text for the input
 * @param {boolean} error - Whether to show error state
 * @param {string} helperText - Helper text to display below the input
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the field is required
 * @param {object} sx - Additional MUI sx styles
 * @param {string} size - Input size: "small", "medium"
 * @param {function} onExpenseNameChange - Callback with full expense name object (optional)
 * @param {boolean} autoFocus - Whether to auto-focus the input
 * @param {boolean} showLabel - Whether to show the label
 * @param {boolean} freeSolo - Whether to allow free text entry (default: true)
 * @param {boolean} autofetch - Whether to automatically fetch expense names (default: true)
 */
const ExpenseNameAutocomplete = ({
  value,
  onChange,
  sourceType = "expenses",
  label = "Expense Name",
  placeholder = "Enter expense name",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  sx = {},
  size = "medium",
  onExpenseNameChange = null,
  autoFocus = false,
  showLabel = true,
  freeSolo = true,
  autofetch = true,
}) => {
  const { colors } = useTheme();

  // Fuzzy filter that searches both label and value
  const filterOptions = useMemo(() => {
    return createFuzzyFilterOptions({
      getOptionLabel: (opt) => opt?.label || opt || "",
      getOptionSearchText: (opt) =>
        `${opt?.label || opt || ""} ${opt?.value || ""}`,
    });
  }, []);

  // Use custom hook for expense names management
  const {
    processedExpenseNames,
    loading: expenseNamesLoading,
    error: expenseNamesError,
  } = useExpenseNames(sourceType, autofetch);

  // Find the selected expense name option
  const selectedExpenseName = useMemo(() => {
    if (!value) return null;

    // First try to find exact match in options
    const found = findExpenseNameByValue(processedExpenseNames, value);
    if (found) return found;

    // If freeSolo and value not in options, return the value as-is for display
    if (freeSolo) {
      return { label: value, value: value, original: { name: value } };
    }

    return null;
  }, [value, processedExpenseNames, freeSolo]);

  // Handle expense name selection change
  const handleChange = (event, newValue) => {
    let expenseNameValue = "";

    if (newValue === null) {
      expenseNameValue = "";
    } else if (typeof newValue === "string") {
      // FreeSolo: user typed a custom value
      expenseNameValue = newValue;
    } else if (newValue && newValue.value) {
      // Selected from dropdown
      expenseNameValue = newValue.value;
    }

    onChange(expenseNameValue);

    // Call optional callback with full expense name object
    if (onExpenseNameChange) {
      onExpenseNameChange(newValue);
    }
  };

  // Handle input change for freeSolo mode
  const handleInputChange = (event, newInputValue, reason) => {
    if (freeSolo && reason === "input") {
      onChange(newInputValue);
    }
  };

  // Custom render option with highlighting
  const renderOption = (props, option, { inputValue }) => {
    const displayLabel =
      typeof option === "string" ? option : option.label || "";

    return (
      <li
        {...props}
        style={{
          fontSize: size === "small" ? "0.875rem" : "0.92rem",
          paddingTop: 6,
          paddingBottom: 6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 300,
        }}
        title={displayLabel}
      >
        <HighlightedText
          text={displayLabel}
          query={inputValue}
          title={displayLabel}
        />
      </li>
    );
  };

  const noOptionsText = expenseNamesLoading
    ? "Loading..."
    : expenseNamesError
      ? "Error loading names"
      : freeSolo
        ? "Type to add new"
        : "No options available";

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
      <AppAutocomplete
        options={processedExpenseNames}
        value={selectedExpenseName}
        onChange={handleChange}
        onInputChange={handleInputChange}
        getOptionLabel={getExpenseNameDisplayLabel}
        isOptionEqualToValue={areExpenseNamesEqual}
        filterOptions={filterOptions}
        renderOption={renderOption}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        loading={expenseNamesLoading}
        noOptionsText={noOptionsText}
        size={size}
        autoFocus={autoFocus}
        sx={sx}
        freeSolo={freeSolo}
      />
      {expenseNamesError && !helperText && (
        <div
          style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "4px" }}
        >
          Error: {expenseNamesError}
        </div>
      )}
    </div>
  );
};

ExpenseNameAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  sourceType: PropTypes.oneOf(["bills", "expenses"]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.oneOf(["small", "medium"]),
  onExpenseNameChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  showLabel: PropTypes.bool,
  freeSolo: PropTypes.bool,
  autofetch: PropTypes.bool,
};

export default ExpenseNameAutocomplete;
