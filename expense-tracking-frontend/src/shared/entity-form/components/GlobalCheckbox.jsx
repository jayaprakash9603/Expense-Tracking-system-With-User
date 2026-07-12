import React from "react";
import { Box, Checkbox, Typography, FormControl } from "@mui/material";

export default function GlobalCheckbox({
  checked,
  onChange,
  label = "Make this global (available to all users)",
  accentColor,
  colors,
  name = "isGlobal",
}) {
  return (
    <FormControl>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          sx={{
            color: accentColor,
            "&.Mui-checked": { color: accentColor },
            p: 0.5,
          }}
        />
        <Typography
          sx={{ color: colors.primary_text, ml: 0.5, fontSize: "0.875rem" }}
        >
          {label}
        </Typography>
      </Box>
    </FormControl>
  );
}
