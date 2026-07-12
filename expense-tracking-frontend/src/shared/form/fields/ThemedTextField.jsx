import React from "react";
import TextField from "@mui/material/TextField";

export default function ThemedTextField({
  id,
  name,
  value,
  onChange,
  placeholder,
  colors,
  error = false,
  type = "text",
  variant = "outlined",
  size = "medium",
  maxWidth = "300px",
  height = "52px",
  InputProps,
  sx,
  ...rest
}) {
  return (
    <TextField
      id={id}
      name={name || id}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      variant={variant}
      size={size}
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
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
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
        "& .MuiInputBase-input::placeholder": {
          color: colors.icon_muted,
          opacity: 1,
        },
        ...sx,
      }}
      {...rest}
    />
  );
}
