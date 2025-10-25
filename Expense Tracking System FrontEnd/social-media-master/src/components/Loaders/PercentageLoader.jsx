import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const PercentageLoader = ({
  percentage = 0,
  size = "md",
  trackColor,
  progressColor,
  textColor,
  showPercentage = true,
  label = "",
  processed = null,
  total = null,
}) => {
  const { colors } = useTheme();

  // Use theme colors if not explicitly provided
  const finalTrackColor = trackColor || colors.hover_bg;
  const finalProgressColor = progressColor || colors.primary_accent;
  const finalTextColor = textColor || colors.primary_text;
  // Size configurations
  const sizeConfig = {
    sm: { width: 60, height: 60, thickness: 3, fontSize: "0.75rem" },
    md: { width: 80, height: 80, thickness: 4, fontSize: "0.875rem" },
    lg: { width: 120, height: 120, thickness: 5, fontSize: "1rem" },
    xl: { width: 150, height: 150, thickness: 6, fontSize: "1.25rem" },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {/* Background Circle */}
      <Box sx={{ position: "relative" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={config.width}
          thickness={config.thickness}
          sx={{
            color: finalTrackColor,
            position: "absolute",
          }}
        />

        {/* Progress Circle */}
        <CircularProgress
          variant="determinate"
          value={Math.min(Math.max(percentage, 0), 100)}
          size={config.width}
          thickness={config.thickness}
          sx={{
            color: finalProgressColor,
            animationDuration: "550ms",
            position: "relative",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />

        {/* Percentage Text */}
        {showPercentage && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: finalTextColor,
                fontSize: config.fontSize,
                fontWeight: "bold",
              }}
            >
              {`${Math.round(percentage)}%`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Optional Label or processed/total */}
      {(label || (processed !== null && total !== null)) && (
        <Typography
          variant="body2"
          sx={{
            color: finalTextColor,
            textAlign: "center",
            fontSize: config.fontSize,
          }}
        >
          {label || `${processed} / ${total}`}
        </Typography>
      )}
    </Box>
  );
};

export default PercentageLoader;
