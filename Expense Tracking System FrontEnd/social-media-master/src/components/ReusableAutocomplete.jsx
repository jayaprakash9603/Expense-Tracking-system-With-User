import React from "react";
import {
  Autocomplete as MuiAutocomplete,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import ReusableTextField from "./ReusableTextField";

/**
 * ReusableAutocomplete - A robust, reusable Autocomplete component
 *
 * Features:
 * - Consistent dark theme styling
 * - Loading state with spinner
 * - Error handling
 * - Custom filtering
 * - Custom rendering
 * - Highlight support
 * - Fully extensible
 *
 * @param {Array} options - Array of options
 * @param {any} value - Selected value
 * @param {function} onChange - Change handler (event, newValue)
 * @param {function} onInputChange - Input change handler (event, value, reason)
 * @param {function} getOptionLabel - Function to get option label
 * @param {function} isOptionEqualToValue - Function to compare options
 * @param {function} filterOptions - Custom filter function
 * @param {function} renderOption - Custom option renderer
 * @param {string} placeholder - Placeholder text
 * @param {boolean} error - Error state
 * @param {string} helperText - Helper text
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Loading text
 * @param {string} noOptionsText - No options text
 * @param {string} size - Size: "small", "medium"
 * @param {boolean} autoHighlight - Auto highlight first option
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {boolean} clearOnBlur - Clear on blur
 * @param {boolean} clearOnEscape - Clear on escape
 * @param {boolean} disableClearable - Disable clear button
 * @param {boolean} freeSolo - Allow free text input
 * @param {object} sx - Additional MUI sx styles
 * @param {string} backgroundColor - Background color
 * @param {string} textColor - Text color
 * @param {string} borderColor - Border color
 * @param {string} focusBorderColor - Focus border color
 * @param {string} errorBorderColor - Error border color
 * @param {string} placeholderColor - Placeholder color
 * @param {React.Element} startAdornment - Start adornment
 * @param {React.Element} endAdornment - End adornment
 * @param {boolean} multiple - Multiple selection
 * @param {string} id - Component ID
 */
const ReusableAutocomplete = ({
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
  sx = {},
  backgroundColor = "#29282b",
  textColor = "#fff",
  borderColor = "rgb(75, 85, 99)",
  focusBorderColor = "#00dac6",
  errorBorderColor = "#ff4d4f",
  placeholderColor = "#9ca3af",
  startAdornment,
  endAdornment,
  multiple = false,
  id,
  ...restProps
}) => {
  const defaultSx = {
    width: "100%",
    maxWidth: "300px",
    "& .MuiInputBase-root": {
      backgroundColor: backgroundColor,
      color: textColor,
      height: size === "small" ? "40px" : "56px",
      fontSize: size === "small" ? "14px" : "16px",
    },
    "& .MuiInputBase-input": {
      color: textColor,
      "&::placeholder": {
        color: placeholderColor,
        opacity: 1,
      },
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: error ? errorBorderColor : borderColor,
        borderWidth: error ? "2px" : "1px",
      },
      "&:hover fieldset": {
        borderColor: error ? errorBorderColor : borderColor,
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? errorBorderColor : focusBorderColor,
        borderWidth: "2px",
      },
    },
    "& .MuiAutocomplete-option": {
      fontSize: size === "small" ? "0.875rem" : "0.92rem",
      paddingTop: "4px",
      paddingBottom: "4px",
    },
    "& .MuiAutocomplete-listbox": {
      backgroundColor: "#1b1b1b",
      color: textColor,
    },
    "& .MuiAutocomplete-option:hover": {
      backgroundColor: "#2d2d2d",
    },
    "& .MuiAutocomplete-option[aria-selected='true']": {
      backgroundColor: "#3d3d3d",
    },
    ...sx,
  };

  // Default render option with custom styling
  const defaultRenderOption = (props, option, { inputValue }) => (
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
      title={getOptionLabel(option)}
    >
      {getOptionLabel(option)}
    </li>
  );

  return (
    <MuiAutocomplete
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={filterOptions}
      renderOption={renderOption || defaultRenderOption}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      disabled={disabled}
      autoHighlight={autoHighlight}
      autoFocus={autoFocus}
      clearOnBlur={clearOnBlur}
      clearOnEscape={clearOnEscape}
      disableClearable={disableClearable}
      freeSolo={freeSolo}
      multiple={multiple}
      sx={defaultSx}
      renderInput={(params) => (
        <ReusableTextField
          {...params}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          size={size}
          backgroundColor={backgroundColor}
          textColor={textColor}
          borderColor={borderColor}
          focusBorderColor={focusBorderColor}
          errorBorderColor={errorBorderColor}
          placeholderColor={placeholderColor}
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
};

ReusableAutocomplete.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onInputChange: PropTypes.func,
  getOptionLabel: PropTypes.func,
  isOptionEqualToValue: PropTypes.func,
  filterOptions: PropTypes.func,
  renderOption: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  noOptionsText: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"]),
  autoHighlight: PropTypes.bool,
  autoFocus: PropTypes.bool,
  clearOnBlur: PropTypes.bool,
  clearOnEscape: PropTypes.bool,
  disableClearable: PropTypes.bool,
  freeSolo: PropTypes.bool,
  sx: PropTypes.object,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,
  focusBorderColor: PropTypes.string,
  errorBorderColor: PropTypes.string,
  placeholderColor: PropTypes.string,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  multiple: PropTypes.bool,
  id: PropTypes.string,
};

export default ReusableAutocomplete;
