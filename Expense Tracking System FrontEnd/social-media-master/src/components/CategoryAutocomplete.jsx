import React, { useMemo } from "react";
import PropTypes from "prop-types";
import ReusableAutocomplete from "./ReusableAutocomplete";
import useCategories from "../hooks/useCategories";
import { useTheme } from "../hooks/useTheme";
import {
  findCategoryById,
  findExactCategoryMatch,
  areCategoriesEqual,
  getCategoryDisplayName,
  filterCategoriesWithDeduplication,
} from "../utils/categoryUtils";
import HighlightedText from "./common/HighlightedText";

/**
 * CategoryAutocomplete - A reusable category selection component
 *
 * Features:
 * - Automatic category fetching from API
 * - Deduplication of categories by name (case-insensitive)
 * - Smart filtering and matching
 * - Auto-selection on exact name match
 * - Customizable styling and behavior
 * - Loading and error states
 *
 * @param {number|string} value - The selected category ID
 * @param {function} onChange - Callback when category selection changes (categoryId)
 * @param {string} friendId - Optional friend ID for fetching friend-specific categories
 * @param {string} placeholder - Placeholder text for the input
 * @param {boolean} error - Whether to show error state
 * @param {string} helperText - Helper text to display below the input
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the field is required
 * @param {object} sx - Additional MUI sx styles
 * @param {string} size - Input size: "small", "medium"
 * @param {function} onCategoryChange - Callback with full category object (optional)
 * @param {boolean} autoFocus - Whether to auto-focus the input
 * @param {string} label - Label for the autocomplete (if used standalone)
 * @param {boolean} showLabel - Whether to show the label
 * @param {boolean} autofetch - Whether to automatically fetch categories (default: true)
 */
const CategoryAutocomplete = ({
  value,
  onChange,
  friendId = "",
  placeholder = "Search category",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  sx = {},
  size = "medium",
  onCategoryChange = null,
  autoFocus = false,
  label = "",
  showLabel = false,
  autofetch = true,
}) => {
  const { colors } = useTheme();
  // Use custom hook for category management
  const {
    uniqueCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(friendId, autofetch);

  // Find the selected category object
  const selectedCategory = useMemo(() => {
    return findCategoryById(uniqueCategories, value);
  }, [value, uniqueCategories]);

  // Handle category selection change
  const handleChange = (event, newValue) => {
    const categoryId = newValue ? newValue.id : "";
    onChange(categoryId);

    // Call optional callback with full category object
    if (onCategoryChange) {
      onCategoryChange(newValue);
    }
  };

  // Handle input change for auto-matching
  const handleInputChange = (event, inputValue, reason) => {
    if (reason === "input" && inputValue) {
      const exactMatch = findExactCategoryMatch(uniqueCategories, inputValue);
      if (exactMatch && exactMatch.id !== value) {
        onChange(exactMatch.id);
        if (onCategoryChange) {
          onCategoryChange(exactMatch);
        }
      }
    }
  };

  // Filter options with real-time deduplication
  const filterOptions = (options, { inputValue }) => {
    return filterCategoriesWithDeduplication(options, inputValue);
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
      title={option.name}
    >
      <HighlightedText
        text={option.name}
        query={inputValue}
        title={option.name}
      />
    </li>
  );

  const noOptionsText = categoriesLoading
    ? "Loading categories..."
    : categoriesError
    ? "Error loading categories"
    : "No categories found";

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
        options={uniqueCategories}
        value={selectedCategory}
        onChange={handleChange}
        onInputChange={handleInputChange}
        getOptionLabel={getCategoryDisplayName}
        isOptionEqualToValue={areCategoriesEqual}
        filterOptions={filterOptions}
        renderOption={renderOption}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        loading={categoriesLoading}
        noOptionsText={noOptionsText}
        size={size}
        autoFocus={autoFocus}
        sx={sx}
      />
      {categoriesError && !helperText && (
        <div
          style={{
            color: colors.primary_text,
            fontSize: "0.75rem",
            marginTop: "4px",
          }}
        >
          Error: {categoriesError}
        </div>
      )}
    </div>
  );
};

CategoryAutocomplete.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  friendId: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.oneOf(["small", "medium"]),
  onCategoryChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  autofetch: PropTypes.bool,
};

export default CategoryAutocomplete;
