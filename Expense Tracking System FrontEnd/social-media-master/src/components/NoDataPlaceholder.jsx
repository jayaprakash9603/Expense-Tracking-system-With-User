import React from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

/*
  Reusable NoDataPlaceholder component
  Props:
    message: main message string
    subMessage: optional secondary text
    height: fixed or responsive height (defaults 180)
    onRetry: optional callback to show retry button
    actionLabel: custom label for retry button (default 'Retry')
    icon: optional override React node icon
    dense: if true uses tighter spacing
*/
const NoDataPlaceholder = ({
  message = "No data available",
  subMessage,
  height = 180,
  onRetry,
  actionLabel = "Retry",
  icon,
  dense = false,
  size = "md",
  fullWidth = false,
  minWidth,
  maxWidth,
  style,
  iconSize = 44, 
}) => {
  const derivedHeights = {
    sm: height || 140,
    md: height || 180,
    lg: height || 260,
    fill: height || 320,
  };
  const finalHeight = derivedHeights[size] || height;
  return (
    <Box
      sx={{
        height: finalHeight,
        minHeight: finalHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: dense ? 1 : 1.5,
        bgcolor: "#1b1b1b",
        border: "1px dashed #333",
        borderRadius: 2,
        px: size === "lg" || size === "fill" ? 4 : 2,
        textAlign: "center",
        color: "#b0b6c3",
        width: fullWidth ? "100%" : undefined,
        minWidth,
        maxWidth,
        ...style,
      }}
    >
      <Box sx={{ fontSize: iconSize, lineHeight: 1, opacity: 0.6 }}>
        {icon || (
          <InsertChartOutlinedIcon sx={{ fontSize: iconSize, opacity: 0.6 }} />
        )}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "#e0e0e0" }}
      >
        {message}
      </Typography>
      {subMessage && (
        <Typography variant="caption" sx={{ maxWidth: 360, color: "#8a8f99" }}>
          {subMessage}
        </Typography>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          size="small"
          startIcon={<RefreshIcon />}
          sx={{
            mt: dense ? 0.5 : 1,
            bgcolor: "#00dac6",
            color: "#000",
            fontWeight: 600,
            "&:hover": { bgcolor: "#00b8a0" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default NoDataPlaceholder;
