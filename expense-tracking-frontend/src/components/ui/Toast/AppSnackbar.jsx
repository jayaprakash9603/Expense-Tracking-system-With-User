/**
 * AppSnackbar - Theme-aware MUI Snackbar/Alert wrapper
 *
 * Usage:
 *   <AppSnackbar
 *     open={showSnackbar}
 *     message="Changes saved"
 *     severity="success"
 *     onClose={() => setShowSnackbar(false)}
 *   />
 *
 * Features:
 * - Simple MUI Alert-based snackbar
 * - Four severity levels
 * - Theme-integrated colors
 * - Optional action buttons
 */
import React, { forwardRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

const AppSnackbar = forwardRef(function AppSnackbar(
  {
    // Core props
    open,
    message,
    onClose,
    severity = "info",

    // Behavior
    autoHideDuration = 4000,
    anchorOrigin = { vertical: "bottom", horizontal: "center" },

    // Alert customization
    title,
    variant = "filled", // 'filled' | 'outlined' | 'standard'
    action,
    icon,
    closeText = "Close",

    // MUI pass-through
    alertProps = {},
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Handle close with reason check
  const handleClose = useCallback(
    (event, reason) => {
      // Default: ignore clickaway, can be customized via rest props
      if (reason === "clickaway") {
        return;
      }
      onClose?.(event, reason);
    },
    [onClose],
  );

  // Get variant-specific styles
  const getAlertStyles = () => {
    const baseStyles = {
      width: "100%",
      minWidth: 280,
      maxWidth: 500,
      borderRadius: 2,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    };

    if (variant === "standard") {
      return {
        ...baseStyles,
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
        "& .MuiAlert-message": {
          color: colors.primary_text,
        },
      };
    }

    return baseStyles;
  };

  return (
    <Snackbar
      ref={ref}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      sx={sx}
      {...rest}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant={variant}
        action={action}
        icon={icon}
        closeText={closeText}
        sx={getAlertStyles()}
        {...alertProps}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
});

AppSnackbar.propTypes = {
  /** Control visibility */
  open: PropTypes.bool.isRequired,
  /** Snackbar message content */
  message: PropTypes.node.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Severity level */
  severity: PropTypes.oneOf(["success", "error", "warning", "info"]),
  /** Auto-dismiss duration in ms (null to disable) */
  autoHideDuration: PropTypes.number,
  /** Position on screen */
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "center", "right"]),
  }),
  /** Optional title for Alert */
  title: PropTypes.string,
  /** Alert variant */
  variant: PropTypes.oneOf(["filled", "outlined", "standard"]),
  /** Custom action component */
  action: PropTypes.node,
  /** Custom icon */
  icon: PropTypes.node,
  /** Accessible close text */
  closeText: PropTypes.string,
  /** Additional Alert props */
  alertProps: PropTypes.object,
  /** Custom styles */
  sx: PropTypes.object,
};

export default AppSnackbar;
