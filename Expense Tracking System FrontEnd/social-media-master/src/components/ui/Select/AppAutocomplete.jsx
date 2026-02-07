import React, { useMemo } from "react";
import {
  Autocomplete as MuiAutocomplete,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import { AppTextField } from "../TextField";
import { useTheme } from "../../../hooks/useTheme";
import HighlightedText from "../../common/HighlightedText";
import { createFuzzyFilterOptions } from "../../../utils/fuzzyMatchUtils";

/**
 * AppAutocomplete - Base wrapper for MUI Autocomplete component
 *
 * Built on the same patterns as the existing ReusableAutocomplete.
 *
 * @example
 * <AppAutocomplete
 *   options={categories}
 *   value={selectedCategory}
 *   onChange={(e, newValue) => setSelectedCategory(newValue)}
 *   placeholder="Search categories..."
 * />
 */
const AppAutocomplete = React.forwardRef(
  (
    {
      options = [],
      value = null,
      onChange,
      onInputChange,
      getOptionLabel = (option) => option?.label || option?.name || "",
      isOptionEqualToValue = (option, value) => option?.id === value?.id,
      filterOptions,
      renderOption,
      placeholder = "",
      error = false,
      helperText = "",
      disabled = false,
      loading = false,
      loadingText = "Loading...",
      noOptionsText = "No options found",
      size = "medium",
      autoHighlight = true,
      autoFocus = false,
      clearOnBlur = false,
      clearOnEscape = true,
      disableClearable = false,
      freeSolo = false,
      multiple = false,
      startAdornment,
      endAdornment,
      id,
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Theme-aware colors
    const bgColor = colors.primary_bg || "#1f1f23";
    const textColor = colors.primary_text || "#fff";
    const borderColor = colors.border_color || "rgb(75, 85, 99)";
    const focusBorderColor = colors.primary_accent || "#00dac6";
    const errorBorderColor = colors.error || "#ff4d4f";
    const placeholderColor = colors.placeholder_text || "#9ca3af";
    const highlightColor = colors.primary_accent || "#00dac6";

    const autocompleteSx = {
      width: "100%",
      "& .MuiAutocomplete-option": {
        fontSize: size === "small" ? "0.875rem" : "0.95rem",
        paddingTop: "8px",
        paddingBottom: "8px",
      },
      "& .MuiAutocomplete-listbox": {
        backgroundColor: bgColor,
        color: textColor,
      },
      "& .MuiAutocomplete-option:hover": {
        backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.08)",
      },
      "& .MuiAutocomplete-option[aria-selected='true']": {
        backgroundColor: colors.selected_bg || "rgba(0, 218, 198, 0.15)",
      },
      "& .MuiAutocomplete-option.Mui-focused": {
        backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.08)",
      },
      "& .MuiAutocomplete-paper": {
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      },
      "& .MuiAutocomplete-noOptions": {
        color: colors.secondary_text || placeholderColor,
      },
      "& .MuiAutocomplete-loading": {
        color: colors.secondary_text || placeholderColor,
      },
      ...sx,
    };

    // Default fuzzy filter options
    const defaultFilterOptions = useMemo(() => {
      try {
        return createFuzzyFilterOptions({ getOptionLabel });
      } catch {
        // Fallback if fuzzyMatchUtils not available
        return undefined;
      }
    }, [getOptionLabel]);

    // Default render option with highlighting
    const defaultRenderOption = (props, option, { inputValue }) => {
      const label = getOptionLabel(option);
      return (
        <li
          {...props}
          style={{
            fontSize: size === "small" ? "0.875rem" : "0.95rem",
            paddingTop: 8,
            paddingBottom: 8,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={label}
        >
          {HighlightedText ? (
            <HighlightedText
              text={label}
              query={inputValue}
              highlightStyle={{ color: highlightColor, fontWeight: 700 }}
            />
          ) : (
            label
          )}
        </li>
      );
    };

    return (
      <MuiAutocomplete
        ref={ref}
        id={id}
        options={options}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        filterOptions={filterOptions || defaultFilterOptions}
        renderOption={renderOption || defaultRenderOption}
        loading={loading}
        loadingText={loadingText}
        noOptionsText={noOptionsText}
        disabled={disabled}
        autoHighlight={autoHighlight}
        clearOnBlur={clearOnBlur}
        clearOnEscape={clearOnEscape}
        disableClearable={disableClearable}
        freeSolo={freeSolo}
        multiple={multiple}
        sx={autocompleteSx}
        renderInput={(params) => (
          <AppTextField
            {...params}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            size={size}
            autoFocus={autoFocus}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {startAdornment}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {endAdornment}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        {...restProps}
      />
    );
  },
);

AppAutocomplete.displayName = "AppAutocomplete";

AppAutocomplete.propTypes = {
  /** Array of options */
  options: PropTypes.array,
  /** Selected value */
  value: PropTypes.any,
  /** Change handler */
  onChange: PropTypes.func,
  /** Input change handler */
  onInputChange: PropTypes.func,
  /** Function to get option label */
  getOptionLabel: PropTypes.func,
  /** Function to compare options */
  isOptionEqualToValue: PropTypes.func,
  /** Custom filter function */
  filterOptions: PropTypes.func,
  /** Custom option renderer */
  renderOption: PropTypes.func,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Error state */
  error: PropTypes.bool,
  /** Helper text */
  helperText: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Loading text */
  loadingText: PropTypes.string,
  /** No options text */
  noOptionsText: PropTypes.string,
  /** Input size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Auto highlight first option */
  autoHighlight: PropTypes.bool,
  /** Auto focus on mount */
  autoFocus: PropTypes.bool,
  /** Clear on blur */
  clearOnBlur: PropTypes.bool,
  /** Clear on escape */
  clearOnEscape: PropTypes.bool,
  /** Disable clear button */
  disableClearable: PropTypes.bool,
  /** Allow free text input */
  freeSolo: PropTypes.bool,
  /** Allow multiple selections */
  multiple: PropTypes.bool,
  /** Start adornment */
  startAdornment: PropTypes.node,
  /** End adornment */
  endAdornment: PropTypes.node,
  /** Component ID */
  id: PropTypes.string,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppAutocomplete;
