import React from "react";
import { Button as MuiButton } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppButton - Base wrapper for MUI Button component
 *
 * Provides consistent theming and standardized sizing across the application.
 * Use semantic variants (PrimaryButton, SecondaryButton, etc.) for common use cases.
 *
 * @example
 * // Basic usage
 * <AppButton onClick={handleClick}>Click Me</AppButton>
 *
 * // With variant and size
 * <AppButton variant="contained" size="small">Submit</AppButton>
 */
const AppButton = React.forwardRef(
  (
    {
      children,
      variant = "contained",
      size = "medium",
      color = "primary",
      disabled = false,
      fullWidth = false,
      startIcon,
      endIcon,
      onClick,
      type = "button",
      sx = {},
      ...restProps
    },
    ref
  ) => {
    const { colors } = useTheme();

    // Standardized size configurations
    const sizeConfig = {
      small: {
        height: "32px",
        fontSize: "13px",
        padding: "6px 12px",
      },
      medium: {
        height: "40px",
        fontSize: "14px",
        padding: "8px 16px",
      },
      large: {
        height: "48px",
        fontSize: "16px",
        padding: "10px 24px",
      },
    };

    const currentSize = sizeConfig[size] || sizeConfig.medium;

    // Base styles that apply to all variants
    const baseStyles = {
      height: currentSize.height,
      fontSize: currentSize.fontSize,
      padding: currentSize.padding,
      fontWeight: 500,
      textTransform: "none",
      borderRadius: "8px",
      transition: "all 0.2s ease-in-out",
    };

    // Variant-specific styles
    const variantStyles = {
      contained: {
        backgroundColor: colors.primary_accent || "#00DAC6",
        color: colors.button_text || "#000",
        "&:hover": {
          backgroundColor: colors.primary_accent_hover || "#00c4b2",
          boxShadow: "0 4px 12px rgba(0, 218, 198, 0.3)",
        },
        "&:disabled": {
          backgroundColor: colors.disabled_bg || "#555",
          color: colors.disabled_text || "#888",
        },
      },
      outlined: {
        backgroundColor: "transparent",
        color: colors.primary_text || "#fff",
        borderColor: colors.border_color || "rgb(75, 85, 99)",
        borderWidth: "1px",
        "&:hover": {
          backgroundColor: colors.hover_bg || "rgba(255, 255, 255, 0.05)",
          borderColor: colors.primary_accent || "#00DAC6",
        },
        "&:disabled": {
          borderColor: colors.disabled_border || "#444",
          color: colors.disabled_text || "#888",
        },
      },
      text: {
        backgroundColor: "transparent",
        color: colors.primary_accent || "#00DAC6",
        "&:hover": {
          backgroundColor: colors.hover_bg || "rgba(0, 218, 198, 0.1)",
        },
        "&:disabled": {
          color: colors.disabled_text || "#888",
        },
      },
    };

    // Color overrides for error/danger buttons
    const colorOverrides =
      color === "error"
        ? {
            contained: {
              backgroundColor: colors.error || "#ef4444",
              "&:hover": {
                backgroundColor: colors.error_hover || "#dc2626",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              },
            },
            outlined: {
              borderColor: colors.error || "#ef4444",
              color: colors.error || "#ef4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: colors.error || "#ef4444",
              },
            },
            text: {
              color: colors.error || "#ef4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            },
          }
        : {};

    const mergedStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(colorOverrides[variant] || {}),
      ...sx,
    };

    return (
      <MuiButton
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={onClick}
        type={type}
        sx={mergedStyles}
        {...restProps}
      >
        {children}
      </MuiButton>
    );
  }
);

AppButton.displayName = "AppButton";

AppButton.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** MUI button variant */
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  /** Button size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Button color */
  color: PropTypes.oneOf(["primary", "secondary", "error", "inherit"]),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Icon before text */
  startIcon: PropTypes.node,
  /** Icon after text */
  endIcon: PropTypes.node,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button type */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  /** Additional MUI sx styles */
  sx: PropTypes.object,
};

export default AppButton;
