/**
 * ExpenseNameAutocomplete.jsx
 * A reusable and extensible autocomplete component for expense/bill names
 *
 * Purpose: Provides a robust, consistent interface for selecting expense/bill names
 * across all components (CreateBill, EditBill, NewExpense, EditExpense).
 *
 * Features:
 * - Automatic data fetching via useExpenseNames hook
 * - Real-time filtering and suggestions
 * - Free text input support (freeSolo)
 * - Highlighting of matched text
 * - Loading and error states
 * - Customizable styling and behavior
 * - Uses ReusableAutocomplete as base
 *
 * Architecture:
 * - Pure presentation logic
 * - All API calls handled internally by useExpenseNames hook
 * - Modular utility functions from nameUtils.js
 * - Consistent with CategoryAutocomplete and PaymentMethodAutocomplete patterns
 */

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { createFilterOptions } from "@mui/material/Autocomplete";
import ReusableAutocomplete from "./ReusableAutocomplete";
import useExpenseNames from "../hooks/useExpenseNames";
import {
  findExactNameMatch,
  areNamesEqual,
  getNameDisplayLabel,
  sanitizeName,
} from "../utils/nameUtils";
import { highlightText } from "../utils/highlightUtils";

/**
 * ExpenseNameAutocomplete Component
 *
 * @param {string} value - The current name value
 * @param {function} onChange - Callback when name changes: (name: string) => void
 * @param {string} friendId - Optional friend ID for friend-specific names
 * @param {string} placeholder - Placeholder text for the input
 * @param {boolean} error - Whether to show error state
 * @param {string} helperText - Helper text to display below input
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the field is required
 * @param {object} sx - Additional MUI sx styles
 * @param {string} size - Input size: "small", "medium"
 * @param {function} onNameSelect - Optional callback with full name when selected
 * @param {boolean} autoFocus - Whether to auto-focus the input
 * @param {string} label - Label for the autocomplete (if used standalone)
 * @param {boolean} showLabel - Whether to show the label
 * @param {boolean} autofetch - Whether to automatically fetch names (default: true)
 * @param {number} maxSuggestions - Maximum number of suggestions (default: 50)
 * @param {boolean} freeSolo - Allow free text input (default: true)
 * @param {boolean} autoHighlight - Auto-highlight first option (default: true)
 * @param {boolean} clearOnEscape - Clear on Escape key (default: true)
 */
const ExpenseNameAutocomplete = ({
  value = "",
  onChange,
  friendId = "",
  placeholder = "Enter name",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  sx = {},
  size = "medium",
  onNameSelect = null,
  autoFocus = false,
  label = "",
  showLabel = false,
  autofetch = true,
  maxSuggestions = 50,
  freeSolo = true,
  autoHighlight = true,
  clearOnEscape = true,
}) => {
  // Use custom hook for name management
  const {
    suggestions,
    loading: namesLoading,
    error: namesError,
    setInputValue,
    fetchNames,
  } = useExpenseNames(friendId, autofetch, maxSuggestions);

  /**
   * Custom filter for better search with spaces and special characters
   */
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option) => {
      const label = getNameDisplayLabel(option);
      return label.toLowerCase().trim();
    },
    trim: true,
  });

  /**
   * Handle name selection change
   */
  const handleChange = (event, newValue) => {
    const nameValue = sanitizeName(newValue || "");
    onChange(nameValue);

    // Call optional callback with the name
    if (onNameSelect) {
      onNameSelect(nameValue);
    }
  };

  /**
   * Handle input change for filtering
   */
  const handleInputChange = (event, inputValue, reason) => {
    setInputValue(inputValue);

    // Update parent if typing (freeSolo mode)
    if (reason === "input" && freeSolo) {
      const sanitized = sanitizeName(inputValue);
      onChange(sanitized);
    }

    // Auto-select exact match if found
    if (reason === "input" && inputValue) {
      const exactMatch = findExactNameMatch(suggestions, inputValue);
      if (exactMatch && !areNamesEqual(exactMatch, value)) {
        onChange(exactMatch);
        if (onNameSelect) {
          onNameSelect(exactMatch);
        }
      }
    }
  };

  /**
   * Custom render option with highlighting
   */
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
      title={option}
    >
      {highlightText(option, inputValue)}
    </li>
  );

  /**
   * No options text based on state
   */
  const noOptionsText = namesLoading
    ? "Loading names..."
    : namesError
    ? "Error loading names"
    : "No matches found";

  return (
    <div style={{ width: "100%", maxWidth: "300px" }}>
      {showLabel && label && (
        <label
          style={{
            color: "#fff",
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
        options={suggestions}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onOpen={fetchNames} // Lazy load on open
        getOptionLabel={getNameDisplayLabel}
        isOptionEqualToValue={(option, val) => areNamesEqual(option, val)}
        filterOptions={filterOptions}
        renderOption={renderOption}
        placeholder={placeholder}
        placeholderColor="#9ca3af"
        error={error}
        helperText={helperText}
        disabled={disabled}
        loading={namesLoading}
        noOptionsText={noOptionsText}
        size={size}
        autoFocus={autoFocus}
        freeSolo={freeSolo}
        autoHighlight={autoHighlight}
        clearOnEscape={clearOnEscape}
        sx={sx}
      />
      {namesError &&
        !helperText &&
        !namesLoading &&
        suggestions.length === 0 && (
          <div
            style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "4px" }}
          >
            Error: {namesError}
          </div>
        )}
    </div>
  );
};

ExpenseNameAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  friendId: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.oneOf(["small", "medium"]),
  onNameSelect: PropTypes.func,
  autoFocus: PropTypes.bool,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  autofetch: PropTypes.bool,
  maxSuggestions: PropTypes.number,
  freeSolo: PropTypes.bool,
  autoHighlight: PropTypes.bool,
  clearOnEscape: PropTypes.bool,
};

export default ExpenseNameAutocomplete;
