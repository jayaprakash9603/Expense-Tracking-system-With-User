import React from "react";
import TextField from "@mui/material/TextField";

export default function ThemedAmountField({
  id = "amount",
  name,
  value,
  onChange,
  onClearError,
  placeholder,
  colors,
  error = false,
  height = "52px",
  maxWidth = "300px",
  min = 0.01,
  step = "any",
  InputProps,
  sx,
  ...rest
}) {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val !== "" && (parseFloat(val) < 0 || val.includes("-"))) return;
    if (onChange) onChange(e);
    if (onClearError) onClearError();
  };

  const handleKeyDown = (e) => {
    if (["-", "e", "E"].includes(e.key)) e.preventDefault();
  };

  return (
    <TextField
      id={id}
      name={name || id}
      type="number"
      value={value ?? ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputProps={{ min, step }}
      placeholder={placeholder}
      variant="outlined"
      error={!!error}
      InputProps={{
        style: {
          height,
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
        },
        ...InputProps,
      }}
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
        "& .MuiInputBase-input": {
          color: colors.primary_text,
        },
        ...sx,
      }}
      {...rest}
    />
  );
}
