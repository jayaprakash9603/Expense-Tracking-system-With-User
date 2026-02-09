import React from "react";
import { Chip as MuiChip } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppChip - Base wrapper for MUI Chip component
 *
 * Provides consistent theming across the application.
 *
 * @example
 * <AppChip label="Active" variant="filled" />
 * <AppChip label="Category" onDelete={handleDelete} />
 */
const AppChip = React.forwardRef(
  (
    {
      label,
      variant = "filled",
      size = "medium",
      color = "default",
      icon,
      deleteIcon,
      avatar,
      onDelete,
      onClick,
      disabled = false,
      sx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Size configurations
    const sizeConfig = {
      small: {
        height: "24px",
        fontSize: "12px",
      },
      medium: {
        height: "32px",
        fontSize: "13px",
      },
      large: {
        height: "40px",
        fontSize: "14px",
      },
    };

    const currentSize = sizeConfig[size] || sizeConfig.medium;

    // Color configurations
    const colorStyles = {
      default: {
        filled: {
          backgroundColor: colors.secondary_bg || "#374151",
          color: colors.primary_text || "#fff",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.primary_text || "#fff",
          borderColor: colors.border_color || "rgba(255, 255, 255, 0.2)",
        },
      },
      primary: {
        filled: {
          backgroundColor: colors.primary_accent || "#00DAC6",
          color: colors.button_text || "#000",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.primary_accent || "#00DAC6",
          borderColor: colors.primary_accent || "#00DAC6",
        },
      },
      success: {
        filled: {
          backgroundColor: colors.success || "#22c55e",
          color: "#fff",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.success || "#22c55e",
          borderColor: colors.success || "#22c55e",
        },
      },
      warning: {
        filled: {
          backgroundColor: colors.warning || "#f59e0b",
          color: "#000",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.warning || "#f59e0b",
          borderColor: colors.warning || "#f59e0b",
        },
      },
      error: {
        filled: {
          backgroundColor: colors.error || "#ef4444",
          color: "#fff",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.error || "#ef4444",
          borderColor: colors.error || "#ef4444",
        },
      },
      info: {
        filled: {
          backgroundColor: colors.info || "#3b82f6",
          color: "#fff",
        },
        outlined: {
          backgroundColor: "transparent",
          color: colors.info || "#3b82f6",
          borderColor: colors.info || "#3b82f6",
        },
      },
    };

    const currentColor = colorStyles[color] || colorStyles.default;
    const currentVariantStyles = currentColor[variant] || currentColor.filled;

    const baseStyles = {
      height: currentSize.height,
      fontSize: currentSize.fontSize,
      fontWeight: 500,
      borderRadius: "6px",
      transition: "all 0.2s ease-in-out",
      ...currentVariantStyles,
      "&:hover": onClick
        ? {
            opacity: 0.85,
          }
        : {},
      "& .MuiChip-deleteIcon": {
        color: "inherit",
        opacity: 0.7,
        "&:hover": {
          opacity: 1,
        },
      },
      "&.Mui-disabled": {
        opacity: 0.5,
      },
      ...sx,
    };

    return (
      <MuiChip
        ref={ref}
        label={label}
        variant={variant}
        size={size === "large" ? "medium" : size}
        icon={icon}
        deleteIcon={deleteIcon}
        avatar={avatar}
        onDelete={onDelete}
        onClick={onClick}
        disabled={disabled}
        sx={baseStyles}
        {...restProps}
      />
    );
  },
);

AppChip.displayName = "AppChip";

AppChip.propTypes = {
  /** Chip label text */
  label: PropTypes.node.isRequired,
  /** Chip variant */
  variant: PropTypes.oneOf(["filled", "outlined"]),
  /** Chip size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Chip color */
  color: PropTypes.oneOf([
    "default",
    "primary",
    "success",
    "warning",
    "error",
    "info",
  ]),
  /** Icon element */
  icon: PropTypes.element,
  /** Delete icon element */
  deleteIcon: PropTypes.element,
  /** Avatar element */
  avatar: PropTypes.element,
  /** Delete handler (shows delete icon when provided) */
  onDelete: PropTypes.func,
  /** Click handler (makes chip clickable) */
  onClick: PropTypes.func,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppChip;
