import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { DENSITY, SEMANTIC } from "@shared/theme/tokens";
import AppTextField from "../TextField/AppTextField";

/**
 * AppDatePicker — theme-aware date input (MUI X DatePicker with TextField fallback).
 *
 * @example
 * <AppDatePicker
 *   label="Due date"
 *   value={date}
 *   onChange={(v) => setDate(v)}
 * />
 */
const AppDatePicker = React.forwardRef(
  (
    {
      value,
      onChange,
      label,
      format = "DD/MM/YYYY",
      minDate,
      maxDate,
      disabled = false,
      error = false,
      helperText = "",
      size = "medium",
      density = "comfortable",
      fullWidth = true,
      required = false,
      useNativeFallback = false,
      className = "",
      sx = {},
      slotProps = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const isCompact = density === "compact" || size === "compact";
    const densityKey = isCompact ? "compact" : size === "large" ? "large" : "medium";
    const current = DENSITY[densityKey] || DENSITY.medium;

    const accent = colors.primary_accent || "#00dac6";
    const errorColor = colors.error || SEMANTIC.error;
    const borderColor = colors.border_color || "rgb(75, 85, 99)";
    const textColor = colors.primary_text || "#fff";
    const mutedColor = colors.secondary_text || "#9ca3af";

    const pickerSx = {
      width: fullWidth ? "100%" : "auto",
      "& .MuiOutlinedInput-root": {
        minHeight: current.controlHeight,
        bgcolor: colors.active_bg || colors.secondary_bg,
        borderRadius: `${current.radius}`,
        fontSize: current.fontSize,
        "& fieldset": {
          borderColor: error ? errorColor : borderColor,
          borderWidth: error ? "2px" : "1px",
        },
        "&:hover fieldset": { borderColor: error ? errorColor : accent },
        "&.Mui-focused fieldset": {
          borderColor: error ? errorColor : accent,
          borderWidth: "2px",
        },
      },
      "& .MuiInputBase-input": { color: textColor },
      "& .MuiInputLabel-root": {
        color: mutedColor,
        "&.Mui-focused": { color: error ? errorColor : accent },
      },
      "& .MuiSvgIcon-root": { color: accent },
      ...sx,
    };

    const dayjsValue = value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null;

    const handleChange = (newValue) => {
      onChange?.(newValue);
    };

    if (useNativeFallback) {
      const nativeValue = dayjsValue ? dayjsValue.format("YYYY-MM-DD") : "";
      return (
        <AppTextField
          ref={ref}
          type="date"
          label={label}
          value={nativeValue}
          onChange={(e) => handleChange(e.target.value ? dayjs(e.target.value) : null)}
          disabled={disabled}
          error={error}
          helperText={helperText}
          size={isCompact ? "small" : size}
          fullWidth={fullWidth}
          required={required}
          className={className}
          sx={pickerSx}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate?.format?.("YYYY-MM-DD"), max: maxDate?.format?.("YYYY-MM-DD") }}
          {...restProps}
        />
      );
    }

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MuiDatePicker
          ref={ref}
          label={label}
          value={dayjsValue}
          onChange={handleChange}
          format={format}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          className={className}
          sx={pickerSx}
          slotProps={{
            textField: {
              fullWidth,
              required,
              error,
              helperText,
              size: isCompact ? "small" : size === "large" ? "medium" : size,
              ...slotProps.textField,
            },
            openPickerButton: {
              sx: { color: accent, ...slotProps.openPickerButton?.sx },
              ...slotProps.openPickerButton,
            },
            ...slotProps,
          }}
          {...restProps}
        />
      </LocalizationProvider>
    );
  },
);

AppDatePicker.displayName = "AppDatePicker";

AppDatePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Date)]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  format: PropTypes.string,
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(["compact", "small", "medium", "large"]),
  density: PropTypes.oneOf(["compact", "comfortable"]),
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  useNativeFallback: PropTypes.bool,
  className: PropTypes.string,
  sx: PropTypes.object,
  slotProps: PropTypes.object,
};

export default AppDatePicker;
