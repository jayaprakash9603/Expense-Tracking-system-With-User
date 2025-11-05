import React from "react";
import { TextField as MuiTextField } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";

/**
 * ReusableTextField - A robust, reusable TextField component
 *
 * Features:
 * - Consistent dark theme styling
 * - Customizable sizes and colors
 * - Error state handling
 * - Helper text support
 * - Fully extensible with sx prop
 *
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} error - Error state
 * @param {string} helperText - Helper text below input
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size: "small", "medium"
 * @param {string} variant - MUI variant: "outlined", "filled", "standard"
 * @param {object} sx - Additional MUI sx styles
 * @param {string} backgroundColor - Background color
 * @param {string} textColor - Text color
 * @param {string} borderColor - Border color
 * @param {string} focusBorderColor - Focus border color
 * @param {string} errorBorderColor - Error border color
 * @param {string} placeholderColor - Placeholder text color
 * @param {object} InputProps - Additional InputProps
 * @param {object} inputProps - Additional native input props
 * @param {boolean} multiline - Multiline text area
 * @param {number} rows - Number of rows for multiline
 * @param {number} maxRows - Max rows for multiline
 * @param {string} type - Input type (text, number, email, etc.)
 * @param {boolean} fullWidth - Full width
 * @param {string} id - Input ID
 * @param {string} name - Input name
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {boolean} required - Required field
 * @param {string} label - Input label
 */
const ReusableTextField = ({
  value,
  onChange,
  placeholder = "",
  error = false,
  helperText = "",
  disabled = false,
  size = "medium",
  variant = "outlined",
  sx = {},
  backgroundColor = "#29282b",
  textColor = "#fff",
  borderColor = "rgb(75, 85, 99)",
  focusBorderColor = "#00dac6",
  errorBorderColor = "#ff4d4f",
  placeholderColor = "#9ca3af",
  InputProps = {},
  inputProps = {},
  multiline = false,
  rows,
  maxRows,
  type = "text",
  fullWidth = true,
  id,
  name,
  autoFocus = false,
  required = false,
  label,
  ...restProps
}) => {
  const { colors } = useTheme();

  // Use theme colors as defaults if no custom colors provided (check against hardcoded defaults)
  const effectiveBgColor =
    backgroundColor === "#29282b" ? colors.active_bg : backgroundColor;
  const effectiveTextColor =
    textColor === "#fff" ? colors.primary_text : textColor;
  const effectiveBorderColor =
    borderColor === "rgb(75, 85, 99)" ? colors.border_color : borderColor;
  const effectiveFocusBorderColor =
    focusBorderColor === "#00dac6" ? "#00dac6" : focusBorderColor;
  const effectivePlaceholderColor =
    placeholderColor === "#9ca3af" ? colors.placeholder_text : placeholderColor;

  const defaultSx = {
    width: fullWidth ? "100%" : "auto",
    maxWidth: "300px",
    "& .MuiInputBase-root": {
      backgroundColor: effectiveBgColor,
      color: effectiveTextColor,
      height: !multiline ? (size === "small" ? "40px" : "56px") : "auto",
      fontSize: size === "small" ? "14px" : "16px",
    },
    "& .MuiInputBase-input": {
      color: effectiveTextColor,
      "&::placeholder": {
        color: effectivePlaceholderColor,
        opacity: 1,
      },
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: error ? errorBorderColor : effectiveBorderColor,
        borderWidth: error ? "2px" : "1px",
      },
      "&:hover fieldset": {
        borderColor: error ? errorBorderColor : effectiveBorderColor,
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? errorBorderColor : effectiveFocusBorderColor,
        borderWidth: "2px",
      },
    },
    "& .MuiFormHelperText-root": {
      color: error ? errorBorderColor : effectiveTextColor,
      marginLeft: 0,
      fontSize: "0.75rem",
    },
    ...sx,
  };

  return (
    <MuiTextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      size={size}
      variant={variant}
      sx={defaultSx}
      InputProps={InputProps}
      inputProps={inputProps}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      type={type}
      fullWidth={fullWidth}
      id={id}
      name={name}
      autoFocus={autoFocus}
      required={required}
      label={label}
      {...restProps}
    />
  );
};

ReusableTextField.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  sx: PropTypes.object,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,
  focusBorderColor: PropTypes.string,
  errorBorderColor: PropTypes.string,
  placeholderColor: PropTypes.string,
  InputProps: PropTypes.object,
  inputProps: PropTypes.object,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
  required: PropTypes.bool,
  label: PropTypes.string,
};

export default ReusableTextField;
