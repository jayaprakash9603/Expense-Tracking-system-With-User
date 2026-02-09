import React from "react";
import {
  LinearProgress as MuiLinearProgress,
  Box,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppLinearProgress - Base wrapper for MUI LinearProgress component
 *
 * Provides consistent theming and optional label/value display.
 *
 * @example
 * // Indeterminate loading
 * <AppLinearProgress />
 *
 * // With value and label
 * <AppLinearProgress value={75} label="Budget Used" showValue />
 */
const AppLinearProgress = React.forwardRef(
  (
    {
      value,
      label,
      variant = "indeterminate",
      color = "primary",
      size = "medium",
      showValue = false,
      valuePosition = "right",
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Size configurations (height)
    const sizeConfig = {
      small: 4,
      medium: 8,
      large: 12,
    };

    const currentHeight =
      typeof size === "number" ? size : sizeConfig[size] || sizeConfig.medium;

    // Color configurations
    const colorStyles = {
      primary: {
        bar: colors.primary_accent || "#00DAC6",
        track: colors.hover_bg || "rgba(0, 218, 198, 0.2)",
      },
      success: {
        bar: colors.success || "#22c55e",
        track: "rgba(34, 197, 94, 0.2)",
      },
      warning: {
        bar: colors.warning || "#f59e0b",
        track: "rgba(245, 158, 11, 0.2)",
      },
      error: {
        bar: colors.error || "#ef4444",
        track: "rgba(239, 68, 68, 0.2)",
      },
      secondary: {
        bar: colors.secondary_text || "#9ca3af",
        track: "rgba(156, 163, 175, 0.2)",
      },
    };

    // Auto-select color based on value thresholds
    const getAutoColor = () => {
      if (value === undefined) return colorStyles.primary;
      if (value >= 100) return colorStyles.error;
      if (value >= 80) return colorStyles.warning;
      return colorStyles.primary;
    };

    const currentColor =
      color === "auto"
        ? getAutoColor()
        : colorStyles[color] || colorStyles.primary;

    const progressSx = {
      height: currentHeight,
      borderRadius: currentHeight / 2,
      backgroundColor: currentColor.track,
      "& .MuiLinearProgress-bar": {
        backgroundColor: currentColor.bar,
        borderRadius: currentHeight / 2,
      },
      ...sx,
    };

    // No label or value display
    if (!label && !showValue) {
      return (
        <MuiLinearProgress
          ref={ref}
          variant={variant}
          value={value}
          sx={progressSx}
          {...restProps}
        />
      );
    }

    // With label and/or value
    return (
      <Box sx={{ width: "100%" }}>
        {(label || (showValue && valuePosition === "top")) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            {label && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondary_text || "#9ca3af",
                  fontSize: "0.875rem",
                }}
              >
                {label}
              </Typography>
            )}
            {showValue && valuePosition === "top" && value !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.primary_text || "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {`${Math.round(value)}%`}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <MuiLinearProgress
              ref={ref}
              variant={variant}
              value={value}
              sx={progressSx}
              {...restProps}
            />
          </Box>

          {showValue && valuePosition === "right" && value !== undefined && (
            <Typography
              variant="body2"
              sx={{
                color: colors.primary_text || "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                minWidth: "45px",
                textAlign: "right",
              }}
            >
              {`${Math.round(value)}%`}
            </Typography>
          )}
        </Box>
      </Box>
    );
  },
);

AppLinearProgress.displayName = "AppLinearProgress";

AppLinearProgress.propTypes = {
  /** Progress value (0-100) for determinate variant */
  value: PropTypes.number,
  /** Label text */
  label: PropTypes.string,
  /** Progress variant */
  variant: PropTypes.oneOf(["determinate", "indeterminate", "buffer", "query"]),
  /** Progress color (use "auto" for threshold-based coloring) */
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "auto",
  ]),
  /** Size (height) of the progress bar */
  size: PropTypes.oneOfType([
    PropTypes.oneOf(["small", "medium", "large"]),
    PropTypes.number,
  ]),
  /** Show value text */
  showValue: PropTypes.bool,
  /** Position of the value text */
  valuePosition: PropTypes.oneOf(["top", "right"]),
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppLinearProgress;
