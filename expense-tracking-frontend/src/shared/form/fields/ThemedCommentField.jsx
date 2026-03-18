import React from "react";
import TextField from "@mui/material/TextField";

export default function ThemedCommentField({
  id = "comments",
  name,
  value,
  onChange,
  placeholder,
  colors,
  error = false,
  minRows = 3,
  maxRows = 5,
  maxWidth = "920px",
  sx,
  ...rest
}) {
  return (
    <TextField
      id={id}
      name={name || id}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      multiline
      minRows={minRows}
      maxRows={maxRows}
      error={!!error}
      InputProps={{
        style: {
          height: "auto",
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
        },
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
