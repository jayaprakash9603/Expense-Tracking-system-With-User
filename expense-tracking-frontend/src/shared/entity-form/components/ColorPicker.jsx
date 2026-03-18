import React from "react";
import { Box, FormControl } from "@mui/material";

export default function ColorPicker({
  colorOptions,
  selectedColor,
  onColorChange,
  colors,
  height = "200px",
  circleSize = 32,
}) {
  return (
    <FormControl fullWidth>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 1,
          p: 2,
          height,
          overflowY: "auto",
          backgroundColor: colors.secondary_bg,
        }}
      >
        {colorOptions.map((color) => (
          <Box
            key={color}
            onClick={() => onColorChange(color)}
            sx={{
              width: circleSize,
              height: circleSize,
              bgcolor: color,
              borderRadius: "50%",
              cursor: "pointer",
              border:
                selectedColor === color
                  ? `3px solid ${colors.primary_text}`
                  : `1px solid ${colors.border_color}`,
              "&:hover": { opacity: 0.8 },
            }}
          />
        ))}
      </Box>
    </FormControl>
  );
}
