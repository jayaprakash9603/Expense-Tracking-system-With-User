import React from "react";
import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppSelect - Base wrapper for MUI Select component
 *
 * Provides consistent theming across the application.
 *
 * @example
 * <AppSelect
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: 'food', label: 'Food' },
 *     { value: 'transport', label: 'Transport' },
 *   ]}
 *   label="Category"
 * />
 */
const AppSelect = React.forwardRef(
  (
    {
      value,
      onChange,
      options = [],
      label,
      placeholder = "Select...",
      error = false,
      helperText = "",
      disabled = false,
      size = "medium",
      fullWidth = true,
      required = false,
      multiple = false,
      displayEmpty = true,
      renderValue,
      sx = {},
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
    const placeholderColor = colors.placeholder_text || "#9ca3af";

    const formControlSx = {
      width: fullWidth ? "100%" : "auto",
      "& .MuiInputBase-root": {
        backgroundColor: bgColor,
        color: textColor,
        height: currentSize.height,
        fontSize: currentSize.fontSize,
        borderRadius: "8px",
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
      "& .MuiSelect-icon": {
        color: colors.secondary_text || placeholderColor,
      },
      "& .MuiInputLabel-root": {
        color: colors.secondary_text || placeholderColor,
        "&.Mui-focused": {
          color: error ? errorBorderColor : focusBorderColor,
        },
      },
      ...sx,
    };

    const menuProps = {
      PaperProps: {
        sx: {
          backgroundColor: colors.primary_bg || "#1f1f23",
          color: textColor,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          "& .MuiMenuItem-root": {
            fontSize: currentSize.fontSize,
            padding: "10px 16px",
            "&:hover": {
              backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor: colors.selected_bg || "rgba(0, 218, 198, 0.15)",
              "&:hover": {
                backgroundColor: colors.selected_bg || "rgba(0, 218, 198, 0.2)",
              },
            },
          },
        },
      },
    };

    // Default render value for placeholder
    const defaultRenderValue = (selected) => {
      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        return <span style={{ color: placeholderColor }}>{placeholder}</span>;
      }
      if (multiple && Array.isArray(selected)) {
        return selected
          .map((val) => {
            const option = options.find((opt) => opt.value === val);
            return option?.label || val;
          })
          .join(", ");
      }
      const option = options.find((opt) => opt.value === selected);
      return option?.label || selected;
    };

    return (
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        required={required}
        size={size === "large" ? "medium" : size}
        sx={formControlSx}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <MuiSelect
          ref={ref}
          value={value}
          onChange={onChange}
          label={label}
          multiple={multiple}
          displayEmpty={displayEmpty}
          renderValue={renderValue || defaultRenderValue}
          MenuProps={menuProps}
          {...restProps}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

AppSelect.displayName = "AppSelect";

AppSelect.propTypes = {
  /** Selected value */
  value: PropTypes.any,
  /** Change handler */
  onChange: PropTypes.func,
  /** Array of options */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    }),
  ),
  /** Input label */
  label: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Error state */
  error: PropTypes.bool,
  /** Helper text */
  helperText: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Input size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Full width */
  fullWidth: PropTypes.bool,
  /** Required field */
  required: PropTypes.bool,
  /** Allow multiple selections */
  multiple: PropTypes.bool,
  /** Display empty value */
  displayEmpty: PropTypes.bool,
  /** Custom render function for selected value */
  renderValue: PropTypes.func,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppSelect;
