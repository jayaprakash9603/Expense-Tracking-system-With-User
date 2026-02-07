import React from "react";
import { TextField as MuiTextField } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppTextField - Base wrapper for MUI TextField component
 *
 * Provides consistent theming across the application.
 * Built on the same patterns as the existing ReusableTextField.
 *
 * @example
 * // Basic usage
 * <AppTextField
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Enter name"
 * />
 */
const AppTextField = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "",
      error = false,
      helperText = "",
      disabled = false,
      size = "medium",
      variant = "outlined",
      sx = {},
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
      maxWidth = "100%",
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Size configurations
    const sizeConfig = {
      small: {
        height: "40px",
        fontSize: "14px",
      },
      medium: {
        height: "48px",
        fontSize: "15px",
      },
      large: {
        height: "56px",
        fontSize: "16px",
      },
    };

    const currentSize = sizeConfig[size] || sizeConfig.medium;

    // Theme-aware colors
    const bgColor = colors.active_bg || colors.secondary_bg || "#29282b";
    const textColor = colors.primary_text || "#fff";
    const borderColor = colors.border_color || "rgb(75, 85, 99)";
    const focusBorderColor = colors.primary_accent || "#00dac6";
    const errorBorderColor = colors.error || "#ff4d4f";
    const placeholderColor =
      colors.placeholder_text || colors.secondary_text || "#9ca3af";

    const defaultSx = {
      width: fullWidth ? "100%" : "auto",
      maxWidth: maxWidth,
      "& .MuiInputBase-root": {
        backgroundColor: "transparent",
        color: textColor,
        height: !multiline ? currentSize.height : "auto",
        fontSize: currentSize.fontSize,
        borderRadius: "8px",
      },
      "& .MuiInputBase-input": {
        color: textColor,
        backgroundColor: "transparent",
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
        "&.Mui-disabled": {
          backgroundColor: colors.disabled_bg || "#333",
          "& fieldset": {
            borderColor: colors.disabled_border || "#444",
          },
        },
      },
      "& .MuiInputLabel-root": {
        color: colors.secondary_text || placeholderColor,
        "&.Mui-focused": {
          color: error ? errorBorderColor : focusBorderColor,
        },
        "&.Mui-error": {
          color: errorBorderColor,
        },
      },
      "& .MuiFormHelperText-root": {
        color: error ? errorBorderColor : colors.secondary_text || textColor,
        marginLeft: 0,
        fontSize: "0.75rem",
      },
      ...sx,
    };

    return (
      <MuiTextField
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        size={size === "large" ? "medium" : size}
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
  },
);

AppTextField.displayName = "AppTextField";

AppTextField.propTypes = {
  /** Input value */
  value: PropTypes.any,
  /** Change handler */
  onChange: PropTypes.func,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Error state */
  error: PropTypes.bool,
  /** Helper text below input */
  helperText: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Input size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** MUI variant */
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  /** Additional MUI sx styles */
  sx: PropTypes.object,
  /** Additional InputProps */
  InputProps: PropTypes.object,
  /** Additional native input props */
  inputProps: PropTypes.object,
  /** Multiline text area */
  multiline: PropTypes.bool,
  /** Number of rows for multiline */
  rows: PropTypes.number,
  /** Max rows for multiline */
  maxRows: PropTypes.number,
  /** Input type */
  type: PropTypes.string,
  /** Full width */
  fullWidth: PropTypes.bool,
  /** Input ID */
  id: PropTypes.string,
  /** Input name */
  name: PropTypes.string,
  /** Auto focus on mount */
  autoFocus: PropTypes.bool,
  /** Required field */
  required: PropTypes.bool,
  /** Input label */
  label: PropTypes.string,
  /** Max width constraint */
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AppTextField;
