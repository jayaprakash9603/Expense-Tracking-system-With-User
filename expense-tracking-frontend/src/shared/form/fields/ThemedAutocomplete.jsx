import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function ThemedAutocomplete({
  options,
  value,
  onChange,
  onInputChange,
  getOptionLabel,
  filterOptions,
  renderOption,
  colors,
  error = false,
  placeholder,
  noOptionsText,
  maxWidth = "300px",
  inputHeight = "56px",
  sx,
  textFieldSx,
  ...rest
}) {
  return (
    <Autocomplete
      autoHighlight
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      renderOption={renderOption}
      noOptionsText={noOptionsText}
      sx={{
        width: "100%",
        maxWidth,
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: error ? "#ff4d4f" : colors.border_color,
            borderWidth: error ? "2px" : "1px",
            borderStyle: "solid",
          },
          "&:hover fieldset": {
            borderColor: error ? "#ff4d4f" : colors.border_color,
            borderWidth: error ? "2px" : "1px",
            borderStyle: "solid",
          },
          "&.Mui-focused fieldset": {
            borderColor: error ? "#ff4d4f" : colors.primary_accent,
            borderWidth: "2px",
            borderStyle: "solid",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#ff4d4f" : colors.border_color,
            borderWidth: error ? "2px" : "1px",
            borderStyle: "solid",
          },
        },
        ...sx,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          error={!!error}
          InputProps={{
            ...params.InputProps,
            style: {
              backgroundColor: colors.primary_bg,
              color: colors.primary_text,
              height: inputHeight,
            },
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: colors.primary_text,
            },
            "& .MuiInputBase-input::placeholder": {
              color: colors.placeholder_text || colors.icon_muted,
              opacity: 1,
            },
            ...textFieldSx,
          }}
        />
      )}
      {...rest}
    />
  );
}
