import React from "react";
import { IconButton as MuiIconButton, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppIconButton - Base wrapper for MUI IconButton component
 *
 * Provides consistent theming, standardized sizing, and optional tooltip support.
 *
 * @example
 * // Basic usage
 * <AppIconButton onClick={handleClick}>
 *   <EditIcon />
 * </AppIconButton>
 *
 * // With tooltip
 * <AppIconButton tooltip="Edit item" onClick={handleEdit}>
 *   <EditIcon />
 * </AppIconButton>
 */
const AppIconButton = React.forwardRef(
  (
    {
      children,
      size = "medium",
      color = "default",
      disabled = false,
      tooltip,
      tooltipPlacement = "top",
      onClick,
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Standardized size configurations
    const sizeConfig = {
      small: {
        width: "32px",
        height: "32px",
        fontSize: "18px",
      },
      medium: {
        width: "40px",
        height: "40px",
        fontSize: "22px",
      },
      large: {
        width: "48px",
        height: "48px",
        fontSize: "26px",
      },
    };

    const currentSize = sizeConfig[size] || sizeConfig.medium;

    // Color configurations
    const colorStyles = {
      default: {
        color: colors.secondary_text || "#9ca3af",
        "&:hover": {
          color: colors.primary_text || "#fff",
          backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.08)",
        },
      },
      primary: {
        color: colors.primary_accent || "#00DAC6",
        "&:hover": {
          backgroundColor: "rgba(0, 218, 198, 0.15)",
        },
      },
      error: {
        color: colors.error || "#ef4444",
        "&:hover": {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
        },
      },
      inherit: {
        color: "inherit",
        "&:hover": {
          backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.08)",
        },
      },
    };

    const baseStyles = {
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: "8px",
      transition: "all 0.2s ease-in-out",
      "& .MuiSvgIcon-root": {
        fontSize: currentSize.fontSize,
      },
      "&:disabled": {
        color: colors.disabled_text || "#555",
      },
      ...(colorStyles[color] || colorStyles.default),
      ...sx,
    };

    const iconButton = (
      <MuiIconButton
        ref={ref}
        size={size}
        disabled={disabled}
        onClick={onClick}
        sx={baseStyles}
        {...restProps}
      >
        {children}
      </MuiIconButton>
    );

    // Wrap with Tooltip if tooltip prop is provided
    if (tooltip && !disabled) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
          {iconButton}
        </Tooltip>
      );
    }

    return iconButton;
  },
);

AppIconButton.displayName = "AppIconButton";

AppIconButton.propTypes = {
  /** Icon element to display */
  children: PropTypes.node.isRequired,
  /** Button size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Button color */
  color: PropTypes.oneOf(["default", "primary", "error", "inherit"]),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Tooltip text (optional) */
  tooltip: PropTypes.string,
  /** Tooltip placement */
  tooltipPlacement: PropTypes.oneOf([
    "top",
    "bottom",
    "left",
    "right",
    "top-start",
    "top-end",
    "bottom-start",
    "bottom-end",
  ]),
  /** Click handler */
  onClick: PropTypes.func,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppIconButton;
