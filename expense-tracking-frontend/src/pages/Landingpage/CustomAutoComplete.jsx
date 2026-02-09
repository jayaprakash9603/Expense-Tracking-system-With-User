import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const CustomAutocomplete = ({
  options = [],
  value = "",
  inputValue = "",
  onInputChange,
  onChange,
  placeholder = "Select or type...",
  disabled = false,
  error = false,
  size = "small",
  variant = "outlined",
  freeSolo = true,
  noOptionsText = "No matching options found",
  loading = false,
  loadingText = "Loading...",
  className = "",
  sx = {},
  renderOption,
  getOptionLabel,
  isOptionEqualToValue,
  ...otherProps
}) => {
  const { colors } = useTheme();

  const defaultSx = {
    "& .MuiInputBase-root": {
      backgroundColor: colors.primary_bg,
      color: colors.primary_text,
      fontSize: "14px",
      height: size === "small" ? "40px" : "56px",
    },
    "& .MuiInputBase-input": {
      color: colors.primary_text,
      padding: size === "small" ? "8px 12px" : "16px 14px",
      "&::placeholder": {
        color: colors.placeholder_text,
        opacity: 1,
      },
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: error ? "#ff4d4f" : "transparent",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: error ? "#ff4d4f" : colors.primary_accent,
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? "#ff4d4f" : colors.primary_accent,
        borderWidth: "2px",
      },
    },
    "& .MuiAutocomplete-endAdornment": {
      "& .MuiSvgIcon-root": {
        color: colors.placeholder_text,
        fontSize: "18px",
      },
    },
    "& .MuiAutocomplete-clearIndicator": {
      color: colors.placeholder_text,
      "&:hover": {
        backgroundColor: colors.hover_bg,
      },
    },
    ...sx,
  };

  const defaultRenderOption = (props, option) => (
    <li
      {...props}
      style={{
        backgroundColor: colors.primary_bg,
        color: colors.primary_text,
        fontSize: "14px",
        padding: "8px 12px",
        borderBottom: `1px solid ${colors.border_color}`,
      }}
    >
      {typeof option === "string"
        ? option
        : option.label || option.name || option}
    </li>
  );

  const defaultGetOptionLabel = (option) => {
    if (typeof option === "string") return option;
    return option.label || option.name || option.toString();
  };

  const defaultIsOptionEqualToValue = (option, value) => {
    if (typeof option === "string" && typeof value === "string") {
      return option === value;
    }
    return option?.id === value?.id || option === value;
  };

  return (
    <Autocomplete
      freeSolo={freeSolo}
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      getOptionLabel={getOptionLabel || defaultGetOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue || defaultIsOptionEqualToValue}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant={variant}
          size={size}
          error={error}
          sx={defaultSx}
          className={className}
        />
      )}
      renderOption={renderOption || defaultRenderOption}
      ListboxProps={{
        style: {
          backgroundColor: colors.primary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: "4px",
          maxHeight: "200px",
        },
      }}
      PaperComponent={({ children, ...other }) => (
        <div
          {...other}
          style={{
            backgroundColor: colors.primary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "4px",
          }}
        >
          {children}
        </div>
      )}
      noOptionsText={
        <div style={{ color: colors.placeholder_text, padding: "8px 12px" }}>
          {noOptionsText}
        </div>
      }
      loadingText={
        <div style={{ color: colors.placeholder_text, padding: "8px 12px" }}>
          {loadingText}
        </div>
      }
      {...otherProps}
    />
  );
};

export default CustomAutocomplete;
