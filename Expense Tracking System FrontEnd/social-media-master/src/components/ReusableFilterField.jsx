import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";

/**
 * ReusableFilterField - A unified component for filter fields (TextField, Select, Date)
 *
 * Features:
 * - Consistent theme-aware styling across all input types
 * - Support for TextField, Select, and Date inputs
 * - Grid layout support for paired fields
 * - Icon adornments with consistent accent color
 * - Minimal height: 56px for all field types (matches ReusableAutocomplete)
 * - Production-ready with proper prop validation
 *
 * @param {string} type - Field type: "text", "number", "date", "select"
 * @param {string} label - Field label
 * @param {any} value - Field value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text (for TextField)
 * @param {Array} options - Select options [{value, label}] (for Select)
 * @param {React.Element} startAdornment - Icon or element at start
 * @param {React.Element} endAdornment - Icon or element at end
 * @param {object} inputProps - Additional native input props (min, max, step, etc.)
 * @param {object} InputProps - Additional MUI InputProps
 * @param {boolean} fullWidth - Full width (default: true)
 * @param {string} size - Size: "small", "medium" (default: "medium")
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disabled state
 * @param {object} sx - Additional MUI sx styles
 * @param {object} gridProps - Grid item props for responsive layout {xs, sm, md}
 */
const ReusableFilterField = ({
  type = "text",
  label = "",
  value = "",
  onChange,
  placeholder = "",
  options = [],
  startAdornment = null,
  endAdornment = null,
  inputProps = {},
  InputProps = {},
  fullWidth = true,
  size = "medium",
  required = false,
  disabled = false,
  sx = {},
  gridProps = null,
  ...restProps
}) => {
  const { colors, mode } = useTheme();

  // Theme-aware styling functions
  const getBaseFieldStyles = () => ({
    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      bgcolor: colors.secondary_bg,
      borderRadius: 2,
      "& fieldset": {
        borderColor: colors.border_color,
        borderWidth: "1px",
        borderStyle: "solid",
      },
      "&:hover fieldset": {
        borderColor: "#00dac6",
        borderWidth: "1px",
        borderStyle: "solid",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00dac6",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    },
    "& .MuiInputBase-input": {
      color: colors.primary_text,
    },
    "& .MuiInputLabel-root": {
      color: colors.secondary_text,
      "&.Mui-focused": {
        color: "#00dac6",
      },
    },
    "& .MuiSelect-icon": {
      color: colors.primary_text,
    },
    ...sx,
  });

  const getSelectStyles = () => ({
    minHeight: 56,
    bgcolor: colors.secondary_bg,
    borderRadius: 2,
    color: colors.primary_text,
    "& fieldset": {
      borderColor: colors.border_color,
      borderWidth: "1px",
      borderStyle: "solid",
    },
    "&:hover fieldset": {
      borderColor: "#00dac6",
      borderWidth: "1px",
      borderStyle: "solid",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00dac6",
      borderWidth: "2px",
      borderStyle: "solid",
    },
    "& .MuiSelect-icon": {
      color: colors.primary_text,
    },
    ...sx,
  });

  // Merge custom InputProps with startAdornment
  const mergedInputProps = {
    ...InputProps,
    ...(startAdornment && {
      startAdornment: (
        <InputAdornment position="start">{startAdornment}</InputAdornment>
      ),
    }),
    ...(endAdornment && {
      endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>,
    }),
  };

  // Render TextField for text, number, email types
  const renderTextField = () => (
    <TextField
      size={size}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      sx={getBaseFieldStyles()}
      InputProps={mergedInputProps}
      inputProps={inputProps}
      {...restProps}
    />
  );

  // Render MUI DatePicker for date type
  const renderDatePicker = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          if (newValue) {
            const formatted = dayjs(newValue).format("YYYY-MM-DD");
            onChange({ target: { value: formatted } });
          } else {
            onChange({ target: { value: "" } });
          }
        }}
        disabled={disabled}
        sx={{
          width: fullWidth ? "100%" : "auto",
          "& .MuiOutlinedInput-root": {
            minHeight: 48,
            bgcolor: colors.secondary_bg,
            borderRadius: 2,
            "& fieldset": {
              borderColor: colors.border_color,
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "&:hover fieldset": {
              borderColor: "#00dac6",
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00dac6",
              borderWidth: "2px",
              borderStyle: "solid",
            },
          },
          "& .MuiInputBase-input": {
            color: colors.primary_text,
          },
          "& .MuiInputLabel-root": {
            color: colors.secondary_text,
            "&.Mui-focused": {
              color: "#00dac6",
            },
          },
          "& .MuiSvgIcon-root": {
            color: "#00dac6",
          },
          ...sx,
        }}
        slotProps={{
          textField: {
            size: size,
            variant: "outlined",
            fullWidth: fullWidth,
            required: required,
          },
        }}
        format="DD/MM/YYYY"
        {...restProps}
      />
    </LocalizationProvider>
  );

  // Render Select for dropdown
  const renderSelect = () => (
    <FormControl fullWidth={fullWidth} disabled={disabled}>
      <InputLabel sx={{ color: colors.secondary_text }}>{label}</InputLabel>
      <Select
        size={size}
        value={value}
        onChange={onChange}
        label={label}
        required={required}
        sx={getSelectStyles()}
        startAdornment={
          startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined
        }
        {...restProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Choose renderer based on type
  const renderField = () => {
    if (type === "select") {
      return renderSelect();
    }
    if (type === "date") {
      return renderDatePicker();
    }
    return renderTextField();
  };

  // Wrap in Grid if gridProps provided
  if (gridProps) {
    return (
      <Grid item {...gridProps}>
        {renderField()}
      </Grid>
    );
  }

  return renderField();
};

ReusableFilterField.propTypes = {
  type: PropTypes.oneOf(["text", "number", "date", "select"]),
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  inputProps: PropTypes.object,
  InputProps: PropTypes.object,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium"]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
  gridProps: PropTypes.object,
};

export default ReusableFilterField;
