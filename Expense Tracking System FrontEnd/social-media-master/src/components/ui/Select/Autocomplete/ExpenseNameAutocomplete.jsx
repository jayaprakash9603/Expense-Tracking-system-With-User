import React, { useMemo } from "react";
import PropTypes from "prop-types";
import AppAutocomplete from "../AppAutocomplete";
import useExpenseNames from "../../../../hooks/useExpenseNames";
import { useTheme } from "../../../../hooks/useTheme";
import {
  findExactNameMatch,
  areNamesEqual,
  getNameDisplayLabel,
  sanitizeName,
} from "../../../../utils/nameUtils";
import HighlightedText from "../../../common/HighlightedText";

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
 * @param {string} friendId - Optional friend ID for fetching friend-specific names
 * @param {string} label - Label for the autocomplete
 * @param {string} placeholder - Placeholder text for the input
 * @param {boolean} error - Whether to show error state
 * @param {string} helperText - Helper text to display below the input
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the field is required
 * @param {object} sx - Additional MUI sx styles
 * @param {string} size - Input size: "small", "medium"
 * @param {function} onNameSelect - Callback with full name when selected
 * @param {boolean} autoFocus - Whether to auto-focus the input
 * @param {boolean} showLabel - Whether to show the label
 * @param {boolean} freeSolo - Whether to allow free text input (default: true)
 * @param {boolean} autofetch - Whether to automatically fetch expense names (default: true)
 * @param {number} maxSuggestions - Maximum number of suggestions (default: 50)
 * @param {boolean} autoHighlight - Auto-highlight first option (default: true)
 * @param {boolean} clearOnEscape - Clear on Escape key (default: true)
 */
const ExpenseNameAutocomplete = ({
  value = "",
  onChange,
  friendId = "",
  label = "",
  placeholder = "Enter name",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  sx = {},
  size = "medium",
  onNameSelect = null,
  autoFocus = false,
  showLabel = true,
  freeSolo = true,
  autofetch = true,
  maxSuggestions = 50,
  autoHighlight = true,
  clearOnEscape = true,
}) => {
  const { colors } = useTheme();

  // Use custom hook for name management
  const {
    suggestions,
    loading: namesLoading,
    error: namesError,
    setInputValue,
    fetchNames,
  } = useExpenseNames(friendId, autofetch, maxSuggestions);

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
        paddingTop: 6,
        paddingBottom: 6,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 300,
      }}
      title={option}
    >
      <HighlightedText text={option} query={inputValue} title={option} />
    </li>
  );

  const noOptionsText = namesLoading
    ? "Loading names..."
    : namesError
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
        options={suggestions}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onOpen={fetchNames} // Lazy load on open
        getOptionLabel={getNameDisplayLabel}
        isOptionEqualToValue={(option, val) => areNamesEqual(option, val)}
        renderOption={renderOption}
        placeholder={placeholder}
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
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.oneOf(["small", "medium"]),
  onNameSelect: PropTypes.func,
  autoFocus: PropTypes.bool,
  showLabel: PropTypes.bool,
  freeSolo: PropTypes.bool,
  autofetch: PropTypes.bool,
  maxSuggestions: PropTypes.number,
  autoHighlight: PropTypes.bool,
  clearOnEscape: PropTypes.bool,
};

export default ExpenseNameAutocomplete;
