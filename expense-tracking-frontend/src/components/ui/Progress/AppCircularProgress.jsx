import React from "react";
import {
  CircularProgress as MuiCircularProgress,
  Box,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppCircularProgress - Base wrapper for MUI CircularProgress component
 *
 * Provides consistent theming and optional value display.
 *
 * @example
 * // Indeterminate loading
 * <AppCircularProgress />
 *
 * // With value
 * <AppCircularProgress value={75} showValue />
 */
const AppCircularProgress = React.forwardRef(
  (
    {
      value,
      size = "medium",
      color = "primary",
      variant = "indeterminate",
      showValue = false,
      thickness = 4,
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Size configurations
    const sizeConfig = {
      small: 24,
      medium: 40,
      large: 56,
      xlarge: 80,
    };

    const currentSize =
      typeof size === "number" ? size : sizeConfig[size] || sizeConfig.medium;

    // Color configurations
    const colorStyles = {
      primary: colors.primary_accent || "#00DAC6",
      secondary: colors.secondary_text || "#9ca3af",
      success: colors.success || "#22c55e",
      warning: colors.warning || "#f59e0b",
      error: colors.error || "#ef4444",
      inherit: "inherit",
    };

    const progressColor = colorStyles[color] || colorStyles.primary;

    const progressSx = {
      color: progressColor,
      ...sx,
    };

    // If showing value, wrap in a box with centered text
    if (showValue && variant === "determinate" && value !== undefined) {
      const fontSize = currentSize > 40 ? "0.875rem" : "0.75rem";

      return (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <MuiCircularProgress
            ref={ref}
            variant="determinate"
            value={value}
            size={currentSize}
            thickness={thickness}
            sx={progressSx}
            {...restProps}
          />
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
                color: colors.primary_text || "#fff",
                fontSize: fontSize,
                fontWeight: 600,
              }}
            >
              {`${Math.round(value)}%`}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <MuiCircularProgress
        ref={ref}
        variant={variant}
        value={value}
        size={currentSize}
        thickness={thickness}
        sx={progressSx}
        {...restProps}
      />
    );
  },
);

AppCircularProgress.displayName = "AppCircularProgress";

AppCircularProgress.propTypes = {
  /** Progress value (0-100) for determinate variant */
  value: PropTypes.number,
  /** Size of the progress indicator */
  size: PropTypes.oneOfType([
    PropTypes.oneOf(["small", "medium", "large", "xlarge"]),
    PropTypes.number,
  ]),
  /** Progress color */
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "inherit",
  ]),
  /** Progress variant */
  variant: PropTypes.oneOf(["determinate", "indeterminate"]),
  /** Show value text in center (only for determinate) */
  showValue: PropTypes.bool,
  /** Thickness of the circle */
  thickness: PropTypes.number,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppCircularProgress;
