/**
 * AppToast - Theme-aware toast notification component
 *
 * Usage:
 *   <AppToast
 *     open={showToast}
 *     message="Operation successful!"
 *     severity="success"
 *     onClose={() => setShowToast(false)}
 *   />
 *
 * Features:
 * - Four severity levels: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Custom positioning
 * - Progress bar animation
 * - Theme-integrated styling
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Snackbar, Box, Typography, IconButton } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const AppToast = forwardRef(function AppToast(
  {
    // Core props
    open,
    message,
    onClose,
    severity = "success",

    // Behavior
    autoHideDuration = 3000,
    anchorOrigin = { vertical: "bottom", horizontal: "right" },
    showProgress = true,
    showCloseButton = true,

    // Customization
    title,
    icon,
    action,

    // MUI pass-through
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Severity configuration
  const severityConfig = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#4caf50",
      lightBg: "#4caf5020",
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#f44336",
      lightBg: "#f4433620",
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#ff9800",
      lightBg: "#ff980020",
    },
    info: {
      icon: <InfoIcon sx={{ fontSize: "1.5rem" }} />,
      bgColor: "#2196f3",
      lightBg: "#2196f320",
    },
  };

  const config = severityConfig[severity] || severityConfig.success;
  const displayIcon = icon || config.icon;

  return (
    <Snackbar
      ref={ref}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        "& .MuiSnackbarContent-root": {
          padding: 0,
        },
        ...sx,
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 300,
          maxWidth: 500,
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 3,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px ${config.bgColor}40`,
          overflow: "hidden",
          position: "relative",
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: {
              transform:
                anchorOrigin.horizontal === "right"
                  ? "translateX(100%)"
                  : "translateX(-100%)",
              opacity: 0,
            },
            to: {
              transform: "translateX(0)",
              opacity: 1,
            },
          },
        }}
      >
        {/* Color accent bar */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 5,
            backgroundColor: config.bgColor,
          }}
        />

        {/* Icon container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            ml: 2,
            borderRadius: 2,
            backgroundColor: config.lightBg,
            color: config.bgColor,
            flexShrink: 0,
          }}
        >
          {displayIcon}
        </Box>

        {/* Message content */}
        <Box sx={{ flex: 1, py: 1.5, pr: 1 }}>
          {title && (
            <Typography
              variant="subtitle2"
              sx={{
                color: config.bgColor,
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 0.25,
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            variant="body1"
            sx={{
              color: colors.primary_text,
              fontWeight: 600,
              fontSize: "0.95rem",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Actions */}
        {action && <Box sx={{ mr: 1 }}>{action}</Box>}

        {/* Close button */}
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              mr: 1.5,
              color: colors.secondary_text,
              backgroundColor: colors.hover_bg,
              width: 28,
              height: 28,
              flexShrink: 0,
              "&:hover": {
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
                transform: "scale(1.1)",
              },
              transition: "all 0.2s",
            }}
          >
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        )}

        {/* Progress bar animation */}
        {showProgress && autoHideDuration && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: `${config.bgColor}30`,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: "100%",
                backgroundColor: config.bgColor,
                animation: `progress ${autoHideDuration}ms linear`,
                "@keyframes progress": {
                  from: { transform: "translateX(-100%)" },
                  to: { transform: "translateX(0%)" },
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Snackbar>
  );
});

AppToast.propTypes = {
  /** Control visibility */
  open: PropTypes.bool.isRequired,
  /** Toast message content */
  message: PropTypes.string.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Severity level determines color and icon */
  severity: PropTypes.oneOf(["success", "error", "warning", "info"]),
  /** Auto-dismiss duration in ms (null to disable) */
  autoHideDuration: PropTypes.number,
  /** Position on screen */
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "center", "right"]),
  }),
  /** Show progress bar */
  showProgress: PropTypes.bool,
  /** Show close button */
  showCloseButton: PropTypes.bool,
  /** Optional title above message */
  title: PropTypes.string,
  /** Custom icon (overrides severity icon) */
  icon: PropTypes.node,
  /** Custom action component */
  action: PropTypes.node,
  /** Custom styles */
  sx: PropTypes.object,
};

export default AppToast;
